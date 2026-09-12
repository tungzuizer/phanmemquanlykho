/*
1. Importers/Callers: public/index.html via <script type="text/babel" src="/js/components/Tabs/GrnsTab.js"></script>
2. Affected API: iOS 26 Liquid Glass Goods Receipt Note (GRN) Tab (window.WMS_COMPONENTS.GrnsTab), DELETE /api/grns/:id, handlers.onRequestDelete.
3. Data schemas: Uses data.goodsReceiptNotes, data.purchaseOrders, data.skus, data.uoms, data.bins, currentUser, { id, type: 'GRN', code, title, details }.
4. User's verbatim instruction: "Ban Giám Đốc MEVN (ADMIN) và tôi cần chức năng xóa" / "theo khuyến nghị của bạn"
*/

function GrnsTab({ data, currentUser, handlers, onOpenPrintPreview }) {
  const { formatDate, formatNumber } = window.WMS_CONSTANTS || { formatDate: d => d, formatNumber: n => n };
  if (!data) return null;

  const grns = data.goodsReceiptNotes || [];

  return (
    <div className="space-y-5 animate-fade-in select-none">
      {/* Top Bar */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-4 sm:p-5 rounded-3xl border border-white/80 dark:border-white/10 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 liquid-specular">
        <div>
          <h2 className="text-sm sm:text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
            <i className="fa-solid fa-truck-ramp-box text-teal-600 dark:text-teal-400"></i>
            Phiếu Nhập Kho Hàng Về (Goods Receipt Notes - GRN)
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
            Ghi nhận tiếp nhận hàng từ nhà cung cấp, kiểm đếm thực tế và chỉ định vị trí kệ lưu kho (Bin Location).
          </p>
        </div>

        <button
          onClick={() => handlers.onOpenGrnModal()}
          className="px-4 py-2.5 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-bold text-xs rounded-2xl shadow-lg shadow-teal-500/25 flex items-center gap-2 transition liquid-touch whitespace-nowrap"
        >
          <i className="fa-solid fa-plus"></i> Tạo Phiếu Nhập GRN
        </button>
      </div>

      {grns.length === 0 ? (
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl border border-white/80 dark:border-white/10 p-12 text-center text-slate-400 liquid-specular">
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
                className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl border border-white/80 dark:border-white/10 p-4 sm:p-5 shadow-xs space-y-3.5 liquid-specular"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="font-mono font-black text-xs bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 px-2.5 py-1 rounded-xl border border-teal-300 dark:border-teal-800">
                      {grn.code}
                    </span>
                    <span className="text-xs text-slate-500">
                      Nhà cung cấp: <strong className="text-slate-800 dark:text-slate-200">{grn.supplierName}</strong>
                    </span>
                    {po && (
                      <span className="text-xs text-slate-400">
                        Theo PO: <span className="font-mono font-bold text-blue-600 dark:text-blue-400">{po.code}</span>
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 justify-between sm:justify-end flex-wrap">
                    <span className="text-xs text-slate-400">
                      Ngày nhập: {formatDate(grn.receivedDate || grn.createdAt)}
                    </span>
                    <button
                      onClick={() => onOpenPrintPreview('GRN', grn)}
                      className="px-3.5 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold flex items-center gap-1.5 border border-slate-200 dark:border-slate-700 liquid-touch"
                    >
                      <i className="fa-solid fa-print text-blue-500"></i> In Phiếu Nhập
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
                        className="px-2.5 py-1.5 bg-red-50 hover:bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400 font-bold text-xs rounded-xl border border-red-200 dark:border-red-900 flex items-center gap-1 liquid-touch"
                        title="Xóa Phiếu Nhập Kho"
                      >
                        <i className="fa-solid fa-trash-can"></i> Xóa
                      </button>
                    )}
                  </div>
                </div>

                {/* Mobile Adaptive Cards for GRN Items (Visible on Mobile < 768px) */}
                <div className="md:hidden space-y-2.5">
                  {(grn.items || []).map(it => {
                    const sku = (data.skus || []).find(s => s.id === it.skuId);
                    const uom = (data.uoms || []).find(u => u.id === (sku?.baseUomId || it.uomId));
                    const bin = (data.bins || []).find(b => b.id === it.binId);

                    return (
                      <div key={it.id} className="p-3 rounded-2xl bg-white/70 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700/80 shadow-xs space-y-2 liquid-touch">
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-black text-xs text-teal-700 dark:text-teal-300">{sku?.code}</span>
                          <span className="font-mono font-black text-xs text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/60 px-2 py-0.5 rounded-lg border border-teal-200 dark:border-teal-900">
                            +{it.quantityReceived} {uom?.name}
                          </span>
                        </div>
                        <div className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">{sku?.name}</div>
                        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800">
                          <span>Vị trí kệ: <strong className="font-mono text-slate-700 dark:text-slate-300">{bin?.code || 'Kệ chờ'}</strong></span>
                          <span>{it.note || 'Chuẩn MEVN'}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Desktop Table for GRN Items (Visible on Desktop >= 768px) */}
                <div className="hidden md:block border border-slate-200/80 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50/80 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 border-b border-slate-200/80 dark:border-slate-700/80 font-bold">
                        <th className="py-2.5 px-3.5">Mã SKU / Vật Tư</th>
                        <th className="py-2.5 px-3 text-right">Số Lượng Nhập</th>
                        <th className="py-2.5 px-3.5 text-center">Vị Trí Kệ Chỉ Định</th>
                        <th className="py-2.5 px-3.5">Ghi Chú</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {(grn.items || []).map(it => {
                        const sku = (data.skus || []).find(s => s.id === it.skuId);
                        const uom = (data.uoms || []).find(u => u.id === (sku?.baseUomId || it.uomId));
                        const bin = (data.bins || []).find(b => b.id === it.binId);

                        return (
                          <tr key={it.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition">
                            <td className="py-2.5 px-3.5">
                              <span className="font-mono font-bold text-slate-900 dark:text-white mr-2">{sku?.code}</span>
                              <span className="text-slate-600 dark:text-slate-300">{sku?.name}</span>
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono font-bold text-teal-700 dark:text-teal-300">
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
