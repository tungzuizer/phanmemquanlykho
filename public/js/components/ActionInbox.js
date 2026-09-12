/*
Fact-Forcing Gate Info:
1. Importers/Callers: public/index.html via <script type="text/babel" src="/js/components/ActionInbox.js"></script>
2. Affected API: Client-side Role-Adaptive Action Inbox component (window.WMS_COMPONENTS.ActionInbox)
3. Data schemas: Uses data.orders, data.boms, data.purchaseOrders, data.goodsDispatchNotes, data.pickupRegistrations and filters by currentUser.role & permissions
4. User verbatim: "cần bạn tách các dự liệu tài khoản và phân luồng các tài khoản và có phần đăng nhập"
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

  // Helper check for role matching or admin power
  const isMatch = (...allowedRoles) => role === 'ADMIN' || allowedRoles.includes(role);

  // 1. Kỹ thuật / Sale Admin: Đơn hàng mới chờ nạp BOM
  const ordersNeedBom = (data.orders || []).filter(o => o.status === 'CHO_BOM' || o.status === 'MOI_NHAN');
  ordersNeedBom.forEach(order => {
    const hasBom = (data.boms || []).some(b => b.orderId === order.id);
    if (!hasBom && isMatch('KY_THUAT', 'SALE_ADMIN')) {
      actions.push({
        id: `bom-${order.id}`,
        title: `Nạp BOM thiết kế cho đơn: ${order.code}`,
        desc: `Dự án: ${order.title} (${order.customerName})`,
        priority: 'HIGH',
        icon: 'fa-file-arrow-up',
        color: 'text-indigo-600 bg-indigo-50 border-indigo-200 dark:bg-indigo-950/50 dark:text-indigo-300 dark:border-indigo-800',
        btnText: 'Nạp BOM Mẫu',
        btnAction: () => onOpenBomModal(order)
      });
    }
  });

  // 2. Thủ kho: BOM đã nạp chờ Đối chiếu & Giữ chỗ
  const submittedBoms = (data.boms || []).filter(b => b.status === 'SUBMITTED');
  submittedBoms.forEach(bom => {
    const order = (data.orders || []).find(o => o.id === bom.orderId);
    if (isMatch('THU_KHO')) {
      actions.push({
        id: `verify-bom-${bom.id}`,
        title: `Kho đối chiếu tồn & Khóa giữ chỗ: BOM v${bom.version}`,
        desc: `Đơn hàng ${order?.code || bom.orderId} (${bom.items?.length || 0} chi tiết vật tư)`,
        priority: 'CRITICAL',
        icon: 'fa-calculator',
        color: 'text-blue-600 bg-blue-50 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800',
        btnText: 'Khóa Giữ Chỗ Tự Động',
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
        title: `Phát hành PO mua hàng bù thiếu cho: ${order.code}`,
        desc: `Đơn hàng đang chờ vật tư để đủ điều kiện sản xuất`,
        priority: 'HIGH',
        icon: 'fa-cart-plus',
        color: 'text-red-600 bg-red-50 border-red-200 dark:bg-red-950/50 dark:text-red-300 dark:border-red-800',
        btnText: 'Lập Đơn PO Bù',
        btnAction: () => onOpenPoModal(order)
      });
    }
  });

  // 4. Sản xuất: Đơn hàng SẴN SÀNG XUẤT chờ đăng ký ca lấy
  const ordersReady = (data.orders || []).filter(o => o.status === 'SAN_SANG_XUAT');
  ordersReady.forEach(order => {
    if (isMatch('SAN_SANG_XUAT')) {
      actions.push({
        id: `pickup-${order.id}`,
        title: `Đăng ký ca lấy vật tư sản xuất: ${order.code}`,
        desc: `Kho đã giữ đủ 100% vật tư theo định mức BOM`,
        priority: 'MEDIUM',
        icon: 'fa-calendar-check',
        color: 'text-emerald-600 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800',
        btnText: 'Đăng Ký Ca Lấy',
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
        title: `Duyệt Phiếu xuất kho: ${gdn.code}`,
        desc: `Xuất vật tư cho ${gdn.receiverName} (${gdn.items?.length || 0} hạng mục)`,
        priority: 'HIGH',
        icon: 'fa-signature',
        color: 'text-blue-600 bg-blue-50 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800',
        btnText: 'Duyệt Xuất',
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
        title: `Thực xuất kho & ký nhận: ${gdn.code}`,
        desc: `Đã duyệt. Sẵn sàng bàn giao vật tư tại cửa kho`,
        priority: 'CRITICAL',
        icon: 'fa-truck-fast',
        color: 'text-emerald-600 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800',
        btnText: 'Thực Xuất & Trừ Tồn',
        btnAction: () => onDispatchGdn(gdn.id)
      });
    }
  });

  const { getRoleConfig } = window.WMS_CONSTANTS || { getRoleConfig: () => ({}) };
  const roleConfig = getRoleConfig(currentUser?.role);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center text-sm font-bold">
            <i className="fa-solid fa-inbox"></i>
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              Hộp Thư Tác Vụ Cần Xử Lý Ngay
              <span className="px-2 py-0.5 rounded-full text-xs font-bold font-mono bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                {actions.length} việc
              </span>
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Tự động phân luồng theo: <span className="font-bold text-blue-600 dark:text-blue-400">{currentUser?.fullName} ({roleConfig.roleName || role})</span>
            </p>
          </div>
        </div>

        {actions.length === 0 && (
          <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
            <i className="fa-solid fa-circle-check"></i> Đã hoàn tất mọi nhiệm vụ
          </span>
        )}
      </div>

      {actions.length === 0 ? (
        <div className="py-8 text-center text-slate-400 dark:text-slate-500">
          <i className="fa-solid fa-circle-check text-4xl text-emerald-500/40 mb-2 block"></i>
          <p className="text-xs font-medium">Hiện không có chứng từ nào đang tắc nghẽn ở vai trò của bạn.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {actions.map(action => (
            <div
              key={action.id}
              className={`p-3.5 rounded-xl border flex flex-col justify-between gap-3 transition-all hover:shadow-md ${action.color}`}
            >
              <div className="flex items-start gap-3">
                <i className={`fa-solid ${action.icon} text-base mt-0.5`}></i>
                <div className="flex-1">
                  <div className="text-xs font-bold leading-snug">{action.title}</div>
                  <div className="text-[11px] opacity-80 mt-0.5">{action.desc}</div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-1 border-t border-black/5 dark:border-white/5">
                <button
                  onClick={action.btnAction}
                  className="px-3 py-1.5 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-100 font-bold text-xs rounded-lg shadow-sm border border-slate-300 dark:border-slate-700 flex items-center gap-1.5 transition active:scale-95"
                >
                  <i className="fa-solid fa-play text-[10px] text-blue-500"></i>
                  {action.btnText}
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
