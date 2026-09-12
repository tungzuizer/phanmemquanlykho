/*
1. Importers/Callers: public/index.html via <script type="text/babel" src="/js/components/Tabs/DispatchTab.js"></script>
2. Affected API: iOS 26 Liquid Glass Shift Registration & GDN Dispatch Tab (window.WMS_COMPONENTS.DispatchTab), DELETE /api/gdns/:id, DELETE /api/pickup-registrations/:id, handlers.onRequestDelete.
3. Data schemas: Uses data.pickupRegistrations, data.goodsDispatchNotes, data.orders, data.skus, data.uoms, currentUser, { id, type: 'GDN'|'PICKUP', code, title, details }.
4. User's verbatim instruction: "Ban Giám Đốc MEVN (ADMIN) và tôi cần chức năng xóa" / "theo khuyến nghị của bạn"
*/

function DispatchTab({ data, currentUser, handlers, onOpenPrintPreview }) {
  const [activeSubTab, setActiveSubTab] = React.useState('gdn'); // 'gdn' | 'pickup'
  const { formatDate, formatNumber } = window.WMS_CONSTANTS || { formatDate: d => d, formatNumber: n => n };
  if (!data) return null;

  const gdns = data.goodsDispatchNotes || [];
  const pickups = data.pickupRegistrations || [];

  return (
    <div className="space-y-5 animate-fade-in select-none">
      {/* Top Bar */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-4 sm:p-5 rounded-3xl border border-white/80 dark:border-white/10 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 liquid-specular">
        <div>
          <h2 className="text-sm sm:text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
            <i className="fa-solid fa-dolly text-emerald-600 dark:text-emerald-400"></i>
            Điều Phối Xuất Kho & Đăng Ký Ca Lấy Vật Tư (ISO PXK-BOM-01)
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
            Quy trình khép kín: Tổ sản xuất đăng ký ca lấy (Mẫu 1) → Lập phiếu xuất kho → Kế toán/Giám đốc duyệt → Thủ kho thực xuất trừ tồn.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => handlers.onOpenPickupModal()}
            className="px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-2xl shadow-lg shadow-emerald-500/25 flex items-center gap-2 transition liquid-touch whitespace-nowrap"
          >
            <i className="fa-solid fa-calendar-plus"></i> Đăng Ký Ca Lấy (Mẫu 1)
          </button>
          <button
            onClick={() => handlers.onOpenGdnModal()}
            className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs rounded-2xl shadow-lg shadow-blue-500/25 flex items-center gap-2 transition liquid-touch whitespace-nowrap"
          >
            <i className="fa-solid fa-plus"></i> Lập Phiếu Xuất (PXK-01)
          </button>
        </div>
      </div>

      {/* Sub Tabs Switcher */}
      <div className="flex items-center gap-2 border-b border-slate-200/80 dark:border-slate-800 pb-2">
        <button
          onClick={() => setActiveSubTab('gdn')}
          className={`px-4 py-2 rounded-2xl text-xs font-bold transition flex items-center gap-2 liquid-touch ${
            activeSubTab === 'gdn'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
              : 'bg-white/80 dark:bg-slate-900/80 backdrop-blur-md text-slate-600 dark:text-slate-300 border border-white/80 dark:border-white/10'
          }`}
        >
          <i className="fa-solid fa-file-invoice"></i> Phiếu Xuất Kho GDN ({gdns.length})
        </button>
        <button
          onClick={() => setActiveSubTab('pickup')}
          className={`px-4 py-2 rounded-2xl text-xs font-bold transition flex items-center gap-2 liquid-touch ${
            activeSubTab === 'pickup'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/25'
              : 'bg-white/80 dark:bg-slate-900/80 backdrop-blur-md text-slate-600 dark:text-slate-300 border border-white/80 dark:border-white/10'
          }`}
        >
          <i className="fa-solid fa-calendar-check"></i> Đăng Ký Ca Lấy ({pickups.length})
        </button>
      </div>

      {/* Content for GDN */}
      {activeSubTab === 'gdn' && (
        <div className="space-y-4">
          {gdns.length === 0 ? (
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl border border-white/80 dark:border-white/10 p-12 text-center text-slate-400 liquid-specular">
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
                  className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl border border-white/80 dark:border-white/10 p-4 sm:p-5 shadow-xs space-y-3.5 liquid-specular"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="font-mono font-black text-xs bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 px-2.5 py-1 rounded-xl border border-blue-300 dark:border-blue-800">
                        {gdn.code}
                      </span>
                      <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full ${
                        isDispatched
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                          : isApproved
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
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
                        className="px-3.5 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold flex items-center gap-1.5 border border-slate-200 dark:border-slate-700 liquid-touch"
                      >
                        <i className="fa-solid fa-print text-blue-500"></i> In PXK-BOM-01
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
                          className="px-2.5 py-1.5 bg-red-50 hover:bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400 font-bold text-xs rounded-xl border border-red-200 dark:border-red-900 flex items-center gap-1 liquid-touch"
                          title="Xóa Phiếu Xuất Kho"
                        >
                          <i className="fa-solid fa-trash-can"></i> Xóa
                        </button>
                      )}

                      {isDraft && (
                        <button
                          onClick={() => handlers.onApproveGdn(gdn.id)}
                          className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 liquid-touch"
                        >
                          <i className="fa-solid fa-signature"></i> Duyệt Xuất
                        </button>
                      )}

                      {isApproved && (
                        <button
                          onClick={() => handlers.onDispatchGdn(gdn.id)}
                          className="px-3.5 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-500/20 flex items-center gap-1.5 transition liquid-touch"
                        >
                          <i className="fa-solid fa-truck-fast"></i> Thực Xuất Kho & Trừ Tồn
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Mobile Adaptive Cards for GDN Items (Visible on Mobile < 768px) */}
                  <div className="md:hidden space-y-2.5">
                    {(gdn.items || []).map(it => {
                      const sku = (data.skus || []).find(s => s.id === it.skuId);
                      const uom = (data.uoms || []).find(u => u.id === (sku?.baseUomId || it.uomId));

                      return (
                        <div key={it.id} className="p-3 rounded-2xl bg-white/70 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700/80 shadow-xs space-y-2 liquid-touch">
                          <div className="flex items-center justify-between">
                            <span className="font-mono font-black text-xs text-blue-600 dark:text-blue-400">{sku?.code}</span>
                            <span className="font-mono font-black text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/60 px-2 py-0.5 rounded-lg border border-red-200 dark:border-red-900">
                              -{it.quantityDispatched} {uom?.name}
                            </span>
                          </div>
                          <div className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">{sku?.name}</div>
                          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800">
                            <span>Vị trí lấy: <strong className="font-mono text-slate-700 dark:text-slate-300">{it.binCode || 'Kệ chính'}</strong></span>
                            <span>Chuẩn MEVN</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Desktop Table for GDN Items (Visible on Desktop >= 768px) */}
                  <div className="hidden md:block border border-slate-200/80 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-50/80 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 border-b border-slate-200/80 dark:border-slate-700/80 font-bold">
                          <th className="py-2.5 px-3.5">Mã SKU</th>
                          <th className="py-2.5 px-3.5">Tên Vật Tư / Thông Số</th>
                          <th className="py-2.5 px-3 text-right">Số Lượng Xuất</th>
                          <th className="py-2.5 px-3.5 text-center">Vị Trí Lấy Hàng</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {(gdn.items || []).map(it => {
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
                              <td className="py-2.5 px-3 text-right font-mono font-bold text-red-600 dark:text-red-400">
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
            <div className="col-span-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl border border-white/80 dark:border-white/10 p-12 text-center text-slate-400 liquid-specular">
              <i className="fa-solid fa-calendar-xmark text-4xl mb-3 text-slate-300 dark:text-slate-600"></i>
              <p className="text-xs font-bold">Chưa có đăng ký ca lấy vật tư nào.</p>
            </div>
          ) : (
            pickups.map(pk => {
              const order = (data.orders || []).find(o => o.id === pk.orderId);

              return (
                <div
                  key={pk.id}
                  className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl border border-white/80 dark:border-white/10 p-4 sm:p-5 shadow-xs flex flex-col justify-between space-y-3 liquid-specular liquid-touch"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950 px-2.5 py-0.5 rounded-lg border border-emerald-200 dark:border-emerald-800 font-mono">
                        Ca: {pk.shift}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {pk.status}
                      </span>
                    </div>

                    <div>
                      <div className="text-xs font-black text-slate-900 dark:text-white">
                        Ngày lấy: {formatDate(pk.pickupDate)}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        Tổ trưởng nhận: <strong className="text-slate-700 dark:text-slate-200">{pk.teamLeaderName}</strong>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        Đơn hàng: <span className="font-mono text-blue-600 dark:text-blue-400">{order?.code}</span> ({order?.title})
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Cửa xuất kho: <strong className="text-slate-600 dark:text-slate-300">{pk.gateNumber || 'Cửa A1'}</strong>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                    <button
                      onClick={() => onOpenPrintPreview('PICKUP', pk)}
                      className="px-3.5 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold flex items-center gap-1.5 border border-slate-200 dark:border-slate-700 liquid-touch"
                    >
                      <i className="fa-solid fa-print text-emerald-500"></i> In Đăng Ký Ca (Mẫu 1)
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
                        className="p-1.5 bg-red-50 hover:bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400 rounded-xl text-xs font-bold liquid-touch"
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
