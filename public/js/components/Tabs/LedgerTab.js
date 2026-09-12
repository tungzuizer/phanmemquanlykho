/*
1. Importers/Callers: public/index.html via <script type="text/babel" src="/js/components/Tabs/LedgerTab.js"></script>
2. Affected API: iOS 26 Liquid Glass Immutable Stock Movement Ledger Tab (window.WMS_COMPONENTS.LedgerTab).
3. Data schemas: Uses data.stockTransactions, data.skus, data.uoms, data.warehouses, data.bins, currentUser.
4. User's verbatim instruction: "cải thiện cả giao diện trên iphone và adroi và thiết kế theo phong cách Giao Diện Ios 26 Liquid Glass" / "theo khuyến nghị của bạn"
*/

function LedgerTab({ data, currentUser }) {
  const [filterType, setFilterType] = React.useState('ALL');
  const [searchQuery, setSearchQuery] = React.useState('');
  const { formatNumber, formatDateTime } = window.WMS_CONSTANTS || { formatNumber: n => n, formatDateTime: d => d };
  if (!data) return null;

  const transactions = data.stockTransactions || [];
  const skus = data.skus || [];
  const warehouses = data.warehouses || [];
  const bins = data.bins || [];

  const filteredTxns = transactions.filter(t => {
    const matchType = filterType === 'ALL' || t.type === filterType;
    const sku = skus.find(s => s.id === t.skuId);
    const matchQ = !searchQuery ||
      (t.referenceDocCode || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (sku?.code || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (sku?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.performedByName || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchType && matchQ;
  });

  return (
    <div className="space-y-5 animate-fade-in select-none">
      {/* Top Banner */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-4 sm:p-5 rounded-3xl border border-white/80 dark:border-white/10 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 liquid-specular">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-1">
            <i className="fa-solid fa-shield-halved"></i>
            <span>ISO 9001:2015 Audit Trail</span>
          </div>
          <h2 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
            Sổ Cái Biến Động Kho Bất Biến (Immutable Stock Movement Ledger)
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
            Nhật ký kiểm toán ghi nhận mọi biến động xuất nhập tồn, khoá giữ chỗ đơn hàng và thu hồi phế phẩm — Dữ liệu chỉ ghi nối (Append-Only), không thể chỉnh sửa hay xoá lùi ngày.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3.5 py-2 rounded-2xl bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 font-bold text-xs border border-emerald-200 dark:border-emerald-800 flex items-center gap-1.5 shadow-xs">
            <i className="fa-solid fa-circle-check text-emerald-500"></i>
            Hồ sơ kiểm toán toàn vẹn (ACID)
          </span>
        </div>
      </div>

      {/* Filter Chips & Search Bar */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl border border-white/80 dark:border-white/10 p-4 sm:p-5 shadow-sm space-y-4 liquid-specular">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-2 overflow-x-auto pb-1.5 no-scrollbar">
            {[
              { id: 'ALL', label: 'Tất Cả' },
              { id: 'RECEIPT', label: 'Nhập (GRN)', icon: 'fa-truck-ramp-box' },
              { id: 'DISPATCH', label: 'Xuất (GDN)', icon: 'fa-truck-fast' },
              { id: 'RESERVATION_HOLD', label: 'Khóa (BOM)', icon: 'fa-lock' },
              { id: 'RETURN_IN', label: 'Nhập Trả', icon: 'fa-arrow-rotate-left' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setFilterType(tab.id)}
                className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap liquid-touch ${
                  filterType === tab.id
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                    : 'bg-slate-100/80 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-200/80 dark:hover:bg-slate-700/80'
                }`}
              >
                {tab.icon && <i className={`fa-solid ${tab.icon}`}></i>}
                {tab.label}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-72">
            <i className="fa-solid fa-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Tìm theo Mã CT, SKU, Người lập..."
              className="w-full pl-9 pr-4 py-2 bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 rounded-2xl text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
          </div>
        </div>

        {/* Mobile Adaptive Cards (Visible on Mobile < 768px) */}
        <div className="md:hidden space-y-3">
          {filteredTxns.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-xs font-bold">
              Không có giao dịch nào phù hợp với bộ lọc.
            </div>
          ) : (
            filteredTxns.map(t => {
              const sku = skus.find(s => s.id === t.skuId);
              const uom = (data.uoms || []).find(u => u.id === sku?.baseUomId);
              const wh = warehouses.find(w => w.id === t.warehouseId);
              const bin = bins.find(bn => bn.id === t.binId);

              const isPositive = t.type === 'RECEIPT' || t.type === 'RETURN_IN';
              const isNegative = t.type === 'DISPATCH';

              return (
                <div
                  key={t.id}
                  className="p-3.5 rounded-2xl bg-white/70 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700/80 shadow-xs space-y-2 liquid-touch"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-xs text-blue-600 dark:text-blue-400">
                      {t.referenceDocCode || 'AUTO-SYSTEM'}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      t.type === 'RECEIPT'
                        ? 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300'
                        : t.type === 'DISPATCH'
                        ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                        : t.type === 'RESERVATION_HOLD'
                        ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300'
                        : 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                    }`}>
                      {t.type}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-xs font-bold text-slate-900 dark:text-white">
                      <span className="font-mono text-blue-600 dark:text-blue-400 mr-1.5">{sku?.code}</span>
                      <span>{sku?.name}</span>
                    </div>
                    <div className="font-mono font-black text-xs">
                      <span className={
                        isPositive ? 'text-emerald-600 dark:text-emerald-400' :
                        isNegative ? 'text-red-600 dark:text-red-400' :
                        'text-indigo-600 dark:text-indigo-400'
                      }>
                        {isPositive ? `+${formatNumber(t.quantity)}` : isNegative ? `-${formatNumber(t.quantity)}` : `${formatNumber(t.quantity)} (HOLD)`}
                      </span>
                      <span className="text-[10px] text-slate-400 font-normal ml-1">{uom?.name}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1.5 border-t border-slate-100 dark:border-slate-800">
                    <span>{wh?.code?.slice(0, 8)} / <strong className="font-mono text-slate-600 dark:text-slate-300">{bin?.code || 'Kệ chính'}</strong></span>
                    <span>{formatDateTime(t.timestamp || t.createdAt)}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Desktop Transactions Table (Visible on Desktop >= 768px) */}
        <div className="hidden md:block border border-slate-200/80 dark:border-slate-800 rounded-2xl overflow-x-auto shadow-xs">
          <table className="w-full text-left text-xs border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-slate-50/80 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 border-b border-slate-200/80 dark:border-slate-700/80 font-bold">
                <th className="py-2.5 px-3.5">Thời Gian</th>
                <th className="py-2.5 px-3.5">Chứng Từ Tham Chiếu</th>
                <th className="py-2.5 px-3.5">Loại Nghiệp Vụ</th>
                <th className="py-2.5 px-3.5">Mã SKU & Tên Vật Tư</th>
                <th className="py-2.5 px-3.5">Kho & Vị Trí Kệ</th>
                <th className="py-2.5 px-3 text-right">Biến Động</th>
                <th className="py-2.5 px-3.5">Người Thực Hiện</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredTxns.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-slate-400">
                    Không có giao dịch nào phù hợp với bộ lọc.
                  </td>
                </tr>
              ) : (
                filteredTxns.map(t => {
                  const sku = skus.find(s => s.id === t.skuId);
                  const uom = (data.uoms || []).find(u => u.id === sku?.baseUomId);
                  const wh = warehouses.find(w => w.id === t.warehouseId);
                  const bin = bins.find(bn => bn.id === t.binId);

                  const isPositive = t.type === 'RECEIPT' || t.type === 'RETURN_IN';
                  const isNegative = t.type === 'DISPATCH';

                  return (
                    <tr key={t.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition">
                      <td className="py-2.5 px-3.5 font-mono text-slate-500 text-[11px] whitespace-nowrap">
                        {formatDateTime(t.timestamp || t.createdAt)}
                      </td>
                      <td className="py-2.5 px-3.5 font-mono font-bold text-blue-600 dark:text-blue-400">
                        {t.referenceDocCode || 'AUTO-SYSTEM'}
                      </td>
                      <td className="py-2.5 px-3.5">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          t.type === 'RECEIPT'
                            ? 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300'
                            : t.type === 'DISPATCH'
                            ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                            : t.type === 'RESERVATION_HOLD'
                            ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300'
                            : 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                        }`}>
                          {t.type}
                        </span>
                      </td>
                      <td className="py-2.5 px-3.5">
                        <span className="font-mono font-bold text-slate-900 dark:text-white mr-1.5">{sku?.code}</span>
                        <span className="text-slate-600 dark:text-slate-300 truncate">{sku?.name}</span>
                      </td>
                      <td className="py-2.5 px-3.5 text-[11px]">
                        <span className="text-slate-700 dark:text-slate-300">{wh?.code?.slice(0, 8)}</span>
                        <span className="text-slate-400 mx-1">/</span>
                        <span className="font-mono text-blue-600 dark:text-blue-400">{bin?.code || 'Kệ chính'}</span>
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold whitespace-nowrap">
                        <span className={
                          isPositive ? 'text-emerald-600 dark:text-emerald-400' :
                          isNegative ? 'text-red-600 dark:text-red-400' :
                          'text-indigo-600 dark:text-indigo-400'
                        }>
                          {isPositive ? `+${formatNumber(t.quantity)}` : isNegative ? `-${formatNumber(t.quantity)}` : `${formatNumber(t.quantity)} (HOLD)`}
                        </span>
                        <span className="text-[10px] text-slate-400 font-normal ml-1">{uom?.name}</span>
                      </td>
                      <td className="py-2.5 px-3.5 text-slate-600 dark:text-slate-300 text-[11px] whitespace-nowrap">
                        {t.performedByName || 'Hệ thống'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

window.WMS_COMPONENTS = window.WMS_COMPONENTS || {};
window.WMS_COMPONENTS.LedgerTab = LedgerTab;
