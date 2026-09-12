// 1. Importers/Callers: Test and diagnostic suite (node test_supabase_diagnostic.js)
// 2. Affected API: Supabase PostgreSQL direct connectivity and entity count verification
// 3. Data schemas: PrismaClient, PostgreSQL connection pool, all 14 domain entity models
// 4. User's verbatim instruction: "hãy kiểm kết nối database với supabase"

require('dotenv').config();
const prisma = require('./src/db');

async function checkSupabase() {
  const start = Date.now();
  console.log('====================================================');
  console.log('🔍 KIỂM TRA KẾT NỐI DATABASE SUPABASE POSTGRESQL');
  console.log('====================================================\n');
  try {
    const rawResult = await prisma.$queryRaw`SELECT version(), current_database(), current_user, inet_server_addr(), now();`;
    const latency = Date.now() - start;
    console.log('✅ KẾT NỐI SUPABASE THÀNH CÔNG RỰC RỠ!');
    console.log(`⏱️  Thời gian phản hồi (Roundtrip Latency): ${latency} ms`);
    console.log('\n📊 THÔNG TIN MÁY CHỦ SUPABASE:');
    console.log(`   - Database name: ${rawResult[0].current_database}`);
    console.log(`   - User: ${rawResult[0].current_user}`);
    console.log(`   - Server IP: ${rawResult[0].inet_server_addr}`);
    console.log(`   - Supabase Server Time: ${rawResult[0].now}`);
    console.log(`   - PostgreSQL Version: ${rawResult[0].version}`);

    // Check entity counts
    const [
      userCount,
      warehouseCount,
      skuCount,
      stockCount,
      supplierCount,
      orderCount,
      bomCount,
      poCount,
      grnCount,
      pickupCount,
      gdnCount,
      returnCount,
      txCount,
      kpiCount
    ] = await prisma.$transaction([
      prisma.user.count(),
      prisma.warehouse.count(),
      prisma.sku.count(),
      prisma.stockBalance.count(),
      prisma.supplier.count(),
      prisma.order.count(),
      prisma.bom.count(),
      prisma.purchaseOrder.count(),
      prisma.goodsReceiptNote.count(),
      prisma.pickupRegistration.count(),
      prisma.goodsDispatchNote.count(),
      prisma.stockReturnNote.count(),
      prisma.stockTransaction.count(),
      prisma.kpiLog.count()
    ]);

    console.log('\n📈 THỐNG KÊ TOÀN BỘ 14 BẢNG THỰC THỂ TRÊN SUPABASE:');
    console.log(`   1. Users (Tài khoản người dùng): ${userCount}`);
    console.log(`   2. Warehouses (Kho vật tư): ${warehouseCount}`);
    console.log(`   3. SKUs (Danh mục vật tư): ${skuCount}`);
    console.log(`   4. Stock Balances (Thẻ kho tồn thực tế/giữ chỗ): ${stockCount}`);
    console.log(`   5. Suppliers (Nhà cung cấp): ${supplierCount}`);
    console.log(`   6. Orders (Đơn hàng / Lệnh sản xuất): ${orderCount}`);
    console.log(`   7. BOMs (Bảng định mức kỹ thuật): ${bomCount}`);
    console.log(`   8. Purchase Orders (Đơn mua PO): ${poCount}`);
    console.log(`   9. Goods Receipt Notes (Phiếu nhập kho GRN): ${grnCount}`);
    console.log(`   10. Pickup Registrations (Đăng ký lấy hàng ca): ${pickupCount}`);
    console.log(`   11. Goods Dispatch Notes (Phiếu xuất kho GDN): ${gdnCount}`);
    console.log(`   12. Stock Return Notes (Phiếu nhập trả / phế phẩm): ${returnCount}`);
    console.log(`   13. Stock Transactions (Sổ cái giao dịch kho bất biến): ${txCount}`);
    console.log(`   14. KPI Logs (Nhật ký chỉ số ISO 9001): ${kpiCount}`);

    console.log('\n====================================================');
    console.log('🎉 TẤT CẢ KẾT NỐI & DỮ LIỆU ĐỀU HOẠT ĐỘNG HOÀN HẢO!');
    console.log('====================================================\n');
  } catch (err) {
    console.error('\n❌ LỖI KẾT NỐI SUPABASE:', err);
  } finally {
    await prisma.$disconnect();
  }
}

checkSupabase();
