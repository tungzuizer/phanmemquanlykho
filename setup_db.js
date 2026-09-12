// Fact-Forcing Gate Info:
// 1. Importers/Callers: Direct execution via node setup_db.js
// 2. Affected API: Database schema initialization on Supabase PostgreSQL
// 3. Data schemas: DDL for all 19 MEVN WMS models, enums, constraints, and relationships
// 4. User verbatim: "mk supbase cảu tôi là 15072007Tunghb@ ... ccmvarbwchbwstgblsns"

require('dotenv').config();
const { Client } = require('pg');

async function setup() {
  const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;
  console.log('🔗 Connecting to Supabase PostgreSQL...');

  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  await client.connect();
  console.log('✅ Connected successfully to Supabase!');

  try {
    console.log('🔨 Creating ENUM types and tables...');

    await client.query(`
      -- 1. ENUM TYPES
      DO $$ BEGIN
        CREATE TYPE "Role" AS ENUM ('ADMIN', 'THU_KHO', 'MUA_HANG', 'KY_THUAT', 'SAN_XUAT', 'SALE_ADMIN', 'KE_TOAN');
      EXCEPTION WHEN duplicate_object THEN null; END $$;

      DO $$ BEGIN
        CREATE TYPE "OrderStatus" AS ENUM ('MOI_NHAN', 'CHO_BOM', 'DANG_DOI_CHIEU_TON', 'DA_GIU_CHO', 'CHO_MUA', 'DA_NHAP_KHO', 'SAN_SANG_XUAT', 'DA_XUAT_MOT_PHAN', 'HOAN_TAT', 'DA_HUY');
      EXCEPTION WHEN duplicate_object THEN null; END $$;

      DO $$ BEGIN
        CREATE TYPE "BomStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'VERIFIED', 'REVISED', 'CANCELLED');
      EXCEPTION WHEN duplicate_object THEN null; END $$;

      DO $$ BEGIN
        CREATE TYPE "BomItemStatus" AS ENUM ('PENDING', 'RESERVED', 'PO_REQUESTED', 'PARTIALLY_DISPATCHED', 'COMPLETED');
      EXCEPTION WHEN duplicate_object THEN null; END $$;

      DO $$ BEGIN
        CREATE TYPE "PoStatus" AS ENUM ('DRAFT', 'ORDERED', 'PARTIALLY_RECEIVED', 'COMPLETED', 'CANCELLED');
      EXCEPTION WHEN duplicate_object THEN null; END $$;

      DO $$ BEGIN
        CREATE TYPE "GrnType" AS ENUM ('PO_RECEIPT', 'INITIAL_STOCK', 'RETURN_FROM_PRODUCTION', 'STOCKTAKE_ADJUSTMENT');
      EXCEPTION WHEN duplicate_object THEN null; END $$;

      DO $$ BEGIN
        CREATE TYPE "ShiftType" AS ENUM ('CA_SANG', 'CA_CHIEU');
      EXCEPTION WHEN duplicate_object THEN null; END $$;

      DO $$ BEGIN
        CREATE TYPE "PickupStatus" AS ENUM ('REGISTERED', 'STAGED', 'DISPATCHED', 'CANCELLED');
      EXCEPTION WHEN duplicate_object THEN null; END $$;

      DO $$ BEGIN
        CREATE TYPE "GdnStatus" AS ENUM ('DRAFT', 'APPROVED', 'DISPATCHED', 'CANCELLED');
      EXCEPTION WHEN duplicate_object THEN null; END $$;

      DO $$ BEGIN
        CREATE TYPE "StocktakeType" AS ENUM ('QUARTERLY', 'AD_HOC');
      EXCEPTION WHEN duplicate_object THEN null; END $$;

      DO $$ BEGIN
        CREATE TYPE "StocktakeStatus" AS ENUM ('DRAFT', 'COMPLETED', 'CANCELLED');
      EXCEPTION WHEN duplicate_object THEN null; END $$;

      DO $$ BEGIN
        CREATE TYPE "TransactionType" AS ENUM ('INBOUND_PO', 'INBOUND_INITIAL', 'INBOUND_RETURN', 'INBOUND_ADJUSTMENT', 'OUTBOUND_BOM', 'OUTBOUND_SCRAP', 'OUTBOUND_ADJUSTMENT');
      EXCEPTION WHEN duplicate_object THEN null; END $$;

      -- 2. MASTER DATA TABLES
      CREATE TABLE IF NOT EXISTS "users" (
        "id" TEXT PRIMARY KEY,
        "email" TEXT UNIQUE NOT NULL,
        "username" TEXT UNIQUE NOT NULL,
        "password_hash" TEXT NOT NULL,
        "full_name" TEXT NOT NULL,
        "phone" TEXT,
        "role" "Role" NOT NULL DEFAULT 'THU_KHO',
        "is_active" BOOLEAN NOT NULL DEFAULT true,
        "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS "warehouses" (
        "id" TEXT PRIMARY KEY,
        "code" TEXT UNIQUE NOT NULL,
        "name" TEXT NOT NULL,
        "address" TEXT,
        "description" TEXT,
        "is_scrap_location" BOOLEAN NOT NULL DEFAULT false,
        "is_active" BOOLEAN NOT NULL DEFAULT true,
        "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS "uoms" (
        "id" TEXT PRIMARY KEY,
        "code" TEXT UNIQUE NOT NULL,
        "name" TEXT NOT NULL,
        "description" TEXT,
        "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS "skus" (
        "id" TEXT PRIMARY KEY,
        "code" TEXT UNIQUE NOT NULL,
        "name" TEXT NOT NULL,
        "specification" TEXT,
        "category" TEXT,
        "base_uom_id" TEXT NOT NULL REFERENCES "uoms"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
        "default_warehouse_id" TEXT NOT NULL REFERENCES "warehouses"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
        "min_stock_alert" DECIMAL(12,4) NOT NULL DEFAULT 0,
        "average_cost" DECIMAL(15,2) NOT NULL DEFAULT 0,
        "is_active" BOOLEAN NOT NULL DEFAULT true,
        "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS "uom_conversions" (
        "id" TEXT PRIMARY KEY,
        "sku_id" TEXT NOT NULL REFERENCES "skus"("id") ON DELETE CASCADE ON UPDATE CASCADE,
        "from_uom_id" TEXT NOT NULL REFERENCES "uoms"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
        "to_uom_id" TEXT NOT NULL REFERENCES "uoms"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
        "conversion_rate" DECIMAL(12,4) NOT NULL,
        "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "uom_conversions_unique" UNIQUE ("sku_id", "from_uom_id", "to_uom_id")
      );

      CREATE TABLE IF NOT EXISTS "stock_balances" (
        "id" TEXT PRIMARY KEY,
        "sku_id" TEXT NOT NULL REFERENCES "skus"("id") ON DELETE CASCADE ON UPDATE CASCADE,
        "warehouse_id" TEXT NOT NULL REFERENCES "warehouses"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
        "quantity_physical" DECIMAL(12,4) NOT NULL DEFAULT 0,
        "quantity_reserved" DECIMAL(12,4) NOT NULL DEFAULT 0,
        "bin_location" TEXT,
        "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "stock_balances_unique" UNIQUE ("sku_id", "warehouse_id"),
        CONSTRAINT "chk_stock_balance_positive" CHECK ("quantity_physical" >= 0),
        CONSTRAINT "chk_stock_balance_reserved_valid" CHECK ("quantity_physical" >= "quantity_reserved" AND "quantity_reserved" >= 0)
      );

      -- 3. ORDERS & BOM TABLES
      CREATE TABLE IF NOT EXISTS "orders" (
        "id" TEXT PRIMARY KEY,
        "code" TEXT UNIQUE NOT NULL,
        "title" TEXT NOT NULL,
        "customer_name" TEXT NOT NULL,
        "sale_admin_id" TEXT NOT NULL REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
        "status" "OrderStatus" NOT NULL DEFAULT 'MOI_NHAN',
        "target_delivery_date" TIMESTAMP(3),
        "note" TEXT,
        "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS "order_panels" (
        "id" TEXT PRIMARY KEY,
        "order_id" TEXT NOT NULL REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE,
        "code" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "description" TEXT,
        "panel_type" TEXT,
        "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "order_panels_unique" UNIQUE ("order_id", "code")
      );

      CREATE TABLE IF NOT EXISTS "boms" (
        "id" TEXT PRIMARY KEY,
        "order_id" TEXT NOT NULL REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE,
        "panel_id" TEXT REFERENCES "order_panels"("id") ON DELETE SET NULL ON UPDATE CASCADE,
        "version" INTEGER NOT NULL DEFAULT 1,
        "status" "BomStatus" NOT NULL DEFAULT 'SUBMITTED',
        "submitted_by_id" TEXT NOT NULL REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
        "verified_by_id" TEXT REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE,
        "submitted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "verified_at" TIMESTAMP(3),
        "notes" TEXT,
        "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "boms_unique" UNIQUE ("order_id", "panel_id", "version")
      );

      CREATE TABLE IF NOT EXISTS "bom_items" (
        "id" TEXT PRIMARY KEY,
        "bom_id" TEXT NOT NULL REFERENCES "boms"("id") ON DELETE CASCADE ON UPDATE CASCADE,
        "sku_id" TEXT NOT NULL REFERENCES "skus"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
        "warehouse_id" TEXT NOT NULL REFERENCES "warehouses"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
        "quantity_required" DECIMAL(12,4) NOT NULL,
        "quantity_reserved" DECIMAL(12,4) NOT NULL DEFAULT 0,
        "quantity_dispatched" DECIMAL(12,4) NOT NULL DEFAULT 0,
        "quantity_pending_po" DECIMAL(12,4) NOT NULL DEFAULT 0,
        "status" "BomItemStatus" NOT NULL DEFAULT 'PENDING',
        "note" TEXT
      );

      CREATE TABLE IF NOT EXISTS "stock_reservations" (
        "id" TEXT PRIMARY KEY,
        "order_id" TEXT NOT NULL REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE,
        "panel_id" TEXT REFERENCES "order_panels"("id") ON DELETE SET NULL ON UPDATE CASCADE,
        "bom_item_id" TEXT NOT NULL REFERENCES "bom_items"("id") ON DELETE CASCADE ON UPDATE CASCADE,
        "sku_id" TEXT NOT NULL REFERENCES "skus"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
        "warehouse_id" TEXT NOT NULL REFERENCES "warehouses"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
        "quantity" DECIMAL(12,4) NOT NULL,
        "is_active" BOOLEAN NOT NULL DEFAULT true,
        "reserved_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "released_at" TIMESTAMP(3)
      );

      -- 4. PROCUREMENT
      CREATE TABLE IF NOT EXISTS "suppliers" (
        "id" TEXT PRIMARY KEY,
        "code" TEXT UNIQUE NOT NULL,
        "name" TEXT NOT NULL,
        "contact_person" TEXT,
        "phone" TEXT,
        "email" TEXT,
        "address" TEXT,
        "is_active" BOOLEAN NOT NULL DEFAULT true,
        "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS "purchase_orders" (
        "id" TEXT PRIMARY KEY,
        "code" TEXT UNIQUE NOT NULL,
        "supplier_id" TEXT NOT NULL REFERENCES "suppliers"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
        "order_id" TEXT REFERENCES "orders"("id") ON DELETE SET NULL ON UPDATE CASCADE,
        "created_by_id" TEXT NOT NULL REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
        "status" "PoStatus" NOT NULL DEFAULT 'DRAFT',
        "expected_delivery_date" TIMESTAMP(3),
        "actual_delivery_date" TIMESTAMP(3),
        "total_amount" DECIMAL(15,2) NOT NULL DEFAULT 0,
        "note" TEXT,
        "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS "purchase_order_items" (
        "id" TEXT PRIMARY KEY,
        "po_id" TEXT NOT NULL REFERENCES "purchase_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE,
        "sku_id" TEXT NOT NULL REFERENCES "skus"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
        "bom_item_id" TEXT REFERENCES "bom_items"("id") ON DELETE SET NULL ON UPDATE CASCADE,
        "purchasing_uom_id" TEXT NOT NULL REFERENCES "uoms"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
        "quantity_purchased" DECIMAL(12,4) NOT NULL,
        "base_quantity_expected" DECIMAL(12,4) NOT NULL,
        "base_quantity_received" DECIMAL(12,4) NOT NULL DEFAULT 0,
        "unit_price" DECIMAL(15,2) NOT NULL,
        "line_total" DECIMAL(15,2) NOT NULL
      );

      -- 5. INBOUND & OUTBOUND
      CREATE TABLE IF NOT EXISTS "goods_receipt_notes" (
        "id" TEXT PRIMARY KEY,
        "code" TEXT UNIQUE NOT NULL,
        "grn_type" "GrnType" NOT NULL DEFAULT 'PO_RECEIPT',
        "po_id" TEXT REFERENCES "purchase_orders"("id") ON DELETE SET NULL ON UPDATE CASCADE,
        "warehouse_id" TEXT NOT NULL REFERENCES "warehouses"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
        "created_by_id" TEXT NOT NULL REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
        "received_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "document_ref" TEXT,
        "note" TEXT,
        "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS "goods_receipt_items" (
        "id" TEXT PRIMARY KEY,
        "grn_id" TEXT NOT NULL REFERENCES "goods_receipt_notes"("id") ON DELETE CASCADE ON UPDATE CASCADE,
        "po_item_id" TEXT REFERENCES "purchase_order_items"("id") ON DELETE SET NULL ON UPDATE CASCADE,
        "bom_item_id" TEXT REFERENCES "bom_items"("id") ON DELETE SET NULL ON UPDATE CASCADE,
        "sku_id" TEXT NOT NULL REFERENCES "skus"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
        "purchasing_uom_id" TEXT NOT NULL REFERENCES "uoms"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
        "quantity" DECIMAL(12,4) NOT NULL,
        "conversion_rate" DECIMAL(12,4) NOT NULL DEFAULT 1,
        "base_quantity" DECIMAL(12,4) NOT NULL,
        "unit_price" DECIMAL(15,2) NOT NULL,
        "base_unit_cost" DECIMAL(15,2) NOT NULL,
        "line_total" DECIMAL(15,2) NOT NULL,
        "note" TEXT
      );

      CREATE TABLE IF NOT EXISTS "pickup_registrations" (
        "id" TEXT PRIMARY KEY,
        "code" TEXT UNIQUE NOT NULL,
        "order_id" TEXT NOT NULL REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE,
        "panel_id" TEXT REFERENCES "order_panels"("id") ON DELETE SET NULL ON UPDATE CASCADE,
        "shift_type" "ShiftType" NOT NULL,
        "pickup_date" DATE NOT NULL,
        "registered_by_id" TEXT NOT NULL REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
        "status" "PickupStatus" NOT NULL DEFAULT 'REGISTERED',
        "is_comply_kpi" BOOLEAN NOT NULL DEFAULT true,
        "registered_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "note" TEXT
      );

      CREATE TABLE IF NOT EXISTS "goods_dispatch_notes" (
        "id" TEXT PRIMARY KEY,
        "code" TEXT UNIQUE NOT NULL,
        "order_id" TEXT NOT NULL REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE,
        "panel_id" TEXT REFERENCES "order_panels"("id") ON DELETE SET NULL ON UPDATE CASCADE,
        "pickup_registration_id" TEXT REFERENCES "pickup_registrations"("id") ON DELETE SET NULL ON UPDATE CASCADE,
        "warehouse_id" TEXT NOT NULL REFERENCES "warehouses"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
        "shift_type" "ShiftType" NOT NULL,
        "is_out_of_shift" BOOLEAN NOT NULL DEFAULT false,
        "out_of_shift_reason" TEXT,
        "is_emergency" BOOLEAN NOT NULL DEFAULT false,
        "emergency_approver_name" TEXT,
        "created_by_id" TEXT NOT NULL REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
        "approved_by_id" TEXT REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE,
        "approved_at" TIMESTAMP(3),
        "receiver_name" TEXT NOT NULL,
        "receiver_role" TEXT NOT NULL DEFAULT 'Đội Sản Xuất Lắp Ráp Tủ Điện',
        "status" "GdnStatus" NOT NULL DEFAULT 'DRAFT',
        "dispatched_at" TIMESTAMP(3),
        "note" TEXT,
        "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS "goods_dispatch_items" (
        "id" TEXT PRIMARY KEY,
        "gdn_id" TEXT NOT NULL REFERENCES "goods_dispatch_notes"("id") ON DELETE CASCADE ON UPDATE CASCADE,
        "bom_item_id" TEXT NOT NULL REFERENCES "bom_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
        "sku_id" TEXT NOT NULL REFERENCES "skus"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
        "quantity_bom" DECIMAL(12,4) NOT NULL,
        "quantity_real" DECIMAL(12,4) NOT NULL,
        "unit_cost" DECIMAL(15,2) NOT NULL DEFAULT 0,
        "note" TEXT
      );

      CREATE TABLE IF NOT EXISTS "stock_return_notes" (
        "id" TEXT PRIMARY KEY,
        "code" TEXT UNIQUE NOT NULL,
        "order_id" TEXT NOT NULL REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE,
        "panel_id" TEXT REFERENCES "order_panels"("id") ON DELETE SET NULL ON UPDATE CASCADE,
        "warehouse_id" TEXT NOT NULL REFERENCES "warehouses"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
        "is_defective" BOOLEAN NOT NULL DEFAULT false,
        "defect_reason" TEXT,
        "created_by_id" TEXT NOT NULL REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
        "returned_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "note" TEXT,
        "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS "stock_return_items" (
        "id" TEXT PRIMARY KEY,
        "return_note_id" TEXT NOT NULL REFERENCES "stock_return_notes"("id") ON DELETE CASCADE ON UPDATE CASCADE,
        "sku_id" TEXT NOT NULL REFERENCES "skus"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
        "quantity" DECIMAL(12,4) NOT NULL,
        "unit_cost" DECIMAL(15,2) NOT NULL DEFAULT 0,
        "is_reusable" BOOLEAN NOT NULL DEFAULT true,
        "note" TEXT
      );

      -- 6. STOCKTAKE & AUDIT LEDGER
      CREATE TABLE IF NOT EXISTS "stocktakes" (
        "id" TEXT PRIMARY KEY,
        "code" TEXT UNIQUE NOT NULL,
        "warehouse_id" TEXT NOT NULL REFERENCES "warehouses"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
        "stocktake_type" "StocktakeType" NOT NULL DEFAULT 'QUARTERLY',
        "status" "StocktakeStatus" NOT NULL DEFAULT 'DRAFT',
        "conducted_by_id" TEXT NOT NULL REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
        "approved_by_id" TEXT REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE,
        "conducted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "note" TEXT,
        "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS "stocktake_items" (
        "id" TEXT PRIMARY KEY,
        "stocktake_id" TEXT NOT NULL REFERENCES "stocktakes"("id") ON DELETE CASCADE ON UPDATE CASCADE,
        "sku_id" TEXT NOT NULL REFERENCES "skus"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
        "system_quantity" DECIMAL(12,4) NOT NULL,
        "physical_quantity" DECIMAL(12,4) NOT NULL,
        "variance_quantity" DECIMAL(12,4) NOT NULL,
        "unit_cost" DECIMAL(15,2) NOT NULL DEFAULT 0,
        "variance_amount" DECIMAL(15,2) NOT NULL DEFAULT 0,
        "explanation" TEXT,
        "is_adjusted" BOOLEAN NOT NULL DEFAULT false
      );

      CREATE TABLE IF NOT EXISTS "stock_transactions" (
        "id" TEXT PRIMARY KEY,
        "sku_id" TEXT NOT NULL REFERENCES "skus"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
        "warehouse_id" TEXT NOT NULL REFERENCES "warehouses"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
        "transaction_type" "TransactionType" NOT NULL,
        "quantity_change" DECIMAL(12,4) NOT NULL,
        "quantity_before" DECIMAL(12,4) NOT NULL,
        "quantity_after" DECIMAL(12,4) NOT NULL,
        "unit_cost" DECIMAL(15,2) NOT NULL,
        "grn_id" TEXT REFERENCES "goods_receipt_notes"("id") ON DELETE SET NULL ON UPDATE CASCADE,
        "gdn_id" TEXT REFERENCES "goods_dispatch_notes"("id") ON DELETE SET NULL ON UPDATE CASCADE,
        "return_note_id" TEXT REFERENCES "stock_return_notes"("id") ON DELETE SET NULL ON UPDATE CASCADE,
        "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS "kpi_logs" (
        "id" TEXT PRIMARY KEY,
        "metric_code" TEXT NOT NULL,
        "reference_code" TEXT NOT NULL,
        "expected_timestamp" TIMESTAMP(3),
        "actual_timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "is_compliant" BOOLEAN NOT NULL,
        "deviation_minutes" INTEGER,
        "details" TEXT,
        "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('✅ All tables, enums and constraints created successfully on Supabase!');
  } finally {
    await client.end();
  }
}

setup().then(() => process.exit(0)).catch(err => {
  console.error('❌ Setup failed:', err);
  process.exit(1);
});
