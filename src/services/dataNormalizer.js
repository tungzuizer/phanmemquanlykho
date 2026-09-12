// 1. Importers/Callers: src/services/wmsService.js, server.js
// 2. Affected API: High-Performance Data Normalization & Serialization Layer for MEVN WMS Frontend
// 3. Data Schemas: Normalizes Prisma models into JSON-safe objects with dual-compatibility aliases
// 4. User's Verbatim Instruction: "phần data lỗi hòa toàn và lỗi cực kỳ hãy sửa lại cấu trúng backend"

/**
 * Safe conversion of Prisma Decimal or numeric string to standard JavaScript number
 */
function toNum(val, fallback = 0) {
  if (val === null || val === undefined) return fallback;
  const num = Number(val);
  return isNaN(num) ? fallback : num;
}

/**
 * Safe conversion of Date object to YYYY-MM-DD string
 */
function toDateStr(d) {
  if (!d) return null;
  try {
    const dt = new Date(d);
    return isNaN(dt.getTime()) ? null : dt.toISOString().split('T')[0];
  } catch (e) {
    return null;
  }
}

/**
 * Safe conversion of Date object to ISO string
 */
function toIsoStr(d) {
  if (!d) return null;
  try {
    const dt = new Date(d);
    return isNaN(dt.getTime()) ? null : dt.toISOString();
  } catch (e) {
    return null;
  }
}

/**
 * Standard warehouse bin locations across the 3 MEVN storage zones
 */
const STANDARD_BINS = [
  { id: 'BIN-KD-A11', code: 'A-01-01', name: 'Kệ Thiết Bị Đóng Cắt A1-T1', warehouseId: 'KHO_DIEN', zone: 'Aptomat & Khởi Động Từ' },
  { id: 'BIN-KD-A12', code: 'A-01-02', name: 'Kệ Thiết Bị Đóng Cắt A1-T2', warehouseId: 'KHO_DIEN', zone: 'ACB & MCCB Khối Lớn' },
  { id: 'BIN-KD-A21', code: 'A-02-01', name: 'Kệ Dây Cáp Điều Khiển A2-T1', warehouseId: 'KHO_DIEN', zone: 'Cáp Cu/PVC 0.75 - 6mm2' },
  { id: 'BIN-KD-A22', code: 'A-02-02', name: 'Kệ Dây Cáp Động Lực A2-T2', warehouseId: 'KHO_DIEN', zone: 'Cáp Cu/PVC 1x50 - 1x240mm2' },
  { id: 'BIN-KD-B11', code: 'B-01-01', name: 'Kệ Phụ Kiện Đầu Cốt B1-T1', warehouseId: 'KHO_DIEN', zone: 'Đầu cốt & Mũ chụp' },
  { id: 'BIN-KD-B12', code: 'B-01-02', name: 'Kệ Phụ Kiện Cách Điện B1-T2', warehouseId: 'KHO_DIEN', zone: 'Sứ cách điện & Máng cáp' },
  { id: 'BIN-KD-TN',  code: 'TN-01',   name: 'Khu Vực Tiếp Nhận Hàng', warehouseId: 'KHO_DIEN', zone: 'Cửa nhập hàng GRN' },

  { id: 'BIN-KDG-01', code: 'KD-01-01', name: 'Giá Đỡ Thanh Đồng Bản Lớn', warehouseId: 'KHO_DONG', zone: 'Thanh cái 10x100mm, 10x80mm' },
  { id: 'BIN-KDG-02', code: 'KD-01-02', name: 'Giá Đỡ Thanh Đồng Trung Bình', warehouseId: 'KHO_DONG', zone: 'Thanh cái 10x60mm, 5x50mm' },
  { id: 'BIN-KDG-03', code: 'KD-02-01', name: 'Giá Đỡ Thanh Đồng Bản Nhỏ', warehouseId: 'KHO_DONG', zone: 'Thanh cái 5x30mm, 3x20mm' },
  { id: 'BIN-KDG-04', code: 'KD-02-02', name: 'Khu Gia Công Đột Uốn Đồng', warehouseId: 'KHO_DONG', zone: 'Sản phẩm chờ lắp ráp' },

  { id: 'BIN-KCL-01', code: 'CL-01-01', name: 'Khu Cách Ly Đầu Mẩu Phế Liệu', warehouseId: 'KHO_CACH_LY', zone: 'Phôi đồng thừa / Phế phẩm' },
  { id: 'BIN-KCL-02', code: 'CL-01-02', name: 'Khu Hàng Lỗi Nhà Cung Cấp', warehouseId: 'KHO_CACH_LY', zone: 'Hàng chờ trả NCC / Bảo hành' },
];

/**
 * Normalizer functions for each entity
 */
class DataNormalizer {
  static normalizeUser(u) {
    if (!u) return null;
    return {
      id: u.id,
      email: u.email,
      username: u.username,
      fullName: u.fullName,
      phone: u.phone || '',
      role: u.role,
      isActive: Boolean(u.isActive),
      createdAt: toIsoStr(u.createdAt),
      updatedAt: toIsoStr(u.updatedAt),
    };
  }

  static normalizeWarehouse(w) {
    if (!w) return null;
    return {
      id: w.id,
      code: w.code,
      name: w.name,
      address: w.address || '',
      description: w.description || '',
      isScrapLocation: Boolean(w.isScrapLocation),
      isActive: Boolean(w.isActive),
    };
  }

  static normalizeUom(u) {
    if (!u) return null;
    return {
      id: u.id,
      code: u.code,
      name: u.name,
      description: u.description || '',
    };
  }

  static normalizeSku(s) {
    if (!s) return null;
    return {
      id: s.id,
      code: s.code,
      name: s.name,
      specification: s.specification || '',
      category: s.category || 'Vật tư',
      baseUomId: s.baseUomId,
      baseUom: s.baseUom ? this.normalizeUom(s.baseUom) : null,
      baseUomName: s.baseUom?.name || '',
      defaultWarehouseId: s.defaultWarehouseId,
      defaultWarehouse: s.defaultWarehouse ? this.normalizeWarehouse(s.defaultWarehouse) : null,
      minStockAlert: toNum(s.minStockAlert, 10),
      minSafetyStock: toNum(s.minStockAlert, 10), // Frontend alias
      averageCost: toNum(s.averageCost, 0),
      isActive: Boolean(s.isActive),
      conversions: (s.conversions || []).map(c => ({
        id: c.id,
        fromUomId: c.fromUomId,
        fromUom: c.fromUom ? this.normalizeUom(c.fromUom) : null,
        fromUomName: c.fromUom?.name || '',
        toUomId: c.toUomId,
        toUom: c.toUom ? this.normalizeUom(c.toUom) : null,
        toUomName: c.toUom?.name || '',
        conversionRate: toNum(c.conversionRate, 1),
      })),
    };
  }

  static normalizeStockBalance(sb, skus = [], warehouses = []) {
    if (!sb) return null;
    const sku = sb.sku || skus.find(s => s.id === sb.skuId);
    const wh = sb.warehouse || warehouses.find(w => w.id === sb.warehouseId);
    const phys = toNum(sb.quantityPhysical, 0);
    const resv = toNum(sb.quantityReserved, 0);
    const avail = Math.max(0, phys - resv);

    return {
      id: sb.id,
      skuId: sb.skuId,
      sku: sku ? this.normalizeSku(sku) : null,
      skuCode: sku?.code || '',
      skuName: sku?.name || '',
      warehouseId: sb.warehouseId,
      warehouse: wh ? this.normalizeWarehouse(wh) : null,
      warehouseCode: wh?.code || '',
      warehouseName: wh?.name || '',
      quantityPhysical: phys,
      quantityReserved: resv,
      quantityAvailable: avail,
      available: avail, // Frontend alias
      binLocation: sb.binLocation || 'Kệ chính',
      binId: sb.binLocation ? `BIN-${sb.binLocation}` : 'BIN-CHINH', // Frontend alias
      updatedAt: toIsoStr(sb.updatedAt),
    };
  }

  static normalizeOrder(o) {
    if (!o) return null;
    return {
      id: o.id,
      code: o.code,
      title: o.title,
      customerName: o.customerName,
      customer: o.customerName, // Frontend alias
      saleAdminId: o.saleAdminId,
      saleAdmin: o.saleAdmin ? this.normalizeUser(o.saleAdmin) : null,
      saleAdminName: o.saleAdmin?.fullName || 'Sale Admin',
      status: o.status,
      targetDeliveryDate: toDateStr(o.targetDeliveryDate),
      deliveryDate: toDateStr(o.targetDeliveryDate), // Frontend alias
      note: o.note || '',
      createdAt: toIsoStr(o.createdAt),
      updatedAt: toIsoStr(o.updatedAt),
      panels: (o.panels || []).map(p => ({
        id: p.id,
        orderId: p.orderId,
        code: p.code,
        name: p.name,
        description: p.description || '',
        panelType: p.panelType || 'MSB',
        cabinetType: p.panelType || 'MSB', // Frontend alias
      })),
      boms: (o.boms || []).map(b => this.normalizeBom(b)),
    };
  }

  static normalizeBom(b) {
    if (!b) return null;
    return {
      id: b.id,
      orderId: b.orderId,
      orderCode: b.order?.code || '',
      order: b.order ? { id: b.order.id, code: b.order.code, title: b.order.title, customerName: b.order.customerName } : null,
      panelId: b.panelId,
      panelName: b.panel?.name || '',
      panel: b.panel ? { id: b.panel.id, code: b.panel.code, name: b.panel.name, panelType: b.panel.panelType } : null,
      version: b.version || 1,
      status: b.status,
      submittedById: b.submittedById,
      submittedBy: b.submittedBy ? this.normalizeUser(b.submittedBy) : null,
      submittedByName: b.submittedBy?.fullName || 'Kỹ Thuật BOM',
      submittedAt: toIsoStr(b.submittedAt),
      verifiedById: b.verifiedById,
      verifiedBy: b.verifiedBy ? this.normalizeUser(b.verifiedBy) : null,
      verifiedByName: b.verifiedBy?.fullName || '',
      verifiedAt: toIsoStr(b.verifiedAt),
      notes: b.notes || '',
      createdAt: toIsoStr(b.createdAt),
      items: (b.items || []).map(i => ({
        id: i.id,
        bomId: i.bomId,
        skuId: i.skuId,
        sku: i.sku ? this.normalizeSku(i.sku) : null,
        skuCode: i.sku?.code || '',
        skuName: i.sku?.name || '',
        uomName: i.sku?.baseUom?.name || '',
        warehouseId: i.warehouseId,
        warehouse: i.warehouse ? this.normalizeWarehouse(i.warehouse) : null,
        quantityRequired: toNum(i.quantityRequired, 1),
        quantityReserved: toNum(i.quantityReserved, 0),
        quantityDispatched: toNum(i.quantityDispatched, 0),
        quantityPendingPo: toNum(i.quantityPendingPo, 0),
        status: i.status || 'PENDING',
        note: i.note || '',
      })),
    };
  }

  static normalizePurchaseOrder(po) {
    if (!po) return null;
    return {
      id: po.id,
      code: po.code,
      supplierId: po.supplierId,
      supplier: po.supplier ? { id: po.supplier.id, code: po.supplier.code, name: po.supplier.name, phone: po.supplier.phone } : null,
      supplierName: po.supplier?.name || 'Nhà Cung Cấp Chuẩn MEVN',
      orderId: po.orderId,
      order: po.order ? { id: po.order.id, code: po.order.code, title: po.order.title } : null,
      orderCode: po.order?.code || '',
      createdById: po.createdById,
      createdBy: po.createdBy ? this.normalizeUser(po.createdBy) : null,
      createdByName: po.createdBy?.fullName || 'Phòng Mua Hàng',
      status: po.status,
      expectedDeliveryDate: toDateStr(po.expectedDeliveryDate),
      expectedDate: toDateStr(po.expectedDeliveryDate), // Frontend alias
      actualDeliveryDate: toDateStr(po.actualDeliveryDate),
      totalAmount: toNum(po.totalAmount, 0),
      note: po.note || '',
      createdAt: toIsoStr(po.createdAt),
      items: (po.items || []).map(i => ({
        id: i.id,
        poId: i.poId,
        skuId: i.skuId,
        sku: i.sku ? this.normalizeSku(i.sku) : null,
        skuCode: i.sku?.code || '',
        skuName: i.sku?.name || '',
        purchasingUomId: i.purchasingUomId,
        purchasingUom: i.purchasingUom ? this.normalizeUom(i.purchasingUom) : null,
        purchasingUomName: i.purchasingUom?.name || '',
        quantityPurchased: toNum(i.quantityPurchased, 1),
        baseQuantityExpected: toNum(i.baseQuantityExpected, 1),
        baseQuantityReceived: toNum(i.baseQuantityReceived, 0),
        unitPrice: toNum(i.unitPrice, 0),
        lineTotal: toNum(i.lineTotal, 0),
        note: i.note || '',
      })),
    };
  }

  static normalizeGoodsReceiptNote(g) {
    if (!g) return null;
    const suppName = g.po?.supplier?.name || 'Nhà Cung Cấp Chuẩn MEVN';
    return {
      id: g.id,
      code: g.code,
      grnType: g.grnType || 'PO_RECEIPT',
      poId: g.poId,
      po: g.po ? this.normalizePurchaseOrder(g.po) : null,
      poCode: g.po?.code || '',
      supplierName: suppName, // Frontend alias
      warehouseId: g.warehouseId,
      warehouse: g.warehouse ? this.normalizeWarehouse(g.warehouse) : null,
      warehouseName: g.warehouse?.name || '',
      createdById: g.createdById,
      createdBy: g.createdBy ? this.normalizeUser(g.createdBy) : null,
      createdByName: g.createdBy?.fullName || 'Thủ Kho',
      receivedAt: toIsoStr(g.receivedAt),
      receivedDate: toDateStr(g.receivedAt), // Frontend alias
      documentRef: g.documentRef || '',
      note: g.note || '',
      createdAt: toIsoStr(g.createdAt),
      items: (g.items || []).map(i => ({
        id: i.id,
        grnId: i.grnId,
        skuId: i.skuId,
        sku: i.sku ? this.normalizeSku(i.sku) : null,
        skuCode: i.sku?.code || '',
        skuName: i.sku?.name || '',
        purchasingUomId: i.purchasingUomId,
        purchasingUom: i.purchasingUom ? this.normalizeUom(i.purchasingUom) : null,
        purchasingUomName: i.purchasingUom?.name || '',
        quantity: toNum(i.quantity, 1),
        quantityReceived: toNum(i.quantity, 1), // Frontend alias
        conversionRate: toNum(i.conversionRate, 1),
        baseQuantity: toNum(i.baseQuantity, 1),
        unitPrice: toNum(i.unitPrice, 0),
        baseUnitCost: toNum(i.baseUnitCost, 0),
        lineTotal: toNum(i.lineTotal, 0),
        binId: 'BIN-KD-TN', // Frontend alias
        note: i.note || '',
      })),
    };
  }

  static normalizePickupRegistration(pr) {
    if (!pr) return null;
    return {
      id: pr.id,
      code: pr.code,
      orderId: pr.orderId,
      order: pr.order ? { id: pr.order.id, code: pr.order.code, title: pr.order.title } : null,
      orderCode: pr.order?.code || '',
      panelId: pr.panelId,
      panelName: pr.panel?.name || '',
      shiftType: pr.shiftType || 'CA_SANG',
      pickupDate: toDateStr(pr.pickupDate),
      registeredById: pr.registeredById,
      registeredBy: pr.registeredBy ? this.normalizeUser(pr.registeredBy) : null,
      registeredByName: pr.registeredBy?.fullName || 'Tổ Trưởng Sản Xuất',
      status: pr.status,
      isComplyKpi: Boolean(pr.isComplyKpi),
      registeredAt: toIsoStr(pr.registeredAt),
      note: pr.note || '',
      createdAt: toIsoStr(pr.createdAt),
    };
  }

  static normalizeGoodsDispatchNote(gdn) {
    if (!gdn) return null;
    return {
      id: gdn.id,
      code: gdn.code,
      orderId: gdn.orderId,
      order: gdn.order ? { id: gdn.order.id, code: gdn.order.code, title: gdn.order.title, customerName: gdn.order.customerName } : null,
      orderCode: gdn.order?.code || '',
      panelId: gdn.panelId,
      panelName: gdn.panel?.name || '',
      pickupRegistrationId: gdn.pickupRegistrationId,
      warehouseId: gdn.warehouseId,
      warehouse: gdn.warehouse ? this.normalizeWarehouse(gdn.warehouse) : null,
      warehouseName: gdn.warehouse?.name || 'Kho Điện',
      shiftType: gdn.shiftType || 'CA_SANG',
      isOutOfShift: Boolean(gdn.isOutOfShift),
      outOfShiftReason: gdn.outOfShiftReason || '',
      isEmergency: Boolean(gdn.isEmergency),
      emergencyApproverName: gdn.emergencyApproverName || '',
      createdById: gdn.createdById,
      createdBy: gdn.createdBy ? this.normalizeUser(gdn.createdBy) : null,
      createdByName: gdn.createdBy?.fullName || 'Thủ Kho',
      approvedById: gdn.approvedById,
      approvedBy: gdn.approvedBy ? this.normalizeUser(gdn.approvedBy) : null,
      approvedByName: gdn.approvedBy?.fullName || '',
      approvedAt: toIsoStr(gdn.approvedAt),
      dispatchedAt: toIsoStr(gdn.dispatchedAt),
      receiverName: gdn.receiverName || 'Tổ Trưởng Sản Xuất',
      receiverRole: gdn.receiverRole || 'Đội Lắp Ráp Tủ Điện MEVN',
      status: gdn.status,
      note: gdn.note || '',
      createdAt: toIsoStr(gdn.createdAt),
      items: (gdn.items || []).map(i => ({
        id: i.id,
        gdnId: i.gdnId,
        skuId: i.skuId,
        sku: i.sku ? this.normalizeSku(i.sku) : null,
        skuCode: i.sku?.code || '',
        skuName: i.sku?.name || '',
        uomName: i.sku?.baseUom?.name || '',
        quantityBom: toNum(i.quantityBom, 1),
        quantityReal: toNum(i.quantityReal, 1),
        unitCost: toNum(i.unitCost, 0),
        note: i.note || '',
      })),
    };
  }

  static normalizeStockReturnNote(r) {
    if (!r) return null;
    const isDefective = Boolean(r.isDefective);
    return {
      id: r.id,
      code: r.code,
      orderId: r.orderId,
      order: r.order ? { id: r.order.id, code: r.order.code, title: r.order.title } : null,
      orderCode: r.order?.code || '',
      panelId: r.panelId,
      panelName: r.panel?.name || '',
      warehouseId: r.warehouseId,
      warehouse: r.warehouse ? this.normalizeWarehouse(r.warehouse) : null,
      warehouseName: r.warehouse?.name || (isDefective ? 'Kho Cách Ly' : 'Kho Điện'),
      isDefective: isDefective,
      type: isDefective ? 'SCRAP_DEFECT' : 'SURPLUS_USABLE', // Frontend alias
      defectReason: r.defectReason || '',
      createdById: r.createdById,
      createdBy: r.createdBy ? this.normalizeUser(r.createdBy) : null,
      createdByName: r.createdBy?.fullName || 'Tổ Trưởng Sản Xuất',
      returnedByName: r.createdBy?.fullName || 'Hoàng Văn Ráp (Tổ Trưởng Sản Xuất)', // Frontend alias
      returnedAt: toIsoStr(r.returnedAt),
      returnDate: toDateStr(r.returnedAt), // Frontend alias
      note: r.note || '',
      createdAt: toIsoStr(r.createdAt),
      items: (r.items || []).map(i => ({
        id: i.id,
        returnNoteId: i.returnNoteId,
        skuId: i.skuId,
        sku: i.sku ? this.normalizeSku(i.sku) : null,
        skuCode: i.sku?.code || '',
        skuName: i.sku?.name || '',
        uomName: i.sku?.baseUom?.name || '',
        quantity: toNum(i.quantity, 1),
        unitCost: toNum(i.unitCost, 0),
        isReusable: Boolean(i.isReusable),
        note: i.note || '',
      })),
    };
  }

  static normalizeStockTransaction(t) {
    if (!t) return null;
    const change = toNum(t.quantityChange, 0);
    const absQty = Math.abs(change);

    // Map transaction type to friendly frontend category
    let frontendType = 'OTHER';
    if (t.transactionType === 'INBOUND_PO' || t.transactionType === 'INBOUND_INITIAL') {
      frontendType = 'RECEIPT';
    } else if (t.transactionType === 'OUTBOUND_BOM') {
      frontendType = 'DISPATCH';
    } else if (t.transactionType === 'INBOUND_RETURN') {
      frontendType = 'RETURN_IN';
    } else if (t.transactionType === 'HOLD_RESERVATION') {
      frontendType = 'RESERVATION_HOLD';
    }

    const refCode = t.grn?.code || t.gdn?.code || t.returnNote?.code || t.referenceCode || `GDK-${t.id.slice(0, 8).toUpperCase()}`;

    return {
      id: t.id,
      skuId: t.skuId,
      sku: t.sku ? this.normalizeSku(t.sku) : null,
      skuCode: t.sku?.code || '',
      skuName: t.sku?.name || '',
      uomName: t.sku?.baseUom?.name || '',
      warehouseId: t.warehouseId,
      warehouse: t.warehouse ? this.normalizeWarehouse(t.warehouse) : null,
      warehouseName: t.warehouse?.name || '',
      transactionType: t.transactionType,
      type: frontendType, // Frontend alias
      quantityChange: change,
      quantity: absQty, // Frontend alias
      quantityBefore: toNum(t.quantityBefore, 0),
      quantityAfter: toNum(t.quantityAfter, 0),
      unitCost: toNum(t.unitCost, 0),
      referenceDocCode: refCode, // Frontend alias
      performedByName: 'Thủ Kho MEVN', // Frontend alias
      createdAt: toIsoStr(t.createdAt),
    };
  }

  static normalizeKpiLog(k) {
    if (!k) return null;
    return {
      id: k.id,
      metricCode: k.metricCode,
      referenceCode: k.referenceCode || '',
      expectedTimestamp: toIsoStr(k.expectedTimestamp),
      actualTimestamp: toIsoStr(k.actualTimestamp),
      isCompliant: Boolean(k.isCompliant),
      deviationMinutes: toNum(k.deviationMinutes, 0),
      details: k.details || '',
      createdAt: toIsoStr(k.createdAt),
    };
  }

  /**
   * Generates standard warehouses bins array enriched with actual warehouse references
   */
  static getStandardBins(warehouses = []) {
    const whDien = warehouses.find(w => w.code === 'KHO_DIEN') || { id: 'KHO_DIEN' };
    const whDong = warehouses.find(w => w.code === 'KHO_DONG') || { id: 'KHO_DONG' };
    const whCachLy = warehouses.find(w => w.code === 'KHO_CACH_LY') || { id: 'KHO_CACH_LY' };

    return STANDARD_BINS.map(b => {
      let targetWhId = whDien.id;
      if (b.warehouseId === 'KHO_DONG') targetWhId = whDong.id;
      if (b.warehouseId === 'KHO_CACH_LY') targetWhId = whCachLy.id;

      return {
        ...b,
        warehouseId: targetWhId,
      };
    });
  }
}

module.exports = DataNormalizer;
