/**
 * Fact-Forcing Gate Details:
 * 1. Importers/Callers: public/index.html via <script type="text/babel" src="/js/components/Tabs/ReturnsTab.js"></script>
 * 2. Affected API: window.WMS_COMPONENTS.ReturnsTab (Action-Direct Material Return & Scrap Recovery Management), DELETE /api/returns/:id, handlers.onRequestDelete.
 * 3. Data schemas: Uses data.returnVouchers, data.orders, data.skus, data.uoms, currentUser, { id, type: 'RETURN', code, title, details }.
 * 4. User's verbatim instruction: "sửa lại toàn bộ giao diện đnăg nahạp cho sáng sủa nhiều hiệu ứng sinh động tương tác và phông chữ sủa lại cho phù hợp với tiếng việt trong các mục và các trang hãy tối ưu hóa toàn bộ chữ khôgn viết dài dòng lan man hãy tập chung vào các ý chính và hãy tôn trong người dùng thiết không dùng icon quê mùa và đặc biệt không dùng phông nền màu đen hoặc trắng hãy mix nhiều màu lại và mang phong cách sáng sủa nhìn vào không biết trang web là ai làm"
 */

function ReturnsTab({ data, currentUser, handlers, onOpenPrintPreview }) {
  const { formatDate, formatNumber } = window.WMS_CONSTANTS || { formatDate: d => d, formatNumber: n => n };
  if (!data) return null;

  const returns = data.returnVouchers || [];

  return (
    <div className="space-y-4 sm:space-y-5 animate-fade-in font-sans">
      {/* Top Header Card */}
      <div className="liquid-glass p-4 sm:p-5 rounded-2xl border border-white/40 dark:border-white/10 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3.5">
        <div>
          <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 font-display">
            <i className="fa-solid fa-arrow-rotate-left text-purple-500"></i>
            Quản Lý Nhập Trả Vật Tư & Thu Hồi Phế Liệu
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Thu hồi vật tư thừa từ xưởng và nhập kho phế phẩm thanh cái đồng phục vụ tái chế.
          </p>
        </div>

        <button
          onClick={() => handlers.onOpenReturnModal()}
          className="px-4 py-2.5 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-purple-500/25 flex items-center gap-2 transition active:scale-95 cursor-pointer whitespace-nowrap"
        >
          <i className="fa-solid fa-plus text-xs"></i>
          <span>Lập Phiếu Nhập Trả</span>
        </button>
      </div>

      {returns.length === 0 ? (
        <div className="liquid-glass rounded-2xl p-12 text-center text-slate-400">
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
                className="liquid-glass rounded-2xl border border-white/40 dark:border-white/10 p-4 sm:p-5 shadow-xs space-y-3.5"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200/60 dark:border-slate-800">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="font-mono font-bold text-xs bg-purple-500/10 text-purple-700 dark:text-purple-300 px-2.5 py-1 rounded-lg border border-purple-500/20">
                      {ret.code}
                    </span>
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                      isScrap
                        ? 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20'
                        : 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20'
                    }`}>
                      {isScrap ? 'Phế Liệu / Đầu Mẩu' : 'Vật Tư Dư Thừa'}
                    </span>
                    <span className="text-xs text-slate-500">
                      Người trả: <strong className="text-slate-800 dark:text-slate-200">{ret.returnedByName}</strong>
                    </span>
                    {order && (
                      <span className="text-xs text-slate-400">
                        Từ đơn: <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">{order.code}</span>
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 justify-between sm:justify-end flex-wrap">
                    <span className="text-xs text-slate-400 font-mono">
                      Ngày lập: {formatDate(ret.returnDate || ret.createdAt)}
                    </span>
                    <button
                      onClick={() => onOpenPrintPreview('RETURN', ret)}
                      className="px-3.5 py-1.5 bg-white dark:bg-slate-800 hover:bg-slate-50 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold flex items-center gap-1.5 border border-slate-200 dark:border-slate-700 cursor-pointer"
                    >
                      <i className="fa-solid fa-print text-purple-500"></i>
                      <span>In Phiếu Trả</span>
                    </button>
                    {handlers?.onRequestDelete && (currentUser?.role === 'ADMIN' || currentUser?.role === 'GD') && (
                      <button
                        onClick={() => handlers.onRequestDelete({
                          id: ret.id,
                          type: 'RETURN',
                          code: ret.code,
                          title: `Phiếu trả ${ret.code} - ${ret.returnedByName}`,
                          details: 'Hệ thống sẽ xóa phiếu nhập trả / thu hồi phế phẩm này và các dòng chi tiết liên quan.'
                        })}
                        className="px-2.5 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 font-bold text-xs rounded-xl border border-rose-500/20 flex items-center gap-1 cursor-pointer transition active:scale-95"
                        title="Xóa Phiếu Nhập Trả"
                      >
                        <i className="fa-solid fa-trash-can"></i>
                        <span>Xóa</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Mobile Adaptive Cards for Return Items */}
                <div className="md:hidden space-y-2.5">
                  {(ret.items || []).map(it => {
                    const sku = (data.skus || []).find(s => s.id === it.skuId);
                    const uom = (data.uoms || []).find(u => u.id === (sku?.baseUomId || it.uomId));

                    return (
                      <div key={it.id} className="p-3 rounded-xl bg-white/40 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-bold text-xs text-purple-700 dark:text-purple-300">{sku?.code}</span>
                          <span className="font-mono font-bold text-xs text-purple-600 dark:text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-lg border border-purple-500/20">
                            +{it.quantity} {uom?.name}
                          </span>
                        </div>
                        <div className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">{sku?.name}</div>
                        <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-200/60 dark:border-slate-800">
                          Lý do: <strong className="text-slate-700 dark:text-slate-300">{it.reason || ret.reason || 'Dư thừa sau gia công'}</strong>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Desktop Table for Return Items */}
                <div className="hidden md:block border border-slate-200/60 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-white/40 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 border-b border-slate-200/60 dark:border-slate-800 font-bold">
                        <th className="py-2.5 px-3.5">Mã SKU</th>
                        <th className="py-2.5 px-3.5">Tên Vật Tư</th>
                        <th className="py-2.5 px-3 text-right">Số Lượng Trả</th>
                        <th className="py-2.5 px-3.5">Lý Do Nhập Trả</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200/60 dark:divide-slate-800">
                      {(ret.items || []).map(it => {
                        const sku = (data.skus || []).find(s => s.id === it.skuId);
                        const uom = (data.uoms || []).find(u => u.id === (sku?.baseUomId || it.uomId));

                        return (
                          <tr key={it.id} className="hover:bg-white/60 dark:hover:bg-slate-800/40 transition">
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
