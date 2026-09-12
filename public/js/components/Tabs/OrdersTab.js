/*
1. Importers/Callers: public/index.html via <script type="text/babel" src="/js/components/Tabs/OrdersTab.js"></script>
2. Affected API: iOS 26 Liquid Glass Order Lifecycle & Pipeline Management Tab (window.WMS_COMPONENTS.OrdersTab).
3. Data schemas: Uses data.orders, data.boms, data.stockBalances, data.skus, data.uoms, currentUser.
4. User's verbatim instruction: "cải thiện cả giao diện trên iphone và adroi và thiết kế theo phong cách Giao Diện Ios 26 Liquid Glass" / "theo khuyến nghị của bạn"
*/

function OrdersTab({ data, currentUser, handlers, onSelectOrder, onOpenPrintPreview }) {
  const [filterStatus, setFilterStatus] = React.useState('ALL');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [viewMode, setViewMode] = React.useState('grid'); // 'grid' | 'table'
  const { STATUS_MAP, formatMoney, formatNumber, formatDate } = window.WMS_CONSTANTS || {
    STATUS_MAP: {},
    formatMoney: n => n,
    formatNumber: n => n,
    formatDate: d => d
  };

  if (!data) return null;

  const orders = data.orders || [];

  // Filter logic
  const filteredOrders = orders.filter(order => {
    const matchStatus = filterStatus === 'ALL' || order.status === filterStatus;
    const matchQuery = !searchQuery ||
      order.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchStatus && matchQuery;
  });

  // Calculate allocation for an order
  const getOrderAllocation = (orderId) => {
    const orderBoms = (data.boms || []).filter(b => b.orderId === orderId);
    const latestBom = orderBoms[orderBoms.length - 1];
    if (!latestBom || !latestBom.items || latestBom.items.length === 0) return { percent: 0, reserved: 0, required: 0, hasBom: false };
    const required = latestBom.items.reduce((s, it) => s + Number(it.quantityRequired), 0);
    const reserved = latestBom.items.reduce((s, it) => s + Number(it.quantityReserved || 0), 0);
    const percent = required > 0 ? Math.min(100, Math.round((reserved / required) * 100)) : 0;
    return { percent, reserved, required, hasBom: true, bomStatus: latestBom.status, bomId: latestBom.id };
  };

  const statusFilters = [
    { id: 'ALL', label: 'Tất Cả', count: orders.length },
    { id: 'CHO_BOM', label: 'Chờ BOM', count: orders.filter(o => o.status === 'CHO_BOM' || o.status === 'MOI_NHAN').length },
    { id: 'DANG_DOI_CHIEU_TON', label: 'Đối Chiếu', count: orders.filter(o => o.status === 'DANG_DOI_CHIEU_TON').length },
    { id: 'CHO_MUA', label: 'Thiếu PO', count: orders.filter(o => o.status === 'CHO_MUA').length },
    { id: 'SAN_SANG_XUAT', label: 'Sẵn Sàng Xuất', count: orders.filter(o => o.status === 'SAN_SANG_XUAT').length },
    { id: 'HOAN_TAT', label: 'Hoàn Tất', count: orders.filter(o => o.status === 'HOAN_TAT' || o.status === 'DA_XUAT_MOT_PHAN').length }
  ];

  return (
    <div className="space-y-5 animate-fade-in select-none">
      {/* Top Controls Bar */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-4 sm:p-5 rounded-3xl border border-white/80 dark:border-white/10 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 liquid-specular">
        {/* Search */}
        <div className="flex-1 relative">
          <i className="fa-solid fa-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Tìm theo Mã đơn, Dự án tủ điện, Khách hàng..."
            className="w-full pl-9 pr-4 py-2.5 bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 rounded-2xl text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          />
        </div>

        {/* View Switcher & Create Action */}
        <div className="flex items-center gap-2.5 justify-between sm:justify-end">
          <div className="flex items-center bg-slate-100/80 dark:bg-slate-800/80 p-1 rounded-2xl border border-slate-200/80 dark:border-slate-700/80">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition liquid-touch ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <i className="fa-solid fa-grip mr-1"></i> Thẻ
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition liquid-touch ${
                viewMode === 'table'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <i className="fa-solid fa-list mr-1"></i> Bảng
            </button>
          </div>

          <button
            onClick={() => handlers.onOpenOrderModal()}
            className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs rounded-2xl shadow-lg shadow-blue-500/25 flex items-center gap-2 transition liquid-touch whitespace-nowrap"
          >
            <i className="fa-solid fa-plus"></i> Tạo Đơn Hàng
          </button>
        </div>
      </div>

      {/* Filter Chips Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1.5 no-scrollbar">
        {statusFilters.map(chip => (
          <button
            key={chip.id}
            onClick={() => setFilterStatus(chip.id)}
            className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap liquid-touch ${
              filterStatus === chip.id
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                : 'bg-white/80 dark:bg-slate-900/80 backdrop-blur-md text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-white/80 dark:border-white/10'
            }`}
          >
            <span>{chip.label}</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                filterStatus === chip.id
                  ? 'bg-white/20 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
              }`}
            >
              {chip.count}
            </span>
          </button>
        ))}
      </div>

      {/* Empty State */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl border border-white/80 dark:border-white/10 p-12 text-center text-slate-400 liquid-specular">
          <i className="fa-solid fa-folder-open text-4xl mb-3 text-slate-300 dark:text-slate-600"></i>
          <p className="text-xs font-bold">Không tìm thấy đơn hàng nào khớp với điều kiện lọc.</p>
        </div>
      ) : viewMode === 'grid' ? (
        /* GRID VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredOrders.map(order => {
            const statusInfo = STATUS_MAP[order.status] || { label: order.status, step: 1, color: 'bg-slate-100 text-slate-700' };
            const alloc = getOrderAllocation(order.id);

            return (
              <div
                key={order.id}
                className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl border border-white/80 dark:border-white/10 shadow-xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group cursor-pointer liquid-specular liquid-touch"
                onClick={() => onSelectOrder(order)}
              >
                {/* Card Top */}
                <div className="p-4 sm:p-5 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-black text-xs bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 px-2 py-0.5 rounded-lg border border-slate-200/80 dark:border-slate-700">
                        {order.code}
                      </span>
                      <span className={`text-[10px] px-2.5 py-0.5 rounded-full border font-bold ${statusInfo.color}`}>
                        {statusInfo.label}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400 font-mono">
                      Hạn: {formatDate(order.targetDeliveryDate)}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition leading-snug">
                      {order.title}
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      Khách hàng: <strong className="text-slate-700 dark:text-slate-300">{order.customerName}</strong>
                    </p>
                  </div>

                  {/* 9-Step Mini Stepper */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <span>Tiến độ sản xuất:</span>
                      <span className="font-mono font-bold text-blue-600 dark:text-blue-400">Bước {statusInfo.step}/9</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden flex">
                      {Array.from({ length: 9 }).map((_, i) => (
                        <div
                          key={i}
                          className={`flex-1 h-full border-r border-white/40 dark:border-slate-900 ${
                            i < statusInfo.step ? 'bg-blue-600' : 'bg-transparent'
                          }`}
                        ></div>
                      ))}
                    </div>
                  </div>

                  {/* Allocation Status Bar */}
                  <div className="p-3 bg-slate-50/80 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-1.5">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-500 dark:text-slate-400 font-semibold flex items-center gap-1">
                        <i className="fa-solid fa-lock text-[10px] text-indigo-500"></i> Giữ chỗ BOM:
                      </span>
                      <span className="font-mono font-bold text-xs text-slate-800 dark:text-slate-200">
                        {alloc.percent}% ({alloc.reserved}/{alloc.required})
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all ${alloc.percent === 100 ? 'bg-emerald-500' : 'bg-blue-600'}`}
                        style={{ width: `${alloc.percent}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* Card Actions Footer */}
                <div
                  className="px-4 sm:px-5 py-3 bg-slate-50/70 dark:bg-slate-800/60 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2"
                  onClick={e => e.stopPropagation()}
                >
                  <button
                    onClick={() => onSelectOrder(order)}
                    className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                  >
                    Xem chi tiết <i className="fa-solid fa-chevron-right text-[9px]"></i>
                  </button>

                  <div className="flex items-center gap-1.5 flex-wrap">
                    {!alloc.hasBom && (
                      <button
                        onClick={() => handlers.onOpenBomModal(order)}
                        className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white font-bold text-[11px] rounded-xl shadow-xs liquid-touch"
                      >
                        Nạp BOM
                      </button>
                    )}
                    {alloc.bomStatus === 'SUBMITTED' && (
                      <button
                        onClick={() => handlers.onVerifyBom(alloc.bomId)}
                        className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[11px] rounded-xl shadow-xs liquid-touch"
                      >
                        Khóa giữ chỗ
                      </button>
                    )}
                    {order.status === 'CHO_MUA' && (
                      <button
                        onClick={() => handlers.onOpenPoModal(order)}
                        className="px-3 py-1 bg-red-600 hover:bg-red-500 text-white font-bold text-[11px] rounded-xl shadow-xs liquid-touch"
                      >
                        Lập PO bù
                      </button>
                    )}
                    {order.status === 'SAN_SANG_XUAT' && (
                      <button
                        onClick={() => handlers.onOpenPickupModal(order)}
                        className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] rounded-xl shadow-xs liquid-touch"
                      >
                        Đăng ký ca
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* TABLE VIEW (Responsive with Adaptive Cards on mobile) */
        <div className="space-y-3">
          {/* Mobile Table Alternate View */}
          <div className="md:hidden space-y-3">
            {filteredOrders.map(order => {
              const statusInfo = STATUS_MAP[order.status] || { label: order.status, step: 1, color: 'bg-slate-100 text-slate-700' };
              const alloc = getOrderAllocation(order.id);

              return (
                <div
                  key={order.id}
                  onClick={() => onSelectOrder(order)}
                  className="p-4 rounded-2xl bg-white/70 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700/80 shadow-xs space-y-3 liquid-touch"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-black text-xs bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-lg border border-slate-200 dark:border-slate-700">
                      {order.code}
                    </span>
                    <span className={`text-[10px] px-2.5 py-0.5 rounded-full border font-bold ${statusInfo.color}`}>
                      {statusInfo.label} ({statusInfo.step}/9)
                    </span>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white">{order.title}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">{order.customerName}</div>
                  </div>
                  <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-slate-400">Hạn: {formatDate(order.targetDeliveryDate)}</span>
                    <span className="font-mono font-bold text-blue-600 dark:text-blue-400">BOM: {alloc.percent}%</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl border border-white/80 dark:border-white/10 overflow-hidden shadow-xs liquid-specular">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/80 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 border-b border-slate-200/80 dark:border-slate-700/80 font-bold">
                  <th className="py-3.5 px-4">Mã Đơn</th>
                  <th className="py-3.5 px-4">Dự Án / Khách Hàng</th>
                  <th className="py-3.5 px-3 text-center">Trạng Thái (Bước)</th>
                  <th className="py-3.5 px-3">Tiến Độ Giữ Chỗ</th>
                  <th className="py-3.5 px-3">Hạn Giao</th>
                  <th className="py-3.5 px-4 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredOrders.map(order => {
                  const statusInfo = STATUS_MAP[order.status] || { label: order.status, step: 1, color: 'bg-slate-100 text-slate-700' };
                  const alloc = getOrderAllocation(order.id);

                  return (
                    <tr
                      key={order.id}
                      onClick={() => onSelectOrder(order)}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/60 cursor-pointer transition"
                    >
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-white">
                        {order.code}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-800 dark:text-slate-100">{order.title}</div>
                        <div className="text-[11px] text-slate-400">{order.customerName}</div>
                      </td>
                      <td className="py-3.5 px-3 text-center">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${statusInfo.color}`}>
                          {statusInfo.label} ({statusInfo.step}/9)
                        </span>
                      </td>
                      <td className="py-3.5 px-3">
                        <div className="w-28 space-y-1">
                          <div className="flex justify-between text-[10px] font-mono">
                            <span>{alloc.percent}%</span>
                            <span className="text-slate-400">{alloc.reserved}/{alloc.required}</span>
                          </div>
                          <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${alloc.percent === 100 ? 'bg-emerald-500' : 'bg-blue-600'}`}
                              style={{ width: `${alloc.percent}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-3 font-mono text-slate-500">
                        {formatDate(order.targetDeliveryDate)}
                      </td>
                      <td className="py-3.5 px-4 text-right" onClick={e => e.stopPropagation()}>
                        <button
                          onClick={() => onSelectOrder(order)}
                          className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold liquid-touch"
                        >
                          Chi tiết
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

window.WMS_COMPONENTS = window.WMS_COMPONENTS || {};
window.WMS_COMPONENTS.OrdersTab = OrdersTab;
