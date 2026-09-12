/*
1. Importers/Callers: public/index.html via <script type="text/babel" src="/js/components/Tabs/BomsTab.js"></script>
2. Affected API: iOS 26 Liquid Glass BOM Management & Delta Gap Analysis Tab (window.WMS_COMPONENTS.BomsTab).
3. Data schemas: Uses data.boms, data.orders, data.skus, data.uoms, data.stockBalances, currentUser.
4. User's verbatim instruction: "cải thiện cả giao diện trên iphone và adroi và thiết kế theo phong cách Giao Diện Ios 26 Liquid Glass" / "theo khuyến nghị của bạn"
*/

function BomsTab({ data, currentUser, handlers, onSelectOrder, onOpenPrintPreview }) {
  const [selectedBomId, setSelectedBomId] = React.useState(null);
  const { formatNumber, formatDate } = window.WMS_CONSTANTS || { formatNumber: n => n, formatDate: d => d };

  if (!data) return null;

  const boms = data.boms || [];
  const selectedBom = boms.find(b => b.id === selectedBomId) || boms[0];

  return (
    <div className="space-y-5 animate-fade-in select-none">
      {/* Top Header Card */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-4 sm:p-5 rounded-3xl border border-white/80 dark:border-white/10 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 liquid-specular">
        <div>
          <h2 className="text-sm sm:text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
            <i className="fa-solid fa-list-check text-blue-600 dark:text-blue-400"></i>
            Định Mức Kỹ Thuật (BOM) & Động Cơ Tính Toán Delta Thiếu Hụt
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
            Tự động đối chiếu lượng tồn kho vật lý, khóa giữ chỗ (Reserved) và phát hiện delta thiếu vật tư cần mua bù chuẩn ISO 9001.
          </p>
        </div>

        <button
          onClick={() => handlers.onOpenBomModal()}
          className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs rounded-2xl shadow-lg shadow-blue-500/25 flex items-center gap-2 transition liquid-touch whitespace-nowrap"
        >
          <i className="fa-solid fa-plus"></i> Nạp BOM Mới
        </button>
      </div>

      {boms.length === 0 ? (
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl border border-white/80 dark:border-white/10 p-12 text-center text-slate-400 liquid-specular">
          <i className="fa-solid fa-file-circle-exclamation text-4xl mb-3 text-slate-300 dark:text-slate-600"></i>
          <p className="text-xs font-bold">Chưa có bản BOM nào được nạp trong hệ thống.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Left: BOM List */}
          <div className="space-y-3">
            <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase px-1">
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
                  className={`p-4 rounded-3xl border cursor-pointer transition-all liquid-touch ${
                    isSelected
                      ? 'bg-blue-50/80 dark:bg-blue-950/40 border-blue-400 dark:border-blue-700 shadow-md ring-1 ring-blue-400/30'
                      : 'bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-white/80 dark:border-white/10 hover:border-slate-300 dark:hover:border-slate-700 shadow-xs'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono font-black text-xs text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-950 px-2 py-0.5 rounded-lg border border-blue-200 dark:border-blue-900">
                      v{bom.version}
                    </span>
                    <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full ${
                      isFulfilled
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                        : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                    }`}>
                      {bom.status}
                    </span>
                  </div>

                  <div className="text-xs font-bold text-slate-900 dark:text-white leading-snug">
                    Đơn: {order?.code || bom.orderId}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                    {order?.title || 'Dự án tủ điện'}
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">{totalItems} mã chi tiết</span>
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
            <div className="lg:col-span-2 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl border border-white/80 dark:border-white/10 p-5 shadow-sm space-y-4 liquid-specular">
              {/* Header of selected BOM */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-black text-xs bg-blue-600 text-white px-2.5 py-1 rounded-xl shadow-xs">
                      BOM Version {selectedBom.version}
                    </span>
                    <span className="text-xs text-slate-400">
                      Cập nhật: {formatDate(selectedBom.updatedAt || selectedBom.createdAt)}
                    </span>
                  </div>
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-1.5">
                    Mã đơn hàng: {(data.orders || []).find(o => o.id === selectedBom.orderId)?.code} - {(data.orders || []).find(o => o.id === selectedBom.orderId)?.title}
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => onOpenPrintPreview('BOM', selectedBom)}
                    className="px-3.5 py-2 bg-slate-100/80 dark:bg-slate-800/80 hover:bg-slate-200 text-slate-700 dark:text-slate-200 rounded-2xl text-xs font-bold flex items-center gap-1.5 border border-slate-200/80 dark:border-slate-700/80 liquid-touch"
                  >
                    <i className="fa-solid fa-print text-blue-500"></i> In Bản Định Mức
                  </button>
                  {selectedBom.status === 'SUBMITTED' && (
                    <button
                      onClick={() => handlers.onVerifyBom(selectedBom.id)}
                      className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold text-xs rounded-2xl shadow-md shadow-indigo-500/25 flex items-center gap-1.5 transition liquid-touch"
                    >
                      <i className="fa-solid fa-calculator"></i> Khóa Giữ Chỗ Tự Động
                    </button>
                  )}
                </div>
              </div>

              {/* Mobile Adaptive Cards for BOM Items (Visible on Mobile < 768px) */}
              <div className="md:hidden space-y-3">
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
                      className="p-4 rounded-2xl bg-white/70 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700/80 shadow-xs space-y-3 liquid-touch"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-black text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-lg border border-blue-200 dark:border-blue-900">
                          {sku?.code || 'SKU'}
                        </span>
                        {isOk ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                            Đủ 100%
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300 border border-red-200 dark:border-red-800">
                            Thiếu {shortage} {uom?.name}
                          </span>
                        )}
                      </div>

                      <div>
                        <div className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">{sku?.name || item.skuId}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5">{sku?.specification || 'Chuẩn MEVN'}</div>
                      </div>

                      <div className="grid grid-cols-4 gap-1.5 text-center font-mono pt-1">
                        <div className="bg-slate-50 dark:bg-slate-900/80 p-1.5 rounded-xl border border-slate-200/60 dark:border-slate-800">
                          <div className="text-[9px] uppercase font-bold text-slate-400">BOM Định Mức</div>
                          <div className="text-xs font-black text-slate-900 dark:text-white mt-0.5">
                            {req} <span className="text-[9px] font-normal text-slate-400">{uom?.name}</span>
                          </div>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-900/80 p-1.5 rounded-xl border border-slate-200/60 dark:border-slate-800">
                          <div className="text-[9px] uppercase font-bold text-slate-400">Tồn Vật Lý</div>
                          <div className="text-xs font-black text-slate-700 dark:text-slate-300 mt-0.5">
                            {totalPhysical}
                          </div>
                        </div>
                        <div className="bg-indigo-50/60 dark:bg-indigo-950/40 p-1.5 rounded-xl border border-indigo-200/60 dark:border-indigo-900/40">
                          <div className="text-[9px] uppercase font-bold text-indigo-400">Đã Khóa</div>
                          <div className="text-xs font-black text-indigo-600 dark:text-indigo-400 mt-0.5">
                            {resv}
                          </div>
                        </div>
                        <div className={`p-1.5 rounded-xl border ${shortage > 0 ? 'bg-red-50/60 dark:bg-red-950/40 border-red-200/60 dark:border-red-900/40' : 'bg-emerald-50/60 dark:bg-emerald-950/40 border-emerald-200/60 dark:border-emerald-900/40'}`}>
                          <div className={`text-[9px] uppercase font-bold ${shortage > 0 ? 'text-red-400' : 'text-emerald-400'}`}>Delta Thiếu</div>
                          <div className={`text-xs font-black mt-0.5 ${shortage > 0 ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                            {shortage > 0 ? `-${shortage}` : '0'}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Desktop Table for BOM Items (Visible on Desktop >= 768px) */}
              <div className="hidden md:block border border-slate-200/80 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50/80 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 border-b border-slate-200/80 dark:border-slate-700/80 font-bold">
                      <th className="py-3 px-3.5">Mã SKU</th>
                      <th className="py-3 px-3.5">Tên Chi Tiết / Thông Số</th>
                      <th className="py-3 px-2 text-right">Định Mức (BOM)</th>
                      <th className="py-3 px-2 text-right">Tồn Vật Lý</th>
                      <th className="py-3 px-2 text-right">Đã Khóa Giữ</th>
                      <th className="py-3 px-2 text-right">Thiếu (Delta)</th>
                      <th className="py-3 px-3 text-center">Tình Trạng</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {(selectedBom.items || []).map(item => {
                      const sku = (data.skus || []).find(s => s.id === item.skuId);
                      const uom = (data.uoms || []).find(u => u.id === (sku?.baseUomId || item.uomId));

                      // Find total physical for this SKU
                      const skuBalances = (data.stockBalances || []).filter(b => b.skuId === item.skuId);
                      const totalPhysical = skuBalances.reduce((s, b) => s + Number(b.quantityPhysical), 0);

                      const req = Number(item.quantityRequired);
                      const resv = Number(item.quantityReserved || 0);
                      const shortage = Math.max(0, req - resv);
                      const isOk = shortage === 0;

                      return (
                        <tr key={item.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition">
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
                          <td className="py-3 px-2 text-right font-mono text-indigo-600 dark:text-indigo-400 font-bold">
                            {resv}
                          </td>
                          <td className="py-3 px-2 text-right font-mono font-bold">
                            {shortage > 0 ? (
                              <span className="text-red-600 dark:text-red-400">-{shortage}</span>
                            ) : (
                              <span className="text-emerald-600 dark:text-emerald-400">0</span>
                            )}
                          </td>
                          <td className="py-3 px-3 text-center">
                            {isOk ? (
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                                Đủ 100%
                              </span>
                            ) : (
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300 border border-red-200 dark:border-red-800">
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
