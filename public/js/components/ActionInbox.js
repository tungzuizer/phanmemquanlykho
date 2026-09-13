/**
 * Fact-Forcing Gate Details:
 * 1. Importers/Callers: public/index.html, DashboardTab.js
 * 2. Affected API: window.WMS_COMPONENTS.ActionInbox
 * 3. Data schemas: { data, currentUser, onOpenOrderModal, onOpenBomModal, onVerifyBom, onOpenPoModal, onOpenPickupModal, onOpenGdnModal, onApproveGdn, onDispatchGdn, onNavigateTab }
 * 4. User's verbatim instruction: "giao diện quá hỗn loạn không biết ở trong có cái gì quá loạn và chữ thì nhiều và hỗn loạn hãy kiểm tra lại vè mấy cái huy chương hay icon tương tự đi phèn quá"
 */

function ActionInbox({
  data,
  currentUser,
  onOpenOrderModal,
  onOpenBomModal,
  onVerifyBom,
  onOpenPoModal,
  onOpenPickupModal,
  onOpenGdnModal,
  onApproveGdn,
  onDispatchGdn,
  onNavigateTab
}) {
  if (!data) return null;

  const role = currentUser?.role || 'ADMIN';
  const actions = [];
  const isMatch = (...allowedRoles) => role === 'ADMIN' || allowedRoles.includes(role);

  // 1. Kỹ thuật / Sale Admin: Đơn chờ nạp BOM
  const ordersNeedBom = (data.orders || []).filter(o => o.status === 'CHO_BOM' || o.status === 'MOI_NHAN');
  ordersNeedBom.forEach(order => {
    const hasBom = (data.boms || []).some(b => b.orderId === order.id);
    if (!hasBom && isMatch('KY_THUAT', 'SALE_ADMIN')) {
      actions.push({
        id: `bom-${order.id}`,
        code: order.code,
        title: order.title,
        sub: `Khách: ${order.customerName}`,
        badge: 'Cần Nạp BOM',
        badgeColor: 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20',
        icon: 'fa-layer-group',
        iconColor: 'text-amber-500',
        btnText: 'Nạp BOM',
        btnAction: () => onOpenBomModal(order)
      });
    }
  });

  // 2. Thủ kho: BOM chờ Đối chiếu & Giữ chỗ
  const submittedBoms = (data.boms || []).filter(b => b.status === 'SUBMITTED');
  submittedBoms.forEach(bom => {
    const order = (data.orders || []).find(o => o.id === bom.orderId);
    if (isMatch('THU_KHO')) {
      actions.push({
        id: `verify-bom-${bom.id}`,
        code: bom.code || `BOM v${bom.version}`,
        title: order?.title || `Đơn ${order?.code || bom.orderId}`,
        sub: `${bom.items?.length || 0} hạng mục vật tư`,
        badge: 'Khóa Tồn Kho',
        badgeColor: 'bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border-cyan-500/20',
        icon: 'fa-lock',
        iconColor: 'text-cyan-500',
        btnText: 'Khóa Giữ Chỗ',
        btnAction: () => onVerifyBom(bom.id)
      });
    }
  });

  // 3. Mua hàng: Đơn thiếu vật tư chờ lập PO
  const ordersNeedPo = (data.orders || []).filter(o => o.status === 'CHO_MUA');
  ordersNeedPo.forEach(order => {
    if (isMatch('MUA_HANG')) {
      actions.push({
        id: `po-${order.id}`,
        code: order.code,
        title: order.title,
        sub: 'Thiếu vật tư theo BOM',
        badge: 'Lập PO Mua',
        badgeColor: 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/20',
        icon: 'fa-cart-shopping',
        iconColor: 'text-rose-500',
        btnText: 'Tạo PO',
        btnAction: () => onOpenPoModal(order)
      });
    }
  });

  // 4. Sản xuất: Đơn SẴN SÀNG XUẤT chờ đăng ký ca lấy
  const ordersReady = (data.orders || []).filter(o => o.status === 'SAN_SANG_XUAT');
  ordersReady.forEach(order => {
    if (isMatch('SAN_XUAT')) {
      actions.push({
        id: `pickup-${order.id}`,
        code: order.code,
        title: order.title,
        sub: 'Đã khóa đủ 100% BOM',
        badge: 'Đăng Ký Nhận',
        badgeColor: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20',
        icon: 'fa-truck-ramp-box',
        iconColor: 'text-emerald-500',
        btnText: 'Đăng Ký Ca',
        btnAction: () => onOpenPickupModal(order)
      });
    }
  });

  // 5. Kế toán: GDN chờ duyệt xuất
  const draftGdns = (data.goodsDispatchNotes || []).filter(g => g.status === 'DRAFT');
  draftGdns.forEach(gdn => {
    if (isMatch('KE_TOAN')) {
      actions.push({
        id: `approve-gdn-${gdn.id}`,
        code: gdn.code,
        title: `Xuất cho: ${gdn.receiverName}`,
        sub: `${gdn.items?.length || 0} dòng vật tư`,
        badge: 'Chờ Duyệt Xuất',
        badgeColor: 'bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border-cyan-500/20',
        icon: 'fa-file-signature',
        iconColor: 'text-cyan-600',
        btnText: 'Duyệt Lệnh',
        btnAction: () => onApproveGdn(gdn.id)
      });
    }
  });

  // 6. Thủ kho: GDN đã duyệt chờ thực xuất & ký nhận
  const approvedGdns = (data.goodsDispatchNotes || []).filter(g => g.status === 'APPROVED');
  approvedGdns.forEach(gdn => {
    if (isMatch('THU_KHO')) {
      actions.push({
        id: `dispatch-gdn-${gdn.id}`,
        code: gdn.code,
        title: `Bàn giao: ${gdn.receiverName}`,
        sub: 'Đã duyệt • Cấp tại cửa kho',
        badge: 'Thực Xuất Kho',
        badgeColor: 'bg-teal-500/10 text-teal-700 dark:text-teal-300 border-teal-500/20',
        icon: 'fa-dolly',
        iconColor: 'text-teal-500',
        btnText: 'Xuất & Trừ Tồn',
        btnAction: () => onDispatchGdn(gdn.id)
      });
    }
  });

  const { getRoleConfig } = window.WMS_CONSTANTS || { getRoleConfig: () => ({}) };
  const roleConfig = getRoleConfig(currentUser?.role);

  return (
    <div className="liquid-glass rounded-2xl border border-slate-200/80 dark:border-slate-800 p-4 sm:p-5 shadow-sm space-y-3 font-sans">
      <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-slate-800/80 pb-3 flex-wrap gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center text-xs font-bold border border-cyan-500/20">
            <i className="fa-solid fa-bolt"></i>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white font-display">
                Tác Vụ Cần Xử Lý Ngay
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border border-cyan-500/20">
                {actions.length} việc
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Vai trò: <span className="font-semibold text-slate-700 dark:text-slate-200">{currentUser?.fullName} ({roleConfig.roleName || role})</span>
            </p>
          </div>
        </div>

        {actions.length === 0 && (
          <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
            <i className="fa-solid fa-circle-check"></i> Không có tồn đọng
          </span>
        )}
      </div>

      {actions.length === 0 ? (
        <div className="py-5 text-center text-slate-400 dark:text-slate-500">
          <p className="text-xs font-medium">Toàn bộ chứng từ trong luồng công việc của bạn đã được xử lý xong.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2.5">
          {actions.map(action => (
            <div
              key={action.id}
              className="p-3 rounded-xl bg-white/70 dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between gap-2.5 transition hover:border-cyan-400/50 hover:shadow-sm"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-6 h-6 rounded-md bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs shrink-0">
                    <i className={`fa-solid ${action.icon} ${action.iconColor}`}></i>
                  </div>
                  <span className="font-mono font-bold text-xs text-slate-900 dark:text-white truncate">
                    {action.code}
                  </span>
                </div>
                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-wider shrink-0 ${action.badgeColor}`}>
                  {action.badge}
                </span>
              </div>

              <div className="min-w-0">
                <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">{action.title}</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">{action.sub}</div>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-end">
                <button
                  onClick={action.btnAction}
                  className="px-3 py-1 bg-slate-900 hover:bg-slate-800 text-white dark:bg-cyan-500 dark:hover:bg-cyan-400 dark:text-slate-950 font-bold text-xs rounded-lg shadow-xs flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
                >
                  <i className="fa-solid fa-arrow-right text-[10px]"></i>
                  <span>{action.btnText}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

window.WMS_COMPONENTS = window.WMS_COMPONENTS || {};
window.WMS_COMPONENTS.ActionInbox = ActionInbox;
