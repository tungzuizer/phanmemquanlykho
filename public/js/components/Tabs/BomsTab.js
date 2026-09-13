/**
 * Fact-Forcing Gate Details:
 * 1. Importers/Callers: public/index.html via <script type="text/babel" src="/js/components/Tabs/BomsTab.js"></script>
 * 2. Affected API: window.WMS_COMPONENTS.BomsTab (Action-Direct BOM Management & Delta Gap Analysis)
 * 3. Data schemas: data ({ boms, orders, skus, uoms, stockBalances }), currentUser, handlers, onSelectOrder, onOpenPrintPreview
 * 4. User's verbatim instruction: "giao diện quá hỗn loạn không biết ở trong có cái gì quá loạn và chữ thì nhiều và hỗn loạn hãy kiểm tra lại vè mấy cái huy chương hay icon tương tự đi phèn quá"
 */

function BomsTab({ data, currentUser, handlers, onSelectOrder, onOpenPrintPreview }) {
  const [selectedBomId, setSelectedBomId] = React.useState(null);
  const { formatNumber, formatDate } = window.WMS_CONSTANTS || { formatNumber: n => n, formatDate: d => d };

  if (!data) return null;

  const boms = data.boms || [];
  const selectedBom = boms.find(b => b.id === selectedBomId) || boms[0];

  return (
    <div className="space-y-4 sm:space-y-5 animate-fade-in font-sans">
      {/* Top Header Card */}
      <div className="liquid-glass p-4 sm:p-5 rounded-2xl border border-white/40 dark:border-white/10 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3.5">
        <div>
          <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 font-display">
            <i className="fa-solid fa-list-check text-cyan-500"></i>
            Định Mức Kỹ Thuật (BOM) & Tính Toán Thiếu Hụt
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Tự động đối chiếu tồn kho, khóa giữ chỗ vật tư và tính toán chính xác lượng cần mua bù.
          </p>
        </div>

        <button
          onClick={() => handlers.onOpenBomModal()}
          className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white dark:bg-cyan-500 dark:hover:bg-cyan-400 dark:text-slate-950 font-bold text-xs rounded-xl shadow-xs flex items-center gap-2 transition active:scale-95 cursor-pointer whitespace-nowrap"
        >
          <i className="fa-solid fa-plus text-xs"></i>
          <span>Nạp BOM Mới</span>
        </button>
      </div>

      {boms.length === 0 ? (
        <div className="liquid-glass rounded-2xl p-12 text-center text-slate-400">
          <i className="fa-solid fa-file-circle-exclamation text-4xl mb-3 text-slate-300 dark:text-slate-600"></i>
          <p className="text-xs font-bold">Chưa có bản BOM nào được nạp vào hệ thống.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Left: BOM List */}
          <div className="space-y-2.5">
            <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-1 font-display">
              Danh sách BOM ({boms.length})
            </div>

            {boms.map(bom => {
              const order = (data.orders || []).find(o => o.id === bom.orderId);
              const isSelected = selectedBom?.id === bom.id;

              const totalItems = bom.items?.length || 0;
              const totalReq = (bom.items || []).reduce((s, it) => s + Number(it.quantityRequired), 0);
              const totalResv = (bom.items || []).reduce((s, it) => s + Number(it.quantityReserved || 0), 0);
              const isFulfilled = totalReq > 0 && totalResv >= totalReq;

              return (
                <div
                  key={bom.id}
                  onClick={() => setSelectedBomId(bom.id)}
                  className={`p-4 rounded-2xl border cursor-pointer transition active:scale-98 ${
                    isSelected
                      ? 'bg-cyan-500/10 border-cyan-500/40 shadow-xs ring-1 ring-cyan-500/20'
                      : 'liquid-glass hover:bg-white/90 dark:hover:bg-slate-800/90 shadow-xs'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono font-bold text-xs text-cyan-700 dark:text-cyan-300 bg-cyan-500/10 px-2 py-0.5 rounded-lg border border-cyan-500/20">
                      v{bom.version}
                    </span>
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                      isFulfilled
                        ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20'
                        : 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20'
                    }`}>
                      {bom.status}
                    </span>
                  </div>

                  <div className="text-xs font-bold text-slate-900 dark:text-white leading-snug font-display">
                    Đơn: {order?.code || bom.orderId}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                    {order?.title || 'Dự án tủ điện'}
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between text-[11px]">
                    <span className="text-slate-400 font-medium">{totalItems} mã chi tiết</span>
                    <span className="font-mono font-bold text-slate-700 dark:text-slate-300">
                      Giữ chỗ: {totalResv}/{totalReq} ({totalReq > 0 ? Math.round((totalResv/totalReq)*100) : 0}%)
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right: Selected BOM Detail & Delta Breakdown */}
          {selectedBom && (
            <div className="lg:col-span-2 liquid-glass rounded-2xl p-5 shadow-sm space-y-4">
              {/* Header of selected BOM */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200/60 dark:border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-500 text-slate-950 px-2.5 py-1 rounded-lg shadow-sm font-extrabold">
                      BOM v{selectedBom.version}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      Cập nhật: {formatDate(selectedBom.updatedAt || selectedBom.createdAt)}
                    </span>
                  </div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white mt-1.5 font-display">
                    Mã đơn hàng: {(data.orders || []).find(o => o.id === selectedBom.orderId)?.code} - {(data.orders || []).find(o => o.id === selectedBom.orderId)?.title}
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => onOpenPrintPreview('BOM', selectedBom)}
                    className="px-3.5 py-2 bg-white dark:bg-slate-800 hover:bg-slate-50 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold flex items-center gap-1.5 border border-slate-200 dark:border-slate-700 cursor-pointer transition active:scale-95"
                  >
                    <i className="fa-solid fa-print text-cyan-500"></i>
                    <span>In Định Mức</span>
                  </button>
                  {selectedBom.status === 'SUBMITTED' && (
                    <button
                      onClick={() => handlers.onVerifyBom(selectedBom.id)}
                      className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white dark:bg-cyan-500 dark:hover:bg-cyan-400 dark:text-slate-950 font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
                    >
                      <i className="fa-solid fa-calculator text-xs"></i>
                      <span>Khóa Giữ Chỗ</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Mobile Adaptive Cards for BOM Items */}
              <div className="md:hidden space-y-2.5">
                {(selectedBom.items || []).map(item => {
                  const sku = (data.skus || []).find(s => s.id === item.skuId);
                  const uom = (data.uoms || []).find(u => u.id === (sku?.baseUomId || item.uomId));
                  const skuBalances = (data.stockBalances || []).filter(b => b.skuId === item.skuId);
                  const totalPhysical = skuBalances.reduce((s, b) => s + Number(b.quantityPhysical), 0);

                  const req = Number(item.quantityRequired);
                  const resv = Number(item.quantityReserved || 0);
                  const shortage = Math.max(0, req - resv);
                  const isOk = shortage === 0;

                  return (
                    <div
                      key={item.id}
                      className="p-4 rounded-2xl liquid-glass space-y-2.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-xs text-cyan-700 dark:text-cyan-300 bg-cyan-500/10 px-2 py-0.5 rounded-lg border border-cyan-500/20">
                          {sku?.code || 'SKU'}
                        </span>
                        {isOk ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
                            Đủ 100%
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-700 dark:text-rose-300 border border-rose-500/20">
                            Thiếu {shortage} {uom?.name}
                          </span>
                        )}
                      </div>

                      <div>
                        <div className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">{sku?.name || item.skuId}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5">{sku?.specification || 'Chuẩn MEVN'}</div>
                      </div>

                      <div className="grid grid-cols-4 gap-1.5 text-center font-mono pt-1">
                        <div className="bg-white/50 dark:bg-slate-900/80 p-1.5 rounded-xl border border-slate-200/60 dark:border-slate-800">
                          <div className="text-[9px] uppercase font-bold text-slate-400">BOM Định Mức</div>
                          <div className="text-xs font-bold text-slate-900 dark:text-white mt-0.5">
                            {req} <span className="text-[9px] font-normal text-slate-400">{uom?.name}</span>
                          </div>
                        </div>
                        <div className="bg-white/50 dark:bg-slate-900/80 p-1.5 rounded-xl border border-slate-200/60 dark:border-slate-800">
                          <div className="text-[9px] uppercase font-bold text-slate-400">Tồn Vật Lý</div>
                          <div className="text-xs font-bold text-slate-700 dark:text-slate-300 mt-0.5">
                            {totalPhysical}
                          </div>
                        </div>
                        <div className="bg-amber-500/10 p-1.5 rounded-xl border border-amber-500/20">
                          <div className="text-[9px] uppercase font-bold text-amber-500">Đã Khóa</div>
                          <div className="text-xs font-bold text-amber-600 dark:text-amber-400 mt-0.5">
                            {resv}
                          </div>
                        </div>
                        <div className={`p-1.5 rounded-xl border ${shortage > 0 ? 'bg-rose-500/10 border-rose-500/20' : 'bg-emerald-500/10 border-emerald-500/20'}`}>
                          <div className={`text-[9px] uppercase font-bold ${shortage > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>Thiếu Hụt</div>
                          <div className={`text-xs font-bold mt-0.5 ${shortage > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                            {shortage > 0 ? `-${shortage}` : '0'}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Desktop Table for BOM Items */}
              <div className="hidden md:block border border-slate-200/60 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-white/40 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 border-b border-slate-200/60 dark:border-slate-800 font-bold">
                      <th className="py-3 px-3.5">Mã SKU</th>
                      <th className="py-3 px-3.5">Tên Chi Tiết / Thông Số</th>
                      <th className="py-3 px-2 text-right">Định Mức (BOM)</th>
                      <th className="py-3 px-2 text-right">Tồn Vật Lý</th>
                      <th className="py-3 px-2 text-right">Đã Khóa Giữ</th>
                      <th className="py-3 px-2 text-right">Thiếu (Delta)</th>
                      <th className="py-3 px-3 text-center">Tình Trạng</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200/60 dark:divide-slate-800">
                    {(selectedBom.items || []).map(item => {
                      const sku = (data.skus || []).find(s => s.id === item.skuId);
                      const uom = (data.uoms || []).find(u => u.id === (sku?.baseUomId || item.uomId));
                      const skuBalances = (data.stockBalances || []).filter(b => b.skuId === item.skuId);
                      const totalPhysical = skuBalances.reduce((s, b) => s + Number(b.quantityPhysical), 0);

                      const req = Number(item.quantityRequired);
                      const resv = Number(item.quantityReserved || 0);
                      const shortage = Math.max(0, req - resv);
                      const isOk = shortage === 0;

                      return (
                        <tr key={item.id} className="hover:bg-white/60 dark:hover:bg-slate-800/40 transition">
                          <td className="py-3 px-3.5 font-mono font-bold text-slate-900 dark:text-white">
                            {sku?.code || 'SKU'}
                          </td>
                          <td className="py-3 px-3.5">
                            <div className="font-bold text-slate-800 dark:text-slate-100">{sku?.name || item.skuId}</div>
                            <div className="text-[10px] text-slate-400">{sku?.specification || 'Chuẩn MEVN'}</div>
                          </td>
                          <td className="py-3 px-2 text-right font-mono font-bold text-slate-800 dark:text-slate-200">
                            {req} <span className="text-[10px] text-slate-400 font-normal">{uom?.name}</span>
                          </td>
                          <td className="py-3 px-2 text-right font-mono text-slate-600 dark:text-slate-400">
                            {totalPhysical}
                          </td>
                          <td className="py-3 px-2 text-right font-mono text-amber-600 dark:text-amber-400 font-bold">
                            {resv}
                          </td>
                          <td className="py-3 px-2 text-right font-mono font-bold">
                            {shortage > 0 ? (
                              <span className="text-rose-600 dark:text-rose-400">-{shortage}</span>
                            ) : (
                              <span className="text-emerald-600 dark:text-emerald-400">0</span>
                            )}
                          </td>
                          <td className="py-3 px-3 text-center">
                            {isOk ? (
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
                                Đủ 100%
                              </span>
                            ) : (
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-700 dark:text-rose-300 border border-rose-500/20">
                                Thiếu {shortage}
                              </span>
                            )}
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
      )}
    </div>
  );
}

window.WMS_COMPONENTS = window.WMS_COMPONENTS || {};
window.WMS_COMPONENTS.BomsTab = BomsTab;
