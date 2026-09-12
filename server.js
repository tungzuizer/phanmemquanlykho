// 1. Importers/Callers: Node.js runtime entrypoint (package.json "start", Vercel Serverless)
// 2. Affected API: GET /api/state (with ETag 304, L1 Cache & Gzip), GET /api/health, all REST CRUD endpoints
// 3. Data Schemas: JSON Request/Response with ETag, HTTP 304 Not Modified, Gzip Buffer
// 4. User's Verbatim Instruction: "theo khuyến nghị của bạn nhưng loading quá lâu cần upadate tốc độ"

require('dotenv').config();
const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const zlib = require('zlib');
const wmsService = require('./src/services/wmsService');

const PORT = process.env.PORT || 3000;

async function handleApiRequest(req, res, pathname, query) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, If-None-Match');
  res.setHeader('Access-Control-Expose-Headers', 'ETag');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

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

  // GET State (Real-time data with L1 In-Memory Cache, ETag 304 & Gzip Compression)
  if (req.method === 'GET' && pathname === '/api/state') {
    try {
      if (!process.env.DATABASE_URL) {
        throw new Error('Chưa cài đặt biến môi trường DATABASE_URL trên Vercel. Vui lòng vào Vercel Dashboard -> Project -> Settings -> Environment Variables để cấu hình.');
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
      res.end(JSON.stringify({ success: false, message: err.message || 'Lỗi kết nối cơ sở dữ liệu Supabase' }));
    }
    return;
  }

  // Read JSON Body for POST Requests
  let body = '';
  req.on('data', chunk => { body += chunk; });
  req.on('end', async () => {
    let payload = {};
    if (body) {
      try { payload = JSON.parse(body); } catch (e) {
        res.writeHead(400);
        return res.end(JSON.stringify({ success: false, message: 'Invalid JSON payload' }));
      }
    }

    try {
      // 0. Xác thực đăng nhập người dùng (Authentication & RBAC)
      // Fact-Forcing Gate Info:
      // 1. Importers/Callers: public/index.html & LoginScreen
      // 2. Affected API: POST /api/auth/login, POST /api/auth/logout
      // 3. Data schemas: { usernameOrEmail, password } -> { success, user }
      // 4. User verbatim: "cần bạn tách các dự liệu tài khoản và phân luồng các tài khoản và có phần đăng nhập"
      if (req.method === 'POST' && pathname === '/api/auth/login') {
        const user = await wmsService.authenticateUser(payload);
        res.writeHead(200);
        return res.end(JSON.stringify({ success: true, user, message: `Chào mừng ${user.fullName} (${user.roleName}) đã đăng nhập thành công!` }));
      }

      // 0.1 Đăng xuất
      if (req.method === 'POST' && pathname === '/api/auth/logout') {
        res.writeHead(200);
        return res.end(JSON.stringify({ success: true, message: 'Đã đăng xuất an toàn khỏi hệ thống MEVN WMS.' }));
      }

      // 1. Tạo đơn hàng mới
      if (req.method === 'POST' && pathname === '/api/orders') {
        const order = await wmsService.createOrder(payload);
        res.writeHead(201);
        return res.end(JSON.stringify({ success: true, data: order }));
      }

      // 2. Kỹ thuật gửi BOM cho đơn hàng
      if (req.method === 'POST' && pathname.match(/^\/api\/orders\/([^\/]+)\/boms$/)) {
        const orderId = pathname.split('/')[3];
        const bom = await wmsService.submitBom(orderId, payload);
        res.writeHead(201);
        return res.end(JSON.stringify({ success: true, data: bom, orderStatus: 'DANG_DOI_CHIEU_TON' }));
      }

      // 3. Kho đối chiếu tồn & Khóa giữ chỗ (ACID Transaction with Stock Reservation)
      if (req.method === 'POST' && pathname.match(/^\/api\/boms\/([^\/]+)\/verify$/)) {
        const bomId = pathname.split('/')[3];
        const result = await wmsService.verifyBom(bomId, payload);
        res.writeHead(200);
        return res.end(JSON.stringify({ success: true, data: result.bom, orderStatus: result.orderStatus }));
      }

      // 4. Mua hàng tạo PO cho các mã còn thiếu
      if (req.method === 'POST' && pathname === '/api/pos') {
        const po = await wmsService.createPo(payload);
        res.writeHead(201);
        return res.end(JSON.stringify({ success: true, data: po }));
      }

      // 5. Nhập kho theo PO & Tự động giữ chỗ vào BOM mục tiêu (ADR-0005)
      if (req.method === 'POST' && pathname === '/api/grns') {
        const grn = await wmsService.receiveGrn(payload);
        res.writeHead(201);
        return res.end(JSON.stringify({ success: true, data: grn }));
      }

      // 6. Sản xuất gửi Đăng ký lấy hàng (Mẫu 1) & Audit KPI
      if (req.method === 'POST' && pathname === '/api/pickup-registrations') {
        const reg = await wmsService.registerPickup(payload);
        res.writeHead(201);
        return res.end(JSON.stringify({ success: true, data: reg }));
      }

      // 7. Tạo Phiếu xuất kho chuẩn PXK-BOM-01
      if (req.method === 'POST' && pathname === '/api/gdns') {
        const gdn = await wmsService.createGdn(payload);
        res.writeHead(201);
        return res.end(JSON.stringify({ success: true, data: gdn }));
      }

      // 8. Duyệt Phiếu xuất kho
      if (req.method === 'POST' && pathname.match(/^\/api\/gdns\/([^\/]+)\/approve$/)) {
        const gdnId = pathname.split('/')[3];
        const gdn = await wmsService.approveGdn(gdnId, payload);
        res.writeHead(200);
        return res.end(JSON.stringify({ success: true, data: gdn }));
      }

      // 9. Thực xuất kho & Ký nhận điện tử (ACID Transaction + Ledger)
      if (req.method === 'POST' && pathname.match(/^\/api\/gdns\/([^\/]+)\/dispatch$/)) {
        const gdnId = pathname.split('/')[3];
        const gdn = await wmsService.dispatchGdn(gdnId);
        res.writeHead(200);
        return res.end(JSON.stringify({ success: true, data: gdn }));
      }

      // 10. Phiếu nhập trả lại kho (B3: Thừa nguyên vẹn vs Hỏng/phế liệu -> Kho Cách Ly)
      if (req.method === 'POST' && pathname === '/api/returns') {
        const ret = await wmsService.createReturn(payload);
        res.writeHead(201);
        return res.end(JSON.stringify({ success: true, data: ret }));
      }

      // 11. Nạp tồn đầu kỳ vào Supabase
      if (req.method === 'POST' && pathname === '/api/import-stock') {
        const result = await wmsService.importStock(payload);
        res.writeHead(200);
        return res.end(JSON.stringify({ success: true, ...result, message: `Đã nạp thành công ${result.importedCount} mã tồn đầu kỳ vào Supabase!` }));
      }

      // 12. Khôi phục dữ liệu mẫu chuẩn (Seed to Supabase)
      if (req.method === 'POST' && pathname === '/api/reset-seed') {
        const seedMain = require('./prisma/seed');
        await seedMain();
        wmsService.invalidateCache();
        const freshData = await wmsService.getFullState(true);
        res.writeHead(200);
        return res.end(JSON.stringify({ success: true, data: freshData, message: 'Đã đồng bộ và khôi phục dữ liệu chuẩn MEVN trên Supabase PostgreSQL thành công!' }));
      }

      // =========================================================================
      // CÁC ENDPOINT XÓA CHỨNG TỪ (DELETE APIS WITH INTEGRITY ROLLBACK)
      // =========================================================================
      // Xóa Đơn hàng & giải phóng giữ chỗ
      if (req.method === 'DELETE' && pathname.match(/^\/api\/orders\/([^\/]+)$/)) {
        const orderId = pathname.split('/')[3];
        const result = await wmsService.deleteOrder(orderId);
        res.writeHead(200);
        return res.end(JSON.stringify({ success: true, message: result.message, data: result }));
      }

      // Xóa Đơn mua hàng (PO)
      if (req.method === 'DELETE' && pathname.match(/^\/api\/pos\/([^\/]+)$/)) {
        const poId = pathname.split('/')[3];
        const result = await wmsService.deletePo(poId);
        res.writeHead(200);
        return res.end(JSON.stringify({ success: true, message: result.message, data: result }));
      }

      // Xóa Phiếu xuất kho (GDN)
      if (req.method === 'DELETE' && pathname.match(/^\/api\/gdns\/([^\/]+)$/)) {
        const gdnId = pathname.split('/')[3];
        const result = await wmsService.deleteGdn(gdnId);
        res.writeHead(200);
        return res.end(JSON.stringify({ success: true, message: result.message, data: result }));
      }

      // Xóa Phiếu nhập kho (GRN)
      if (req.method === 'DELETE' && pathname.match(/^\/api\/grns\/([^\/]+)$/)) {
        const grnId = pathname.split('/')[3];
        const result = await wmsService.deleteGrn(grnId);
        res.writeHead(200);
        return res.end(JSON.stringify({ success: true, message: result.message, data: result }));
      }

      // Xóa Đăng ký lấy hàng (Pickup Registration)
      if (req.method === 'DELETE' && pathname.match(/^\/api\/pickup-registrations\/([^\/]+)$/)) {
        const regId = pathname.split('/')[3];
        const result = await wmsService.deletePickupRegistration(regId);
        res.writeHead(200);
        return res.end(JSON.stringify({ success: true, message: result.message, data: result }));
      }

      // Xóa Phiếu nhập trả hàng (Return Note)
      if (req.method === 'DELETE' && pathname.match(/^\/api\/returns\/([^\/]+)$/)) {
        const returnId = pathname.split('/')[3];
        const result = await wmsService.deleteReturn(returnId);
        res.writeHead(200);
        return res.end(JSON.stringify({ success: true, message: result.message, data: result }));
      }

      // 404 Endpoint
      res.writeHead(404);
      res.end(JSON.stringify({ success: false, message: `Endpoint ${pathname} not found` }));
    } catch (err) {
      console.error(`[API ERROR] ${req.method} ${pathname}:`, err);
      res.writeHead(500);
      res.end(JSON.stringify({ success: false, message: err.message }));
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
    console.log(`📡 Kết nối Database: Supabase Cloud PostgreSQL (Schema: mevn_wms)`);
    console.log(`================================================================`);
  });
}

module.exports = server;
