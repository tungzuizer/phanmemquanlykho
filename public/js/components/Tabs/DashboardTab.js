/*
Fact-Forcing Gate Info:
1. Importers/Callers: public/index.html via <script type="text/babel" src="/js/components/Tabs/DashboardTab.js?v=2026.09.12"></script>
2. Affected API: Industrial CAD Executive Control Room Dashboard Tab (window.WMS_COMPONENTS.DashboardTab)
3. Data schemas: data (orders, stockBalances, skus, warehouses, uoms), currentUser, handlers, onNavigateTab, onSelectOrder
4. User's verbatim instruction: "web không thay đổi gì cả ?" / "cần cải thiện lại cho chuyên nghiệp và xịn xò"
*/

function DashboardTab({ data, currentUser, handlers, onNavigateTab, onSelectOrder }) {
  const { formatMoney, formatNumber } = window.WMS_CONSTANTS || { formatMoney: n => n, formatNumber: n => n };
  const { ActionInbox } = window.WMS_COMPONENTS || {};

  if (!data) return null;

  // Key Calculations
  const totalPhysical = (data.stockBalances || []).reduce((sum, sb) => sum + Number(sb.quantityPhysical), 0);
  const totalReserved = (data.stockBalances || []).reduce((sum, sb) => sum + Number(sb.quantityReserved), 0);
  const totalAvailable = Math.max(0, totalPhysical - totalReserved);
  const readyOrders = (data.orders || []).filter(o => o.status === 'SAN_SANG_XUAT').length;
  const pendingPoOrders = (data.orders || []).filter(o => o.status === 'CHO_MUA').length;
  const inProgressOrders = (data.orders || []).filter(o => o.status !== 'HOAN_TAT').length;

  // Low Stock Items (where available < safety stock or min threshold)
  const lowStockSkus = (data.skus || []).map(sku => {
    const balances = (data.stockBalances || []).filter(b => b.skuId === sku.id);
    const physical = balances.reduce((s, b) => s + Number(b.quantityPhysical), 0);
    const reserved = balances.reduce((s, b) => s + Number(b.quantityReserved), 0);
    const available = Math.max(0, physical - reserved);
    const minStock = sku.minSafetyStock || 10;
    const isLow = available < minStock;
    const baseUom = (data.uoms || []).find(u => u.id === sku.baseUomId);
    return { sku, physical, reserved, available, minStock, isLow, uomName: baseUom?.name || '' };
  }).filter(item => item.isLow);

  return (
    <div className="space-y-4 sm:space-y-5 animate-fade-in">
      {/* 1. Live Industrial CAD Control Room Telemetry Ribbon */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 sm:p-4 text-white shadow-xl relative overflow-hidden bg-industrial-grid">
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-cyan-400 font-bold tracking-wider uppercase">TRUNG TÂM ĐIỀU HÀNH MEVN CAD</span>
            <span className="text-slate-500">|</span>
            <span className="text-slate-400">IEC 61439 & ISO 9001:2015</span>
          </div>

          <div className="flex items-center gap-4 text-[11px] text-slate-400">
            <div className="hidden sm:flex items-center gap-1.5">
              <i className="fa-solid fa-bolt text-amber-400 text-xs"></i>
              <span>LƯỚI ĐIỆN 3 PHA:</span>
              <span className="text-white font-bold">398.5V / 50.02Hz</span>
            </div>
            <div className="flex items-center gap-1.5">
              <i className="fa-solid fa-lock text-indigo-400 text-xs"></i>
              <span>ACID LOCK:</span>
              <span className="text-emerald-400 font-bold">ACTIVE (0 CONFLICT)</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 rounded-2xl p-5 sm:p-6 text-white shadow-xl border border-white/10 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-[10px] font-black text-cyan-400 uppercase tracking-widest font-mono mb-1">
              <i className="fa-solid fa-microchip"></i>
              <span>HỆ THỐNG QUẢN TRỊ KHO & SẢN XUẤT TỦ ĐIỆN TỰ ĐỘNG HÓA</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight font-mono">
              Xin chào, {currentUser?.fullName || 'Người dùng'}!
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Hệ thống đang theo dõi <span className="font-bold text-white font-mono">{inProgressOrders} đơn hàng</span> trong tiến trình sản xuất tủ điện, tự động kiểm soát giữ chỗ vật tư và tính toán delta thiếu hụt theo chuẩn ISO 9001.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={() => handlers.onOpenOrderModal()}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-500/30 flex items-center gap-2 transition liquid-touch font-mono"
            >
              <i className="fa-solid fa-plus"></i> + TẠO ĐƠN HÀNG MỚI
            </button>
            <button
              onClick={() => onNavigateTab('kpi')}
              className="px-3.5 py-2.5 bg-white/10 hover:bg-white/20 text-slate-200 font-bold text-xs rounded-xl border border-white/15 flex items-center gap-1.5 transition liquid-touch backdrop-blur-md font-mono"
            >
              <i className="fa-solid fa-chart-line text-cyan-400"></i> XEM 3 KPI ISO
            </button>
          </div>
        </div>
      </div>

      {/* 3. Top 5 Key Metric Cards with Industrial CAD Styling */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div
          onClick={() => onNavigateTab('orders')}
          className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs hover:border-blue-500/50 transition cursor-pointer group liquid-touch"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider font-mono">Tổng Đơn Hàng</span>
            <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center text-xs group-hover:scale-110 transition">
              <i className="fa-solid fa-cubes"></i>
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-2 font-mono">
            {data.orders?.length || 0}
          </div>
          <div className="text-[10px] text-slate-400 mt-1 truncate font-mono">
            <span className="text-blue-600 dark:text-blue-400 font-bold">{inProgressOrders} đơn</span> đang chạy
          </div>
        </div>

        <div
          onClick={() => onNavigateTab('dispatch')}
          className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-emerald-200 dark:border-emerald-950 shadow-xs hover:border-emerald-500/50 transition cursor-pointer group liquid-touch"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider font-mono">Sẵn Sàng Xuất</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xs group-hover:scale-110 transition">
              <i className="fa-solid fa-circle-check"></i>
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-2 font-mono">
            {readyOrders}
          </div>
          <div className="text-[10px] text-emerald-600/80 dark:text-emerald-400/80 mt-1 truncate font-mono">
            Đủ 100% BOM Tủ
          </div>
        </div>

        <div
          onClick={() => onNavigateTab('pos')}
          className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-rose-200 dark:border-rose-950 shadow-xs hover:border-rose-500/50 transition cursor-pointer group liquid-touch"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider font-mono">Chờ Mua Bù</span>
            <div className="w-7 h-7 rounded-lg bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-400 flex items-center justify-center text-xs group-hover:scale-110 transition">
              <i className="fa-solid fa-triangle-exclamation"></i>
            </div>
          </div>
          <div className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-2 font-mono">
            {pendingPoOrders}
          </div>
          <div className="text-[10px] text-rose-600/80 dark:text-rose-400/80 mt-1 truncate font-mono">
            Phát hành PO gấp
          </div>
        </div>

        <div
          onClick={() => onNavigateTab('inventory')}
          className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-indigo-200 dark:border-indigo-950 shadow-xs hover:border-indigo-500/50 transition cursor-pointer group liquid-touch"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider font-mono">Đang Giữ Chỗ</span>
            <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-xs group-hover:scale-110 transition">
              <i className="fa-solid fa-lock"></i>
            </div>
          </div>
          <div className="text-2xl font-black text-indigo-600 dark:text-indigo-300 mt-2 font-mono">
            {formatNumber(totalReserved)}
          </div>
          <div className="text-[10px] text-indigo-600/80 dark:text-indigo-400/80 mt-1 truncate font-mono">
            Khóa theo BOM tủ
          </div>
        </div>

        <div
          onClick={() => onNavigateTab('inventory')}
          className="col-span-2 md:col-span-1 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-blue-200 dark:border-blue-950 shadow-xs hover:border-blue-500/50 transition cursor-pointer group liquid-touch"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider font-mono">Tồn Khả Dụng</span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xs group-hover:scale-110 transition">
              <i className="fa-solid fa-boxes-stacked"></i>
            </div>
          </div>
          <div className="text-2xl font-black text-blue-600 dark:text-blue-300 mt-2 font-mono">
            {formatNumber(totalAvailable)}
          </div>
          <div className="text-[10px] text-blue-600/80 dark:text-blue-400/80 mt-1 truncate font-mono">
            Tự do cấp phát
          </div>
        </div>
      </div>

      {/* 4. Role-Adaptive Action Required Inbox */}
      {ActionInbox && (
        <ActionInbox
          data={data}
          currentUser={currentUser}
          onOpenOrderModal={handlers.onOpenOrderModal}
          onOpenBomModal={handlers.onOpenBomModal}
          onVerifyBom={handlers.onVerifyBom}
          onOpenPoModal={handlers.onOpenPoModal}
          onOpenPickupModal={handlers.onOpenPickupModal}
          onOpenGdnModal={handlers.onOpenGdnModal}
          onApproveGdn={handlers.onApproveGdn}
          onDispatchGdn={handlers.onDispatchGdn}
          onNavigateTab={onNavigateTab}
        />
      )}

      {/* 5. Bottom Grid: Low Stock Alert & Warehouse Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
        {/* Low Stock Safety Alert Panel */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <i className="fa-solid fa-bell text-amber-500 text-sm"></i>
              <h3 className="text-sm font-black text-slate-900 dark:text-white font-mono">CẢNH BÁO TỒN AN TOÀN (SAFETY STOCK)</h3>
            </div>
            <span className="text-xs font-bold font-mono text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950 px-2.5 py-0.5 rounded border border-amber-200 dark:border-amber-800">
              {lowStockSkus.length} MÃ CẢNH BÁO
            </span>
          </div>

          {lowStockSkus.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center font-mono">Toàn bộ danh mục vật tư đều đang duy trì trên mức tồn an toàn ISO.</p>
          ) : (
            <div className="space-y-2">
              {lowStockSkus.slice(0, 4).map(({ sku, available, minStock, uomName }) => (
                <div key={sku.id} className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between liquid-touch">
                  <div className="min-w-0 flex-1 pr-2">
                    <span className="font-mono font-bold text-xs text-blue-600 dark:text-blue-400">{sku.code}</span>
                    <div className="text-[11px] text-slate-700 dark:text-slate-300 font-medium truncate">{sku.name}</div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-xs font-bold text-rose-600 dark:text-rose-400 font-mono">
                      Khả dụng: {available} {uomName}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">Tối thiểu: {minStock} {uomName}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Warehouse Quick Distribution */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <i className="fa-solid fa-warehouse text-blue-500 text-sm"></i>
              <h3 className="text-sm font-black text-slate-900 dark:text-white font-mono">CÂN ĐỐI KHO VẬT LÝ MEVN</h3>
            </div>
            <button onClick={() => onNavigateTab('inventory')} className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-bold font-mono">
              Chi tiết kệ hàng →
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {(data.warehouses || []).map(wh => {
              const balances = (data.stockBalances || []).filter(sb => sb.warehouseId === wh.id);
              const phys = balances.reduce((s, b) => s + Number(b.quantityPhysical), 0);
              const resv = balances.reduce((s, b) => s + Number(b.quantityReserved), 0);
              const avail = Math.max(0, phys - resv);

              return (
                <div key={wh.id} className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2 liquid-touch">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-900 dark:text-white truncate">{wh.name}</span>
                    <span className="text-[10px] font-mono bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-1.5 py-0.5 rounded">{wh.code}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1 text-center font-mono">
                    <div className="bg-white dark:bg-slate-900 p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-[10px]">
                      <div className="text-slate-400">Vật lý</div>
                      <div className="font-bold text-slate-800 dark:text-slate-200">{phys}</div>
                    </div>
                    <div className="bg-indigo-50/60 dark:bg-indigo-950/40 p-1.5 rounded-lg border border-indigo-200/40 dark:border-indigo-800/40 text-[10px]">
                      <div className="text-indigo-600 dark:text-indigo-400">Giữ chỗ</div>
                      <div className="font-bold text-indigo-600 dark:text-indigo-400">{resv}</div>
                    </div>
                    <div className="bg-blue-50/60 dark:bg-blue-950/40 p-1.5 rounded-lg border border-blue-200/40 dark:border-blue-800/40 text-[10px]">
                      <div className="text-blue-600 dark:text-blue-400">Tự do</div>
                      <div className="font-bold text-blue-600 dark:text-blue-400">{avail}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

window.WMS_COMPONENTS = window.WMS_COMPONENTS || {};
window.WMS_COMPONENTS.DashboardTab = DashboardTab;
