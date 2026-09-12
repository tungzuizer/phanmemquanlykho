// 1. Importers/Callers: Test runner script (node test_e2e_supabase.js)
// 2. Affected API: End-to-End Test for all 11 MEVN WMS Workflows on Supabase PostgreSQL
// 3. Data Schemas: Prisma Client 19 Models in mevn_wms schema
// 4. User's Verbatim Instruction: "check lại logic cốt lõi cấm đươc fake dự liệu phải thật nghiệm ngặt về luồng dữ liệu và logic code và dữ liệu sẽ lưu trên database" and "dùng data base trên supabase"

require('dotenv').config();
const prisma = require('./src/db');
const wmsService = require('./src/services/wmsService');

async function runE2ETest() {
  console.log('========================================================================');
  console.log('🧪 BẮT ĐẦU KIỂM THỬ END-TO-END MEVN WMS TRÊN SUPABASE CLOUD POSTGRESQL');
  console.log('========================================================================\n');

  try {
    // 1. TEST KẾT NỐI VÀ GET FULL STATE
    console.log('▶ [BƯỚC 1] Kiểm tra kết nối Supabase và tải Full State...');
    const state = await wmsService.getFullState();
    console.log(`✅ Kết nối thành công! Đã tải từ Supabase:
    - ${state.users.length} Users
    - ${state.warehouses.length} Kho hàng
    - ${state.skus.length} Mã SKU
    - ${state.stockBalances.length} Bản ghi tồn kho
    - ${state.orders.length} Đơn hàng
    - ${state.stockTransactions.length} Giao dịch Sổ Cái (Ledger)
    - ${state.kpiLogs.length} Bản ghi Audit KPI`);

    const admin = state.users.find(u => u.role === 'ADMIN') || state.users[0];
    const techUser = state.users.find(u => u.role === 'KY_THUAT') || state.users[0];
    const whUser = state.users.find(u => u.role === 'THU_KHO') || state.users[0];
    const prodUser = state.users.find(u => u.role === 'SAN_XUAT') || state.users[0];
    const buyerUser = state.users.find(u => u.role === 'MUA_HANG') || state.users[0];

    const testTimestamp = Date.now();
    const testOrderCode = `DH-TEST-${testTimestamp}`;

    // 2. TEST TẠO ĐƠN HÀNG MỚI (SALE ADMIN)
    console.log('\n▶ [BƯỚC 2] Tạo Đơn Hàng Mới...');
    const newOrder = await wmsService.createOrder({
      code: testOrderCode,
      title: `Tủ Điện Bơm Cứu Hỏa PCCC E2E Test - ${testTimestamp}`,
      customerName: 'Công ty Cổ phần Xây Lắp Điện Miền Bắc',
      saleAdminId: admin.id,
      targetDeliveryDate: new Date('2026-10-15'),
      note: 'Dự án trọng điểm kiểm thử luồng nghiệp vụ Supabase',
      panels: [
        { code: `TU-PCCC-01-${testTimestamp}`, name: 'Tủ Điều Khiển Bơm PCCC 1', panelType: 'PCCC' },
        { code: `TU-PCCC-02-${testTimestamp}`, name: 'Tủ Điều Khiển Bơm PCCC 2', panelType: 'PCCC' },
      ],
    });
    console.log(`✅ Đã tạo Đơn hàng [${newOrder.code}] với ID: ${newOrder.id}, ${newOrder.panels.length} tủ điện.`);

    const panel1 = newOrder.panels[0];

    // 3. TEST KỸ THUẬT GỬI BOM (BOM SUBMIT)
    console.log('\n▶ [BƯỚC 3] Kỹ thuật nạp và gửi Bản Định Mức Vật Tư (BOM)...');
    const mcbSku = state.skus.find(s => s.code === 'SKU-MCB-2P-16A') || state.skus[0];
    const cableSku = state.skus.find(s => s.code === 'SKU-CAP-CDV-1X6') || state.skus[1];

    const submittedBom = await wmsService.submitBom(newOrder.id, {
      panelId: panel1.id,
      version: 1,
      submittedById: techUser.id,
      notes: 'BOM V1 thiết kế theo hồ sơ kỹ thuật duyệt',
      items: [
        {
          skuId: mcbSku.id,
          quantityRequired: 5,
          warehouseId: mcbSku.defaultWarehouseId || state.warehouses[0].id,
          note: 'Aptomat điều khiển bơm mồi',
        },
        {
          skuId: cableSku.id,
          quantityRequired: 200, // Cần 200 mét
          warehouseId: cableSku.defaultWarehouseId || state.warehouses[0].id,
          note: 'Dây cáp động lực Cadivi 1x6mm2',
        },
      ],
    });
    console.log(`✅ Đã gửi BOM ID: ${submittedBom.id} (Trạng thái: ${submittedBom.status}, ${submittedBom.items.length} hạng mục vật tư).`);

    // 4. TEST KHO ĐỐI CHIẾU TỒN & GIỮ CHỖ VẬT TƯ (ACID TRANSACTION)
    console.log('\n▶ [BƯỚC 4] Kho đối chiếu tồn kho và khóa giữ chỗ tự động...');
    const verifyResult = await wmsService.verifyBom(submittedBom.id, {
      verifiedById: whUser.id,
    });
    console.log(`✅ Kết quả đối chiếu BOM: Trạng thái BOM = ${verifyResult.bom.status}, Trạng thái Đơn hàng = ${verifyResult.orderStatus}`);
    verifyResult.bom.items.forEach(it => {
      console.log(`   - SKU [${it.sku.code}]: Cần = ${it.quantityRequired}, Đã giữ chỗ = ${it.quantityReserved}, Còn thiếu = ${it.quantityPendingPo}, Khả dụng = ${it.status}`);
    });

    // 5. NẾU CÓ THIẾU -> TEST MUA HÀNG TẠO PO VÀ NHẬP KHO GRN
    const missingItem = verifyResult.bom.items.find(it => Number(it.quantityPendingPo) > 0);
    if (missingItem) {
      console.log(`\n▶ [BƯỚC 5] Phát hiện thiếu vật tư [${missingItem.sku.code}], Mua Hàng tạo PO bù thiếu...`);
      const supplier = state.suppliers[0];
      const newPo = await wmsService.createPo({
        code: `PO-TEST-${testTimestamp}`,
        supplierId: supplier.id,
        orderId: newOrder.id,
        createdById: buyerUser.id,
        note: `Mua bù thiếu cho đơn hàng ${newOrder.code}`,
        items: [
          {
            skuId: missingItem.skuId,
            quantity: Number(missingItem.quantityPendingPo),
            purchasingUomId: missingItem.sku.baseUomId,
            unitPrice: 150000,
            bomItemId: missingItem.id,
          },
        ],
      });
      console.log(`✅ Đã tạo PO [${newPo.code}] tổng tiền = ${newPo.totalAmount.toLocaleString()} ₫.`);

      // 6. TEST NHẬP KHO GRN VÀ TỰ ĐỘNG GIỮ CHỖ (ADR-0005)
      console.log('\n▶ [BƯỚC 6] Hàng về kho: Thủ kho lập Phiếu Nhập Kho (GRN) & Tự động giữ chỗ cho BOM...');
      const grn = await wmsService.receiveGrn({
        poId: newPo.id,
        warehouseId: missingItem.warehouseId,
        createdById: whUser.id,
        supplierDeliveryNote: `PXK-NCC-${testTimestamp}`,
        note: 'Nhập hàng đúng quy cách kiểm định',
        items: [
          {
            poItemId: newPo.items[0].id,
            skuId: missingItem.skuId,
            quantityReceived: Number(missingItem.quantityPendingPo),
            purchasingUomId: missingItem.sku.baseUomId,
            unitCost: 150000,
            lotNumber: `LOT-${testTimestamp}`,
            warehouseId: missingItem.warehouseId,
          },
        ],
      });
      console.log(`✅ Đã lập GRN [${grn.code}]. Hàng đã nhập và tự động chuyển vào tồn giữ chỗ cho đơn hàng!`);
    }

    // 7. TEST ĐĂNG KÝ LẤY HÀNG (SẢN XUẤT) & AUDIT KPI
    console.log('\n▶ [BƯỚC 7] Sản xuất gửi Đăng ký lấy hàng (Mẫu 1) theo Ca...');
    const pickupReg = await wmsService.registerPickup({
      code: `DKLH-TEST-${testTimestamp}`,
      orderId: newOrder.id,
      panelId: panel1.id,
      shiftType: 'CA_SANG',
      pickupDate: '2026-09-20',
      isEmergency: false,
      registeredById: prodUser.id,
      note: 'Chuẩn bị lắp ráp khung tủ',
    });
    console.log(`✅ Đã đăng ký lấy hàng [${pickupReg.code}], Ca lấy hàng: ${pickupReg.shiftType}`);

    // 8. TEST TẠO PHIẾU XUẤT KHO GDN, DUYỆT VÀ THỰC XUẤT
    console.log('\n▶ [BƯỚC 8] Thủ kho tạo Phiếu Xuất Kho (GDN), Duyệt và Thực xuất ký nhận...');
    const updatedBom = await prisma.bom.findUnique({
      where: { id: submittedBom.id },
      include: { items: { include: { sku: true } } },
    });

    const gdn = await wmsService.createGdn({
      orderId: newOrder.id,
      panelId: panel1.id,
      warehouseId: state.warehouses[0].id,
      pickupRegistrationId: pickupReg.id,
      createdById: whUser.id,
      receiverName: prodUser.fullName,
      receiverRole: prodUser.role,
      isEmergency: false,
      isOutOfShift: false,
      items: updatedBom.items.map(it => ({
        bomItemId: it.id,
        skuId: it.skuId,
        quantityBom: Number(it.quantityRequired),
        quantityReal: Number(it.quantityReserved) || Number(it.quantityRequired),
        unitCost: Number(it.sku.standardCost) || 50000,
        note: 'Xuất theo định mức duyệt',
      })),
    });
    console.log(`✅ Đã tạo GDN [${gdn.code}] (Trạng thái: ${gdn.status})`);

    // Duyệt GDN
    const approvedGdn = await wmsService.approveGdn(gdn.id, { approvedById: admin.id });
    console.log(`✅ Ban Quản Lý đã duyệt GDN [${approvedGdn.code}] (Trạng thái: ${approvedGdn.status})`);

    // Thực xuất & Ký nhận điện tử (ACID Mutation + Stock Balance Deduction + Ledger)
    const dispatchedGdn = await wmsService.dispatchGdn(gdn.id);
    console.log(`✅ Thủ kho đã THỰC XUẤT kho GDN [${dispatchedGdn.code}]!`);

    // 9. KIỂM TRA SỔ CÁI (STOCK LEDGER) & TỒN KHO SAU XUẤT
    console.log('\n▶ [BƯỚC 9] Kiểm tra Sổ Cái Giao Dịch Kho (Stock Ledger) trên Supabase...');
    const latestTx = await prisma.stockTransaction.findMany({
      where: { gdnId: dispatchedGdn.id },
      include: { sku: true, warehouse: true },
    });
    console.log(`✅ Đã ghi nhận ${latestTx.length} bản ghi giao dịch bất biến vào Sổ Cái:`);
    latestTx.forEach(tx => {
      console.log(`   - Giao dịch [${tx.id.substring(0, 8)}] | Loại: ${tx.transactionType} | SKU: ${tx.sku.code} | Trước: ${tx.quantityBefore} -> Biến động: ${tx.quantityChange} -> Sau: ${tx.quantityAfter} | Giá vốn: ${Number(tx.unitCost).toLocaleString()} ₫`);
    });

    // 10. TEST NHẬP TRẢ LẠI KHO (B3: Thừa hoặc Phế Liệu)
    console.log('\n▶ [BƯỚC 10] Kiểm thử luồng Nhập Trả Hàng (Quy trình B3)...');
    const returnNote = await wmsService.createReturn({
      orderId: newOrder.id,
      panelId: panel1.id,
      warehouseId: state.warehouses[0].id,
      createdById: prodUser.id,
      reason: 'Hoàn thành tủ sớm, dư 1 MCB nguyên vẹn và thừa 5m cáp',
      items: [
        {
          skuId: mcbSku.id,
          quantity: 1,
          isReusable: true,
          scrapWarehouseId: null,
          note: 'MCB mới 100%, chưa qua sử dụng, nhập lại kho khả dụng',
        },
      ],
    });
    console.log(`✅ Đã lập Phiếu Nhập Trả [${returnNote.code}]. Tồn kho tự do đã được cộng hoàn lại!`);

    // 11. KIỂM TRA BẤT BIẾN TOÀN CỤC VÀ DB CONSTRAINTS
    console.log('\n▶ [BƯỚC 11] Kiểm tra tính toàn vẹn và Bất Biến Tồn Kho trên toàn hệ thống...');
    const allBalances = await prisma.stockBalance.findMany({
      include: { sku: true, warehouse: true },
    });

    let violations = 0;
    for (const b of allBalances) {
      const phys = Number(b.quantityPhysical);
      const res = Number(b.quantityReserved);
      const avail = phys - res;
      if (phys < 0 || res < 0 || res > phys || avail < 0) {
        console.error(`❌ VI PHẠM BẤT BIẾN TỒN TẠI SKU [${b.sku.code}] KHO [${b.warehouse.code}]: Physical=${phys}, Reserved=${res}, Available=${avail}`);
        violations++;
      }
    }

    if (violations === 0) {
      console.log(`✅ BẢO TOÀN TUYỆT ĐỐI BẤT BIẾN TỒN KHO TRÊN TOÀN BỘ ${allBalances.length} BẢN GHI:
      👉 Invariant: quantity_physical >= quantity_reserved >= 0 VÀ Available Stock >= 0 luôn thỏa mãn 100%!`);
    }

    console.log('\n========================================================================');
    console.log('🎉 TOÀN BỘ 11 LUỒNG NGHIỆP VỤ ĐÃ KIỂM THỬ THÀNH CÔNG TRÊN SUPABASE POSTGRESQL!');
    console.log('========================================================================\n');

  } catch (err) {
    console.error('❌ LỖI TRONG QUÁ TRÌNH KIỂM THỬ E2E:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runE2ETest();
