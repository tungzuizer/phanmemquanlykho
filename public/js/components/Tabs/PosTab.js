/**
 * Fact-Forcing Gate Details:
 * 1. Importers/Callers: public/index.html via <script type="text/babel" src="/js/components/Tabs/PosTab.js"></script>
 * 2. Affected API: window.WMS_COMPONENTS.PosTab (Action-Direct Purchase Order PO Management), DELETE /api/pos/:id, handlers.onRequestDelete.
 * 3. Data schemas: Uses data.purchaseOrders, data.orders, data.skus, data.uoms, currentUser, { id, type: 'PO', code, title, details }.
 * 4. User's verbatim instruction: "sửa lại toàn bộ giao diện đnăg nahạp cho sáng sủa nhiều hiệu ứng sinh động tương tác và phông chữ sủa lại cho phù hợp với tiếng việt trong các mục và các trang hãy tối ưu hóa toàn bộ chữ khôgn viết dài dòng lan man hãy tập chung vào các ý chính và hãy tôn trong người dùng thiết không dùng icon quê mùa và đặc biệt không dùng phông nền màu đen hoặc trắng hãy mix nhiều màu lại và mang phong cách sáng sủa nhìn vào không biết trang web là ai làm"
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
    <div className="space-y-4 sm:space-y-5 animate-fade-in font-sans">
      {/* Top Header Card */}
      <div className="liquid-glass p-4 sm:p-5 rounded-2xl border border-white/40 dark:border-white/10 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3.5">
        <div>
          <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 font-display">
            <i className="fa-solid fa-cart-shopping text-rose-500"></i>
            Đơn Mua Hàng Bổ Sung (Purchase Orders - PO)
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Quản lý hợp đồng mua sắm vật tư thiếu hụt, liên kết 1 chạm sang Phiếu Nhập Kho (GRN).
          </p>
        </div>

        <button
          onClick={() => handlers.onOpenPoModal()}
          className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white dark:bg-cyan-500 dark:hover:bg-cyan-400 dark:text-slate-950 font-bold text-xs rounded-xl shadow-xs flex items-center gap-2 transition active:scale-95 cursor-pointer whitespace-nowrap"
        >
          <i className="fa-solid fa-plus text-xs"></i>
          <span>Lập Đơn PO Mới</span>
        </button>
      </div>

      {pos.length === 0 ? (
        <div className="liquid-glass rounded-2xl p-12 text-center text-slate-400">
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
                className="liquid-glass rounded-2xl border border-white/40 dark:border-white/10 shadow-xs hover:shadow-md transition flex flex-col justify-between overflow-hidden"
              >
                <div className="p-4 sm:p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-xs bg-rose-500/10 text-rose-700 dark:text-rose-300 px-2.5 py-0.5 rounded-lg border border-rose-500/20">
                      {po.code}
                    </span>
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                      isReceived
                        ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20'
                        : 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20'
                    }`}>
                      {po.status}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white leading-snug font-display">
                      NCC: {po.supplierName}
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      Bù cho đơn: <strong className="text-slate-700 dark:text-slate-300">{order?.code || 'N/A'}</strong> ({order?.title || 'Dự án'})
                    </p>
                  </div>

                  <div className="bg-white/40 dark:bg-slate-900/60 p-3 rounded-xl border border-slate-200/60 dark:border-slate-800 space-y-1.5 text-xs font-mono">
                    <div className="flex justify-between">
                      <span className="text-slate-400 font-sans">Tổng giá trị:</span>
                      <span className="font-bold text-slate-900 dark:text-white">{formatMoney(po.totalAmount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400 font-sans">Dự kiến về:</span>
                      <span className="text-slate-700 dark:text-slate-300">{formatDate(po.expectedDate)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400 font-sans">Hạng mục:</span>
                      <span className="font-bold text-cyan-600 dark:text-cyan-400">{po.items?.length || 0} mã</span>
                    </div>
                  </div>
                </div>

                <div className="px-4 sm:px-5 py-3 bg-white/40 dark:bg-slate-900/40 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onOpenPrintPreview('PO', po)}
                      className="text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-cyan-600 flex items-center gap-1.5 cursor-pointer"
                    >
                      <i className="fa-solid fa-print text-cyan-500"></i>
                      <span>In PO</span>
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
                        className="px-2 py-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 font-bold text-[10px] rounded-lg flex items-center gap-1 cursor-pointer transition active:scale-95"
                        title="Xóa Đơn Mua Hàng PO"
                      >
                        <i className="fa-solid fa-trash-can"></i>
                        <span>Xóa</span>
                      </button>
                    )}
                  </div>

                  {!isReceived && (
                    <button
                      onClick={() => handlers.onOpenGrnModal(po)}
                      className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white dark:bg-emerald-500 dark:hover:bg-emerald-400 dark:text-slate-950 font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
                    >
                      <i className="fa-solid fa-truck-ramp-box"></i>
                      <span>Nhập Kho (GRN)</span>
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
