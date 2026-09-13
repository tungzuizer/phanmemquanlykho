/**
 * Fact-Forcing Gate Details:
 * Importers/Callers: public/index.html, public/js/app.js
 * Affected API: window.WMS_COMPONENTS.GrnsTab, DELETE /api/grns/:id
 * Data schemas: { goodsReceiptNotes, purchaseOrders, skus, uoms, bins }, currentUser, handlers, onOpenPrintPreview
 * User's verbatim instruction: "giao diện quá hỗn loạn không biết ở trong có cái gì quá loạn và chữ thì nhiều và hỗn loạn hãy kiểm tra lại vè mấy cái huy chương hay icon tương tự đi phèn quá"
 */

function GrnsTab({ data, currentUser, handlers, onOpenPrintPreview }) {
  const { formatDate, formatNumber } = window.WMS_CONSTANTS || { formatDate: d => d, formatNumber: n => n };
  if (!data) return null;

  const grns = data.goodsReceiptNotes || [];

  return (
    <div className="space-y-4 sm:space-y-5 animate-fade-in font-sans">
      {/* Top Header Card */}
      <div className="liquid-glass p-4 sm:p-5 rounded-2xl border border-white/40 dark:border-white/10 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3.5">
        <div>
          <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 font-display">
            <i className="fa-solid fa-truck-ramp-box text-cyan-500"></i>
            Phiếu Nhập Kho Hàng Về (Goods Receipt Notes - GRN)
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Ghi nhận tiếp nhận vật tư từ nhà cung cấp, kiểm đếm thực tế và chỉ định vị trí kệ lưu kho.
          </p>
        </div>

        <button
          onClick={() => handlers.onOpenGrnModal()}
          className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white dark:bg-cyan-500 dark:hover:bg-cyan-400 dark:text-slate-950 font-bold text-xs rounded-xl shadow-xs flex items-center gap-2 transition active:scale-95 cursor-pointer whitespace-nowrap"
        >
          <i className="fa-solid fa-plus text-xs"></i>
          <span>Tạo Phiếu Nhập GRN</span>
        </button>
      </div>

      {grns.length === 0 ? (
        <div className="liquid-glass rounded-2xl p-12 text-center text-slate-400">
          <i className="fa-solid fa-boxes-packing text-4xl mb-3 text-slate-300 dark:text-slate-600"></i>
          <p className="text-xs font-bold">Chưa có phiếu nhập kho nào trong hệ thống.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {grns.map(grn => {
            const po = (data.purchaseOrders || []).find(p => p.id === grn.poId);

            return (
              <div
                key={grn.id}
                className="liquid-glass rounded-2xl border border-white/40 dark:border-white/10 p-4 sm:p-5 shadow-xs space-y-3.5"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200/60 dark:border-slate-800">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="font-mono font-bold text-xs bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 px-2.5 py-1 rounded-lg border border-cyan-500/20">
                      {grn.code}
                    </span>
                    <span className="text-xs text-slate-500">
                      Nhà cung cấp: <strong className="text-slate-800 dark:text-slate-200">{grn.supplierName}</strong>
                    </span>
                    {po && (
                      <span className="text-xs text-slate-400">
                        Theo PO: <span className="font-mono font-bold text-cyan-600 dark:text-cyan-400">{po.code}</span>
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 justify-between sm:justify-end flex-wrap">
                    <span className="text-xs text-slate-400 font-mono">
                      Ngày nhập: {formatDate(grn.receivedDate || grn.createdAt)}
                    </span>
                    <button
                      onClick={() => onOpenPrintPreview('GRN', grn)}
                      className="px-3.5 py-1.5 bg-white dark:bg-slate-800 hover:bg-slate-50 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold flex items-center gap-1.5 border border-slate-200 dark:border-slate-700 cursor-pointer transition active:scale-95"
                    >
                      <i className="fa-solid fa-print text-cyan-500"></i>
                      <span>In Phiếu Nhập</span>
                    </button>
                    {handlers?.onRequestDelete && (currentUser?.role === 'ADMIN' || currentUser?.role === 'GD') && (
                      <button
                        onClick={() => handlers.onRequestDelete({
                          id: grn.id,
                          type: 'GRN',
                          code: grn.code,
                          title: `Phiếu nhập ${grn.code} - ${grn.supplierName}`,
                          details: 'Hệ thống sẽ xóa phiếu nhập kho GRN này và các dòng chi tiết nhập vật tư liên quan.'
                        })}
                        className="px-2.5 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 font-bold text-xs rounded-xl border border-rose-500/20 flex items-center gap-1 cursor-pointer transition active:scale-95"
                        title="Xóa Phiếu Nhập Kho"
                      >
                        <i className="fa-solid fa-trash-can"></i>
                        <span>Xóa</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Mobile Adaptive Cards for GRN Items */}
                <div className="md:hidden space-y-2.5">
                  {(grn.items || []).map(it => {
                    const sku = (data.skus || []).find(s => s.id === it.skuId);
                    const uom = (data.uoms || []).find(u => u.id === (sku?.baseUomId || it.uomId));
                    const bin = (data.bins || []).find(b => b.id === it.binId);

                    return (
                      <div key={it.id} className="p-3 rounded-xl bg-white/40 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-bold text-xs text-cyan-700 dark:text-cyan-300">{sku?.code}</span>
                          <span className="font-mono font-bold text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-500/20">
                            +{it.quantityReceived} {uom?.name}
                          </span>
                        </div>
                        <div className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">{sku?.name}</div>
                        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-200/60 dark:border-slate-800">
                          <span>Vị trí kệ: <strong className="font-mono text-slate-700 dark:text-slate-300">{bin?.code || 'Kệ chờ'}</strong></span>
                          <span>{it.note || 'Chuẩn MEVN'}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Desktop Table for GRN Items */}
                <div className="hidden md:block border border-slate-200/60 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-white/40 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 border-b border-slate-200/60 dark:border-slate-800 font-bold">
                        <th className="py-2.5 px-3.5">Mã SKU / Vật Tư</th>
                        <th className="py-2.5 px-3 text-right">Số Lượng Nhập</th>
                        <th className="py-2.5 px-3.5 text-center">Vị Trí Kệ Chỉ Định</th>
                        <th className="py-2.5 px-3.5">Ghi Chú</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200/60 dark:divide-slate-800">
                      {(grn.items || []).map(it => {
                        const sku = (data.skus || []).find(s => s.id === it.skuId);
                        const uom = (data.uoms || []).find(u => u.id === (sku?.baseUomId || it.uomId));
                        const bin = (data.bins || []).find(b => b.id === it.binId);

                        return (
                          <tr key={it.id} className="hover:bg-white/60 dark:hover:bg-slate-800/40 transition">
                            <td className="py-2.5 px-3.5">
                              <span className="font-mono font-bold text-slate-900 dark:text-white mr-2">{sku?.code}</span>
                              <span className="text-slate-600 dark:text-slate-300">{sku?.name}</span>
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                              +{it.quantityReceived} <span className="text-[10px] text-slate-400 font-normal">{uom?.name}</span>
                            </td>
                            <td className="py-2.5 px-3.5 text-center font-mono">
                              <span className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] border border-slate-200 dark:border-slate-700">
                                {bin?.code || 'Kệ chờ'}
                              </span>
                            </td>
                            <td className="py-2.5 px-3.5 text-slate-400 text-[11px]">
                              {it.note || 'Nhập mới chuẩn lô'}
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
window.WMS_COMPONENTS.GrnsTab = GrnsTab;
