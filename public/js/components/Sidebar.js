/**
 * Fact-Forcing Gate Details:
 * 1. Importers/Callers: public/index.html via <script type="text/babel" src="/js/components/Sidebar.js"></script> and public/js/app.js
 * 2. Affected API: Desktop Collapsible Sidebar & Mobile Navigation Drawer with Seamless Typography (window.WMS_COMPONENTS.Sidebar)
 * 3. Data schemas: NAV_DOMAINS (filtered by role), currentUser, setCurrentUser, users, onOpenCommandPalette, onLogout, counts, mobileDrawerOpen, setMobileDrawerOpen, activeTab, setActiveTab, collapsed
 * 4. User's verbatim instruction: "bỏ phần chuyển đổi tài khoản 1click bỏ đi và sửa lại vị trí của MAX ELECTRIC đang bị lệch"
 */

function Sidebar({
  activeTab,
  setActiveTab,
  collapsed,
  counts = {},
  mobileDrawerOpen,
  setMobileDrawerOpen,
  currentUser,
  setCurrentUser,
  users = [],
  onOpenCommandPalette,
  onLogout
}) {
  const { getNavDomainsForRole, getRoleConfig } = window.WMS_CONSTANTS || {
    getNavDomainsForRole: () => [],
    getRoleConfig: () => ({})
  };

  const roleNavDomains = getNavDomainsForRole(currentUser?.role);
  const roleConfig = getRoleConfig(currentUser?.role);

  const handleSelectTab = (tabId) => {
    setActiveTab(tabId);
    if (setMobileDrawerOpen) {
      setMobileDrawerOpen(false);
    }
  };

  const getRoleBadgeStyle = (role) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30';
      case 'THU_KHO':
        return 'bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border-cyan-500/30';
      case 'KY_THUAT':
        return 'bg-teal-500/15 text-teal-700 dark:text-teal-300 border-teal-500/30';
      case 'KE_TOAN':
        return 'bg-sky-500/15 text-sky-700 dark:text-sky-300 border-sky-500/30';
      case 'MUA_HANG':
        return 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30';
      case 'SAN_XUAT':
        return 'bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30';
      default:
        return 'bg-slate-500/15 text-slate-700 dark:text-slate-300 border-slate-500/30';
    }
  };

  return (
    <React.Fragment>
      {/* 1. Desktop Multi-tier Collapsible Sidebar (Independent Scroll Pane) */}
      <aside
        className={`hidden md:flex flex-col pane-sidebar liquid-glass border-r border-cyan-500/20 transition-all duration-300 z-20 select-none font-sans ${
          collapsed ? 'w-18' : 'w-64'
        }`}
        style={{ width: collapsed ? '4.5rem' : '16rem' }}
      >
        {/* User Role Card at Top of Desktop Sidebar */}
        {!collapsed && currentUser && (
          <div className="p-3 border-b border-cyan-500/20 shrink-0">
            <div className="p-2.5 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-cyan-500/25 space-y-1.5 shadow-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-400 via-teal-400 to-emerald-400 text-slate-950 flex items-center justify-center text-xs font-bold shrink-0 shadow-xs">
                    <i className={`fa-solid ${roleConfig.icon || 'fa-user-tie'}`}></i>
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-slate-900 dark:text-white truncate font-display">
                      {currentUser.fullName}
                    </div>
                    <div className="text-[11px] text-cyan-700 dark:text-cyan-300 font-semibold truncate">
                      {roleConfig.roleName || currentUser.role}
                    </div>
                  </div>
                </div>
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1 flex items-center gap-1 font-medium">
                <i className="fa-solid fa-industry text-[9px] text-teal-500"></i>
                <span>{roleConfig.department || 'Nhà máy MEVN'}</span>
              </div>
            </div>
          </div>
        )}

        {/* Collapsed Mini Role Icon */}
        {collapsed && currentUser && (
          <div className="p-3 border-b border-cyan-500/20 flex justify-center shrink-0">
            <div
              className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-400 via-teal-400 to-emerald-400 text-slate-950 flex items-center justify-center text-sm shadow-xs"
              title={`${currentUser.fullName} (${currentUser.role})`}
            >
              <i className={`fa-solid ${roleConfig.icon || 'fa-user-tie'}`}></i>
            </div>
          </div>
        )}

        {/* Navigation Items (Filtered by User Role) - Independent Scroll Body */}
        <div className="flex-1 py-2 overflow-y-auto space-y-3 custom-scrollbar">
          {roleNavDomains.map((domain, idx) => (
            <div key={idx} className="px-2.5 space-y-1">
              {!collapsed && (
                <div className="px-3 pt-2 pb-1 border-b border-cyan-500/10">
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 tracking-normal uppercase font-display">
                    {domain.group}
                  </span>
                </div>
              )}
              <div className="space-y-0.5">
                {domain.items.map(item => {
                  const isActive = activeTab === item.id;
                  const badgeCount = counts[item.id] || 0;

                  return (
                    <button
                      key={item.id}
                      onClick={() => handleSelectTab(item.id)}
                      title={collapsed ? item.label : undefined}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all group relative cursor-pointer active:scale-98 ${
                        isActive
                          ? 'bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-500 text-slate-950 shadow-md shadow-cyan-500/25 font-bold'
                          : 'text-slate-700 dark:text-slate-200 hover:bg-white/80 dark:hover:bg-slate-800/80 hover:text-cyan-700 dark:hover:text-cyan-300'
                      } ${collapsed ? 'justify-center' : ''}`}
                    >
                      <div className="flex items-center gap-2.5">
                        <i
                          className={`fa-solid ${item.icon} text-xs w-4 text-center transition-transform group-hover:scale-110 ${
                            isActive
                              ? 'text-slate-950 font-bold'
                              : 'text-slate-400 group-hover:text-cyan-500'
                          }`}
                        ></i>
                        {!collapsed && <span className="truncate tracking-normal text-[12px]">{item.label}</span>}
                      </div>

                      {!collapsed && badgeCount > 0 && (
                        <span
                          className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold transition ${
                            isActive
                              ? 'bg-slate-950/20 text-slate-950'
                              : item.id === 'pos'
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                              : item.id === 'dispatch'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                              : 'bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300 border border-cyan-300 dark:border-cyan-800'
                          }`}
                        >
                          {badgeCount}
                        </span>
                      )}

                      {collapsed && badgeCount > 0 && (
                        <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-cyan-500 ring-2 ring-white dark:ring-slate-950"></span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Desktop Footer Actions: Logout */}
        <div className="p-3 border-t border-cyan-500/20 space-y-2 shrink-0">
          {onLogout && !collapsed && (
            <button
              onClick={onLogout}
              className="w-full flex items-center justify-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 border border-rose-500/20 transition cursor-pointer active:scale-95"
              title="Đăng xuất khỏi phiên làm việc"
            >
              <i className="fa-solid fa-arrow-right-from-bracket text-xs"></i>
              <span>Đăng xuất</span>
            </button>
          )}

          {onLogout && collapsed && (
            <button
              onClick={onLogout}
              className="w-full flex items-center justify-center p-2 rounded-xl text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 border border-rose-500/20 transition cursor-pointer active:scale-95"
              title="Đăng xuất"
            >
              <i className="fa-solid fa-arrow-right-from-bracket text-sm"></i>
            </button>
          )}
        </div>
      </aside>

      {/* 2. Mobile Slide-Over Navigation Drawer (Visible on Mobile < 768px when Opened) */}
      {mobileDrawerOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex select-none font-sans">
          {/* Backdrop Blur Overlay: Tap to Close */}
          <div
            onClick={() => setMobileDrawerOpen(false)}
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-md transition-opacity duration-300 animate-fade-in"
          ></div>

          {/* Drawer Slide-in Panel from Left */}
          <div className="relative w-80 max-w-[85vw] h-full liquid-glass border-r border-cyan-500/20 shadow-2xl flex flex-col z-10 animate-slide-in-left overflow-hidden">
            {/* Safe Area Inset Top Spacer */}
            <div className="h-[env(safe-area-inset-top,0px)]"></div>

            {/* Drawer Header */}
            <div className="p-4 border-b border-cyan-500/20 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-400 via-teal-400 to-emerald-400 flex items-center justify-center font-bold text-sm text-slate-950 border border-white/40 font-display shadow-xs shrink-0">
                  ME
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs sm:text-sm font-bold tracking-normal text-slate-900 dark:text-white font-display">
                    MAX ELECTRIC
                  </span>
                  <span className="text-[9px] uppercase font-bold bg-gradient-to-r from-cyan-500/15 to-emerald-500/15 text-cyan-700 dark:text-cyan-300 px-1.5 py-0.5 rounded border border-cyan-500/25">
                    WMS
                  </span>
                </div>
              </div>

              {/* Close Button X */}
              <button
                onClick={() => setMobileDrawerOpen(false)}
                className="w-7 h-7 rounded-xl bg-white/80 dark:bg-slate-900/80 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center justify-center border border-cyan-500/20 cursor-pointer active:scale-95"
                title="Đóng menu"
              >
                <i className="fa-solid fa-xmark text-xs"></i>
              </button>
            </div>

            {/* Current User Card inside Drawer */}
            {currentUser && (
              <div className="p-3 mx-3 mt-3 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-cyan-500/25 space-y-2 shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-400 via-teal-400 to-emerald-400 text-slate-950 flex items-center justify-center text-xs font-bold shrink-0 shadow-xs">
                    <i className={`fa-solid ${roleConfig.icon || 'fa-user-tie'}`}></i>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-bold text-slate-900 dark:text-white truncate font-display">
                      {currentUser.fullName}
                    </div>
                    <div className="text-[11px] text-cyan-700 dark:text-cyan-300 font-semibold truncate">
                      {roleConfig.roleName || currentUser.role}
                    </div>
                  </div>
                  <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold border ${getRoleBadgeStyle(currentUser.role)}`}>
                    {currentUser.role}
                  </span>
                </div>
              </div>
            )}

            {/* Navigation Domains List (Filtered by Role) - Scrollable */}
            <div className="flex-1 py-2 px-3 overflow-y-auto space-y-3 custom-scrollbar">
              {roleNavDomains.map((domain, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="px-2 pt-1 pb-0.5 border-b border-cyan-500/10">
                    <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 tracking-normal uppercase font-display">
                      {domain.group}
                    </span>
                  </div>
                  <div className="space-y-0.5">
                    {domain.items.map(item => {
                      const isActive = activeTab === item.id;
                      const badgeCount = counts[item.id] || 0;

                      return (
                        <button
                          key={item.id}
                          onClick={() => handleSelectTab(item.id)}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer active:scale-98 ${
                            isActive
                              ? 'bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-500 text-slate-950 font-bold shadow-sm'
                              : 'text-slate-700 dark:text-slate-200 hover:bg-white/80 dark:hover:bg-slate-800/80 font-medium'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <i
                              className={`fa-solid ${item.icon} text-xs w-4 text-center ${
                                isActive ? 'text-slate-950 font-bold' : 'text-slate-400'
                              }`}
                            ></i>
                            <span className="tracking-normal">{item.label}</span>
                          </div>

                          {badgeCount > 0 && (
                            <span
                              className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                                isActive
                                  ? 'bg-slate-950/20 text-slate-950'
                                  : item.id === 'pos'
                                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                                  : item.id === 'dispatch'
                                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                  : 'bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300'
                              }`}
                            >
                              {badgeCount}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Drawer Bottom Actions & Footer */}
            <div className="p-3 border-t border-cyan-500/20 space-y-2 bg-white/50 dark:bg-slate-900/50 shrink-0">
              {/* Logout Button */}
              {onLogout && (
                <button
                  onClick={() => {
                    setMobileDrawerOpen(false);
                    onLogout();
                  }}
                  className="w-full px-3 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 border border-rose-500/20 cursor-pointer active:scale-95"
                >
                  <i className="fa-solid fa-arrow-right-from-bracket"></i>
                  <span>Đăng xuất</span>
                </button>
              )}

              {/* Quick Search Shortcut */}
              {onOpenCommandPalette && (
                <button
                  onClick={() => {
                    setMobileDrawerOpen(false);
                    onOpenCommandPalette();
                  }}
                  className="w-full px-3 py-2 bg-white/80 dark:bg-slate-950/80 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold flex items-center justify-between border border-cyan-500/20 cursor-pointer active:scale-95"
                >
                  <span className="flex items-center gap-2">
                    <i className="fa-solid fa-magnifying-glass text-cyan-500"></i>
                    <span>Tìm kiếm nhanh</span>
                  </span>
                  <span className="text-[11px] font-medium text-slate-400">Ctrl+K</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </React.Fragment>
  );
}

window.WMS_COMPONENTS = window.WMS_COMPONENTS || {};
window.WMS_COMPONENTS.Sidebar = Sidebar;
