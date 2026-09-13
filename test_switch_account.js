/**
 * Fact-Forcing Gate Details:
 * 1. Importers/Callers: Test runner script executed via CLI (`node test_switch_account.js`)
 * 2. Affected API: POST /api/auth/switch, POST /api/pos, JWT token generation & verification (src/utils/auth.js, server.js, src/services/wmsService.js)
 * 3. Data schemas: Authentication payload { email, username, targetUserId }, JWT Token payload { id, username, email, role, fullName }, User matrix permissions & allowedTabs
 * 4. User's verbatim instruction: "sao ở phần trong tài khoản chuyển tài khoản không thay đổi gì vậy"
 */

require('dotenv').config();
const http = require('http');
const { verifyToken } = require('./src/utils/auth');
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

async function runSwitchAccountTests() {
  console.log('========================================================================');
  console.log('🔄 KIỂM THỬ TÍNH NĂNG CHUYỂN TÀI KHOẢN & CẤP LẠI TOKEN JWT (/api/auth/switch)');
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

  const testPort = await new Promise((resolve) => {
    const testServer = server.listen(0, () => {
      const addr = testServer.address();
      resolve(addr.port);
    });
  });

  try {
    // 1. Switch to Thủ kho
    console.log('▶ [BƯỚC 1] Chuyển đổi sang tài khoản Thủ kho (THU_KHO)...');
    const switchWhRes = await makeRequest({
      hostname: 'localhost',
      port: testPort,
      path: '/api/auth/switch',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      email: 'storemanager@maxelectric.vn'
    });

    assert(switchWhRes.statusCode === 200, `API /api/auth/switch trả về HTTP 200 OK cho Thủ kho`);
    assert(switchWhRes.data.success === true, 'Phản hồi success: true');
    assert(!!switchWhRes.data.token, 'Cấp phát Token JWT mới cho Thủ kho');

    const decodedWh = verifyToken(switchWhRes.data.token);
    assert(decodedWh && decodedWh.role === 'THU_KHO', `Token chứa role chính xác: ${decodedWh?.role}`);
    assert(switchWhRes.data.user.allowedTabs.includes('dispatch'), 'Thủ kho có quyền truy cập tab dispatch (Xuất kho)');

    // 2. Switch to Kỹ thuật
    console.log('\n▶ [BƯỚC 2] Chuyển đổi sang tài khoản Kỹ thuật (KY_THUAT)...');
    const switchTechRes = await makeRequest({
      hostname: 'localhost',
      port: testPort,
      path: '/api/auth/switch',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      email: 'manh.dh@maxelectric.vn'
    });

    assert(switchTechRes.statusCode === 200, `API /api/auth/switch trả về HTTP 200 OK cho Kỹ thuật`);
    const decodedTech = verifyToken(switchTechRes.data.token);
    assert(decodedTech && decodedTech.role === 'KY_THUAT', `Token chứa role chính xác: ${decodedTech?.role}`);
    assert(switchTechRes.data.user.allowedTabs.includes('boms'), 'Kỹ thuật có quyền truy cập tab boms (Định mức kỹ thuật)');

    // 3. Chuyển đổi sang Mua hàng
    console.log('\n▶ [BƯỚC 3] Chuyển đổi sang tài khoản Mua hàng (MUA_HANG)...');
    const switchBuyerRes = await makeRequest({
      hostname: 'localhost',
      port: testPort,
      path: '/api/auth/switch',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      email: 'Nguyenthitienmax@gmail.com'
    });

    assert(switchBuyerRes.statusCode === 200, `API /api/auth/switch trả về HTTP 200 OK cho Mua hàng`);
    const decodedBuyer = verifyToken(switchBuyerRes.data.token);
    assert(decodedBuyer && decodedBuyer.role === 'MUA_HANG', `Token chứa role chính xác: ${decodedBuyer?.role}`);
    assert(switchBuyerRes.data.user.allowedTabs.includes('pos'), 'Mua hàng có quyền truy cập tab pos (Đơn mua hàng PO)');

    // 4. Kiểm tra quyền thực thi API sau khi chuyển vai trò
    console.log('\n▶ [BƯỚC 4] Kiểm tra phân quyền thực thi trên Backend sau khi đổi Token...');
    const techBlockRes = await makeRequest({
      hostname: 'localhost',
      port: testPort,
      path: '/api/pos',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${switchTechRes.data.token}`
      }
    }, { code: 'PO-TEST-FORBIDDEN' });

    assert(techBlockRes.statusCode === 403, 'Token Kỹ thuật mới bị chặn tạo PO (HTTP 403 Forbidden)');

  } finally {
    server.close();
  }

  console.log('\n========================================================================');
  console.log(`📊 KẾT QUẢ: ${passedTests}/${totalTests} BÀI KIỂM TRA ĐẠT TIÊU CHUẨN`);
  console.log('========================================================================\n');

  if (passedTests === totalTests) {
    console.log('🎉 TÍNH NĂNG CHUYỂN TÀI KHOẢN VÀ CẤP PHÁT TOKEN JWT MỚI ĐÃ HOẠT ĐỘNG HOÀN HẢO 100%!');
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runSwitchAccountTests().catch(err => {
  console.error('[Fatal Error in Test]:', err);
  process.exit(1);
});
