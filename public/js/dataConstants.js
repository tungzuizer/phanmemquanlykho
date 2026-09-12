/* Fact-Forcing Gate Answer:
1. Importers/Callers: public/index.html via <script src="/js/dataConstants.js"></script> and all React components
2. Affected API: Role matrix, navigation filters, permission checks (window.WMS_CONSTANTS)
3. Data schemas: ROLE_CONFIG, getNavDomainsForRole, hasPermission, isTabAllowed, formatters
4. User verbatim: "cần bạn tách các dự liệu tài khoản và phân luồng các tài khoản và có phần đăng nhập"
*/

window.WMS_CONSTANTS = {
  STATUS_MAP: {
    'MOI_NHAN': { label: 'Mới Nhận', step: 1, color: 'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700' },
    'CHO_BOM': { label: 'Chờ BOM Kỹ Thuật', step: 2, color: 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800' },
    'DANG_DOI_CHIEU_TON': { label: 'Đang Đối Chiếu Tồn', step: 3, color: 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800' },
    'DA_GIU_CHO': { label: 'Đã Giữ Chỗ 1 Phần', step: 4, color: 'bg-indigo-100 text-indigo-800 border-indigo-300 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-800' },
    'CHO_MUA': { label: 'Chờ Mua Bù Thiếu', step: 5, color: 'bg-red-100 text-red-800 border-red-300 dark:bg-red-950/60 dark:text-red-300 dark:border-red-800' },
    'DA_NHAP_KHO': { label: 'Đã Nhập Kho PO', step: 6, color: 'bg-teal-100 text-teal-800 border-teal-300 dark:bg-teal-950/60 dark:text-teal-300 dark:border-teal-800' },
    'SAN_SANG_XUAT': { label: 'Sẵn Sàng Xuất Kho', step: 7, color: 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800 font-bold' },
    'DA_XUAT_MOT_PHAN': { label: 'Đã Xuất 1 Phần', step: 8, color: 'bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800' },
    'HOAN_TAT': { label: 'Hoàn Tất Đơn Hàng', step: 9, color: 'bg-green-100 text-green-900 border-green-400 dark:bg-green-950/60 dark:text-green-300 dark:border-green-800 font-bold' }
  },

  ROLES: [
    { id: 'all', name: 'Tất cả Vai trò', icon: 'fa-users', color: 'text-slate-500' },
    { id: 'ADMIN', name: 'Ban Giám Đốc / Admin', icon: 'fa-crown', color: 'text-amber-500' },
    { id: 'THU_KHO', name: 'Thủ Kho (Điện & Đồng)', icon: 'fa-warehouse', color: 'text-blue-500' },
    { id: 'KY_THUAT', name: 'Kỹ Sư BOM Thiết Kế', icon: 'fa-ruler-combined', color: 'text-indigo-500' },
    { id: 'MUA_HANG', name: 'Nhân Viên Thu Mua PO', icon: 'fa-cart-shopping', color: 'text-rose-500' },
    { id: 'SAN_XUAT', name: 'Đội Trưởng Lắp Ráp', icon: 'fa-helmet-safety', color: 'text-emerald-500' },
    { id: 'SALE_ADMIN', name: 'Sale Admin Dự Án', icon: 'fa-briefcase', color: 'text-sky-500' },
    { id: 'KE_TOAN', name: 'Kế Toán & Kiểm Toán', icon: 'fa-calculator', color: 'text-purple-500' }
  ],

  ROLE_CONFIG: {
    ADMIN: {
      roleKey: 'ADMIN',
      roleName: 'Ban Giám Đốc / Quản Trị Hệ Thống',
      department: 'Ban Điều Hành & Quản Trị',
      icon: 'fa-crown',
      badgeBg: 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-800',
      allowedTabs: ['dashboard', 'kpi', 'orders', 'boms', 'pos', 'grns', 'dispatch', 'returns', 'inventory', 'ledger'],
      permissions: ['ALL', 'CREATE_ORDER', 'SUBMIT_BOM', 'VERIFY_BOM', 'CREATE_PO', 'RECEIVE_GRN', 'REGISTER_PICKUP', 'APPROVE_GDN', 'DISPATCH_GDN', 'CREATE_RETURN', 'IMPORT_STOCK', 'RESET_SEED'],
      description: 'Toàn quyền điều hành, phê duyệt, giám sát 10 phân hệ và 3 KPI ISO.'
    },
    THU_KHO: {
      roleKey: 'THU_KHO',
      roleName: 'Thủ Kho (Điện & Đồng)',
      department: 'Bộ Phận Kho Vận & Quản Lý Vật Tư',
      icon: 'fa-warehouse',
      badgeBg: 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-800',
      allowedTabs: ['dashboard', 'inventory', 'boms', 'grns', 'dispatch', 'returns', 'ledger'],
      permissions: ['VERIFY_BOM', 'RECEIVE_GRN', 'APPROVE_GDN', 'DISPATCH_GDN', 'CREATE_RETURN', 'IMPORT_STOCK'],
      description: 'Đối chiếu tồn kho BOM, nhận hàng GRN, duyệt và thực xuất GDN, nhập trả phế phẩm.'
    },
    KY_THUAT: {
      roleKey: 'KY_THUAT',
      roleName: 'Kỹ Sư Thiết Kế / Kỹ Thuật BOM',
      department: 'Phòng Kỹ Thuật & Thiết Kế Điện',
      icon: 'fa-ruler-combined',
      badgeBg: 'bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border-indigo-300 dark:border-indigo-800',
      allowedTabs: ['dashboard', 'orders', 'boms', 'inventory'],
      permissions: ['SUBMIT_BOM'],
      description: 'Bóc tách bản vẽ kỹ thuật, nạp định mức BOM và phân tích delta thiếu hụt vật tư.'
    },
    MUA_HANG: {
      roleKey: 'MUA_HANG',
      roleName: 'Nhân Viên Mua Hàng / Thu Mua',
      department: 'Phòng Thu Mua & Cung Ứng',
      icon: 'fa-cart-shopping',
      badgeBg: 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border-rose-300 dark:border-rose-800',
      allowedTabs: ['dashboard', 'orders', 'boms', 'pos', 'grns', 'inventory'],
      permissions: ['CREATE_PO'],
      description: 'Tạo đơn đặt mua PO theo delta âm của BOM và theo dõi tiến độ giao hàng.'
    },
    SAN_XUAT: {
      roleKey: 'SAN_XUAT',
      roleName: 'Đội Trưởng Lắp Ráp Sản Xuất',
      department: 'Xưởng Sản Xuất & Lắp Ráp Tủ Điện',
      icon: 'fa-helmet-safety',
      badgeBg: 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800',
      allowedTabs: ['dashboard', 'orders', 'dispatch', 'returns', 'inventory'],
      permissions: ['REGISTER_PICKUP', 'CREATE_RETURN'],
      description: 'Đăng ký lấy hàng (PXK-01) phục vụ lắp ráp tủ, nhận vật tư và hoàn trả vật tư thừa/hỏng.'
    },
    SALE_ADMIN: {
      roleKey: 'SALE_ADMIN',
      roleName: 'Kinh Doanh / Sale Admin Dự Án',
      department: 'Phòng Kinh Doanh & Quản Lý Dự Án',
      icon: 'fa-briefcase',
      badgeBg: 'bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 border-sky-300 dark:border-sky-800',
      allowedTabs: ['dashboard', 'orders', 'boms', 'inventory', 'kpi'],
      permissions: ['CREATE_ORDER'],
      description: 'Tạo đơn hàng dự án tủ điện mới và theo dõi tiến độ vòng đời cung ứng.'
    },
    KE_TOAN: {
      roleKey: 'KE_TOAN',
      roleName: 'Kế Toán Kho & Kiểm Toán Nội Bộ',
      department: 'Phòng Kế Toán & Tài Chính',
      icon: 'fa-calculator',
      badgeBg: 'bg-violet-100 dark:bg-violet-950 text-violet-700 dark:text-violet-300 border-violet-300 dark:border-violet-800',
      allowedTabs: ['dashboard', 'kpi', 'orders', 'pos', 'grns', 'dispatch', 'returns', 'inventory', 'ledger'],
      permissions: ['AUDIT_VIEW'],
      description: 'Kiểm toán Sổ cái biến động kho bất biến (Immutable Ledger) và giám sát 3 KPI ISO.'
    }
  },

  NAV_DOMAINS: [
    {
      group: 'Tổng Quan & Giám Sát',
      items: [
        { id: 'dashboard', label: 'Bảng Điều Hành', icon: 'fa-gauge-high' },
        { id: 'kpi', label: 'Đo Lường KPI (3 Chỉ số)', icon: 'fa-chart-pie' }
      ]
    },
    {
      group: 'Đơn Hàng & Kỹ Thuật',
      items: [
        { id: 'orders', label: 'Quản Lý Đơn Hàng & Vòng Đời', icon: 'fa-cubes' },
        { id: 'boms', label: 'BOM & Đối Chiếu Delta', icon: 'fa-list-check' }
      ]
    },
    {
      group: 'Kho Vận & Cung Ứng',
      items: [
        { id: 'pos', label: 'Mua Hàng Bù Thiếu (PO)', icon: 'fa-cart-shopping' },
        { id: 'grns', label: 'Nhập Kho Hàng Về (GRN)', icon: 'fa-truck-ramp-box' },
        { id: 'dispatch', label: 'Đăng Ký & Xuất Kho (PXK-01)', icon: 'fa-dolly' },
        { id: 'returns', label: 'Nhập Trả / Phế Phẩm', icon: 'fa-arrow-rotate-left' }
      ]
    },
    {
      group: 'Tra Cứu & Báo Cáo',
      items: [
        { id: 'inventory', label: 'Tồn Kho & Vị Trí Kệ', icon: 'fa-boxes-stacked' },
        { id: 'ledger', label: 'Sổ Cái Biến Động (Ledger)', icon: 'fa-book-bookmark' }
      ]
    }
  ],

  getRoleConfig: (role) => {
    return window.WMS_CONSTANTS.ROLE_CONFIG[role] || window.WMS_CONSTANTS.ROLE_CONFIG.ADMIN;
  },

  isTabAllowed: (user, tabId) => {
    if (!user) return false;
    if (user.role === 'ADMIN') return true;
    const cfg = window.WMS_CONSTANTS.ROLE_CONFIG[user.role];
    if (!cfg) return true;
    return cfg.allowedTabs.includes(tabId);
  },

  hasPermission: (user, perm) => {
    if (!user) return false;
    if (user.role === 'ADMIN') return true;
    const cfg = window.WMS_CONSTANTS.ROLE_CONFIG[user.role];
    if (!cfg) return false;
    return cfg.permissions.includes('ALL') || cfg.permissions.includes(perm);
  },

  getNavDomainsForRole: (role) => {
    if (!role || role === 'ADMIN') return window.WMS_CONSTANTS.NAV_DOMAINS;
    const cfg = window.WMS_CONSTANTS.ROLE_CONFIG[role];
    if (!cfg) return window.WMS_CONSTANTS.NAV_DOMAINS;

    const allowed = cfg.allowedTabs || [];
    return window.WMS_CONSTANTS.NAV_DOMAINS.map(group => {
      const filteredItems = group.items.filter(item => allowed.includes(item.id));
      return {
        ...group,
        items: filteredItems
      };
    }).filter(group => group.items.length > 0);
  },

  formatMoney: (amount) => {
    return (Number(amount) || 0).toLocaleString('vi-VN') + ' ₫';
  },

  formatNumber: (num) => {
    return (Number(num) || 0).toLocaleString('vi-VN');
  },

  formatDate: (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      const d = new Date(dateStr);
      return isNaN(d.getTime()) ? dateStr : d.toLocaleDateString('vi-VN');
    } catch {
      return dateStr;
    }
  },

  formatDateTime: (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      const d = new Date(dateStr);
      return isNaN(d.getTime()) ? dateStr : d.toLocaleString('vi-VN');
    } catch {
      return dateStr;
    }
  }
};
