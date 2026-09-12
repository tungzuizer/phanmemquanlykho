/*
1. Importers/Callers: public/index.html via <script type="text/babel" src="/js/components/Tabs/PosTab.js"></script>
2. Affected API: iOS 26 Liquid Glass Purchase Order (PO) Management Tab (window.WMS_COMPONENTS.PosTab), DELETE /api/pos/:id, handlers.onRequestDelete.
3. Data schemas: Uses data.purchaseOrders, data.orders, data.skus, data.uoms, currentUser, { id, type: 'PO', code, title, details }.
4. User's verbatim instruction: "Ban Giám Đốc MEVN (ADMIN) và tôi cần chức năng xóa" / "theo khuyến nghị của bạn"
*/

function PosTab({ data, currentUser, handlers, onOpenPrintPreview }) {
  const { formatMoney, formatNumber, formatDate } = window.WMS_CONSTANTS || {
    formatMoney: n => n,
    formatNumber: n => n,
    formatDate: d => d
  };
  if (!data) return null;

  const pos = data.purchaseOrders || [];

  return (
    <div className="space-y-5 animate-fade-in select-none">
      {/* Top Bar */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-4 sm:p-5 rounded-3xl border border-white/80 dark:border-white/10 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 liquid-specular">
        <div>
          <h2 className="text-sm sm:text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
            <i className="fa-solid fa-cart-shopping text-red-600 dark:text-red-400"></i>
            Đơn Mua Hàng Bù Thiếu Vật Tư (Purchase Orders - PO)
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
            Quản lý các hợp đồng mua sắm vật tư bù thiếu theo phân tích BOM, hỗ trợ 1-touch liên kết sang Phiếu Nhập Kho (GRN).
          </p>
        </div>

        <button
          onClick={() => handlers.onOpenPoModal()}
          className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs rounded-2xl shadow-lg shadow-blue-500/25 flex items-center gap-2 transition liquid-touch whitespace-nowrap"
        >
          <i className="fa-solid fa-plus"></i> Lập Đơn PO Mới
        </button>
      </div>

      {pos.length === 0 ? (
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl border border-white/80 dark:border-white/10 p-12 text-center text-slate-400 liquid-specular">
          <i className="fa-solid fa-cart-plus text-4xl mb-3 text-slate-300 dark:text-slate-600"></i>
          <p className="text-xs font-bold">Chưa có đơn mua hàng PO nào được tạo.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {pos.map(po => {
            const order = (data.orders || []).find(o => o.id === po.orderId);
            const isReceived = po.status === 'RECEIVED';

            return (
              <div
                key={po.id}
                className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl border border-white/80 dark:border-white/10 shadow-xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden liquid-specular liquid-touch"
              >
                <div className="p-4 sm:p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-black text-xs bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300 px-2.5 py-0.5 rounded-lg border border-red-200 dark:border-red-800">
                      {po.code}
                    </span>
                    <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full ${
                      isReceived
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                        : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                    }`}>
                      {po.status}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white leading-snug">
                      Nhà cung cấp: {po.supplierName}
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      Bù cho đơn: <strong className="text-slate-700 dark:text-slate-300">{order?.code || 'N/A'}</strong> ({order?.title || 'Dự án'})
                    </p>
                  </div>

                  <div className="bg-slate-50/80 dark:bg-slate-800/50 p-3 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Tổng giá trị:</span>
                      <span className="font-mono font-bold text-slate-900 dark:text-white">{formatMoney(po.totalAmount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Dự kiến về kho:</span>
                      <span className="font-mono text-slate-700 dark:text-slate-300">{formatDate(po.expectedDate)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Số hạng mục:</span>
                      <span className="font-mono font-bold text-blue-600 dark:text-blue-400">{po.items?.length || 0} mã</span>
                    </div>
                  </div>
                </div>

                <div className="px-4 sm:px-5 py-3 bg-slate-50/70 dark:bg-slate-800/60 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onOpenPrintPreview('PO', po)}
                      className="text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-blue-600 flex items-center gap-1.5"
                    >
                      <i className="fa-solid fa-print text-blue-500"></i> In PO
                    </button>
                    {handlers?.onRequestDelete && (currentUser?.role === 'ADMIN' || currentUser?.role === 'GD') && (
                      <button
                        onClick={() => handlers.onRequestDelete({
                          id: po.id,
                          type: 'PO',
                          code: po.code,
                          title: `PO ${po.code} - ${po.supplierName || 'NCC'}`,
                          details: 'Hệ thống sẽ xóa đơn mua hàng PO này và các dòng chi tiết vật tư mua kèm.'
                        })}
                        className="px-2 py-1 bg-red-50 hover:bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400 font-bold text-[10px] rounded-lg flex items-center gap-1 liquid-touch"
                        title="Xóa Đơn Mua Hàng PO"
                      >
                        <i className="fa-solid fa-trash-can"></i> Xóa
                      </button>
                    )}
                  </div>

                  {!isReceived && (
                    <button
                      onClick={() => handlers.onReceivePoToGrn(po)}
                      className="px-3.5 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-500/20 flex items-center gap-1.5 transition liquid-touch"
                    >
                      <i className="fa-solid fa-truck-ramp-box"></i> Nhập Kho (GRN)
                    </button>
                  )}
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
window.WMS_COMPONENTS.PosTab = PosTab;
