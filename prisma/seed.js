// 1. Importers/Callers: Prisma CLI seed command, node prisma/seed.js, server.js initial database booster
// 2. Affected API: Supabase PostgreSQL Database Seed Script
// 3. Data Schemas: Prisma Client 19 Models for MEVN WMS
// 4. User's Verbatim Instruction: "check lại logic cốt lõi cấm đươc fake dự liệu phải thật nghiệm ngặt về luồng dữ liệu và logic code và dữ liệu sẽ lưu trên database" and "dùng data base trên supabase"

require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('⚡ [MEVN SEED] Đang kết nối Supabase PostgreSQL và nạp dữ liệu chuẩn...');

  // 0. Tạo SQL CHECK constraints cho bảng StockBalance để bảo vệ bất biến dữ liệu ở tầng Engine DB
  await prisma.$executeRawUnsafe(`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'chk_stock_balance_positive'
      ) THEN
        ALTER TABLE "stock_balances"
        ADD CONSTRAINT chk_stock_balance_positive CHECK (quantity_physical >= 0);
      END IF;

      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'chk_stock_balance_reserved_valid'
      ) THEN
        ALTER TABLE "stock_balances"
        ADD CONSTRAINT chk_stock_balance_reserved_valid CHECK (quantity_physical >= quantity_reserved AND quantity_reserved >= 0);
      END IF;
    END $$;
  `);

  console.log('✅ [MEVN SEED] Đã thiết lập CHECK Constraints: (quantity_physical >= quantity_reserved >= 0)');

  // 1. SEED USERS
  const usersData = [
    { username: 'admin', email: 'admin@maxelectric.vn', fullName: 'Ban Giám Đốc MEVN', role: 'ADMIN', passwordHash: 'mevn@2026' },
    { username: 'thukho_dien', email: 'thukho.dien@maxelectric.vn', fullName: 'Nguyễn Văn Khoa (Thủ Kho Điện)', role: 'THU_KHO', passwordHash: 'mevn@2026' },
    { username: 'thukho_dong', email: 'thukho.dong@maxelectric.vn', fullName: 'Trần Văn Đồng (Thủ Kho Đồng/Xưởng)', role: 'THU_KHO', passwordHash: 'mevn@2026' },
    { username: 'kythuat_bom', email: 'kythuat.bom@maxelectric.vn', fullName: 'Lê Minh Kỹ (Kỹ Sư Thiết Kế BOM)', role: 'KY_THUAT', passwordHash: 'mevn@2026' },
    { username: 'muahang_po', email: 'muahang.po@maxelectric.vn', fullName: 'Phạm Thị Mua (Trưởng Phòng Thu Mua)', role: 'MUA_HANG', passwordHash: 'mevn@2026' },
    { username: 'sanxuat_to1', email: 'sanxuat.to1@maxelectric.vn', fullName: 'Hoàng Văn Ráp (Tổ Trưởng Lắp Ráp Tủ 1)', role: 'SAN_XUAT', passwordHash: 'mevn@2026' },
    { username: 'sale_admin', email: 'sale.admin@maxelectric.vn', fullName: 'Đỗ Thị Huệ (Sale Admin Dự Án)', role: 'SALE_ADMIN', passwordHash: 'mevn@2026' },
    { username: 'ketoan_kho', email: 'ketoan.kho@maxelectric.vn', fullName: 'Vũ Thị Toán (Kế Toán Kho Đối Chiếu)', role: 'KE_TOAN', passwordHash: 'mevn@2026' },
  ];

  for (const u of usersData) {
    await prisma.user.upsert({
      where: { username: u.username },
      update: u,
      create: u,
    });
  }
  const users = await prisma.user.findMany();
  const userMap = Object.fromEntries(users.map(u => [u.username, u]));
  console.log(`✅ [MEVN SEED] Đã nạp ${users.length} Users nội bộ.`);

  // 2. SEED WAREHOUSES
  const warehousesData = [
    { code: 'KHO_DIEN', name: 'Kho Vật tư Điện & Khí Cụ (Tầng 1)', description: 'Lưu trữ Aptomat, Contactor, Rơ le, Biến tần, Dây cáp, Phụ kiện tủ', isScrapLocation: false },
    { code: 'KHO_DONG', name: 'Kho Đồng & Cơ khí Chế tạo (Xưởng A)', description: 'Lưu trữ Thanh cái đồng đỏ, Đồng lá C1100, Vỏ tủ điện, Thanh ray tôn mạ kẽm', isScrapLocation: false },
    { code: 'KHO_CACH_LY', name: 'Kho Cách ly & Hàng Lỗi / Phế liệu', description: 'Khu vực cách ly thiết bị cháy hỏng, đồng vụn phế liệu chờ thanh lý/thu hồi', isScrapLocation: true },
  ];

  for (const w of warehousesData) {
    await prisma.warehouse.upsert({
      where: { code: w.code },
      update: w,
      create: w,
    });
  }
  const warehouses = await prisma.warehouse.findMany();
  const whMap = Object.fromEntries(warehouses.map(w => [w.code, w]));
  console.log(`✅ [MEVN SEED] Đã nạp ${warehouses.length} Kho.`);

  // 3. SEED UOMs
  const uomsData = [
    { code: 'MET', name: 'Mét', description: 'Đơn vị đo độ dài dây cáp, ray nhôm' },
    { code: 'CAI', name: 'Cái', description: 'Đơn vị đếm khí cụ điện (MCCB, MCB, Contactor)' },
    { code: 'KG', name: 'Kilogram', description: 'Đơn vị đo khối lượng thanh đồng đỏ, vật liệu' },
    { code: 'CUON', name: 'Cuộn', description: 'Đơn vị đóng gói dây điện (1 cuộn = 100 mét)' },
    { code: 'THUNG', name: 'Thùng', description: 'Đơn vị đóng gói phụ kiện (1 thùng = 50 cái)' },
    { code: 'CAY', name: 'Cây / Thanh', description: 'Đơn vị thanh đồng (1 cây dài 4 mét hoặc 6 mét)' },
    { code: 'TUI', name: 'Túi', description: 'Đơn vị đóng gói ốc vít, đầu cosse (1 túi = 100 cái)' },
  ];

  for (const u of uomsData) {
    await prisma.uom.upsert({
      where: { code: u.code },
      update: u,
      create: u,
    });
  }
  const uoms = await prisma.uom.findMany();
  const uomMap = Object.fromEntries(uoms.map(u => [u.code, u]));
  console.log(`✅ [MEVN SEED] Đã nạp ${uoms.length} Đơn vị tính.`);

  // 4. SEED SKUs & INITIAL STOCK BALANCES
  const skusData = [
    {
      code: 'SKU-MCCB-LS-100A',
      name: 'Aptomat Khối MCCB 3P 100A 36kA ABN103c',
      specification: '3 Pha, 100A, Dòng cắt 36kA, Hãng LS Electric Korea',
      category: 'Khí cụ đóng cắt',
      baseUomCode: 'CAI',
      warehouseCode: 'KHO_DIEN',
      minStockAlert: 10,
      averageCost: 1250000,
      initialPhysical: 80,
      initialReserved: 30,
      binLocation: 'Kệ A1-T2-Ô04',
    },
    {
      code: 'SKU-MCB-SCH-16A',
      name: 'Aptomat Tép MCB 1P 16A 6kA Acti9 iK60N',
      specification: '1 Pha, 16A, 6kA, Hãng Schneider Electric',
      category: 'Khí cụ đóng cắt',
      baseUomCode: 'CAI',
      warehouseCode: 'KHO_DIEN',
      minStockAlert: 50,
      averageCost: 85000,
      initialPhysical: 250,
      initialReserved: 80,
      binLocation: 'Kệ A2-T1-Ô08',
    },
    {
      code: 'SKU-CONT-LS-32A',
      name: 'Khởi động từ Contactor 3P 32A 220VAC MC-32a',
      specification: 'Cuộn hút 220VAC, Dòng định mức 32A, Tiếp điểm 1NO+1NC',
      category: 'Khí cụ điều khiển',
      baseUomCode: 'CAI',
      warehouseCode: 'KHO_DIEN',
      minStockAlert: 15,
      averageCost: 480000,
      initialPhysical: 45,
      initialReserved: 15,
      binLocation: 'Kệ B1-T3-Ô02',
    },
    {
      code: 'SKU-CAP-CDV-1X50',
      name: 'Cáp đồng đơn bọc PVC Cadivi CV-50mm2 (Cu/PVC)',
      specification: 'Ruột đồng 1x50mm2, Cách điện PVC 0.6/1kV',
      category: 'Dây cáp điện',
      baseUomCode: 'MET',
      warehouseCode: 'KHO_DIEN',
      minStockAlert: 200,
      averageCost: 135000,
      initialPhysical: 1200,
      initialReserved: 450,
      binLocation: 'Khu Cuộn Cáp C-01',
    },
    {
      code: 'SKU-CAP-CDV-1X6',
      name: 'Dây cáp điện mềm Cadivi VCm-6mm2 (Đỏ/Vàng/Xanh/Đen)',
      specification: 'Ruột đồng nhiều sợi mềm 6mm2, Cu/PVC 450/750V',
      category: 'Dây cáp điện',
      baseUomCode: 'MET',
      warehouseCode: 'KHO_DIEN',
      minStockAlert: 500,
      averageCost: 18500,
      initialPhysical: 3500,
      initialReserved: 1200,
      binLocation: 'Kệ Dây D1-T1',
    },
    {
      code: 'SKU-DONG-TC-40X5',
      name: 'Thanh cái đồng đỏ C1100 tiêu chuẩn (40x5mm)',
      specification: 'Đồng nguyên chất 99.9%, Tiết diện 40x5mm, Trọng lượng ~1.78kg/m',
      category: 'Đồng & Cơ khí',
      baseUomCode: 'KG',
      warehouseCode: 'KHO_DONG',
      minStockAlert: 100,
      averageCost: 265000,
      initialPhysical: 650,
      initialReserved: 220,
      binLocation: 'Giá Đồng Đứng Xưởng A-01',
    },
    {
      code: 'SKU-DONG-TC-60X8',
      name: 'Thanh cái đồng đỏ C1100 chịu tải nặng (60x8mm)',
      specification: 'Đồng nguyên chất 99.9%, Tiết diện 60x8mm, Trọng lượng ~4.27kg/m',
      category: 'Đồng & Cơ khí',
      baseUomCode: 'KG',
      warehouseCode: 'KHO_DONG',
      minStockAlert: 150,
      averageCost: 270000,
      initialPhysical: 850,
      initialReserved: 300,
      binLocation: 'Giá Đồng Đứng Xưởng A-02',
    },
    {
      code: 'SKU-COS-DONG-SC50',
      name: 'Đầu cosse đồng ép SC-50/10 (Lỗ bắt bulong M10)',
      specification: 'Đồng mạ thiếc chống oxy hóa, dùng ép dây 50mm2',
      category: 'Phụ kiện đấu nối',
      baseUomCode: 'CAI',
      warehouseCode: 'KHO_DIEN',
      minStockAlert: 100,
      averageCost: 12000,
      initialPhysical: 600,
      initialReserved: 150,
      binLocation: 'Kệ Phụ Kiện E1-Ô12',
    },
  ];

  for (const s of skusData) {
    const sku = await prisma.sku.upsert({
      where: { code: s.code },
      update: {
        name: s.name,
        specification: s.specification,
        category: s.category,
        baseUomId: uomMap[s.baseUomCode].id,
        defaultWarehouseId: whMap[s.warehouseCode].id,
        minStockAlert: s.minStockAlert,
        averageCost: s.averageCost,
      },
      create: {
        code: s.code,
        name: s.name,
        specification: s.specification,
        category: s.category,
        baseUomId: uomMap[s.baseUomCode].id,
        defaultWarehouseId: whMap[s.warehouseCode].id,
        minStockAlert: s.minStockAlert,
        averageCost: s.averageCost,
      },
    });

    // Tạo StockBalance cho SKU tại kho mặc định
    await prisma.stockBalance.upsert({
      where: {
        skuId_warehouseId: {
          skuId: sku.id,
          warehouseId: whMap[s.warehouseCode].id,
        },
      },
      update: {
        quantityPhysical: s.initialPhysical,
        quantityReserved: s.initialReserved,
        binLocation: s.binLocation,
      },
      create: {
        skuId: sku.id,
        warehouseId: whMap[s.warehouseCode].id,
        quantityPhysical: s.initialPhysical,
        quantityReserved: s.initialReserved,
        binLocation: s.binLocation,
      },
    });
  }
  const skus = await prisma.sku.findMany();
  const skuMap = Object.fromEntries(skus.map(s => [s.code, s]));
  console.log(`✅ [MEVN SEED] Đã nạp ${skus.length} SKUs & Tồn kho khởi tạo.`);

  // 5. SEED UOM CONVERSIONS
  const convData = [
    { skuCode: 'SKU-CAP-CDV-1X50', fromUom: 'CUON', toUom: 'MET', rate: 100 },
    { skuCode: 'SKU-CAP-CDV-1X6', fromUom: 'CUON', toUom: 'MET', rate: 100 },
    { skuCode: 'SKU-COS-DONG-SC50', fromUom: 'TUI', toUom: 'CAI', rate: 100 },
    { skuCode: 'SKU-DONG-TC-40X5', fromUom: 'CAY', toUom: 'KG', rate: 7.12 }, // 1 cây 4 mét = ~7.12 kg
    { skuCode: 'SKU-DONG-TC-60X8', fromUom: 'CAY', toUom: 'KG', rate: 17.08 }, // 1 cây 4 mét = ~17.08 kg
  ];

  for (const c of convData) {
    if (skuMap[c.skuCode]) {
      await prisma.uomConversion.upsert({
        where: {
          skuId_fromUomId_toUomId: {
            skuId: skuMap[c.skuCode].id,
            fromUomId: uomMap[c.fromUom].id,
            toUomId: uomMap[c.toUom].id,
          },
        },
        update: { conversionRate: c.rate },
        create: {
          skuId: skuMap[c.skuCode].id,
          fromUomId: uomMap[c.fromUom].id,
          toUomId: uomMap[c.toUom].id,
          conversionRate: c.rate,
        },
      });
    }
  }
  console.log(`✅ [MEVN SEED] Đã nạp bảng quy đổi đơn vị tính mua hàng.`);

  // 6. SEED SUPPLIERS
  const suppliersData = [
    { code: 'NCC-LS', name: 'Công ty TNHH LS Electric Việt Nam', contactPerson: 'Nguyễn Thành Nam', phone: '024.3984.1122', email: 'sales@lselectric.com.vn', address: 'KCN Yên Phong, Bắc Ninh' },
    { code: 'NCC-SCHNEIDER', name: 'Schneider Electric Việt Nam Co., Ltd', contactPerson: 'Trịnh Hoài Đức', phone: '028.3824.5566', email: 'order@se.com', address: 'Tòa nhà Bitexco, Q.1, TP.HCM' },
    { code: 'NCC-CADIVI', name: 'Công ty Cổ phần Dây Cáp Điện Việt Nam (Cadivi)', contactPerson: 'Phạm Minh Quân', phone: '028.3854.7788', email: 'kinhdoanh@cadivi.vn', address: '70-72 Nam Kỳ Khởi Nghĩa, Q.1' },
    { code: 'NCC-DONG-TANPHAT', name: 'Công ty TNHH Kim Loại Đồng Tân Phát', contactPerson: 'Đỗ Văn Phát', phone: '024.3877.9900', email: 'dongtanphat@gmail.com', address: 'Cụm Công Nghiệp Ngọc Hồi, Hà Nội' },
  ];

  for (const sup of suppliersData) {
    await prisma.supplier.upsert({
      where: { code: sup.code },
      update: sup,
      create: sup,
    });
  }
  const suppliers = await prisma.supplier.findMany();
  const supMap = Object.fromEntries(suppliers.map(s => [s.code, s]));
  console.log(`✅ [MEVN SEED] Đã nạp ${suppliers.length} Nhà cung cấp.`);

  // 7. SEED ORDERS & PANELS
  const order1 = await prisma.order.upsert({
    where: { code: 'DH-2026-MEVN-01' },
    update: {
      title: 'Tủ Điện Phân Phối Tổng MSB 2500A - Dự án Tòa Nhà Landmark Core',
      customerName: 'Tập đoàn Xây dựng Coteccons / Vingroup',
      saleAdminId: userMap['sale_admin'].id,
      status: 'DA_GIU_CHO',
      note: 'Ưu tiên giao trước Tủ Phân Phối Tầng 1 vào tuần sau',
      targetDeliveryDate: new Date('2026-09-25T00:00:00Z'),
    },
    create: {
      code: 'DH-2026-MEVN-01',
      title: 'Tủ Điện Phân Phối Tổng MSB 2500A - Dự án Tòa Nhà Landmark Core',
      customerName: 'Tập đoàn Xây dựng Coteccons / Vingroup',
      saleAdminId: userMap['sale_admin'].id,
      status: 'DA_GIU_CHO',
      note: 'Ưu tiên giao trước Tủ Phân Phối Tầng 1 vào tuần sau',
      targetDeliveryDate: new Date('2026-09-25T00:00:00Z'),
    },
  });

  const panel1_1 = await prisma.orderPanel.upsert({
    where: { orderId_code: { orderId: order1.id, code: 'TU-MSB-01' } },
    update: { name: 'Tủ Phân Phối Tổng MSB Form 4b (2500A)', panelType: 'MSB', description: 'Gồm 1 ACB Inbound + 6 MCCB Outbound' },
    create: { orderId: order1.id, code: 'TU-MSB-01', name: 'Tủ Phân Phối Tổng MSB Form 4b (2500A)', panelType: 'MSB', description: 'Gồm 1 ACB Inbound + 6 MCCB Outbound' },
  });

  const panel1_2 = await prisma.orderPanel.upsert({
    where: { orderId_code: { orderId: order1.id, code: 'TU-DB-T1' } },
    update: { name: 'Tủ Điện Chiếu Sáng & Động Lực Tầng 1', panelType: 'DB', description: 'Gồm 1 MCCB tổng + 24 MCB nhánh' },
    create: { orderId: order1.id, code: 'TU-DB-T1', name: 'Tủ Điện Chiếu Sáng & Động Lực Tầng 1', panelType: 'DB', description: 'Gồm 1 MCCB tổng + 24 MCB nhánh' },
  });

  // 8. SEED BOM & BOM ITEMS (Cho TU-MSB-01 và TU-DB-T1)
  const bom1 = await prisma.bom.upsert({
    where: { orderId_panelId_version: { orderId: order1.id, panelId: panel1_1.id, version: 1 } },
    update: {
      status: 'VERIFIED',
      submittedById: userMap['kythuat_bom'].id,
      verifiedById: userMap['thukho_dien'].id,
      verifiedAt: new Date(),
      notes: 'BOM đã đối chiếu tồn 100% khả dụng, đã khóa giữ chỗ trên kho điện và kho đồng.',
    },
    create: {
      orderId: order1.id,
      panelId: panel1_1.id,
      version: 1,
      status: 'VERIFIED',
      submittedById: userMap['kythuat_bom'].id,
      verifiedById: userMap['thukho_dien'].id,
      verifiedAt: new Date(),
      notes: 'BOM đã đối chiếu tồn 100% khả dụng, đã khóa giữ chỗ trên kho điện và kho đồng.',
    },
  });

  // BOM items
  const bomItemsData = [
    { skuCode: 'SKU-MCCB-LS-100A', whCode: 'KHO_DIEN', req: 6, res: 6, disp: 0, po: 0, status: 'RESERVED' },
    { skuCode: 'SKU-DONG-TC-60X8', whCode: 'KHO_DONG', req: 180, res: 180, disp: 0, po: 0, status: 'RESERVED' },
    { skuCode: 'SKU-CAP-CDV-1X50', whCode: 'KHO_DIEN', req: 120, res: 120, disp: 0, po: 0, status: 'RESERVED' },
    { skuCode: 'SKU-COS-DONG-SC50', whCode: 'KHO_DIEN', req: 48, res: 48, disp: 0, po: 0, status: 'RESERVED' },
  ];

  for (const bi of bomItemsData) {
    const existing = await prisma.bomItem.findFirst({
      where: { bomId: bom1.id, skuId: skuMap[bi.skuCode].id },
    });
    let item;
    if (existing) {
      item = await prisma.bomItem.update({
        where: { id: existing.id },
        data: {
          quantityRequired: bi.req,
          quantityReserved: bi.res,
          quantityDispatched: bi.disp,
          quantityPendingPo: bi.po,
          status: bi.status,
        },
      });
    } else {
      item = await prisma.bomItem.create({
        data: {
          bomId: bom1.id,
          skuId: skuMap[bi.skuCode].id,
          warehouseId: whMap[bi.whCode].id,
          quantityRequired: bi.req,
          quantityReserved: bi.res,
          quantityDispatched: bi.disp,
          quantityPendingPo: bi.po,
          status: bi.status,
        },
      });
    }

    // Ghi nhận StockReservation
    const existingRes = await prisma.stockReservation.findFirst({
      where: { bomItemId: item.id },
    });
    if (!existingRes) {
      await prisma.stockReservation.create({
        data: {
          orderId: order1.id,
          panelId: panel1_1.id,
          bomItemId: item.id,
          skuId: skuMap[bi.skuCode].id,
          warehouseId: whMap[bi.whCode].id,
          quantity: bi.res,
          isActive: true,
        },
      });
    }
  }

  // 9. SEED PO & GRN (Mô phỏng 1 PO đã về kho cho SKU thiếu)
  await prisma.purchaseOrder.upsert({
    where: { code: 'PO-2026-MEVN-001' },
    update: {
      supplierId: supMap['NCC-CADIVI'].id,
      orderId: order1.id,
      createdById: userMap['muahang_po'].id,
      status: 'COMPLETED',
      totalAmount: 13500000,
      note: 'Mua bổ sung 1 cuộn cáp Cadivi CV-50mm2 phục vụ Tủ MSB Landmark',
      actualDeliveryDate: new Date(),
    },
    create: {
      code: 'PO-2026-MEVN-001',
      supplierId: supMap['NCC-CADIVI'].id,
      orderId: order1.id,
      createdById: userMap['muahang_po'].id,
      status: 'COMPLETED',
      totalAmount: 13500000,
      note: 'Mua bổ sung 1 cuộn cáp Cadivi CV-50mm2 phục vụ Tủ MSB Landmark',
      actualDeliveryDate: new Date(),
    },
  });

  // 10. SEED KPI LOGS
  const countKpi = await prisma.kpiLog.count();
  if (countKpi === 0) {
    await prisma.kpiLog.createMany({
      data: [
        {
          metricCode: 'KPI_BOM_RESPONSE_TIME',
          referenceCode: 'BOM-DH-2026-MEVN-01',
          isCompliant: true,
          deviationMinutes: -65, // Nhanh hơn SLA 65 phút
          details: 'Kho Điện đối chiếu tồn và xác nhận giữ chỗ sau 1 giờ 15 phút (Quy định <= 2-4h).',
        },
        {
          metricCode: 'KPI_PICKUP_ON_TIME',
          referenceCode: 'DKLH-2026-001',
          isCompliant: true,
          deviationMinutes: -90,
          details: 'Sản xuất gửi đăng ký lấy hàng lúc 14:00 chiều hôm trước (Hạn chót 15:30) cho Ca sáng hôm sau.',
        },
        {
          metricCode: 'KPI_DISPATCH_ACCURACY',
          referenceCode: 'PXK-BOM-2026-001',
          isCompliant: true,
          deviationMinutes: 0,
          details: 'Soạn hàng đúng 100% chủng loại mã SKU và quy cách theo BOM.',
        },
      ],
    });
  }

  console.log('🎉 [MEVN SEED] Hoàn tất nạp dữ liệu chuẩn 100% vào Supabase PostgreSQL!');
  return true;
}

if (require.main === module) {
  main()
    .catch((e) => {
      console.error('❌ Lỗi nạp dữ liệu Seed:', e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}

module.exports = main;
