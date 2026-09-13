/**
 * Fact-Forcing Gate Details:
 * Importers/Callers: public/index.html, public/js/app.js
 * Affected API: window.WMS_COMPONENTS.LedgerTab
 * Data schemas: { stockTransactions, skus, uoms, warehouses, bins }, currentUser
 * User's verbatim instruction: "giao diện quá hỗn loạn không biết ở trong có cái gì quá loạn và chữ thì nhiều và hỗn loạn hãy kiểm tra lại vè mấy cái huy chương hay icon tương tự đi phèn quá"
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
    <div className="space-y-4 sm:space-y-5 animate-fade-in font-sans">
      {/* Top Header Card */}
      <div className="liquid-glass p-4 sm:p-5 rounded-2xl border border-white/40 dark:border-white/10 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3.5">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-wider mb-1 font-display">
            <i className="fa-solid fa-shield-halved"></i>
            <span>Nhật Ký Kiểm Toán Kho Bất Biến (ISO 9001:2015)</span>
          </div>
          <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white font-display">
            Sổ Cái Biến Động Kho (Stock Movement Ledger)
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 max-w-2xl">
            Ghi nhận mọi giao dịch nhập xuất, khóa giữ chỗ BOM và thu hồi phế phẩm. Dữ liệu chỉ ghi nối (Append-Only), không cho phép sửa đổi hay lùi ngày.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3.5 py-2 rounded-xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-bold text-xs border border-emerald-500/20 flex items-center gap-1.5 shadow-xs font-mono">
            <i className="fa-solid fa-circle-check text-emerald-500"></i>
            Hồ sơ kiểm toán ACID
          </span>
        </div>
      </div>

      {/* Filter Chips & Search Bar */}
      <div className="liquid-glass rounded-2xl border border-white/40 dark:border-white/10 p-4 sm:p-5 shadow-xs space-y-4">
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
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer active:scale-95 ${
                  filterType === tab.id
                    ? 'bg-slate-900 text-white dark:bg-cyan-500 dark:text-slate-950 shadow-xs'
                    : 'liquid-glass text-slate-600 dark:text-slate-300 hover:bg-white/90 dark:hover:bg-slate-800/90'
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
              className="w-full pl-9 pr-4 py-2 bg-white/60 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-700/80 rounded-xl text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
            />
          </div>
        </div>

        {/* Mobile Adaptive Cards */}
        <div className="md:hidden space-y-2.5">
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
                  className="p-3.5 rounded-xl bg-white/50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800 shadow-xs space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-xs text-cyan-600 dark:text-cyan-400">
                      {t.referenceDocCode || 'AUTO-SYSTEM'}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      t.type === 'RECEIPT'
                        ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20'
                        : t.type === 'DISPATCH'
                        ? 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border border-rose-500/20'
                        : t.type === 'RESERVATION_HOLD'
                        ? 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20'
                        : 'bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border border-cyan-500/20'
                    }`}>
                      {t.type}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-xs font-bold text-slate-900 dark:text-white">
                      <span className="font-mono text-cyan-600 dark:text-cyan-400 mr-1.5">{sku?.code}</span>
                      <span>{sku?.name}</span>
                    </div>
                    <div className="font-mono font-bold text-xs">
                      <span className={
                        isPositive ? 'text-emerald-600 dark:text-emerald-400' :
                        isNegative ? 'text-rose-600 dark:text-rose-400' :
                        'text-amber-600 dark:text-amber-400'
                      }>
                        {isPositive ? `+${formatNumber(t.quantity)}` : isNegative ? `-${formatNumber(t.quantity)}` : `${formatNumber(t.quantity)} (HOLD)`}
                      </span>
                      <span className="text-[10px] text-slate-400 font-normal ml-1">{uom?.name}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1.5 border-t border-slate-200/60 dark:border-slate-800">
                    <span>{wh?.code?.slice(0, 8)} / <strong className="font-mono text-slate-600 dark:text-slate-300">{bin?.code || 'Kệ chính'}</strong></span>
                    <span className="font-mono">{formatDateTime(t.timestamp || t.createdAt)}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Desktop Transactions Table */}
        <div className="hidden md:block border border-slate-200/60 dark:border-slate-800 rounded-xl overflow-x-auto shadow-xs">
          <table className="w-full text-left text-xs border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-white/40 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 border-b border-slate-200/60 dark:border-slate-800 font-bold">
                <th className="py-2.5 px-3.5">Thời Gian</th>
                <th className="py-2.5 px-3.5">Chứng Từ Tham Chiếu</th>
                <th className="py-2.5 px-3.5">Loại Nghiệp Vụ</th>
                <th className="py-2.5 px-3.5">Mã SKU & Tên Vật Tư</th>
                <th className="py-2.5 px-3.5">Kho & Vị Trí Kệ</th>
                <th className="py-2.5 px-3 text-right">Biến Động</th>
                <th className="py-2.5 px-3.5">Người Thực Hiện</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/60 dark:divide-slate-800">
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
                    <tr key={t.id} className="hover:bg-white/60 dark:hover:bg-slate-800/40 transition">
                      <td className="py-2.5 px-3.5 font-mono text-slate-500 text-[11px] whitespace-nowrap">
                        {formatDateTime(t.timestamp || t.createdAt)}
                      </td>
                      <td className="py-2.5 px-3.5 font-mono font-bold text-cyan-600 dark:text-cyan-400">
                        {t.referenceDocCode || 'AUTO-SYSTEM'}
                      </td>
                      <td className="py-2.5 px-3.5">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          t.type === 'RECEIPT'
                            ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20'
                            : t.type === 'DISPATCH'
                            ? 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border border-rose-500/20'
                            : t.type === 'RESERVATION_HOLD'
                            ? 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20'
                            : 'bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border border-cyan-500/20'
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
                        <span className="font-mono text-cyan-600 dark:text-cyan-400">{bin?.code || 'Kệ chính'}</span>
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold whitespace-nowrap">
                        <span className={
                          isPositive ? 'text-emerald-600 dark:text-emerald-400' :
                          isNegative ? 'text-rose-600 dark:text-rose-400' :
                          'text-amber-600 dark:text-amber-400'
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
