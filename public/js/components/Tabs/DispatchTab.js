/**
 * Fact-Forcing Gate Details:
 * 1. Importers/Callers: public/index.html via <script type="text/babel" src="/js/components/Tabs/DispatchTab.js"></script>
 * 2. Affected API: window.WMS_COMPONENTS.DispatchTab (Action-Direct Dispatch & Pickup Management), DELETE /api/gdns/:id, DELETE /api/pickup-registrations/:id, handlers.onRequestDelete.
 * 3. Data schemas: data ({ goodsDispatchNotes, pickupRegistrations, orders, skus, uoms }), currentUser, handlers, onOpenPrintPreview
 * 4. User's verbatim instruction: "giao diện quá hỗn loạn không biết ở trong có cái gì quá loạn và chữ thì nhiều và hỗn loạn hãy kiểm tra lại vè mấy cái huy chương hay icon tương tự đi phèn quá"
 */

function DispatchTab({ data, currentUser, handlers, onOpenPrintPreview }) {
  const [activeSubTab, setActiveSubTab] = React.useState('gdn'); // 'gdn' | 'pickup'
  const { formatDate, formatNumber } = window.WMS_CONSTANTS || { formatDate: d => d, formatNumber: n => n };
  if (!data) return null;

  const gdns = data.goodsDispatchNotes || [];
  const pickups = data.pickupRegistrations || [];

  return (
    <div className="space-y-4 sm:space-y-5 animate-fade-in font-sans">
      {/* Top Header Card */}
      <div className="liquid-glass p-4 sm:p-5 rounded-2xl border border-white/40 dark:border-white/10 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3.5">
        <div>
          <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 font-display">
            <i className="fa-solid fa-dolly text-emerald-500"></i>
            Điều Phối Xuất Kho & Đăng Ký Ca Lấy Vật Tư
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Quy trình: Đăng ký ca nhận vật tư → Lập phiếu GDN → Kế toán duyệt → Thủ kho thực xuất trừ tồn.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => handlers.onOpenPickupModal()}
            className="px-4 py-2.5 bg-white/80 hover:bg-white text-slate-900 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-white font-bold text-xs rounded-xl border border-slate-200/80 dark:border-slate-700 shadow-xs flex items-center gap-2 transition active:scale-95 cursor-pointer whitespace-nowrap"
          >
            <i className="fa-solid fa-calendar-plus text-xs text-emerald-500"></i>
            <span>Đăng Ký Ca Lấy (Mẫu 1)</span>
          </button>
          <button
            onClick={() => handlers.onOpenGdnModal()}
            className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white dark:bg-cyan-500 dark:hover:bg-cyan-400 dark:text-slate-950 font-bold text-xs rounded-xl shadow-xs flex items-center gap-2 transition active:scale-95 cursor-pointer whitespace-nowrap"
          >
            <i className="fa-solid fa-plus text-xs"></i>
            <span>Lập Phiếu Xuất (PXK-01)</span>
          </button>
        </div>
      </div>

      {/* Sub Tabs Switcher */}
      <div className="flex items-center gap-2 border-b border-slate-200/60 dark:border-slate-800 pb-2">
        <button
          onClick={() => setActiveSubTab('gdn')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer active:scale-95 ${
            activeSubTab === 'gdn'
              ? 'bg-slate-900 text-white dark:bg-cyan-500 dark:text-slate-950 shadow-xs'
              : 'liquid-glass text-slate-600 dark:text-slate-300 hover:bg-white/90 dark:hover:bg-slate-800/90'
          }`}
        >
          <i className="fa-solid fa-file-invoice"></i>
          <span>Phiếu Xuất GDN ({gdns.length})</span>
        </button>
        <button
          onClick={() => setActiveSubTab('pickup')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer active:scale-95 ${
            activeSubTab === 'pickup'
              ? 'bg-slate-900 text-white dark:bg-cyan-500 dark:text-slate-950 shadow-xs'
              : 'liquid-glass text-slate-600 dark:text-slate-300 hover:bg-white/90 dark:hover:bg-slate-800/90'
          }`}
        >
          <i className="fa-solid fa-calendar-check"></i>
          <span>Đăng Ký Ca Lấy ({pickups.length})</span>
        </button>
      </div>

      {/* Content for GDN */}
      {activeSubTab === 'gdn' && (
        <div className="space-y-4">
          {gdns.length === 0 ? (
            <div className="liquid-glass rounded-2xl p-12 text-center text-slate-400">
              <i className="fa-solid fa-box-open text-4xl mb-3 text-slate-300 dark:text-slate-600"></i>
              <p className="text-xs font-bold">Chưa có phiếu xuất kho GDN nào.</p>
            </div>
          ) : (
            gdns.map(gdn => {
              const order = (data.orders || []).find(o => o.id === gdn.orderId);
              const isDraft = gdn.status === 'DRAFT';
              const isApproved = gdn.status === 'APPROVED';
              const isDispatched = gdn.status === 'DISPATCHED';

              return (
                <div
                  key={gdn.id}
                  className="liquid-glass rounded-2xl border border-white/40 dark:border-white/10 p-4 sm:p-5 shadow-xs space-y-3.5"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200/60 dark:border-slate-800">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="font-mono font-bold text-xs bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 px-2.5 py-1 rounded-lg border border-cyan-500/20">
                        {gdn.code}
                      </span>
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                        isDispatched
                          ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20'
                          : isApproved
                          ? 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/20'
                          : 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20'
                      }`}>
                        {gdn.status}
                      </span>
                      <span className="text-xs text-slate-500">
                        Người nhận: <strong className="text-slate-800 dark:text-slate-200">{gdn.receiverName}</strong>
                      </span>
                      {order && (
                        <span className="text-xs text-slate-400">
                          Đơn hàng: <strong className="font-mono text-slate-700 dark:text-slate-300">{order.code}</strong>
                        </span>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-wrap justify-between sm:justify-end">
                      <button
                        onClick={() => onOpenPrintPreview('GDN', gdn)}
                        className="px-3.5 py-1.5 bg-white dark:bg-slate-800 hover:bg-slate-50 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold flex items-center gap-1.5 border border-slate-200 dark:border-slate-700 cursor-pointer transition active:scale-95"
                      >
                        <i className="fa-solid fa-print text-cyan-500"></i>
                        <span>In PXK-BOM-01</span>
                      </button>

                      {handlers?.onRequestDelete && (currentUser?.role === 'ADMIN' || currentUser?.role === 'GD') && (
                        <button
                          onClick={() => handlers.onRequestDelete({
                            id: gdn.id,
                            type: 'GDN',
                            code: gdn.code,
                            title: `Phiếu xuất ${gdn.code} - ${gdn.receiverName || 'Người nhận'}`,
                            details: 'Hệ thống sẽ xóa phiếu xuất kho này và các dòng chi tiết xuất vật tư liên quan.'
                          })}
                          className="px-2.5 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 font-bold text-xs rounded-xl border border-rose-500/20 flex items-center gap-1 cursor-pointer transition active:scale-95"
                          title="Xóa Phiếu Xuất Kho"
                        >
                          <i className="fa-solid fa-trash-can"></i>
                          <span>Xóa</span>
                        </button>
                      )}

                      {isDraft && (
                        <button
                          onClick={() => handlers.onApproveGdn(gdn.id)}
                          className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white dark:bg-cyan-500 dark:hover:bg-cyan-400 dark:text-slate-950 font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer transition active:scale-95"
                        >
                          <i className="fa-solid fa-signature"></i>
                          <span>Duyệt Xuất</span>
                        </button>
                      )}

                      {isApproved && (
                        <button
                          onClick={() => handlers.onDispatchGdn(gdn.id)}
                          className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white dark:bg-emerald-500 dark:hover:bg-emerald-400 dark:text-slate-950 font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
                        >
                          <i className="fa-solid fa-truck-fast"></i>
                          <span>Xuất Kho & Trừ Tồn</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Mobile Adaptive Cards for GDN Items */}
                  <div className="md:hidden space-y-2.5">
                    {(gdn.items || []).map(it => {
                      const sku = (data.skus || []).find(s => s.id === it.skuId);
                      const uom = (data.uoms || []).find(u => u.id === (sku?.baseUomId || it.uomId));

                      return (
                        <div key={it.id} className="p-3 rounded-xl bg-white/40 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-mono font-bold text-xs text-cyan-700 dark:text-cyan-300">{sku?.code}</span>
                            <span className="font-mono font-bold text-xs text-rose-600 dark:text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-lg border border-rose-500/20">
                              -{it.quantityDispatched} {uom?.name}
                            </span>
                          </div>
                          <div className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">{sku?.name}</div>
                          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-200/60 dark:border-slate-800">
                            <span>Vị trí lấy: <strong className="font-mono text-slate-700 dark:text-slate-300">{it.binCode || 'Kệ chính'}</strong></span>
                            <span>Chuẩn MEVN</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Desktop Table for GDN Items */}
                  <div className="hidden md:block border border-slate-200/60 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-white/40 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 border-b border-slate-200/60 dark:border-slate-800 font-bold">
                          <th className="py-2.5 px-3.5">Mã SKU</th>
                          <th className="py-2.5 px-3.5">Tên Vật Tư / Thông Số</th>
                          <th className="py-2.5 px-3 text-right">Số Lượng Xuất</th>
                          <th className="py-2.5 px-3.5 text-center">Vị Trí Lấy Hàng</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200/60 dark:divide-slate-800">
                        {(gdn.items || []).map(it => {
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
                              <td className="py-2.5 px-3 text-right font-mono font-bold text-rose-600 dark:text-rose-400">
                                -{it.quantityDispatched} <span className="text-[10px] text-slate-400 font-normal">{uom?.name}</span>
                              </td>
                              <td className="py-2.5 px-3.5 text-center font-mono text-[11px] text-slate-500">
                                {it.binCode || 'Kệ chính'}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Content for Pickups */}
      {activeSubTab === 'pickup' && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {pickups.length === 0 ? (
            <div className="col-span-full liquid-glass rounded-2xl p-12 text-center text-slate-400">
              <i className="fa-solid fa-calendar-xmark text-4xl mb-3 text-slate-300 dark:text-slate-600"></i>
              <p className="text-xs font-bold">Chưa có đăng ký ca lấy vật tư nào.</p>
            </div>
          ) : (
            pickups.map(pk => {
              const order = (data.orders || []).find(o => o.id === pk.orderId);

              return (
                <div
                  key={pk.id}
                  className="liquid-glass rounded-2xl border border-white/40 dark:border-white/10 p-4 sm:p-5 shadow-xs flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 px-2.5 py-0.5 rounded-lg border border-emerald-500/20 font-mono">
                        Ca: {pk.shift}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200/60 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {pk.status}
                      </span>
                    </div>

                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white font-display">
                        Ngày lấy: {formatDate(pk.pickupDate)}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        Tổ trưởng nhận: <strong className="text-slate-700 dark:text-slate-200">{pk.teamLeaderName}</strong>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        Đơn hàng: <span className="font-mono text-cyan-600 dark:text-cyan-400">{order?.code}</span> ({order?.title})
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Cửa xuất kho: <strong className="text-slate-600 dark:text-slate-300">{pk.gateNumber || 'Cửa A1'}</strong>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2.5 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between gap-2">
                    <button
                      onClick={() => onOpenPrintPreview('PICKUP', pk)}
                      className="px-3.5 py-1.5 bg-white dark:bg-slate-800 hover:bg-slate-50 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold flex items-center gap-1.5 border border-slate-200 dark:border-slate-700 cursor-pointer transition active:scale-95"
                    >
                      <i className="fa-solid fa-print text-emerald-500"></i>
                      <span>In Ca Lấy</span>
                    </button>
                    {handlers?.onRequestDelete && (currentUser?.role === 'ADMIN' || currentUser?.role === 'GD') && (
                      <button
                        onClick={() => handlers.onRequestDelete({
                          id: pk.id,
                          type: 'PICKUP',
                          code: `CA-${pk.shift}-${formatDate(pk.pickupDate)}`,
                          title: `Đăng ký ca lấy: ${pk.teamLeaderName} (${order?.code || 'Đơn hàng'})`,
                          details: 'Hệ thống sẽ xóa phiếu đăng ký ca lấy vật tư này.'
                        })}
                        className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 rounded-xl text-xs font-bold cursor-pointer transition active:scale-95"
                        title="Xóa Đăng Ký Ca Lấy"
                      >
                        <i className="fa-solid fa-trash-can"></i>
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

window.WMS_COMPONENTS = window.WMS_COMPONENTS || {};
window.WMS_COMPONENTS.DispatchTab = DispatchTab;
