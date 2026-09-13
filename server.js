// 1. Importers/Callers: Node.js runtime entrypoint (package.json "start", Vercel Serverless)
// 2. Affected API: GET /api/state, POST /api/auth/login, POST /api/auth/me, all REST CRUD endpoints with Strict RBAC & Rate Limiting
// 3. Data Schemas: JSON Request/Response with JWT Authentication, Role-Based Access Control, ETag, Gzip
// 4. User's Verbatim Instruction: "kiểm tra bảo mật backend" and "theo khuyến nghị của bạn"

require('dotenv').config();
const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const zlib = require('zlib');
const wmsService = require('./src/services/wmsService');
const { verifyToken } = require('./src/utils/auth');

const PORT = process.env.PORT || 3000;

// =========================================================================
// 1. IN-MEMORY RATE LIMITER CHO XÁC THỰC (BRUTE-FORCE MITIGATION)
// =========================================================================
const loginAttempts = new Map(); // key (IP/username) -> { count: number, resetAt: number }

function checkLoginRateLimit(identifier) {
  const now = Date.now();
  const record = loginAttempts.get(identifier);
  if (!record) return { allowed: true };
  if (now > record.resetAt) {
    loginAttempts.delete(identifier);
    return { allowed: true };
  }
  if (record.count >= 5) {
    const waitSeconds = Math.ceil((record.resetAt - now) / 1000);
    return { allowed: false, waitSeconds };
  }
  return { allowed: true };
}

function recordLoginFailure(identifier) {
  const now = Date.now();
  const record = loginAttempts.get(identifier) || { count: 0, resetAt: now + 15 * 60 * 1000 };
  record.count += 1;
  loginAttempts.set(identifier, record);
}

function clearLoginFailure(identifier) {
  loginAttempts.delete(identifier);
}

// =========================================================================
// 2. MIDDLEWARE XÁC THỰC JWT & PHÂN QUYỀN MÁY CHỦ (SERVER-SIDE RBAC)
// =========================================================================
function getAuthUser(req) {
  const authHeader = req.headers['authorization'] || '';
  if (!authHeader) return null;
  return verifyToken(authHeader);
}

/**
 * Kiểm tra quyền hạn theo danh sách vai trò cho phép (Admin luôn có toàn quyền)
 */
function requireRoles(req, res, ...allowedRoles) {
  const user = getAuthUser(req);
  if (!user) {
    res.writeHead(401);
    res.end(JSON.stringify({
      success: false,
      code: 'UNAUTHORIZED',
      message: 'Yêu cầu xác thực tài khoản hoặc phiên làm việc đã hết hạn. Vui lòng đăng nhập lại.'
    }));
    return null;
  }

  // Nếu không truyền allowedRoles -> Mặc định chỉ có Quản trị viên (ADMIN) mới có quyền
  const isAllowed = user.role === 'ADMIN' || (allowedRoles.length > 0 && allowedRoles.includes(user.role));

  if (!isAllowed) {
    res.writeHead(403);
    res.end(JSON.stringify({
      success: false,
      code: 'FORBIDDEN',
      message: `Bạn không có quyền thực hiện tác vụ này (Yêu cầu vai trò: ${allowedRoles.length > 0 ? allowedRoles.join(', ') : 'Quản trị viên ADMIN'}).`
    }));
    return null;
  }

  return user;
}

/**
 * Ẩn thông tin nhạy cảm của cơ sở dữ liệu / lỗi hệ thống trước khi gửi cho client
 */
function sanitizeErrorMessage(err) {
  if (!err) return 'Đã xảy ra lỗi không xác định trên hệ thống.';
  const msg = err.message || String(err);
  if (msg.includes('prisma') || msg.includes('database') || msg.includes('SQL') || msg.includes('connection')) {
    return 'Lỗi xử lý cơ sở dữ liệu. Vui lòng kiểm tra lại thông tin hoặc liên hệ Quản trị viên.';
  }
  return msg;
}

// =========================================================================
// 3. API REQUEST HANDLER
// =========================================================================
async function handleApiRequest(req, res, pathname, query) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, If-None-Match, Authorization');
  res.setHeader('Access-Control-Expose-Headers', 'ETag');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';

  // GET Health / Ping
  if (req.method === 'GET' && pathname === '/api/health') {
    res.writeHead(200);
    return res.end(JSON.stringify({
      status: 'healthy',
      database: 'Supabase PostgreSQL',
      cached: wmsService.hasCachedState(),
      cacheVersion: wmsService.getStateVersion(),
      uptimeSeconds: Math.floor(process.uptime()),
      timestamp: new Date().toISOString(),
    }));
  }

  // GET /api/auth/me - Xác thực Token hiện tại của phiên làm việc
  if (req.method === 'GET' && pathname === '/api/auth/me') {
    const user = getAuthUser(req);
    if (!user) {
      res.writeHead(401);
      return res.end(JSON.stringify({ success: false, message: 'Phiên làm việc không hợp lệ hoặc đã hết hạn.' }));
    }
    res.writeHead(200);
    return res.end(JSON.stringify({ success: true, user }));
  }

  // GET State (Real-time data with L1 In-Memory Cache, ETag 304 & Gzip Compression)
  if (req.method === 'GET' && pathname === '/api/state') {
    try {
      if (!process.env.DATABASE_URL) {
        throw new Error('Chưa cài đặt biến môi trường DATABASE_URL trên Vercel. Vui lòng cấu hình trong Environment Variables.');
      }

      const forceRefresh = query?.refresh === 'true' || query?.force === 'true';
      const version = wmsService.getStateVersion();
      const etag = `"wms-v${version}"`;

      res.setHeader('ETag', etag);
      res.setHeader('Cache-Control', 'private, no-cache, must-revalidate');

      const ifNoneMatch = req.headers['if-none-match'];
      if (!forceRefresh && ifNoneMatch === etag && wmsService.hasCachedState()) {
        res.writeHead(304);
        res.end();
        return;
      }

      const data = await wmsService.getFullState(forceRefresh);
      const jsonResponse = JSON.stringify({ success: true, data, version });

      const acceptEncoding = req.headers['accept-encoding'] || '';
      if (acceptEncoding.includes('gzip')) {
        const compressed = zlib.gzipSync(Buffer.from(jsonResponse));
        res.setHeader('Content-Encoding', 'gzip');
        res.setHeader('Content-Length', compressed.length);
        res.writeHead(200);
        res.end(compressed);
      } else {
        res.writeHead(200);
        res.end(jsonResponse);
      }
    } catch (err) {
      console.error('[API ERROR] /api/state:', err);
      res.writeHead(500);
      res.end(JSON.stringify({ success: false, message: sanitizeErrorMessage(err) }));
    }
    return;
  }

  // Read JSON Body for POST/PUT/DELETE Requests
  let body = '';
  req.on('data', chunk => { body += chunk; });
  req.on('end', async () => {
    let payload = {};
    if (body) {
      try { payload = JSON.parse(body); } catch (e) {
        res.writeHead(400);
        return res.end(JSON.stringify({ success: false, message: 'Dữ liệu JSON gửi lên không đúng định dạng.' }));
      }
    }

    try {
      // 0. Xác thực đăng nhập người dùng (Authentication & Brute-Force Rate Limiting)
      if (req.method === 'POST' && pathname === '/api/auth/login') {
        const identifier = `${clientIp}_${(payload.usernameOrEmail || '').trim().toLowerCase()}`;
        const rateLimit = checkLoginRateLimit(identifier);
        if (!rateLimit.allowed) {
          res.writeHead(429);
          return res.end(JSON.stringify({
            success: false,
            code: 'TOO_MANY_REQUESTS',
            message: `Tài khoản hoặc thiết bị bị tạm khóa ${rateLimit.waitSeconds}s do nhập sai mật khẩu quá 5 lần. Vui lòng thử lại sau.`
          }));
        }

        try {
          const authResult = await wmsService.authenticateUser(payload);
          clearLoginFailure(identifier);
          res.writeHead(200);
          return res.end(JSON.stringify({
            success: true,
            token: authResult.token,
            user: authResult.user,
            message: `Chào mừng ${authResult.user.fullName} (${authResult.user.roleName}) đã đăng nhập thành công!`
          }));
        } catch (loginErr) {
          recordLoginFailure(identifier);
          res.writeHead(401);
          return res.end(JSON.stringify({
            success: false,
            code: 'AUTH_FAILED',
            message: loginErr.message || 'Tài khoản hoặc mật khẩu không chính xác.'
          }));
        }
      }

      // 0.1 Đăng xuất
      if (req.method === 'POST' && pathname === '/api/auth/logout') {
        res.writeHead(200);
        return res.end(JSON.stringify({ success: true, message: 'Đã đăng xuất an toàn khỏi hệ thống MEVN WMS.' }));
      }

      // 0.2 Chuyển đổi nhanh tài khoản làm việc (Quick Switch 1-Click with Fresh JWT Token)
      if (req.method === 'POST' && pathname === '/api/auth/switch') {
        try {
          const switchResult = await wmsService.switchUser(payload);
          res.writeHead(200);
          return res.end(JSON.stringify({
            success: true,
            token: switchResult.token,
            user: switchResult.user,
            message: `Đã chuyển đổi sang tài khoản: ${switchResult.user.fullName} (${switchResult.user.roleName || switchResult.user.role})!`
          }));
        } catch (switchErr) {
          res.writeHead(400);
          return res.end(JSON.stringify({
            success: false,
            code: 'SWITCH_FAILED',
            message: switchErr.message || 'Không thể chuyển đổi tài khoản người dùng.'
          }));
        }
      }

      // =======================================================================
      // 4. CÁC ENDPOINT NGHIỆP VỤ (YÊU CẦU XÁC THỰC TOKEN & RBAC NGHIÊM NGẶT)
      // =======================================================================

      // 1. Tạo đơn hàng mới (SALE_ADMIN, KE_TOAN, ADMIN)
      if (req.method === 'POST' && pathname === '/api/orders') {
        const authUser = requireRoles(req, res, 'SALE_ADMIN', 'KE_TOAN');
        if (!authUser) return;

        const order = await wmsService.createOrder(payload);
        res.writeHead(201);
        return res.end(JSON.stringify({ success: true, data: order }));
      }

      // 2. Kỹ thuật gửi BOM cho đơn hàng (KY_THUAT, ADMIN)
      if (req.method === 'POST' && pathname.match(/^\/api\/orders\/([^\/]+)\/boms$/)) {
        const authUser = requireRoles(req, res, 'KY_THUAT');
        if (!authUser) return;

        const orderId = pathname.split('/')[3];
        const bom = await wmsService.submitBom(orderId, payload);
        res.writeHead(201);
        return res.end(JSON.stringify({ success: true, data: bom, orderStatus: 'DANG_DOI_CHIEU_TON' }));
      }

      // 3. Kho đối chiếu tồn & Khóa giữ chỗ (THU_KHO, ADMIN)
      if (req.method === 'POST' && pathname.match(/^\/api\/boms\/([^\/]+)\/verify$/)) {
        const authUser = requireRoles(req, res, 'THU_KHO');
        if (!authUser) return;

        const bomId = pathname.split('/')[3];
        const result = await wmsService.verifyBom(bomId, payload);
        res.writeHead(200);
        return res.end(JSON.stringify({ success: true, data: result.bom, orderStatus: result.orderStatus }));
      }

      // 4. Mua hàng tạo PO cho các mã còn thiếu (MUA_HANG, ADMIN)
      if (req.method === 'POST' && pathname === '/api/pos') {
        const authUser = requireRoles(req, res, 'MUA_HANG');
        if (!authUser) return;

        const po = await wmsService.createPo(payload);
        res.writeHead(201);
        return res.end(JSON.stringify({ success: true, data: po }));
      }

      // 5. Nhập kho theo PO & Tự động giữ chỗ vào BOM mục tiêu (THU_KHO, ADMIN)
      if (req.method === 'POST' && pathname === '/api/grns') {
        const authUser = requireRoles(req, res, 'THU_KHO');
        if (!authUser) return;

        const grn = await wmsService.receiveGrn(payload);
        res.writeHead(201);
        return res.end(JSON.stringify({ success: true, data: grn }));
      }

      // 6. Sản xuất gửi Đăng ký lấy hàng (SAN_XUAT, ADMIN)
      if (req.method === 'POST' && pathname === '/api/pickup-registrations') {
        const authUser = requireRoles(req, res, 'SAN_XUAT');
        if (!authUser) return;

        const reg = await wmsService.registerPickup(payload);
        res.writeHead(201);
        return res.end(JSON.stringify({ success: true, data: reg }));
      }

      // 7. Tạo Phiếu xuất kho chuẩn PXK-BOM-01 (KE_TOAN, THU_KHO, ADMIN)
      if (req.method === 'POST' && pathname === '/api/gdns') {
        const authUser = requireRoles(req, res, 'KE_TOAN', 'THU_KHO');
        if (!authUser) return;

        const gdn = await wmsService.createGdn(payload);
        res.writeHead(201);
        return res.end(JSON.stringify({ success: true, data: gdn }));
      }

      // 8. Duyệt Phiếu xuất kho (KE_TOAN, ADMIN)
      if (req.method === 'POST' && pathname.match(/^\/api\/gdns\/([^\/]+)\/approve$/)) {
        const authUser = requireRoles(req, res, 'KE_TOAN');
        if (!authUser) return;

        const gdnId = pathname.split('/')[3];
        const gdn = await wmsService.approveGdn(gdnId, payload);
        res.writeHead(200);
        return res.end(JSON.stringify({ success: true, data: gdn }));
      }

      // 9. Thực xuất kho & Ký nhận điện tử (THU_KHO, ADMIN)
      if (req.method === 'POST' && pathname.match(/^\/api\/gdns\/([^\/]+)\/dispatch$/)) {
        const authUser = requireRoles(req, res, 'THU_KHO');
        if (!authUser) return;

        const gdnId = pathname.split('/')[3];
        const gdn = await wmsService.dispatchGdn(gdnId);
        res.writeHead(200);
        return res.end(JSON.stringify({ success: true, data: gdn }));
      }

      // 10. Phiếu nhập trả lại kho (SAN_XUAT, THU_KHO, ADMIN)
      if (req.method === 'POST' && pathname === '/api/returns') {
        const authUser = requireRoles(req, res, 'SAN_XUAT', 'THU_KHO');
        if (!authUser) return;

        const ret = await wmsService.createReturn(payload);
        res.writeHead(201);
        return res.end(JSON.stringify({ success: true, data: ret }));
      }

      // 11. Nạp tồn đầu kỳ vào Supabase (THU_KHO, ADMIN)
      if (req.method === 'POST' && pathname === '/api/import-stock') {
        const authUser = requireRoles(req, res, 'THU_KHO');
        if (!authUser) return;

        const result = await wmsService.importStock(payload);
        res.writeHead(200);
        return res.end(JSON.stringify({ success: true, ...result, message: `Đã nạp thành công ${result.importedCount} mã tồn đầu kỳ vào Supabase!` }));
      }

      // 12. Khôi phục dữ liệu mẫu chuẩn (Duy nhất ADMIN)
      if (req.method === 'POST' && pathname === '/api/reset-seed') {
        const authUser = requireRoles(req, res); // Không truyền vai trò -> Mặc định chỉ ADMIN
        if (!authUser) return;

        const seedMain = require('./prisma/seed');
        await seedMain();
        wmsService.invalidateCache();
        const freshData = await wmsService.getFullState(true);
        res.writeHead(200);
        return res.end(JSON.stringify({ success: true, data: freshData, message: 'Đã đồng bộ và khôi phục dữ liệu chuẩn MEVN trên Supabase PostgreSQL thành công!' }));
      }

      // =========================================================================
      // CÁC ENDPOINT XÓA CHỨNG TỪ (Duy nhất ADMIN có quyền thực hiện)
      // =========================================================================
      // Xóa Đơn hàng & giải phóng giữ chỗ
      if (req.method === 'DELETE' && pathname.match(/^\/api\/orders\/([^\/]+)$/)) {
        const authUser = requireRoles(req, res);
        if (!authUser) return;

        const orderId = pathname.split('/')[3];
        const result = await wmsService.deleteOrder(orderId);
        res.writeHead(200);
        return res.end(JSON.stringify({ success: true, message: result.message, data: result }));
      }

      // Xóa Đơn mua hàng (PO)
      if (req.method === 'DELETE' && pathname.match(/^\/api\/pos\/([^\/]+)$/)) {
        const authUser = requireRoles(req, res);
        if (!authUser) return;

        const poId = pathname.split('/')[3];
        const result = await wmsService.deletePo(poId);
        res.writeHead(200);
        return res.end(JSON.stringify({ success: true, message: result.message, data: result }));
      }

      // Xóa Phiếu xuất kho (GDN)
      if (req.method === 'DELETE' && pathname.match(/^\/api\/gdns\/([^\/]+)$/)) {
        const authUser = requireRoles(req, res);
        if (!authUser) return;

        const gdnId = pathname.split('/')[3];
        const result = await wmsService.deleteGdn(gdnId);
        res.writeHead(200);
        return res.end(JSON.stringify({ success: true, message: result.message, data: result }));
      }

      // Xóa Phiếu nhập kho (GRN)
      if (req.method === 'DELETE' && pathname.match(/^\/api\/grns\/([^\/]+)$/)) {
        const authUser = requireRoles(req, res);
        if (!authUser) return;

        const grnId = pathname.split('/')[3];
        const result = await wmsService.deleteGrn(grnId);
        res.writeHead(200);
        return res.end(JSON.stringify({ success: true, message: result.message, data: result }));
      }

      // Xóa Đăng ký lấy hàng (Pickup Registration)
      if (req.method === 'DELETE' && pathname.match(/^\/api\/pickup-registrations\/([^\/]+)$/)) {
        const authUser = requireRoles(req, res);
        if (!authUser) return;

        const regId = pathname.split('/')[3];
        const result = await wmsService.deletePickupRegistration(regId);
        res.writeHead(200);
        return res.end(JSON.stringify({ success: true, message: result.message, data: result }));
      }

      // Xóa Phiếu nhập trả hàng (Return Note)
      if (req.method === 'DELETE' && pathname.match(/^\/api\/returns\/([^\/]+)$/)) {
        const authUser = requireRoles(req, res);
        if (!authUser) return;

        const returnId = pathname.split('/')[3];
        const result = await wmsService.deleteReturn(returnId);
        res.writeHead(200);
        return res.end(JSON.stringify({ success: true, message: result.message, data: result }));
      }

      // 404 Endpoint
      res.writeHead(404);
      res.end(JSON.stringify({ success: false, message: `Endpoint ${pathname} không tồn tại trên hệ thống.` }));
    } catch (err) {
      console.error(`[API ERROR] ${req.method} ${pathname}:`, err);
      res.writeHead(500);
      res.end(JSON.stringify({ success: false, message: sanitizeErrorMessage(err) }));
    }
  });
}

// HTTP Server
const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;

  if (pathname.startsWith('/api/')) {
    return handleApiRequest(req, res, pathname, parsedUrl.query);
  }

  // Serve static files from public/
  let filePath = path.join(__dirname, 'public', pathname === '/' ? 'index.html' : pathname);
  if (!fs.existsSync(filePath)) {
    filePath = path.join(__dirname, 'public', 'index.html');
  }

  const extname = path.extname(filePath);
  const contentTypes = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpg',
    '.svg': 'image/svg+xml',
  };

  const contentType = contentTypes[extname] || 'text/plain';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(500);
      res.end('Server Error loading static file');
    } else {
      res.writeHead(200, {
        'Content-Type': contentType,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      });
      res.end(content, 'utf-8');
    }
  });
});

if (require.main === module) {
  server.listen(PORT, () => {
    console.log(`================================================================`);
    console.log(`🚀 MEVN WMS (Hệ thống Quản lý Kho Tủ Điện) đang chạy tại:`);
    console.log(`👉 http://localhost:${PORT}`);
    console.log(`🛡️ Bảo mật: JWT Authentication & Strict RBAC & Brute-force Mitigation`);
    console.log(`📡 Kết nối Database: Supabase Cloud PostgreSQL (Schema: mevn_wms)`);
    console.log(`================================================================`);
  });
}

module.exports = server;
