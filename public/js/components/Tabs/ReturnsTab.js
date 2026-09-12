/*
1. Importers/Callers: public/index.html via <script type="text/babel" src="/js/components/Tabs/ReturnsTab.js"></script>
2. Affected API: iOS 26 Liquid Glass Scrap & Material Return Voucher Tab (window.WMS_COMPONENTS.ReturnsTab).
3. Data schemas: Uses data.returnVouchers, data.orders, data.skus, data.uoms, currentUser.
4. User's verbatim instruction: "cải thiện cả giao diện trên iphone và adroi và thiết kế theo phong cách Giao Diện Ios 26 Liquid Glass" / "theo khuyến nghị của bạn"
*/

function ReturnsTab({ data, currentUser, handlers, onOpenPrintPreview }) {
  const { formatDate, formatNumber } = window.WMS_CONSTANTS || { formatDate: d => d, formatNumber: n => n };
  if (!data) return null;

  const returns = data.returnVouchers || [];

  return (
    <div className="space-y-5 animate-fade-in select-none">
      {/* Top Bar */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-4 sm:p-5 rounded-3xl border border-white/80 dark:border-white/10 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 liquid-specular">
        <div>
          <h2 className="text-sm sm:text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
            <i className="fa-solid fa-arrow-rotate-left text-purple-600 dark:text-purple-400"></i>
            Quản Lý Nhập Trả Vật Tư & Thu Hồi Phế Phẩm Đồng / Điện
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
            Thu hồi vật tư thừa từ xưởng lắp ráp hoặc nhập kho phế liệu các đầu mẩu thanh cái đồng để phục vụ tái chế và tính định mức tiêu hao.
          </p>
        </div>

        <button
          onClick={() => handlers.onOpenReturnModal()}
          className="px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs rounded-2xl shadow-lg shadow-purple-500/25 flex items-center gap-2 transition liquid-touch whitespace-nowrap"
        >
          <i className="fa-solid fa-plus"></i> Lập Phiếu Nhập Trả
        </button>
      </div>

      {returns.length === 0 ? (
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl border border-white/80 dark:border-white/10 p-12 text-center text-slate-400 liquid-specular">
          <i className="fa-solid fa-recycle text-4xl mb-3 text-slate-300 dark:text-slate-600"></i>
          <p className="text-xs font-bold">Chưa có phiếu nhập trả nào trong hệ thống.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {returns.map(ret => {
            const order = (data.orders || []).find(o => o.id === ret.orderId);
            const isScrap = ret.type === 'SCRAP_DEFECT';

            return (
              <div
                key={ret.id}
                className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl border border-white/80 dark:border-white/10 p-4 sm:p-5 shadow-xs space-y-3.5 liquid-specular"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="font-mono font-black text-xs bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 px-2.5 py-1 rounded-xl border border-purple-300 dark:border-purple-800">
                      {ret.code}
                    </span>
                    <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full ${
                      isScrap
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                        : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                    }`}>
                      {isScrap ? 'Phế Phẩm / Đầu Mẩu' : 'Vật Tư Dư Thừa'}
                    </span>
                    <span className="text-xs text-slate-500">
                      Người trả: <strong className="text-slate-800 dark:text-slate-200">{ret.returnedByName}</strong>
                    </span>
                    {order && (
                      <span className="text-xs text-slate-400">
                        Từ đơn: <span className="font-mono font-bold text-blue-600 dark:text-blue-400">{order.code}</span>
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 justify-between sm:justify-end">
                    <span className="text-xs text-slate-400">
                      Ngày lập: {formatDate(ret.returnDate || ret.createdAt)}
                    </span>
                    <button
                      onClick={() => onOpenPrintPreview('RETURN', ret)}
                      className="px-3.5 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold flex items-center gap-1.5 border border-slate-200 dark:border-slate-700 liquid-touch"
                    >
                      <i className="fa-solid fa-print text-purple-500"></i> In Phiếu Trả
                    </button>
                  </div>
                </div>

                {/* Mobile Adaptive Cards for Return Items (Visible on Mobile < 768px) */}
                <div className="md:hidden space-y-2.5">
                  {(ret.items || []).map(it => {
                    const sku = (data.skus || []).find(s => s.id === it.skuId);
                    const uom = (data.uoms || []).find(u => u.id === (sku?.baseUomId || it.uomId));

                    return (
                      <div key={it.id} className="p-3 rounded-2xl bg-white/70 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700/80 shadow-xs space-y-2 liquid-touch">
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-black text-xs text-purple-700 dark:text-purple-300">{sku?.code}</span>
                          <span className="font-mono font-black text-xs text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/60 px-2 py-0.5 rounded-lg border border-purple-200 dark:border-purple-900">
                            +{it.quantity} {uom?.name}
                          </span>
                        </div>
                        <div className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">{sku?.name}</div>
                        <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800">
                          Lý do: <strong className="text-slate-700 dark:text-slate-300">{it.reason || ret.reason || 'Dư thừa sau gia công'}</strong>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Desktop Table for Return Items (Visible on Desktop >= 768px) */}
                <div className="hidden md:block border border-slate-200/80 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50/80 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 border-b border-slate-200/80 dark:border-slate-700/80 font-bold">
                        <th className="py-2.5 px-3.5">Mã SKU</th>
                        <th className="py-2.5 px-3.5">Tên Vật Tư</th>
                        <th className="py-2.5 px-3 text-right">Số Lượng Trả</th>
                        <th className="py-2.5 px-3.5">Lý Do Nhập Trả</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {(ret.items || []).map(it => {
                        const sku = (data.skus || []).find(s => s.id === it.skuId);
                        const uom = (data.uoms || []).find(u => u.id === (sku?.baseUomId || it.uomId));

                        return (
                          <tr key={it.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition">
                            <td className="py-2.5 px-3.5 font-mono font-bold text-slate-900 dark:text-white">
                              {sku?.code}
                            </td>
                            <td className="py-2.5 px-3.5 text-slate-700 dark:text-slate-200">
                              {sku?.name}
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono font-bold text-purple-700 dark:text-purple-300">
                              +{it.quantity} <span className="text-[10px] text-slate-400 font-normal">{uom?.name}</span>
                            </td>
                            <td className="py-2.5 px-3.5 text-slate-400 text-[11px]">
                              {it.reason || ret.reason || 'Dư thừa sau gia công'}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

window.WMS_COMPONENTS = window.WMS_COMPONENTS || {};
window.WMS_COMPONENTS.ReturnsTab = ReturnsTab;
