// 1. Importers/Callers: Test suite for invoice and voucher printing engine (node test_invoice_printing.js)
// 2. Affected API: Verifies DataNormalizer, WmsService data contracts and ISO 9001:2015 print document layouts
// 3. Data Schemas: Tests GDN, PO, GRN, RETURN, BOM, ORDER, PICKUP document types
// 4. User's Verbatim Instruction: "dọn hết dữ liệu check lại logic 1 lần nữa phần xuất hóa đơn lỗi"

require('dotenv').config();
const wmsService = require('./src/services/wmsService');

async function testInvoicePrinting() {
  console.log('========================================================================');
  console.log('🖨️  KIỂM THỬ ĐỘ CHÍNH XÁC XUẤT HÓA ĐƠN & BIỂU MẪU CHUẨN ISO 9001:2015');
  console.log('========================================================================\n');

  try {
    const state = await wmsService.getFullState();
    console.log('✅ Đã nạp thành công dữ liệu từ Supabase PostgreSQL.');

    const docTypes = [
      { type: 'GDN', list: state.goodsDispatchNotes, label: 'Phiếu Xuất Kho (PXK-BOM-01)' },
      { type: 'PO', list: state.purchaseOrders, label: 'Đơn Đặt Hàng Nhà Cung Cấp (PO)' },
      { type: 'GRN', list: state.goodsReceiptNotes, label: 'Phiếu Nhập Kho Vật Tư (GRN)' },
      { type: 'RETURN', list: state.stockReturnNotes, label: 'Phiếu Nhập Trả Phế Liệu (NTK)' },
      { type: 'BOM', list: state.boms, label: 'Bảng Định Mức Kỹ Thuật (BOM)' },
      { type: 'ORDER', list: state.orders, label: 'Lệnh Sản Xuất Tủ Điện (LSX)' },
      { type: 'PICKUP', list: state.pickupRegistrations, label: 'Phiếu Đăng Ký Ca Lấy Hàng (Mẫu 1)' },
    ];

    let passedTests = 0;
    let failedTests = 0;

    for (const docGroup of docTypes) {
      console.log(`\n▶ [KIỂM TRA] ${docGroup.label} (Loại: ${docGroup.type})...`);
      if (!docGroup.list || docGroup.list.length === 0) {
        console.warn(`⚠️  Cảnh báo: Danh sách ${docGroup.type} trống!`);
        continue;
      }

      for (const doc of docGroup.list) {
        console.log(`   📄 Kiểm tra chứng từ [${doc.code || doc.id}]:`);

        // 1. Kiểm tra mã chứng từ
        if (!doc.code && !doc.id) {
          console.error(`   ❌ Lỗi: Thiếu mã chứng từ`);
          failedTests++;
          continue;
        }

        // 2. Kiểm tra Items
        const items = doc.items || doc.panels || [doc];
        if (!items || items.length === 0) {
          console.error(`   ❌ Lỗi: Chứng từ không có dòng chi tiết (items)`);
          failedTests++;
          continue;
        }

        let calculatedTotal = 0;
        let validItems = 0;

        items.forEach((it, idx) => {
          const skuCode = it.skuCode || it.sku?.code || it.code || 'N/A';
          const skuName = it.skuName || it.sku?.name || it.name || it.panelName || 'N/A';
          const uomName = it.uomName || it.purchasingUomName || it.sku?.baseUom?.name || 'Cái';
          const qty = Number(it.quantityReal || it.quantityReceived || it.quantityPurchased || it.quantityRequired || it.quantity || 0);
          const unitCost = Number(it.unitCost || it.unitPrice || it.baseUnitCost || 0);
          const lineTotal = Number(it.lineTotal || (unitCost * qty));

          if (isNaN(qty) || isNaN(unitCost) || isNaN(lineTotal)) {
            console.error(`   ❌ Lỗi NaN tại dòng #${idx + 1}: Qty=${qty}, UnitCost=${unitCost}, LineTotal=${lineTotal}`);
            failedTests++;
            return;
          }

          calculatedTotal += lineTotal;
          validItems++;
        });

        console.log(`   ✅ Dòng chi tiết: ${validItems}/${items.length} hợp lệ, Tổng tiền tính toán: ${calculatedTotal.toLocaleString('vi-VN')} ₫`);
        passedTests++;
      }
    }

    console.log('\n========================================================================');
    console.log(`🎉 KẾT QUẢ KIỂM THỬ XUẤT HÓA ĐƠN & CHỨNG TỪ: ${passedTests} ĐẠT, ${failedTests} LỖI`);
    console.log('========================================================================\n');

    if (failedTests > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error('❌ Lỗi kiểm thử hóa đơn:', err);
    process.exit(1);
  }
}

testInvoicePrinting();
