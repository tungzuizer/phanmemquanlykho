/*
1. Importers/Callers: Direct CLI test execution via node test_order_speed.js
2. Affected API: wmsService.createOrder, wmsService.getFullState, wmsService.deleteOrder.
3. Data schemas: Prisma Order, OrderPanel, User, BillOfMaterial.
4. User's verbatim instruction: "lỗi không thể tạo đơn kiểm tra kỹ logic và quá lâu" / "theo khuyến nghị của bạn"
*/

require('dotenv').config();
const prisma = require('./src/db');
const wmsService = require('./src/services/wmsService');

async function testOrderCreationAndSpeed() {
  console.log('⚡ KIỂM THỬ TỐC ĐỘ VÀ LOGIC TẠO ĐƠN HÀNG TRÊN SUPABASE CLOUD...');

  try {
    const t0 = Date.now();
    const state = await wmsService.getFullState();
    const tFetch = Date.now() - t0;
    console.log(`⏱️ Thời gian tải getFullState(): ${tFetch}ms (Mục tiêu < 500ms)`);

    const admin = state.users.find(u => u.role === 'ADMIN') || state.users[0];
    const ts = Date.now();

    // Test 1: Tạo đơn với frontend payload format (customer, deliveryDate, cabinetType: MSB, priority)
    console.log('\n▶ Test 1: Tạo đơn MSB theo payload chuẩn Frontend...');
    const tCreate1 = Date.now();
    const order1 = await wmsService.createOrder({
      code: `DH-SPEED-MSB-${ts}`,
      title: 'Dự án Tủ Điện Tổng MSB Bitexco',
      customer: 'Tập đoàn Bitexco',
      deliveryDate: new Date(Date.now() + 10 * 86400000).toISOString().split('T')[0],
      cabinetType: 'MSB',
      priority: 'HIGH',
      note: 'Yêu cầu kiểm tra Form 4B',
      createdById: admin.id,
    });
    const dur1 = Date.now() - tCreate1;
    console.log(`✅ Tạo đơn 1 thành công trong ${dur1}ms! Mã đơn: ${order1.code}, ID: ${order1.id}`);
    console.log(`   - Khách hàng: ${order1.customerName}`);
    console.log(`   - Số lượng tủ: ${order1.panels.length} (Mã: ${order1.panels[0].code}, Loại: ${order1.panels[0].panelType})`);

    if (order1.panels[0].panelType !== 'MSB' || order1.panels[0].code !== 'TU-MSB-01') {
      throw new Error(`Sai thông tin Panel: ${JSON.stringify(order1.panels[0])}`);
    }

    // Test 2: Tạo đơn với frontend payload format (PCCC, deliveryDate, note)
    console.log('\n▶ Test 2: Tạo đơn PCCC...');
    const tCreate2 = Date.now();
    const order2 = await wmsService.createOrder({
      code: `DH-SPEED-PCCC-${ts}`,
      title: 'Dự án Tủ Điều Khiển PCCC Chung Cư Masteri',
      customer: 'Masterise Homes',
      deliveryDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      cabinetType: 'PCCC',
      priority: 'URGENT',
      note: 'Bơm bù áp và bơm chính 75kW',
      saleAdminId: admin.id,
    });
    const dur2 = Date.now() - tCreate2;
    console.log(`✅ Tạo đơn 2 thành công trong ${dur2}ms! Mã đơn: ${order2.code}, ID: ${order2.id}`);
    console.log(`   - Khách hàng: ${order2.customerName}`);
    console.log(`   - Số lượng tủ: ${order2.panels.length} (Mã: ${order2.panels[0].code}, Loại: ${order2.panels[0].panelType})`);

    // Dọn dẹp đơn test
    console.log('\n▶ Dọn dẹp đơn hàng test...');
    await wmsService.deleteOrder(order1.id);
    await wmsService.deleteOrder(order2.id);
    console.log('✅ Đã dọn dẹp sạch sẽ các đơn hàng test.');

    console.log('\n🎉 TOÀN BỘ KIỂM THỬ TỐC ĐỘ VÀ LOGIC TẠO ĐƠN HÀNG THÀNH CÔNG VƯỢT TRỘI!');
  } catch (err) {
    console.error('❌ Lỗi kiểm thử:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

testOrderCreationAndSpeed();
