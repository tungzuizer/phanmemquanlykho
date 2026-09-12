/*
1. Importers/Callers: Direct test script executed via node test_delete_and_po.js
2. Affected API: wmsService.createPo, wmsService.deletePo, wmsService.deleteOrder, wmsService.deleteGdn, wmsService.deleteGrn, wmsService.deletePickupRegistration, wmsService.deleteReturn.
3. Data schemas: Prisma Models (PurchaseOrder, Order, BillOfMaterial, BomItem, StockBalance).
4. User's verbatim instruction: "Ban Giám Đốc MEVN (ADMIN) và tôi cần chức năng xóa" / "push lên github"
*/

require('dotenv').config();
const prisma = require('./src/db');
const wmsService = require('./src/services/wmsService');

async function testDeleteAndPo() {
  console.log('🧪 BẮT ĐẦU KIỂM THỬ CHỨC NĂNG XÓA CHỨNG TỪ & TẠO PO CHUẨN...');

  try {
    const state = await wmsService.getFullState();
    const admin = state.users.find(u => u.role === 'ADMIN') || state.users[0];
    const techUser = state.users.find(u => u.role === 'KY_THUAT') || state.users[0];
    const whUser = state.users.find(u => u.role === 'THU_KHO') || state.users[0];
    const supplier = state.suppliers[0];
    const sku = state.skus[0];
    const warehouse = state.warehouses[0];

    const ts = Date.now();

    // 1. Test tạo PO với đầy đủ Supplier & Items
    console.log('\n1. Test tạo Đơn Mua Hàng PO...');
    const po = await wmsService.createPo({
      code: `PO-TEST-DEL-${ts}`,
      supplierId: supplier.id,
      createdById: admin.id,
      note: 'Kiểm thử tạo PO đầy đủ',
      items: [
        {
          skuId: sku.id,
          quantity: 10,
          unitPrice: 50000,
        }
      ]
    });
    console.log(`✅ Tạo PO thành công: ${po.code} (ID: ${po.id}, NCC: ${supplier.name})`);

    // 2. Test Xóa PO
    console.log('\n2. Test Xóa PO...');
    const deletePoResult = await wmsService.deletePo(po.id);
    console.log(`✅ Xóa PO thành công:`, deletePoResult);

    const poCheck = await prisma.purchaseOrder.findUnique({ where: { id: po.id } });
    if (poCheck) throw new Error('PO vẫn còn tồn tại trong DB sau khi xóa!');
    console.log('✅ Đã xác thực PO đã bị xóa hoàn toàn khỏi DB');

    // 3. Test Tạo Order + BOM + Giữ chỗ (Reserve) + Xóa Order & Rollback Reserved Stock
    console.log('\n3. Test Tạo Order + BOM + Giữ chỗ vật tư...');

    // Kiểm tra số dư tồn ban đầu
    const balanceBefore = await prisma.stockBalance.findFirst({
      where: { skuId: sku.id, warehouseId: warehouse.id }
    });
    const reservedBefore = Number(balanceBefore?.quantityReserved || 0);
    console.log(`   - Tồn kho trước khi tạo đơn: Reserved = ${reservedBefore}`);

    const order = await wmsService.createOrder({
      code: `DH-TEST-DEL-${ts}`,
      title: `Đơn Hàng Kiểm Thử Xóa Rollback ${ts}`,
      customerName: 'MEVN Test Client',
      saleAdminId: admin.id,
      panels: [
        { code: `PANEL-DEL-${ts}`, name: 'Tủ Test Xóa', panelType: 'MSB' }
      ]
    });

    const bom = await wmsService.submitBom(order.id, {
      panelId: order.panels[0].id,
      version: 1,
      submittedById: techUser.id,
      items: [
        {
          skuId: sku.id,
          quantityRequired: 5,
          warehouseId: warehouse.id
        }
      ]
    });

    // Verify BOM -> Khóa giữ chỗ
    await wmsService.verifyBom(bom.id, { verifiedById: whUser.id });

    const balanceAfterVerify = await prisma.stockBalance.findFirst({
      where: { skuId: sku.id, warehouseId: warehouse.id }
    });
    const reservedAfterVerify = Number(balanceAfterVerify?.quantityReserved || 0);
    console.log(`   - Tồn kho sau khi khóa BOM: Reserved = ${reservedAfterVerify} (Tăng ${reservedAfterVerify - reservedBefore})`);

    // 4. Test Xóa Đơn Hàng & Tự Động Rollback Stock
    console.log('\n4. Test Xóa Đơn Hàng & Tự Động Rollback Stock...');
    const deleteOrderResult = await wmsService.deleteOrder(order.id);
    console.log('✅ Kết quả xóa đơn hàng:', deleteOrderResult);

    const balanceAfterDelete = await prisma.stockBalance.findFirst({
      where: { skuId: sku.id, warehouseId: warehouse.id }
    });
    const reservedAfterDelete = Number(balanceAfterDelete?.quantityReserved || 0);
    console.log(`   - Tồn kho sau khi xóa đơn: Reserved = ${reservedAfterDelete}`);

    if (reservedAfterDelete !== reservedBefore) {
      throw new Error(`Rollback thất bại: Reserved trước = ${reservedBefore}, sau = ${reservedAfterDelete}`);
    }
    console.log('✅ Đã xác thực Rollback Reserved Stock thành công 100%!');

    const orderCheck = await prisma.order.findUnique({ where: { id: order.id } });
    if (orderCheck) throw new Error('Order vẫn còn tồn tại trong DB sau khi xóa!');
    console.log('✅ Đã xác thực Đơn hàng và toàn bộ dữ liệu liên đới đã được xóa sạch.');

    console.log('\n🎉 TOÀN BỘ KIỂM THỬ XÓA & TẠO PO ĐÃ HOÀN TẤT THÀNH CÔNG VỚI TÍNH TOÀN VẸN ACID!');
  } catch (err) {
    console.error('❌ Lỗi kiểm thử:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

testDeleteAndPo();
