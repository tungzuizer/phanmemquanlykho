/*
Fact-Forcing Gate Info:
1. Importers/Callers: public/index.html via <script type="text/babel" src="/js/components/Sidebar.js"></script>
2. Affected API: iOS 26 Liquid Glass Desktop Collapsible Sidebar & Mobile Navigation Drawer with RBAC filtering & Logout
3. Data schemas: NAV_DOMAINS (filtered by role), currentUser, onLogout, counts, mobileDrawerOpen, setMobileDrawerOpen
4. User verbatim: "cần bạn tách các dự liệu tài khoản và phân luồng các tài khoản và có phần đăng nhập"
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
  darkMode,
  setDarkMode,
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

  return (
    <React.Fragment>
      {/* 1. Desktop Multi-tier Collapsible Sidebar (Visible on Desktop >= 768px) */}
      <aside
        className={`hidden md:flex flex-col bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-r border-slate-200/80 dark:border-slate-800 transition-all duration-300 z-20 select-none liquid-specular ${
          collapsed ? 'w-18' : 'w-64'
        }`}
        style={{ width: collapsed ? '4.5rem' : '16rem' }}
      >
        {/* User Role Card at Top of Desktop Sidebar */}
        {!collapsed && currentUser && (
          <div className="p-3 border-b border-slate-100 dark:border-slate-800/80">
            <div className="p-2.5 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100/80 dark:from-slate-800/60 dark:to-slate-900/60 border border-slate-200/70 dark:border-slate-700/60 space-y-1.5 shadow-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-blue-600/10 dark:bg-blue-400/10 text-blue-600 dark:text-blue-400 flex items-center justify-center text-sm font-black flex-shrink-0">
                    <i className={`fa-solid ${roleConfig.icon || 'fa-user'}`}></i>
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-black text-slate-900 dark:text-white truncate">
                      {currentUser.fullName}
                    </div>
                    <div className="text-[10px] text-blue-600 dark:text-blue-400 font-bold truncate">
                      {roleConfig.roleName || currentUser.role}
                    </div>
                  </div>
                </div>
              </div>
              <div className="text-[9px] text-slate-500 dark:text-slate-400 line-clamp-1">
                {roleConfig.department || 'Nhà máy Sản xuất Tủ điện MEVN'}
              </div>
            </div>
          </div>
        )}

        {/* Collapsed Mini Role Icon */}
        {collapsed && currentUser && (
          <div className="p-3 border-b border-slate-100 dark:border-slate-800/80 flex justify-center">
            <div
              className="w-10 h-10 rounded-2xl bg-blue-600/10 dark:bg-blue-400/10 text-blue-600 dark:text-blue-400 flex items-center justify-center text-base"
              title={`${currentUser.fullName} (${currentUser.role})`}
            >
              <i className={`fa-solid ${roleConfig.icon || 'fa-user'}`}></i>
            </div>
          </div>
        )}

        {/* Navigation Items (Filtered by User Role) */}
        <div className="flex-1 py-4 overflow-y-auto space-y-6">
          {roleNavDomains.map((domain, idx) => (
            <div key={idx} className="px-3">
              {!collapsed && (
                <h3 className="px-3 mb-2 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  {domain.group}
                </h3>
              )}
              <div className="space-y-1">
                {domain.items.map(item => {
                  const isActive = activeTab === item.id;
                  const badgeCount = counts[item.id] || 0;

                  return (
                    <button
                      key={item.id}
                      onClick={() => handleSelectTab(item.id)}
                      title={collapsed ? item.label : undefined}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-2xl text-xs font-bold transition-all group relative liquid-touch ${
                        isActive
                          ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                          : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100/80 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-white'
                      } ${collapsed ? 'justify-center' : ''}`}
                    >
                      <div className="flex items-center gap-3">
                        <i
                          className={`fa-solid ${item.icon} text-sm transition-transform group-hover:scale-110 ${
                            isActive ? 'text-white' : 'text-slate-400 group-hover:text-blue-500'
                          }`}
                        ></i>
                        {!collapsed && <span className="truncate">{item.label}</span>}
                      </div>

                      {!collapsed && badgeCount > 0 && (
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold font-mono transition ${
                            isActive
                              ? 'bg-white/20 text-white'
                              : item.id === 'pos'
                              ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300 border border-red-200 dark:border-red-900'
                              : item.id === 'dispatch'
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900'
                              : 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-900'
                          }`}
                        >
                          {badgeCount}
                        </span>
                      )}

                      {collapsed && badgeCount > 0 && (
                        <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-blue-500 ring-2 ring-white dark:ring-slate-900"></span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Desktop Footer Actions: Logout & Version Info */}
        <div className="p-3 border-t border-slate-100 dark:border-slate-800/80 space-y-2">
          {onLogout && !collapsed && (
            <button
              onClick={onLogout}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-2xl text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 border border-red-200/60 dark:border-red-900/60 liquid-touch transition"
              title="Đăng xuất khỏi phiên làm việc"
            >
              <i className="fa-solid fa-arrow-right-from-bracket text-xs"></i>
              <span>Đăng xuất</span>
            </button>
          )}

          {onLogout && collapsed && (
            <button
              onClick={onLogout}
              className="w-full flex items-center justify-center p-2.5 rounded-2xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 border border-red-200/60 dark:border-red-900/60 liquid-touch transition"
              title="Đăng xuất"
            >
              <i className="fa-solid fa-arrow-right-from-bracket text-sm"></i>
            </button>
          )}

          {!collapsed && (
            <div className="bg-slate-100/80 dark:bg-slate-800/50 p-2.5 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <i className="fa-solid fa-shield-halved text-blue-500"></i>
                <span className="font-bold">ISO 9001:2015</span>
              </span>
              <span className="font-mono text-[10px] font-black bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-lg border border-blue-200 dark:border-blue-800">
                v2.6
              </span>
            </div>
          )}
        </div>
      </aside>

      {/* 2. Mobile Slide-Over Navigation Drawer (Visible on Mobile < 768px when Opened) */}
      {mobileDrawerOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex select-none">
          {/* Backdrop Blur Overlay: Tap to Close */}
          <div
            onClick={() => setMobileDrawerOpen(false)}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-md transition-opacity duration-300 animate-fade-in"
          ></div>

          {/* Drawer Slide-in Panel from Left */}
          <div className="relative w-80 max-w-[85vw] h-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border-r border-white/80 dark:border-white/10 shadow-2xl flex flex-col z-10 animate-slide-in-left overflow-hidden">
            {/* Safe Area Inset Top Spacer */}
            <div className="h-[env(safe-area-inset-top,0px)]"></div>

            {/* Drawer Header */}
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 flex items-center justify-center font-black text-base shadow-md shadow-blue-500/25 text-white border border-white/40">
                  ME
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-black tracking-tight text-slate-900 dark:text-white">
                      MAX ELECTRIC
                    </span>
                    <span className="text-[8px] uppercase font-black tracking-wider bg-blue-500/15 text-blue-600 dark:text-blue-400 px-1.5 py-0.5 rounded-full border border-blue-500/25">
                      WMS 26
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">
                    Kho & Cung Ứng Chuẩn ISO
                  </p>
                </div>
              </div>

              {/* Close Button X */}
              <button
                onClick={() => setMobileDrawerOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center justify-center liquid-touch border border-slate-200/80 dark:border-slate-700/80"
                title="Đóng menu"
              >
                <i className="fa-solid fa-xmark text-sm"></i>
              </button>
            </div>

            {/* Current User Card inside Drawer */}
            {currentUser && (
              <div className="p-3 mx-3 mt-3 rounded-2xl bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 space-y-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-blue-600/15 dark:bg-blue-400/15 text-blue-600 dark:text-blue-400 flex items-center justify-center text-sm font-black flex-shrink-0">
                    <i className={`fa-solid ${roleConfig.icon || 'fa-user'}`}></i>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-black text-slate-900 dark:text-white truncate">
                      {currentUser.fullName}
                    </div>
                    <div className="text-[10px] text-blue-600 dark:text-blue-400 font-bold truncate">
                      {roleConfig.roleName || currentUser.role}
                    </div>
                  </div>
                </div>

                {/* Quick Role Selection Dropdown (Only for Testing/Admin) */}
                {users && users.length > 0 && setCurrentUser && (
                  <select
                    value={currentUser.id || ''}
                    onChange={e => {
                      const user = users.find(u => u.id === e.target.value);
                      if (user) setCurrentUser(user);
                    }}
                    className="w-full bg-white dark:bg-slate-900 px-2.5 py-1.5 border border-slate-200 dark:border-slate-700 rounded-xl text-[11px] font-bold text-slate-800 dark:text-slate-200 focus:outline-none"
                  >
                    {users.map(u => (
                      <option key={u.id} value={u.id}>
                        Chuyển tài khoản: {u.fullName} ({u.role})
                      </option>
                    ))}
                  </select>
                )}
              </div>
            )}

            {/* Navigation Domains List (Filtered by Role) */}
            <div className="flex-1 py-3 px-3 overflow-y-auto space-y-5">
              {roleNavDomains.map((domain, idx) => (
                <div key={idx} className="space-y-1.5">
                  <h3 className="px-2 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                    {domain.group}
                  </h3>
                  <div className="space-y-1">
                    {domain.items.map(item => {
                      const isActive = activeTab === item.id;
                      const badgeCount = counts[item.id] || 0;

                      return (
                        <button
                          key={item.id}
                          onClick={() => handleSelectTab(item.id)}
                          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-2xl text-xs font-bold transition-all liquid-touch ${
                            isActive
                              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                              : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100/80 dark:hover:bg-slate-800/80'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <i
                              className={`fa-solid ${item.icon} text-sm ${
                                isActive ? 'text-white' : 'text-slate-400'
                              }`}
                            ></i>
                            <span>{item.label}</span>
                          </div>

                          {badgeCount > 0 && (
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold font-mono ${
                                isActive
                                  ? 'bg-white/20 text-white'
                                  : item.id === 'pos'
                                  ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300'
                                  : item.id === 'dispatch'
                                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                                  : 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
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
            <div className="p-3 border-t border-slate-100 dark:border-slate-800 space-y-2.5 bg-slate-50/50 dark:bg-slate-900/50">
              {/* Logout Button */}
              {onLogout && (
                <button
                  onClick={() => {
                    setMobileDrawerOpen(false);
                    onLogout();
                  }}
                  className="w-full px-3 py-2 bg-red-50 dark:bg-red-950/50 hover:bg-red-100 text-red-600 dark:text-red-400 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 border border-red-200 dark:border-red-900 liquid-touch"
                >
                  <i className="fa-solid fa-arrow-right-from-bracket"></i>
                  <span>Đăng xuất tài khoản</span>
                </button>
              )}

              {/* Quick Search Shortcut */}
              {onOpenCommandPalette && (
                <button
                  onClick={() => {
                    setMobileDrawerOpen(false);
                    onOpenCommandPalette();
                  }}
                  className="w-full px-3 py-2 bg-slate-100/80 dark:bg-slate-800/80 hover:bg-slate-200 text-slate-700 dark:text-slate-200 rounded-2xl text-xs font-bold flex items-center justify-between border border-slate-200/80 dark:border-slate-700/80 liquid-touch"
                >
                  <span className="flex items-center gap-2">
                    <i className="fa-solid fa-magnifying-glass text-blue-500"></i>
                    <span>Tìm kiếm nhanh</span>
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">Ctrl+K</span>
                </button>
              )}

              {/* Theme Toggle in Drawer */}
              {setDarkMode && (
                <button
                  onClick={() => setDarkMode(!darkMode)}
                  className="w-full px-3 py-2 bg-slate-100/80 dark:bg-slate-800/80 hover:bg-slate-200 text-slate-700 dark:text-slate-200 rounded-2xl text-xs font-bold flex items-center justify-between border border-slate-200/80 dark:border-slate-700/80 liquid-touch"
                >
                  <span className="flex items-center gap-2">
                    <i className={`fa-solid ${darkMode ? 'fa-sun text-amber-400' : 'fa-moon text-blue-500'}`}></i>
                    <span>{darkMode ? 'Giao diện Sáng' : 'Giao diện Tối'}</span>
                  </span>
                  <span className="text-[10px] text-slate-400 font-normal">
                    {darkMode ? 'Light Mode' : 'Dark Mode'}
                  </span>
                </button>
              )}

              {/* ISO 9001:2015 Badge */}
              <div className="px-3 py-1.5 flex items-center justify-between text-[10px] text-slate-400">
                <span className="flex items-center gap-1.5 font-bold">
                  <i className="fa-solid fa-shield-halved text-emerald-500"></i>
                  ISO 9001:2015 Audit
                </span>
                <span className="font-mono">v2.6 Enterprise</span>
              </div>

              {/* Safe Area Inset Bottom Spacer for Home Bar */}
              <div className="h-[env(safe-area-inset-bottom,0px)]"></div>
            </div>
          </div>
        </div>
      )}
    </React.Fragment>
  );
}

window.WMS_COMPONENTS = window.WMS_COMPONENTS || {};
window.WMS_COMPONENTS.Sidebar = Sidebar;
