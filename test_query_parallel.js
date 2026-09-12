// 1. Importers/Callers: Test and performance optimization experiment (node test_query_parallel.js)
// 2. Affected API: WmsService.getFullState query parallelism
// 3. Data schemas: Prisma queries via Promise.all vs $transaction
// 4. User's verbatim instruction: "theo khuyến nghị của bạn nhưng loading quá lâu cần upadate tốc độ"

require('dotenv').config();
const prisma = require('./src/db');

async function testParallel() {
  console.log('Testing Promise.all vs $transaction...');
  const t0 = Date.now();
  const [
    users,
    warehouses,
    uoms,
    skus,
    stockBalances,
    suppliers,
    orders,
    boms,
    purchaseOrders,
    goodsReceiptNotes,
    pickupRegistrations,
    goodsDispatchNotes,
    stockReturnNotes,
    stocktakes,
    kpiLogs,
    stockTransactions,
  ] = await Promise.all([
    prisma.user.findMany({ orderBy: { createdAt: 'asc' } }),
    prisma.warehouse.findMany({ orderBy: { code: 'asc' } }),
    prisma.uom.findMany({ orderBy: { code: 'asc' } }),
    prisma.sku.findMany({
      include: {
        conversions: { include: { fromUom: true, toUom: true } },
        baseUom: true,
        defaultWarehouse: true,
      },
      orderBy: { code: 'asc' },
    }),
    prisma.stockBalance.findMany({
      include: { sku: { include: { baseUom: true } }, warehouse: true },
      orderBy: [{ warehouse: { code: 'asc' } }, { sku: { code: 'asc' } }],
    }),
    prisma.supplier.findMany({ orderBy: { code: 'asc' } }),
    prisma.order.findMany({
      include: {
        panels: true,
        saleAdmin: true,
        boms: {
          include: {
            items: { include: { sku: { include: { baseUom: true } } } },
            submittedBy: true,
            verifiedBy: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.bom.findMany({
      include: {
        order: true,
        panel: true,
        submittedBy: true,
        verifiedBy: true,
        items: {
          include: {
            sku: { include: { baseUom: true } },
            warehouse: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.purchaseOrder.findMany({
      include: {
        supplier: true,
        order: true,
        createdBy: true,
        items: {
          include: {
            sku: { include: { baseUom: true } },
            purchasingUom: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.goodsReceiptNote.findMany({
      include: {
        po: { include: { supplier: true } },
        warehouse: true,
        createdBy: true,
        items: {
          include: {
            sku: { include: { baseUom: true } },
            purchasingUom: true,
          },
        },
      },
      orderBy: { receivedAt: 'desc' },
    }),
    prisma.pickupRegistration.findMany({
      include: { order: true, panel: true, registeredBy: true },
      orderBy: { registeredAt: 'desc' },
    }),
    prisma.goodsDispatchNote.findMany({
      include: {
        order: true,
        panel: true,
        warehouse: true,
        createdBy: true,
        approvedBy: true,
        pickupRegistration: true,
        items: {
          include: {
            sku: { include: { baseUom: true } },
            bomItem: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.stockReturnNote.findMany({
      include: {
        order: true,
        panel: true,
        warehouse: true,
        createdBy: true,
        items: {
          include: {
            sku: { include: { baseUom: true } },
          },
        },
      },
      orderBy: { returnedAt: 'desc' },
    }),
    prisma.stocktake.findMany({
      include: {
        warehouse: true,
        conductedBy: true,
        approvedBy: true,
        items: { include: { sku: true } },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.kpiLog.findMany({
      orderBy: { actualTimestamp: 'desc' },
    }),
    prisma.stockTransaction.findMany({
      include: {
        sku: { include: { baseUom: true } },
        warehouse: true,
        grn: true,
        gdn: true,
        returnNote: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 200,
    }),
  ]);

  const duration = Date.now() - t0;
  console.log(`Promise.all finished in: ${duration} ms (Total users: ${users.length}, skus: ${skus.length}, orders: ${orders.length})`);
  await prisma.$disconnect();
}

testParallel();
