/**
 * Fact-Forcing Gate Details:
 * 1. Importers/Callers: public/index.html via <script type="text/babel" src="/js/components/Tabs/DashboardTab.js?v=2026.09.13"></script>
 * 2. Affected API: window.WMS_COMPONENTS.DashboardTab (Action-Direct & Zero-Fluff Executive Overview)
 * 3. Data schemas: data ({ orders, stockBalances, skus, warehouses, uoms }), currentUser, handlers, onNavigateTab, onSelectOrder
 * 4. User's verbatim instruction: "tối ưu hóa toàn bộ chữ khôgn viết dài dòng lan man hãy tập chung vào các ý chính và hãy tôn trong người dùng thiết không dùng icon quê mùa và đặc biệt không dùng phông nền màu đen hoặc trắng hãy mix nhiều màu lại và mang phong cách sáng sủa nhìn vào không biết trang web là ai làm"
 */

function DashboardTab({ data, currentUser, handlers, onNavigateTab, onSelectOrder }) {
  const { formatMoney, formatNumber } = window.WMS_CONSTANTS || { formatMoney: n => n, formatNumber: n => n };
  const { ActionInbox } = window.WMS_COMPONENTS || {};

  if (!data) return null;

  // Metric Computations
  const totalPhysical = (data.stockBalances || []).reduce((sum, sb) => sum + Number(sb.quantityPhysical), 0);
  const totalReserved = (data.stockBalances || []).reduce((sum, sb) => sum + Number(sb.quantityReserved), 0);
  const totalAvailable = Math.max(0, totalPhysical - totalReserved);
  const readyOrders = (data.orders || []).filter(o => o.status === 'SAN_SANG_XUAT').length;
  const pendingPoOrders = (data.orders || []).filter(o => o.status === 'CHO_MUA').length;
  const inProgressOrders = (data.orders || []).filter(o => o.status !== 'HOAN_TAT').length;

  // Low Stock Safety Filter
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
    <div className="space-y-4 sm:space-y-5 animate-fade-in font-sans">
      {/* 1. Header Hero Banner: Action-Direct & Crisp */}
      <div className="rounded-3xl p-6 sm:p-7 text-white shadow-xl relative overflow-hidden bg-gradient-to-r from-indigo-900/90 via-purple-900/85 to-slate-900 border border-white/20 backdrop-blur-2xl">
        {/* Soft Ambient Light Spot */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-400/20 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-cyan-300 mb-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Tổng quan vận hành kho & sản xuất</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight font-display text-white">
              Xin chào, {currentUser?.fullName || 'Quý khách'}!
            </h1>
            <p className="text-xs text-indigo-100/80 mt-1 max-w-xl">
              Hệ thống đang điều phối <strong className="text-white font-bold">{inProgressOrders} đơn hàng</strong> đang chạy. Vật tư được tự động giữ chỗ theo đúng định mức BOM.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={() => handlers.onOpenOrderModal()}
              className="px-4 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-500/25 flex items-center gap-2 transition active:scale-95 cursor-pointer"
            >
              <i className="fa-solid fa-plus text-xs"></i>
              <span>Tạo Đơn Hàng</span>
            </button>
            <button
              onClick={() => onNavigateTab('kpi')}
              className="px-3.5 py-2.5 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs rounded-xl border border-white/20 flex items-center gap-1.5 transition active:scale-95 backdrop-blur-md cursor-pointer"
            >
              <i className="fa-solid fa-chart-pie text-cyan-300"></i>
              <span>Chỉ Số Vận Hành</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Top 5 Key Metric Cards (Vibrant Glow Badges) */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 sm:gap-3.5">
        {/* Orders Card */}
        <div
          onClick={() => onNavigateTab('orders')}
          className="liquid-glass p-4 rounded-2xl border border-white/40 dark:border-white/10 shadow-sm hover:shadow-md transition cursor-pointer group active:scale-95"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Đơn Hàng</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-xs group-hover:scale-110 transition">
              <i className="fa-solid fa-folder-open"></i>
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-2 font-display">
            {data.orders?.length || 0}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-medium">
            <span className="text-indigo-600 dark:text-indigo-400 font-bold">{inProgressOrders} đơn</span> đang sản xuất
          </div>
        </div>

        {/* Ready Orders Card */}
        <div
          onClick={() => onNavigateTab('dispatch')}
          className="liquid-glass p-4 rounded-2xl border border-emerald-500/30 dark:border-emerald-500/20 shadow-sm hover:shadow-md transition cursor-pointer group active:scale-95"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">Sẵn Sàng Xuất</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xs group-hover:scale-110 transition">
              <i className="fa-solid fa-circle-check"></i>
            </div>
          </div>
          <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-2 font-display">
            {readyOrders}
          </div>
          <div className="text-[11px] text-emerald-600/80 dark:text-emerald-400/80 mt-1 font-medium">
            Đã đủ 100% BOM
          </div>
        </div>

        {/* PO Shortage Card */}
        <div
          onClick={() => onNavigateTab('pos')}
          className="liquid-glass p-4 rounded-2xl border border-rose-500/30 dark:border-rose-500/20 shadow-sm hover:shadow-md transition cursor-pointer group active:scale-95"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-rose-600 dark:text-rose-400">Thiếu Vật Tư</span>
            <div className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center text-xs group-hover:scale-110 transition">
              <i className="fa-solid fa-triangle-exclamation"></i>
            </div>
          </div>
          <div className="text-2xl font-extrabold text-rose-600 dark:text-rose-400 mt-2 font-display">
            {pendingPoOrders}
          </div>
          <div className="text-[11px] text-rose-600/80 dark:text-rose-400/80 mt-1 font-medium">
            Cần mua bổ sung
          </div>
        </div>

        {/* Reserved Stock Card */}
        <div
          onClick={() => onNavigateTab('inventory')}
          className="liquid-glass p-4 rounded-2xl border border-purple-500/30 dark:border-purple-500/20 shadow-sm hover:shadow-md transition cursor-pointer group active:scale-95"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-purple-600 dark:text-purple-400">Đã Giữ Chỗ</span>
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center text-xs group-hover:scale-110 transition">
              <i className="fa-solid fa-lock"></i>
            </div>
          </div>
          <div className="text-2xl font-extrabold text-purple-600 dark:text-purple-300 mt-2 font-mono">
            {formatNumber(totalReserved)}
          </div>
          <div className="text-[11px] text-purple-600/80 dark:text-purple-400/80 mt-1 font-medium">
            Khóa theo tiến độ đơn
          </div>
        </div>

        {/* Available Stock Card */}
        <div
          onClick={() => onNavigateTab('inventory')}
          className="col-span-2 md:col-span-1 liquid-glass p-4 rounded-2xl border border-cyan-500/30 dark:border-cyan-500/20 shadow-sm hover:shadow-md transition cursor-pointer group active:scale-95"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-cyan-600 dark:text-cyan-400">Khả Dụng</span>
            <div className="w-8 h-8 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center text-xs group-hover:scale-110 transition">
              <i className="fa-solid fa-box-open"></i>
            </div>
          </div>
          <div className="text-2xl font-extrabold text-cyan-600 dark:text-cyan-300 mt-2 font-mono">
            {formatNumber(totalAvailable)}
          </div>
          <div className="text-[11px] text-cyan-600/80 dark:text-cyan-400/80 mt-1 font-medium">
            Tồn tự do có thể cấp
          </div>
        </div>
      </div>

      {/* 3. Action Required Inbox */}
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

      {/* 4. Bottom Row: Safety Stock & Warehouse Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
        {/* Safety Stock Alert */}
        <div className="liquid-glass rounded-2xl border border-white/40 dark:border-white/10 p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <i className="fa-solid fa-shield-exclamation text-amber-500 text-sm"></i>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white font-display">Cảnh Báo Tồn Kho Tối Thiểu</h2>
            </div>
            <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
              {lowStockSkus.length} Mã Dưới Mức An Toàn
            </span>
          </div>

          {lowStockSkus.length === 0 ? (
            <p className="text-xs text-slate-500 dark:text-slate-400 py-6 text-center">
              Toàn bộ danh mục vật tư đều đang duy trì trên mức an toàn.
            </p>
          ) : (
            <div className="space-y-2">
              {lowStockSkus.slice(0, 4).map(({ sku, available, minStock, uomName }) => (
                <div key={sku.id} className="p-3 bg-white/40 dark:bg-slate-900/40 rounded-xl border border-slate-200/60 dark:border-slate-800 flex items-center justify-between">
                  <div className="min-w-0 flex-1 pr-2">
                    <span className="font-mono font-bold text-xs text-indigo-600 dark:text-indigo-400">{sku.code}</span>
                    <div className="text-xs text-slate-800 dark:text-slate-200 font-medium truncate">{sku.name}</div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-xs font-bold text-rose-600 dark:text-rose-400 font-mono">
                      Khả dụng: {available} {uomName}
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono">Mức an toàn: {minStock} {uomName}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Warehouse Balances Overview */}
        <div className="liquid-glass rounded-2xl border border-white/40 dark:border-white/10 p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <i className="fa-solid fa-warehouse text-indigo-500 text-sm"></i>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white font-display">Phân Bổ Các Kho Hàng</h2>
            </div>
            <button onClick={() => onNavigateTab('inventory')} className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-semibold">
              Chi tiết tồn kho →
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {(data.warehouses || []).map(wh => {
              const balances = (data.stockBalances || []).filter(sb => sb.warehouseId === wh.id);
              const phys = balances.reduce((s, b) => s + Number(b.quantityPhysical), 0);
              const resv = balances.reduce((s, b) => s + Number(b.quantityReserved), 0);
              const avail = Math.max(0, phys - resv);

              return (
                <div key={wh.id} className="p-3 bg-white/40 dark:bg-slate-900/40 rounded-xl border border-slate-200/60 dark:border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-900 dark:text-white truncate">{wh.name}</span>
                    <span className="text-[10px] font-mono bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 px-1.5 py-0.5 rounded font-bold">{wh.code}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1 text-center font-mono">
                    <div className="bg-white/60 dark:bg-slate-800/60 p-1.5 rounded-lg border border-slate-200/50 dark:border-slate-700/50 text-[10px]">
                      <div className="text-slate-400 text-[9px]">Vật lý</div>
                      <div className="font-bold text-slate-800 dark:text-slate-200">{phys}</div>
                    </div>
                    <div className="bg-purple-50/10 p-1.5 rounded-lg border border-purple-500/20 text-[10px]">
                      <div className="text-purple-500 text-[9px]">Giữ chỗ</div>
                      <div className="font-bold text-purple-600 dark:text-purple-400">{resv}</div>
                    </div>
                    <div className="bg-cyan-50/10 p-1.5 rounded-lg border border-cyan-500/20 text-[10px]">
                      <div className="text-cyan-500 text-[9px]">Khả dụng</div>
                      <div className="font-bold text-cyan-600 dark:text-cyan-400">{avail}</div>
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
