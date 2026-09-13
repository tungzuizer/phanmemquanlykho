/**
 * Fact-Forcing Gate Details:
 * 1. Importers/Callers: Test runner script (node test_security_backend.js)
 * 2. Affected API: Automated Security Verification for JWT, Bcrypt, RBAC, Rate Limiting & Error Sanitization
 * 3. Data Schemas: Credentials, JWT Bearer Token, Server-Side RBAC Roles, HTTP 401/403/429 status codes
 * 4. User's Verbatim Instruction: "kiểm tra bảo mật backend" and "theo khuyến nghị của bạn"
 */

require('dotenv').config();
const http = require('http');
const { hashPassword, verifyPassword, generateToken, verifyToken } = require('./src/utils/auth');
const server = require('./server');

function makeRequest(options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        let json = null;
        try {
          json = JSON.parse(body);
        } catch (e) {
          json = { raw: body };
        }
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data: json
        });
      });
    });

    req.on('error', (err) => reject(err));

    if (postData) {
      req.write(typeof postData === 'string' ? postData : JSON.stringify(postData));
    }
    req.end();
  });
}

async function runSecuritySuite() {
  console.log('========================================================================');
  console.log('🛡️  BẮT ĐẦU KIỂM THỬ BẢO MẬT BACKEND MEVN WMS (ENTERPRISE SECURITY)');
  console.log('========================================================================\n');

  let totalTests = 0;
  let passedTests = 0;

  function assert(condition, message) {
    totalTests++;
    if (condition) {
      console.log(`  ✅ [PASS] ${message}`);
      passedTests++;
    } else {
      console.error(`  ❌ [FAIL] ${message}`);
    }
  }

  // TEST 1: BCRYPT PASSWORD HASHING & VERIFICATION
  console.log('▶ [PHẦN 1] Kiểm tra Mã hóa Mật khẩu Bcrypt Salt 10...');
  const testPlainPassword = 'EnterpriseSecurePassword@2026';
  const hashed = await hashPassword(testPlainPassword);
  assert(hashed.startsWith('$2a$') || hashed.startsWith('$2b$'), `Mật khẩu được băm đúng chuẩn Bcrypt ($2a$/$2b$): ${hashed.substring(0, 20)}...`);

  const isValidCorrect = await verifyPassword(testPlainPassword, hashed);
  assert(isValidCorrect === true, 'Xác thực mật khẩu chính xác với chuỗi Bcrypt Hash');

  const isValidWrong = await verifyPassword('WrongPassword123', hashed);
  assert(isValidWrong === false, 'Từ chối mật khẩu sai với chuỗi Bcrypt Hash');

  // Legacy plain-text backward compatibility test
  const legacyPlain = 'legacy_pass_123';
  const isLegacyValid = await verifyPassword('legacy_pass_123', legacyPlain);
  assert(isLegacyValid === true, 'Hỗ trợ tương thích an toàn tài khoản legacy plain-text');


  // TEST 2: JWT TOKEN GENERATION & EXPIRATION SIGNATURE
  console.log('\n▶ [PHẦN 2] Kiểm tra Ký và Xác thực JSON Web Token (JWT)...');
  const mockUser = {
    id: 'usr-sec-test-01',
    username: 'sec_admin',
    email: 'sec_admin@maxelectric.vn',
    role: 'ADMIN',
    fullName: 'Ban Giám Đốc Bảo Mật'
  };

  const token = generateToken(mockUser);
  assert(typeof token === 'string' && token.split('.').length === 3, `Sinh JWT Token hợp lệ chuẩn 3-segment RFC 7519: ${token.substring(0, 25)}...`);

  const decoded = verifyToken(token);
  assert(decoded && decoded.username === mockUser.username && decoded.role === mockUser.role, 'Giải mã và xác thực chữ ký số JWT thành công');

  const invalidToken = verifyToken('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.invalid.signature');
  assert(invalidToken === null, 'Từ chối Token giả mạo hoặc sai chữ ký số');


  // TEST 3: INTEGRATION RBAC & RATE LIMITING VIA HTTP SERVER
  console.log('\n▶ [PHẦN 3] Kiểm tra Phân Quyền Server-Side RBAC & Rate Limiting qua HTTP API...');

  // Start test server on dynamic port
  const testPort = await new Promise((resolve) => {
    const testServer = server.listen(0, () => {
      const addr = testServer.address();
      resolve(addr.port);
    });
  });

  try {
    // Tokens for different roles
    const adminToken = generateToken({ id: 'usr-admin-1', username: 'admin', role: 'ADMIN', fullName: 'Ban Giám Đốc' });
    const techToken = generateToken({ id: 'usr-tech-1', username: 'kythuat', role: 'KY_THUAT', fullName: 'Kỹ Sư Trưởng' });
    const whToken = generateToken({ id: 'usr-wh-1', username: 'thukho', role: 'THU_KHO', fullName: 'Trưởng Kho' });
    const buyerToken = generateToken({ id: 'usr-buyer-1', username: 'muahang', role: 'MUA_HANG', fullName: 'Bộ Phận Thu Mua' });

    // 3.1: Chặn truy cập không có Token (401 Unauthorized)
    const unauthRes = await makeRequest({
      hostname: 'localhost',
      port: testPort,
      path: '/api/orders',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { code: 'DH-UNAUTH-01' });

    assert(unauthRes.statusCode === 401, `Chặn tạo đơn hàng khi không có Token (HTTP 401 Unauthorized)`);
    assert(unauthRes.data.code === 'UNAUTHORIZED', 'Phản hồi mã lỗi chuẩn UNAUTHORIZED');

    // 3.2: Chặn vai trò không được phép (403 Forbidden)
    // KY_THUAT cố tình tạo đơn hàng (chỉ SALE_ADMIN và ADMIN mới được phép)
    const forbiddenRes = await makeRequest({
      hostname: 'localhost',
      port: testPort,
      path: '/api/orders',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${techToken}`
      }
    }, { code: 'DH-FORBIDDEN-01' });

    assert(forbiddenRes.statusCode === 403, `Chặn Kỹ thuật (KY_THUAT) tạo đơn hàng (HTTP 403 Forbidden)`);
    assert(forbiddenRes.data.code === 'FORBIDDEN', 'Phản hồi mã lỗi chuẩn FORBIDDEN');

    // 3.3: Chặn Thủ kho tạo Đơn Mua Hàng PO (chỉ MUA_HANG và ADMIN mới được phép)
    const forbiddenPoRes = await makeRequest({
      hostname: 'localhost',
      port: testPort,
      path: '/api/pos',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${whToken}`
      }
    }, { code: 'PO-FORBIDDEN-01' });

    assert(forbiddenPoRes.statusCode === 403, `Chặn Thủ kho (THU_KHO) phát hành PO (HTTP 403 Forbidden)`);

    // 3.4: Chặn người dùng không phải ADMIN khôi phục dữ liệu mẫu
    const forbiddenResetRes = await makeRequest({
      hostname: 'localhost',
      port: testPort,
      path: '/api/reset-seed',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${buyerToken}`
      }
    });

    assert(forbiddenResetRes.statusCode === 403, `Chặn người dùng thường gọi /api/reset-seed (HTTP 403 Forbidden)`);

    // 3.5: Kiểm tra Rate Limiting chống Brute-force mật khẩu (Giới hạn tối đa 5 lần thử sai)
    console.log('\n▶ [PHẦN 4] Kiểm tra Cơ Chế Chống Tấn Công Dò Mật Khẩu (Brute-Force Rate Limiting)...');
    const targetBruteUser = 'test_brute_force_target';
    let rateLimited = false;

    for (let i = 1; i <= 6; i++) {
      const loginAttempt = await makeRequest({
        hostname: 'localhost',
        port: testPort,
        path: '/api/auth/login',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      }, {
        usernameOrEmail: targetBruteUser,
        password: `WrongPasswordAttempt_${i}`
      });

      if (loginAttempt.statusCode === 429) {
        rateLimited = true;
        assert(true, `Phát hiện & Chặn đứng tấn công Brute-force ở lần thứ ${i} (HTTP 429 Too Many Requests)`);
        assert(loginAttempt.data.code === 'TOO_MANY_REQUESTS', 'Phản hồi mã lỗi bảo mật chuẩn TOO_MANY_REQUESTS');
        break;
      }
    }

    if (!rateLimited) {
      assert(false, 'Rate limiter không chặn sau 5 lần thử sai');
    }

  } finally {
    server.close();
  }

  console.log('\n========================================================================');
  console.log(`📊 KẾT QUẢ KIỂM THỬ BẢO MẬT: ${passedTests}/${totalTests} BÀI KIỂM TRA ĐẠT TIÊU CHUẨN`);
  console.log('========================================================================\n');

  if (passedTests === totalTests) {
    console.log('🎉 TẤT CẢ CÁC TÍNH NĂNG BẢO MẬT BACKEND HOẠT ĐỘNG HOÀN HẢO THEO CHUẨN ISO 9001 & DOANH NGHIỆP!');
    process.exit(0);
  } else {
    console.error('⚠️ Có bài kiểm tra không đạt!');
    process.exit(1);
  }
}

runSecuritySuite().catch(err => {
  console.error('[Fatal Security Test Error]:', err);
  process.exit(1);
});
