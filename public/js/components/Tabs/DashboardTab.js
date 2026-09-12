/*
1. Importers/Callers: public/index.html via <script type="text/babel" src="/js/components/Tabs/DashboardTab.js"></script>
2. Affected API: iOS 26 Liquid Glass Executive Dashboard Tab (window.WMS_COMPONENTS.DashboardTab).
3. Data schemas: Uses data.orders, data.stockBalances, data.skus, data.warehouses, data.uoms.
4. User's verbatim instruction: "cải thiện cả giao diện trên iphone và adroi và thiết kế theo phong cách Giao Diện Ios 26 Liquid Glass" / "theo khuyến nghị của bạn"
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
    <div className="space-y-5 animate-fade-in">
      {/* Welcome Ambient Glass Banner */}
      <div className="bg-gradient-to-tr from-slate-900 via-blue-950 to-indigo-950 rounded-3xl p-5 sm:p-6 text-white shadow-xl border border-white/10 relative overflow-hidden liquid-specular">
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-blue-500/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-[11px] font-black text-cyan-400 uppercase tracking-wider mb-1">
              <i className="fa-solid fa-industry"></i>
              <span>Trung Tâm Điều Hành Kho & Cung Ứng Sản Xuất Chuẩn ISO</span>
            </div>
            <h2 className="text-lg sm:text-xl font-black tracking-tight">
              Xin chào, {currentUser?.fullName || 'Người dùng'}!
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-xl leading-relaxed">
              Hệ thống đang theo dõi <span className="font-bold text-white">{inProgressOrders} đơn hàng</span> trong tiến trình sản xuất tủ điện, tự động kiểm soát giữ chỗ vật tư và tính toán delta thiếu hụt theo chuẩn ISO 9001.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={() => handlers.onOpenOrderModal()}
              className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs rounded-2xl shadow-lg shadow-blue-500/30 flex items-center gap-2 transition liquid-touch"
            >
              <i className="fa-solid fa-plus"></i> Tạo Đơn Hàng Mới
            </button>
            <button
              onClick={() => onNavigateTab('kpi')}
              className="px-3.5 py-2.5 bg-white/10 hover:bg-white/20 text-slate-200 font-semibold text-xs rounded-2xl border border-white/15 flex items-center gap-1.5 transition liquid-touch backdrop-blur-md"
            >
              <i className="fa-solid fa-chart-line text-cyan-400"></i> Xem 3 KPI ISO
            </button>
          </div>
        </div>
      </div>

      {/* Top 5 Key Metric Cards with Liquid Glass Styling */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 sm:gap-3.5">
        <div
          onClick={() => onNavigateTab('orders')}
          className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-4 rounded-3xl border border-white/80 dark:border-white/10 shadow-sm hover:shadow-md transition cursor-pointer group liquid-specular liquid-touch"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Tổng Đơn</span>
            <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center text-xs group-hover:scale-110 transition">
              <i className="fa-solid fa-cubes"></i>
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-2 font-mono">
            {data.orders?.length || 0}
          </div>
          <div className="text-[10px] sm:text-[11px] text-slate-400 mt-1 truncate">
            <span className="text-blue-600 dark:text-blue-400 font-bold">{inProgressOrders} đơn</span> đang chạy
          </div>
        </div>

        <div
          onClick={() => onNavigateTab('dispatch')}
          className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-4 rounded-3xl border border-emerald-200/80 dark:border-emerald-900/40 shadow-sm hover:shadow-md transition cursor-pointer group liquid-specular liquid-touch"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Sẵn Sàng Xuất</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xs group-hover:scale-110 transition">
              <i className="fa-solid fa-circle-check"></i>
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-emerald-700 dark:text-emerald-400 mt-2 font-mono">
            {readyOrders}
          </div>
          <div className="text-[10px] sm:text-[11px] text-emerald-600/80 dark:text-emerald-400/80 mt-1 truncate">
            Đủ 100% BOM
          </div>
        </div>

        <div
          onClick={() => onNavigateTab('pos')}
          className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-4 rounded-3xl border border-red-200/80 dark:border-red-900/40 shadow-sm hover:shadow-md transition cursor-pointer group liquid-specular liquid-touch"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-[11px] font-bold text-red-600 dark:text-red-400 uppercase tracking-wider">Chờ Mua Bù</span>
            <div className="w-8 h-8 rounded-xl bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400 flex items-center justify-center text-xs group-hover:scale-110 transition">
              <i className="fa-solid fa-triangle-exclamation"></i>
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-red-700 dark:text-red-400 mt-2 font-mono">
            {pendingPoOrders}
          </div>
          <div className="text-[10px] sm:text-[11px] text-red-600/80 dark:text-red-400/80 mt-1 truncate">
            Phát hành PO gấp
          </div>
        </div>

        <div
          onClick={() => onNavigateTab('inventory')}
          className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-4 rounded-3xl border border-indigo-200/80 dark:border-indigo-900/40 shadow-sm hover:shadow-md transition cursor-pointer group liquid-specular liquid-touch"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-[11px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">Đang Giữ Chỗ</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-xs group-hover:scale-110 transition">
              <i className="fa-solid fa-lock"></i>
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-indigo-700 dark:text-indigo-300 mt-2 font-mono">
            {formatNumber(totalReserved)}
          </div>
          <div className="text-[10px] sm:text-[11px] text-indigo-600/80 dark:text-indigo-400/80 mt-1 truncate">
            Khóa cho đơn BOM
          </div>
        </div>

        <div
          onClick={() => onNavigateTab('inventory')}
          className="col-span-2 md:col-span-1 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-4 rounded-3xl border border-blue-200/80 dark:border-blue-900/40 shadow-sm hover:shadow-md transition cursor-pointer group liquid-specular liquid-touch"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-[11px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">Tồn Khả Dụng</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xs group-hover:scale-110 transition">
              <i className="fa-solid fa-boxes-stacked"></i>
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-blue-700 dark:text-blue-300 mt-2 font-mono">
            {formatNumber(totalAvailable)}
          </div>
          <div className="text-[10px] sm:text-[11px] text-blue-600/80 dark:text-blue-400/80 mt-1 truncate">
            Tự do cấp phát
          </div>
        </div>
      </div>

      {/* Role-Adaptive Action Required Inbox */}
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

      {/* Bottom Grid: Low Stock Alert & Warehouse Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Low Stock Safety Alert Panel */}
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl border border-white/80 dark:border-white/10 p-5 shadow-sm space-y-3 liquid-specular">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <i className="fa-solid fa-bell text-amber-500 text-sm"></i>
              <h3 className="text-sm font-black text-slate-900 dark:text-white">Cảnh Báo Ngưỡng Tồn An Toàn (Safety Stock)</h3>
            </div>
            <span className="text-xs font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950 px-2.5 py-0.5 rounded-full border border-amber-200 dark:border-amber-800">
              {lowStockSkus.length} mã cảnh báo
            </span>
          </div>

          {lowStockSkus.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">Toàn bộ danh mục vật tư đều đang duy trì trên mức tồn an toàn.</p>
          ) : (
            <div className="space-y-2.5">
              {lowStockSkus.slice(0, 4).map(({ sku, available, minStock, uomName }) => (
                <div key={sku.id} className="p-3 bg-amber-50/50 dark:bg-amber-950/20 rounded-2xl border border-amber-200/60 dark:border-amber-800/40 flex items-center justify-between liquid-touch">
                  <div className="min-w-0 flex-1 pr-2">
                    <span className="font-mono font-bold text-xs text-slate-900 dark:text-white">{sku.code}</span>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{sku.name}</div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-xs font-bold text-red-600 dark:text-red-400 font-mono">
                      Khả dụng: {available} {uomName}
                    </div>
                    <div className="text-[10px] text-slate-400">Ngưỡng tối thiểu: {minStock} {uomName}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Warehouse Quick Distribution */}
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl border border-white/80 dark:border-white/10 p-5 shadow-sm space-y-3 liquid-specular">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <i className="fa-solid fa-warehouse text-blue-500 text-sm"></i>
              <h3 className="text-sm font-black text-slate-900 dark:text-white">Cân Đối 2 Kho Vật Lý MEVN</h3>
            </div>
            <button onClick={() => onNavigateTab('inventory')} className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-bold">
              Chi tiết kệ hàng →
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {(data.warehouses || []).map(wh => {
              const balances = (data.stockBalances || []).filter(sb => sb.warehouseId === wh.id);
              const phys = balances.reduce((s, b) => s + Number(b.quantityPhysical), 0);
              const resv = balances.reduce((s, b) => s + Number(b.quantityReserved), 0);
              const avail = Math.max(0, phys - resv);

              return (
                <div key={wh.id} className="p-3.5 bg-slate-50/70 dark:bg-slate-800/50 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 space-y-2 liquid-touch">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-900 dark:text-white">{wh.name}</span>
                    <span className="text-[10px] font-mono bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-1.5 py-0.5 rounded-lg">{wh.code}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5 text-center font-mono">
                    <div className="bg-white dark:bg-slate-900 p-1.5 rounded-xl border border-slate-200/60 dark:border-slate-700 text-[10px]">
                      <div className="text-slate-400">Vật lý</div>
                      <div className="font-bold text-slate-800 dark:text-slate-200">{phys}</div>
                    </div>
                    <div className="bg-indigo-50/60 dark:bg-indigo-950/40 p-1.5 rounded-xl border border-indigo-200/40 dark:border-indigo-800/40 text-[10px]">
                      <div className="text-indigo-600 dark:text-indigo-400">Giữ chỗ</div>
                      <div className="font-bold text-indigo-700 dark:text-indigo-300">{resv}</div>
                    </div>
                    <div className="bg-blue-50/60 dark:bg-blue-950/40 p-1.5 rounded-xl border border-blue-200/40 dark:border-blue-800/40 text-[10px]">
                      <div className="text-blue-600 dark:text-blue-400">Tự do</div>
                      <div className="font-bold text-blue-700 dark:text-blue-300">{avail}</div>
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
