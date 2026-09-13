/**
 * Fact-Forcing Gate Details:
 * 1. Importers/Callers: public/index.html via <script type="text/babel" src="/js/components/ActionInbox.js"></script>
 * 2. Affected API: window.WMS_COMPONENTS.ActionInbox (Action-Direct Role-Adaptive Workflow Inbox)
 * 3. Data schemas: data ({ orders, boms, purchaseOrders, goodsDispatchNotes, pickupRegistrations }), currentUser, action handlers
 * 4. User's verbatim instruction: "sửa lại toàn bộ giao diện đnăg nahạp cho sáng sủa nhiều hiệu ứng sinh động tương tác và phông chữ sủa lại cho phù hợp với tiếng việt trong các mục và các trang hãy tối ưu hóa toàn bộ chữ khôgn viết dài dòng lan man hãy tập chung vào các ý chính và hãy tôn trong người dùng thiết không dùng icon quê mùa và đặc biệt không dùng phông nền màu đen hoặc trắng hãy mix nhiều màu lại và mang phong cách sáng sủa nhìn vào không biết trang web là ai làm"
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

  // 1. Kỹ thuật / Kinh doanh: Đơn hàng mới chờ nạp định mức BOM
  const ordersNeedBom = (data.orders || []).filter(o => o.status === 'CHO_BOM' || o.status === 'MOI_NHAN');
  ordersNeedBom.forEach(order => {
    const hasBom = (data.boms || []).some(b => b.orderId === order.id);
    if (!hasBom && isMatch('KY_THUAT', 'SALE_ADMIN')) {
      actions.push({
        id: `bom-${order.id}`,
        title: `Nạp BOM thiết kế: ${order.code}`,
        desc: `${order.title} • Khách hàng: ${order.customerName}`,
        badge: 'Cần Nạp BOM',
        icon: 'fa-layer-group',
        theme: 'from-indigo-500/10 to-purple-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-500/30',
        btnText: 'Nạp BOM',
        btnAction: () => onOpenBomModal(order)
      });
    }
  });

  // 2. Thủ kho: BOM đã nạp chờ Đối chiếu tồn & Khóa giữ chỗ
  const submittedBoms = (data.boms || []).filter(b => b.status === 'SUBMITTED');
  submittedBoms.forEach(bom => {
    const order = (data.orders || []).find(o => o.id === bom.orderId);
    if (isMatch('THU_KHO')) {
      actions.push({
        id: `verify-bom-${bom.id}`,
        title: `Đối chiếu & Khóa giữ chỗ: BOM v${bom.version}`,
        desc: `Đơn ${order?.code || bom.orderId} • ${bom.items?.length || 0} vật tư định mức`,
        badge: 'Khóa Vật Tư',
        icon: 'fa-lock',
        theme: 'from-blue-500/10 to-cyan-500/10 text-blue-700 dark:text-blue-300 border-blue-500/30',
        btnText: 'Khóa Giữ Chỗ',
        btnAction: () => onVerifyBom(bom.id)
      });
    }
  });

  // 3. Mua hàng: Đơn hàng thiếu vật tư chờ phát hành PO
  const ordersNeedPo = (data.orders || []).filter(o => o.status === 'CHO_MUA');
  ordersNeedPo.forEach(order => {
    if (isMatch('MUA_HANG')) {
      actions.push({
        id: `po-${order.id}`,
        title: `Lập đơn PO mua bù: ${order.code}`,
        desc: `Thiếu vật tư theo BOM • Cần mua để cấp sản xuất`,
        badge: 'Thiếu Vật Tư',
        icon: 'fa-cart-shopping',
        theme: 'from-rose-500/10 to-pink-500/10 text-rose-700 dark:text-rose-300 border-rose-500/30',
        btnText: 'Lập PO',
        btnAction: () => onOpenPoModal(order)
      });
    }
  });

  // 4. Sản xuất: Đơn hàng SẴN SÀNG XUẤT chờ đăng ký ca lấy
  const ordersReady = (data.orders || []).filter(o => o.status === 'SAN_SANG_XUAT');
  ordersReady.forEach(order => {
    if (isMatch('SAN_XUAT')) {
      actions.push({
        id: `pickup-${order.id}`,
        title: `Đăng ký ca nhận vật tư: ${order.code}`,
        desc: `Kho đã khóa đủ 100% BOM • Sẵn sàng cấp phát`,
        badge: 'Sẵn Sàng',
        icon: 'fa-clock-rotate-left',
        theme: 'from-emerald-500/10 to-teal-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30',
        btnText: 'Đăng Ký Ca',
        btnAction: () => onOpenPickupModal(order)
      });
    }
  });

  // 5. Kế toán: GDN chờ duyệt xuất kho
  const draftGdns = (data.goodsDispatchNotes || []).filter(g => g.status === 'DRAFT');
  draftGdns.forEach(gdn => {
    if (isMatch('KE_TOAN')) {
      actions.push({
        id: `approve-gdn-${gdn.id}`,
        title: `Duyệt xuất kho: ${gdn.code}`,
        desc: `Bàn giao cho ${gdn.receiverName} • ${gdn.items?.length || 0} mục vật tư`,
        badge: 'Chờ Kế Toán',
        icon: 'fa-file-signature',
        theme: 'from-purple-500/10 to-indigo-500/10 text-purple-700 dark:text-purple-300 border-purple-500/30',
        btnText: 'Duyệt Ngay',
        btnAction: () => onApproveGdn(gdn.id)
      });
    }
  });

  // 6. Thủ kho: GDN đã duyệt chờ thực xuất kho & ký nhận điện tử
  const approvedGdns = (data.goodsDispatchNotes || []).filter(g => g.status === 'APPROVED');
  approvedGdns.forEach(gdn => {
    if (isMatch('THU_KHO')) {
      actions.push({
        id: `dispatch-gdn-${gdn.id}`,
        title: `Xuất kho & Ký nhận: ${gdn.code}`,
        desc: `Đã duyệt • Bàn giao vật tư tại cửa kho`,
        badge: 'Chờ Xuất Kho',
        icon: 'fa-dolly',
        theme: 'from-emerald-500/10 to-cyan-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30',
        btnText: 'Xuất & Trừ Tồn',
        btnAction: () => onDispatchGdn(gdn.id)
      });
    }
  });

  const { getRoleConfig } = window.WMS_CONSTANTS || { getRoleConfig: () => ({}) };
  const roleConfig = getRoleConfig(currentUser?.role);

  return (
    <div className="liquid-glass rounded-2xl border border-white/40 dark:border-white/10 p-5 shadow-sm space-y-3 font-sans">
      <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-slate-800 pb-3 flex-wrap gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 text-white flex items-center justify-center text-xs shadow-md shadow-indigo-500/20">
            <i className="fa-solid fa-bolt"></i>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white font-display">
                Tác Vụ Cần Xử Lý
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-mono font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                {actions.length} việc
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Phân luồng: <span className="font-semibold text-slate-700 dark:text-slate-200">{currentUser?.fullName} ({roleConfig.roleName || role})</span>
            </p>
          </div>
        </div>

        {actions.length === 0 && (
          <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
            <i className="fa-solid fa-circle-check"></i> Đã hoàn tất mọi tác vụ
          </span>
        )}
      </div>

      {actions.length === 0 ? (
        <div className="py-6 text-center text-slate-400 dark:text-slate-500">
          <p className="text-xs font-medium">Không có chứng từ tồn đọng ở vị trí của bạn.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
          {actions.map(action => (
            <div
              key={action.id}
              className={`p-3.5 rounded-xl border bg-gradient-to-r flex flex-col justify-between gap-2.5 transition hover:shadow-md ${action.theme}`}
            >
              <div className="flex items-start gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-white/60 dark:bg-slate-900/60 flex items-center justify-center text-xs shrink-0 shadow-xs">
                  <i className={`fa-solid ${action.icon}`}></i>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold font-display truncate">{action.title}</div>
                  <div className="text-[11px] opacity-80 truncate mt-0.5">{action.desc}</div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-black/5 dark:border-white/5">
                <span className="text-[10px] font-semibold uppercase tracking-wider opacity-70">{action.badge}</span>
                <button
                  onClick={action.btnAction}
                  className="px-3 py-1 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-900 dark:text-white font-bold text-xs rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
                >
                  <i className="fa-solid fa-play text-[9px] text-indigo-500"></i>
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
