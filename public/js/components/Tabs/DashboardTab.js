/**
 * Fact-Forcing Gate Details:
 * Importers/Callers: public/index.html, public/js/app.js
 * Affected API: window.WMS_COMPONENTS.DashboardTab
 * Data schemas: { orders, stockBalances, skus, warehouses, uoms }, currentUser, handlers, onNavigateTab, onSelectOrder
 * User's verbatim instruction: "giao diện quá hỗn loạn không biết ở trong có cái gì quá loạn và chữ thì nhiều và hỗn loạn hãy kiểm tra lại vè mấy cái huy chương hay icon tương tự đi phèn quá"
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
    <div className="space-y-4 animate-fade-in font-sans">
      {/* ==========================================
          TẦNG 1: EXECUTIVE KPI BAR (4 CHỈ SỐ CỐT LÕI)
          ========================================== */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* KPI 1: Đơn Hàng Đang Chạy */}
        <div
          onClick={() => onNavigateTab('orders')}
          className="liquid-glass p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-cyan-400/50 transition cursor-pointer group active:scale-98"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Đơn Hàng Đang Chạy</span>
            <div className="w-7 h-7 rounded-lg bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center text-xs group-hover:scale-110 transition">
              <i className="fa-solid fa-boxes-stacked"></i>
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1.5 font-display tracking-tight">
            {inProgressOrders}
            <span className="text-xs font-normal text-slate-400 dark:text-slate-500 ml-1.5 font-mono">/ {data.orders?.length || 0} tổng</span>
          </div>
          <div className="text-[11px] text-cyan-600 dark:text-cyan-400 mt-1 font-medium flex items-center gap-1">
            <i className="fa-solid fa-arrow-right text-[9px]"></i>
            <span>Xem tiến độ đơn</span>
          </div>
        </div>

        {/* KPI 2: Sẵn Sàng Xuất Kho */}
        <div
          onClick={() => onNavigateTab('dispatch')}
          className="liquid-glass p-3.5 sm:p-4 rounded-2xl border border-emerald-500/30 dark:border-emerald-500/20 shadow-xs hover:border-emerald-400/60 transition cursor-pointer group active:scale-98"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">Sẵn Sàng Xuất Kho</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xs group-hover:scale-110 transition">
              <i className="fa-solid fa-truck-ramp-box"></i>
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1.5 font-display tracking-tight">
            {readyOrders}
            <span className="text-xs font-normal text-emerald-600/70 dark:text-emerald-400/70 ml-1.5">đơn hàng</span>
          </div>
          <div className="text-[11px] text-emerald-600/80 dark:text-emerald-400/80 mt-1 font-medium flex items-center gap-1">
            <i className="fa-solid fa-check text-[9px]"></i>
            <span>Đã khóa đủ 100% BOM</span>
          </div>
        </div>

        {/* KPI 3: Thiếu Vật Tư Cần Mua (PO) */}
        <div
          onClick={() => onNavigateTab('pos')}
          className="liquid-glass p-3.5 sm:p-4 rounded-2xl border border-rose-500/30 dark:border-rose-500/20 shadow-xs hover:border-rose-400/60 transition cursor-pointer group active:scale-98"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-rose-700 dark:text-rose-300">Thiếu Vật Tư (PO)</span>
            <div className="w-7 h-7 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center text-xs group-hover:scale-110 transition">
              <i className="fa-solid fa-cart-shopping"></i>
            </div>
          </div>
          <div className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1.5 font-display tracking-tight">
            {pendingPoOrders}
            <span className="text-xs font-normal text-rose-600/70 dark:text-rose-400/70 ml-1.5">đơn thiếu</span>
          </div>
          <div className="text-[11px] text-rose-600/80 dark:text-rose-400/80 mt-1 font-medium flex items-center gap-1">
            <i className="fa-solid fa-triangle-exclamation text-[9px]"></i>
            <span>Cần tạo đơn đặt hàng</span>
          </div>
        </div>

        {/* KPI 4: Tồn Kho Khả Dụng */}
        <div
          onClick={() => onNavigateTab('inventory')}
          className="liquid-glass p-3.5 sm:p-4 rounded-2xl border border-cyan-500/30 dark:border-cyan-500/20 shadow-xs hover:border-cyan-400/60 transition cursor-pointer group active:scale-98"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-cyan-700 dark:text-cyan-300">Tồn Kho Khả Dụng</span>
            <div className="w-7 h-7 rounded-lg bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center text-xs group-hover:scale-110 transition">
              <i className="fa-solid fa-cubes"></i>
            </div>
          </div>
          <div className="text-2xl font-black text-cyan-600 dark:text-cyan-300 mt-1.5 font-mono tracking-tight">
            {formatNumber(totalAvailable)}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-medium flex items-center gap-1">
            <span>Khóa giữ chỗ:</span>
            <strong className="text-amber-600 dark:text-amber-400 font-mono">{formatNumber(totalReserved)}</strong>
          </div>
        </div>
      </div>

      {/* ==========================================
          TẦNG 2: MY ROLE ACTION QUEUE (TÁC VỤ 1 CHẠM)
          ========================================== */}
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

      {/* ==========================================
          TẦNG 3: CLEAN INDUSTRIAL DATA GRIDS
          ========================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Bảng 1: Cảnh Báo Tồn Kho Dưới Mức An Toàn */}
        <div className="liquid-glass rounded-2xl border border-slate-200/80 dark:border-slate-800 p-4 sm:p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-slate-800/80 pb-3">
            <div className="flex items-center gap-2">
              <i className="fa-solid fa-triangle-exclamation text-amber-500 text-xs"></i>
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white font-display">
                Cảnh Báo Tồn Kho Tối Thiểu
              </h3>
            </div>
            <span className="text-[11px] font-mono font-bold text-amber-700 dark:text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
              {lowStockSkus.length} mã cần bổ sung
            </span>
          </div>

          {lowStockSkus.length === 0 ? (
            <div className="py-6 text-center text-slate-400 dark:text-slate-500 text-xs font-medium">
              Toàn bộ vật tư hiện tại đều duy trì trên mức an toàn.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="text-slate-400 border-b border-slate-200/60 dark:border-slate-800/80 text-[10px] uppercase font-mono tracking-wider">
                    <th className="pb-2 font-bold">Mã SKU</th>
                    <th className="pb-2 font-bold">Tên Vật Tư</th>
                    <th className="pb-2 font-bold text-right">Khả Dụng</th>
                    <th className="pb-2 font-bold text-right">Min An Toàn</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {lowStockSkus.slice(0, 5).map(({ sku, available, minStock, uomName }) => (
                    <tr key={sku.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition">
                      <td className="py-2.5 font-mono font-bold text-cyan-600 dark:text-cyan-400">
                        {sku.code}
                      </td>
                      <td className="py-2.5 text-slate-800 dark:text-slate-200 font-medium max-w-[180px] truncate">
                        {sku.name}
                      </td>
                      <td className="py-2.5 text-right font-mono font-bold text-rose-600 dark:text-rose-400">
                        {available} <span className="text-[10px] font-normal text-slate-400">{uomName}</span>
                      </td>
                      <td className="py-2.5 text-right font-mono text-slate-500 dark:text-slate-400">
                        {minStock} <span className="text-[10px] font-normal text-slate-400">{uomName}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Bảng 2: Phân Bổ Tồn Kho Theo Kho Hàng */}
        <div className="liquid-glass rounded-2xl border border-slate-200/80 dark:border-slate-800 p-4 sm:p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-slate-800/80 pb-3">
            <div className="flex items-center gap-2">
              <i className="fa-solid fa-warehouse text-cyan-500 text-xs"></i>
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white font-display">
                Phân Bổ Tồn Kho Theo Kho Hàng
              </h3>
            </div>
            <button
              onClick={() => onNavigateTab('inventory')}
              className="text-[11px] font-bold text-cyan-600 dark:text-cyan-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Xem chi tiết kệ</span>
              <i className="fa-solid fa-arrow-right text-[9px]"></i>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {(data.warehouses || []).map(wh => {
              const balances = (data.stockBalances || []).filter(sb => sb.warehouseId === wh.id);
              const phys = balances.reduce((s, b) => s + Number(b.quantityPhysical), 0);
              const resv = balances.reduce((s, b) => s + Number(b.quantityReserved), 0);
              const avail = Math.max(0, phys - resv);

              return (
                <div
                  key={wh.id}
                  className="p-3 bg-white/60 dark:bg-slate-900/60 rounded-xl border border-slate-200/80 dark:border-slate-800 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-900 dark:text-white truncate">{wh.name}</span>
                    <span className="text-[10px] font-mono bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 px-1.5 py-0.5 rounded font-bold">
                      {wh.code}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-1 text-center font-mono">
                    <div className="bg-slate-100 dark:bg-slate-800/70 p-1.5 rounded-lg text-[10px]">
                      <div className="text-slate-400 text-[9px]">Vật lý</div>
                      <div className="font-bold text-slate-800 dark:text-slate-200">{formatNumber(phys)}</div>
                    </div>
                    <div className="bg-amber-50 dark:bg-amber-950/40 p-1.5 rounded-lg text-[10px] border border-amber-500/20">
                      <div className="text-amber-500 text-[9px]">Giữ chỗ</div>
                      <div className="font-bold text-amber-600 dark:text-amber-400">{formatNumber(resv)}</div>
                    </div>
                    <div className="bg-cyan-50 dark:bg-cyan-950/40 p-1.5 rounded-lg text-[10px] border border-cyan-500/20">
                      <div className="text-cyan-600 dark:text-cyan-400 text-[9px]">Khả dụng</div>
                      <div className="font-bold text-cyan-700 dark:text-cyan-300">{formatNumber(avail)}</div>
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
