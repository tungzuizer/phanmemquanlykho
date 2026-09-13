/*
Fact-Forcing Gate Details:
1. Importers/Callers: public/index.html via <script type="text/babel" src="/js/components/OrderDrawer.js"></script>
2. Affected API: Client-side Order Detail Adaptive iOS Bottom Sheet & Desktop Slide-over Drawer (window.WMS_COMPONENTS.OrderDrawer), handlers.onRequestDelete
3. Data schemas: Uses order, data.boms, data.stockBalances, data.skus, data.uoms, data.goodsDispatchNotes, data.purchaseOrders, data.pickupRegistrations, currentUser
4. User's verbatim instruction: "sửa lại toàn bộ giao diện đnăg nahạp cho sáng sủa nhiều hiệu ứng sinh động tương tác và phông chữ sủa lại cho phù hợp với tiếng việt trong các mục và các trang hãy tối ưu hóa toàn bộ chữ khôgn viết dài dòng lan man hãy tập chung vào các ý chính và hãy tôn trong người dùng thiết không dùng icon quê mùa và đặc biệt không dùng phông nền màu đen hoặc trắng hãy mix nhiều màu lại và mang phong cách sáng sủa nhìn vào không biết trang web là ai làm"
*/

function OrderDrawer({ order, isOpen, onClose, data, currentUser, handlers, onOpenPrintPreview }) {
  const [activeTab, setActiveTab] = React.useState('bom');
  const { STATUS_MAP, formatMoney, formatNumber, formatDate } = window.WMS_CONSTANTS || {
    STATUS_MAP: {},
    formatMoney: n => n,
    formatNumber: n => n,
    formatDate: d => d
  };

  if (!isOpen || !order || !data) return null;

  const currentStatus = STATUS_MAP[order.status] || { label: order.status, step: 1, color: 'bg-slate-100 text-slate-700' };

  // Find related boms
  const relatedBoms = (data.boms || []).filter(b => b.orderId === order.id);
  const latestBom = relatedBoms[relatedBoms.length - 1];

  // Find related GDNs
  const relatedGdns = (data.goodsDispatchNotes || []).filter(g => g.orderId === order.id);

  // Find related Pickups
  const relatedPickups = (data.pickupRegistrations || []).filter(p => p.orderId === order.id);

  // Find related POs
  const relatedPos = (data.purchaseOrders || []).filter(p => p.orderId === order.id);

  // Calculate allocation progress
  let totalRequired = 0;
  let totalReserved = 0;
  if (latestBom && latestBom.items) {
    totalRequired = latestBom.items.reduce((s, it) => s + Number(it.quantityRequired), 0);
    totalReserved = latestBom.items.reduce((s, it) => s + Number(it.quantityReserved || 0), 0);
  }
  const allocPercent = totalRequired > 0 ? Math.min(100, Math.round((totalReserved / totalRequired) * 100)) : 0;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden select-none animate-fade-in flex items-end md:items-stretch justify-center md:justify-end font-sans">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity"
      ></div>

      <div className="relative w-full md:w-screen md:max-w-2xl max-h-[92vh] md:max-h-full liquid-glass border-t md:border-t-0 md:border-l border-white/40 dark:border-white/10 rounded-t-3xl md:rounded-none shadow-2xl flex flex-col pb-[max(1rem,env(safe-area-inset-bottom))] md:pb-0 z-10">

        {/* Mobile Drag Handle Indicator */}
        <div className="md:hidden pt-2 pb-1 flex justify-center">
          <div className="liquid-sheet-handle"></div>
        </div>

        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200/50 dark:border-slate-800 bg-white/40 dark:bg-slate-900/40 flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 flex-wrap">
              <span className="font-mono font-bold text-xs sm:text-sm bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 px-2.5 py-0.5 rounded-lg border border-indigo-500/20">
                {order.code}
              </span>
              <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${currentStatus.color}`}>
                {currentStatus.label}
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                Hạn: <strong className="text-slate-700 dark:text-slate-200">{formatDate(order.targetDeliveryDate)}</strong>
              </span>
            </div>
            <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white leading-tight truncate font-display">
              {order.title}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
              Khách hàng: <span className="font-semibold text-slate-700 dark:text-slate-300">{order.customerName}</span>
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-white/60 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center justify-center cursor-pointer active:scale-95 border border-slate-200/60 dark:border-slate-700"
            aria-label="Đóng"
          >
            <i className="fa-solid fa-xmark text-sm"></i>
          </button>
        </div>

        {/* Stepper (9 stages condensed) */}
        <div className="px-4 sm:px-5 py-2.5 bg-white/30 dark:bg-slate-900/30 border-b border-slate-200/50 dark:border-slate-800">
          <div className="flex items-center justify-between text-[11px] mb-1.5 font-mono">
            <span className="font-bold text-slate-600 dark:text-slate-300 font-sans">Tiến trình vòng đời:</span>
            <span className="font-bold text-indigo-600 dark:text-indigo-400">Bước {currentStatus.step}/9 ({currentStatus.label})</span>
          </div>
          <div className="w-full bg-slate-200/80 dark:bg-slate-800 h-2 rounded-full overflow-hidden flex shadow-inner">
            {Array.from({ length: 9 }).map((_, i) => (
              <div
                key={i}
                className={`flex-1 h-full border-r border-white/40 dark:border-slate-900 ${
                  i < currentStatus.step
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-600'
                    : i === currentStatus.step - 1
                    ? 'bg-indigo-400 animate-pulse'
                    : 'bg-transparent'
                }`}
              ></div>
            ))}
          </div>
        </div>

        {/* Allocation Bar */}
        <div className="px-4 sm:px-5 py-2 bg-indigo-50/40 dark:bg-indigo-950/20 border-b border-indigo-100/60 dark:border-indigo-900/40 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <i className="fa-solid fa-boxes-stacked text-indigo-600 dark:text-indigo-400 text-xs"></i>
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Tỷ lệ giữ chỗ vật tư BOM:</span>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="w-24 sm:w-32 bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all ${allocPercent === 100 ? 'bg-emerald-500' : 'bg-indigo-600'}`}
                style={{ width: `${allocPercent}%` }}
              ></div>
            </div>
            <span className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200">
              {allocPercent}% ({totalReserved}/{totalRequired})
            </span>
          </div>
        </div>

        {/* Internal Tab Bar */}
        <div className="flex border-b border-slate-200/50 dark:border-slate-800 px-4 sm:px-5 gap-3 sm:gap-4 text-xs font-bold overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('bom')}
            className={`py-2.5 border-b-2 flex items-center gap-1.5 transition whitespace-nowrap cursor-pointer active:scale-95 ${
              activeTab === 'bom'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <i className="fa-solid fa-list-check"></i> BOM & Giữ Chỗ ({latestBom?.items?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('gdn')}
            className={`py-2.5 border-b-2 flex items-center gap-1.5 transition whitespace-nowrap cursor-pointer active:scale-95 ${
              activeTab === 'gdn'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <i className="fa-solid fa-truck-fast"></i> Phiếu Xuất GDN ({relatedGdns.length})
          </button>
          <button
            onClick={() => setActiveTab('schedule')}
            className={`py-2.5 border-b-2 flex items-center gap-1.5 transition whitespace-nowrap cursor-pointer active:scale-95 ${
              activeTab === 'schedule'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <i className="fa-solid fa-calendar-days"></i> Ca Lấy & PO ({relatedPickups.length + relatedPos.length})
          </button>
        </div>

        {/* Drawer Body Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3 sm:space-y-4">
          {/* TAB 1: BOM Details & Delta */}
          {activeTab === 'bom' && (
            <div className="space-y-3">
              {!latestBom ? (
                <div className="text-center py-10 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-5 bg-white/30 dark:bg-slate-900/30">
                  <i className="fa-solid fa-file-circle-plus text-3xl text-slate-300 dark:text-slate-600 mb-2 block"></i>
                  <p className="text-xs text-slate-500 font-medium">Đơn hàng này chưa có Định mức vật tư (BOM) được nạp.</p>
                  <button
                    onClick={() => handlers.onOpenBomModal(order)}
                    className="mt-3 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-500/20 cursor-pointer active:scale-95"
                  >
                    <i className="fa-solid fa-plus mr-1"></i> Nạp BOM Ngay
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between bg-white/60 dark:bg-slate-800/50 p-3 rounded-2xl border border-slate-200/80 dark:border-slate-700">
                    <div>
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-100 font-display">BOM Version {latestBom.version}</span>
                      <span className="ml-2 text-[10px] font-mono bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded font-bold">
                        {latestBom.status}
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 font-mono">
                      {formatDate(latestBom.updatedAt || latestBom.createdAt)}
                    </div>
                  </div>

                  {/* Mobile-Friendly Adaptive BOM Card List */}
                  <div className="md:hidden space-y-2">
                    {latestBom.items.map(item => {
                      const sku = (data.skus || []).find(s => s.id === item.skuId);
                      const uom = (data.uoms || []).find(u => u.id === (sku?.baseUomId || item.uomId));
                      const req = Number(item.quantityRequired);
                      const resv = Number(item.quantityReserved || 0);
                      const shortage = Math.max(0, req - resv);
                      const isFulfilled = shortage === 0;

                      return (
                        <div key={item.id} className="p-3 bg-white/60 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 space-y-1.5 shadow-xs">
                          <div className="flex items-center justify-between">
                            <span className="font-mono font-bold text-xs text-indigo-600 dark:text-indigo-400">{sku?.code || 'SKU'}</span>
                            {isFulfilled ? (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                                Đủ 100%
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">
                                Thiếu -{shortage}
                              </span>
                            )}
                          </div>
                          <div className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">{sku?.name || item.skuId}</div>
                          <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-200/60 dark:border-slate-700/40 text-center font-mono text-[11px]">
                            <div className="bg-slate-50 dark:bg-slate-900/60 p-1 rounded-xl">
                              <div className="text-[9px] text-slate-400">Định mức</div>
                              <div className="font-bold">{req} <span className="text-[9px] font-normal">{uom?.name}</span></div>
                            </div>
                            <div className="bg-indigo-50 dark:bg-indigo-950/40 p-1 rounded-xl">
                              <div className="text-[9px] text-indigo-400">Đã giữ</div>
                              <div className="font-bold text-indigo-600 dark:text-indigo-400">{resv}</div>
                            </div>
                            <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                              <div className="text-[9px] text-slate-400">Delta</div>
                              <div className={`font-bold ${shortage > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                                {shortage > 0 ? `-${shortage}` : '0'}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Desktop BOM Table */}
                  <div className="hidden md:block border border-slate-200/60 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-white/50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 border-b border-slate-200/60 dark:border-slate-700 font-bold">
                          <th className="py-2.5 px-3">Mã SKU / Tên Vật Tư</th>
                          <th className="py-2.5 px-2 text-right">Định mức</th>
                          <th className="py-2.5 px-2 text-right">Đã giữ</th>
                          <th className="py-2.5 px-2 text-right">Thiếu (Delta)</th>
                          <th className="py-2.5 px-3 text-center">Trạng thái</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {latestBom.items.map(item => {
                          const sku = (data.skus || []).find(s => s.id === item.skuId);
                          const uom = (data.uoms || []).find(u => u.id === (sku?.baseUomId || item.uomId));
                          const req = Number(item.quantityRequired);
                          const resv = Number(item.quantityReserved || 0);
                          const shortage = Math.max(0, req - resv);
                          const isFulfilled = shortage === 0;

                          return (
                            <tr key={item.id} className="hover:bg-white/60 dark:hover:bg-slate-800/50">
                              <td className="py-2.5 px-3">
                                <div className="font-mono font-bold text-slate-900 dark:text-white">{sku?.code || 'SKU'}</div>
                                <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-xs">{sku?.name || item.skuId}</div>
                              </td>
                              <td className="py-2.5 px-2 text-right font-mono font-bold text-slate-800 dark:text-slate-200">
                                {req} <span className="text-[10px] text-slate-400 font-normal">{uom?.name}</span>
                              </td>
                              <td className="py-2.5 px-2 text-right font-mono text-indigo-600 dark:text-indigo-400 font-bold">
                                {resv}
                              </td>
                              <td className="py-2.5 px-2 text-right font-mono font-bold">
                                {shortage > 0 ? (
                                  <span className="text-rose-600 dark:text-rose-400">-{shortage}</span>
                                ) : (
                                  <span className="text-emerald-600 dark:text-emerald-400">0</span>
                                )}
                              </td>
                              <td className="py-2.5 px-3 text-center">
                                {isFulfilled ? (
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                                    Đủ 100%
                                  </span>
                                ) : (
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">
                                    Thiếu Hàng
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

          {/* TAB 2: GDNs */}
          {activeTab === 'gdn' && (
            <div className="space-y-3">
              {relatedGdns.length === 0 ? (
                <p className="text-xs text-slate-400 py-8 text-center">Chưa có Phiếu xuất kho GDN nào được tạo cho đơn hàng này.</p>
              ) : (
                relatedGdns.map(gdn => (
                  <div key={gdn.id} className="p-3.5 bg-white/60 dark:bg-slate-800/50 rounded-2xl border border-slate-200/80 dark:border-slate-700 flex items-center justify-between gap-2 shadow-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs text-slate-900 dark:text-white">{gdn.code}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold font-mono">
                          {gdn.status}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-1">
                        Người nhận: <strong>{gdn.receiverName}</strong> ({gdn.items.length} hạng mục)
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onOpenPrintPreview('GDN', gdn)}
                        className="px-2.5 py-1 bg-white dark:bg-slate-900 hover:bg-slate-100 text-slate-700 dark:text-slate-200 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95"
                      >
                        <i className="fa-solid fa-print text-indigo-500"></i> In PXK
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 3: Schedule & PO */}
          {activeTab === 'schedule' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase font-mono">Đăng ký ca lấy vật tư (Mẫu 1)</h4>
                {relatedPickups.length === 0 ? (
                  <p className="text-xs text-slate-400 py-2">Chưa có lượt đăng ký ca lấy nào.</p>
                ) : (
                  relatedPickups.map(pk => (
                    <div key={pk.id} className="p-3 bg-emerald-50/60 dark:bg-emerald-950/20 rounded-2xl border border-emerald-200 dark:border-emerald-800/40 text-xs flex justify-between items-center shadow-xs">
                      <div>
                        <div className="font-bold text-emerald-900 dark:text-emerald-300">Ca: {pk.shift} - Ngày {formatDate(pk.pickupDate)}</div>
                        <div className="text-[11px] text-slate-500">Người lấy: {pk.teamLeaderName} | Cửa kho: {pk.gateNumber || 'Cửa A1'}</div>
                      </div>
                      <span className="font-mono text-[10px] bg-emerald-200 dark:bg-emerald-900 px-2 py-0.5 rounded text-emerald-800 dark:text-emerald-200 font-bold">
                        {pk.status}
                      </span>
                    </div>
                  ))
                )}
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase font-mono">Đơn Mua Hàng Bù Thiếu (PO)</h4>
                {relatedPos.length === 0 ? (
                  <p className="text-xs text-slate-400 py-2">Không có PO mua bù nào phát sinh.</p>
                ) : (
                  relatedPos.map(po => (
                    <div key={po.id} className="p-3 bg-rose-50/60 dark:bg-rose-950/20 rounded-2xl border border-rose-200 dark:border-rose-800/40 text-xs flex justify-between items-center shadow-xs">
                      <div>
                        <div className="font-mono font-bold text-rose-900 dark:text-rose-300">{po.code} - {po.supplierName}</div>
                        <div className="text-[11px] text-slate-500 font-mono">Giá trị: {formatMoney(po.totalAmount)} | Dự kiến về: {formatDate(po.expectedDate)}</div>
                      </div>
                      <span className="font-mono text-[10px] bg-rose-200 dark:bg-rose-900 px-2 py-0.5 rounded text-rose-800 dark:text-rose-200 font-bold">
                        {po.status}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer Operations */}
        <div className="p-3 sm:p-4 bg-white/40 dark:bg-slate-900/40 border-t border-slate-200/50 dark:border-slate-800 flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <button
              onClick={() => onOpenPrintPreview('ORDER', order)}
              className="px-3 py-2 bg-white dark:bg-slate-900 hover:bg-slate-100 text-slate-700 dark:text-slate-200 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95"
            >
              <i className="fa-solid fa-file-pdf text-rose-500"></i> In Hồ Sơ
            </button>
            {handlers?.onRequestDelete && (currentUser?.role === 'ADMIN' || currentUser?.role === 'GD') && (
              <button
                onClick={() => {
                  onClose();
                  handlers.onRequestDelete({
                    id: order.id,
                    type: 'ORDER',
                    code: order.code,
                    title: `${order.title} (${order.customerName})`,
                    details: 'Hệ thống sẽ giải phóng toàn bộ số lượng giữ chỗ (Reserved) của BOM đơn hàng này về tồn kho tự do, và xóa toàn bộ chứng từ liên kết.'
                  });
                }}
                className="px-3 py-2 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-400 rounded-xl border border-rose-200 dark:border-rose-900 text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95"
                title="Xóa Đơn Hàng & Giải Phóng Giữ Chỗ"
              >
                <i className="fa-solid fa-trash-can"></i> Xóa Đơn
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {order.status === 'CHO_BOM' && (
              <button
                onClick={() => { onClose(); handlers.onOpenBomModal(order); }}
                className="px-3.5 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:opacity-90 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-500/20 cursor-pointer active:scale-95"
              >
                <i className="fa-solid fa-file-arrow-up mr-1"></i> Nạp BOM
              </button>
            )}
            {latestBom && latestBom.status === 'SUBMITTED' && (
              <button
                onClick={() => { onClose(); handlers.onVerifyBom(latestBom.id); }}
                className="px-3.5 py-2 bg-gradient-to-r from-indigo-600 to-purple-700 hover:opacity-90 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-500/20 cursor-pointer active:scale-95"
              >
                <i className="fa-solid fa-calculator mr-1"></i> Khóa Giữ Chỗ
              </button>
            )}
            {order.status === 'SAN_SANG_XUAT' && (
              <button
                onClick={() => { onClose(); handlers.onOpenPickupModal(order); }}
                className="px-3.5 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:opacity-90 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-500/20 cursor-pointer active:scale-95"
              >
                <i className="fa-solid fa-calendar-plus mr-1"></i> Đăng Ký Ca
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

window.WMS_COMPONENTS = window.WMS_COMPONENTS || {};
window.WMS_COMPONENTS.OrderDrawer = OrderDrawer;
