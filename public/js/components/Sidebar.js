/*
Fact-Forcing Gate Details:
1. Importers/Callers: public/index.html via <script type="text/babel" src="/js/components/Sidebar.js"></script>
2. Affected API: Desktop Collapsible Sidebar & Mobile Navigation Drawer with RBAC filtering & Logout (window.WMS_COMPONENTS.Sidebar)
3. Data schemas: NAV_DOMAINS (filtered by role), currentUser, setCurrentUser, users, darkMode, setDarkMode, onOpenCommandPalette, onLogout, counts, mobileDrawerOpen, setMobileDrawerOpen, activeTab, setActiveTab, collapsed
4. User's verbatim instruction: "sửa lại toàn bộ giao diện đnăg nahạp cho sáng sủa nhiều hiệu ứng sinh động tương tác và phông chữ sủa lại cho phù hợp với tiếng việt trong các mục và các trang hãy tối ưu hóa toàn bộ chữ khôgn viết dài dòng lan man hãy tập chung vào các ý chính và hãy tôn trong người dùng thiết không dùng icon quê mùa và đặc biệt không dùng phông nền màu đen hoặc trắng hãy mix nhiều màu lại và mang phong cách sáng sủa nhìn vào không biết trang web là ai làm"
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
        className={`hidden md:flex flex-col liquid-glass border-r border-white/40 dark:border-white/10 transition-all duration-300 z-20 select-none font-sans ${
          collapsed ? 'w-18' : 'w-64'
        }`}
        style={{ width: collapsed ? '4.5rem' : '16rem' }}
      >
        {/* User Role Card at Top of Desktop Sidebar */}
        {!collapsed && currentUser && (
          <div className="p-3 border-b border-slate-200/50 dark:border-slate-800/80">
            <div className="p-2.5 rounded-2xl bg-white/60 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 space-y-1.5 shadow-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-sm font-bold flex-shrink-0 border border-indigo-500/20">
                    <i className={`fa-solid ${roleConfig.icon || 'fa-user'}`}></i>
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-slate-900 dark:text-white truncate font-display">
                      {currentUser.fullName}
                    </div>
                    <div className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold font-mono truncate">
                      {roleConfig.roleName || currentUser.role}
                    </div>
                  </div>
                </div>
              </div>
              <div className="text-[9px] text-slate-500 dark:text-slate-400 line-clamp-1 font-mono flex items-center gap-1">
                <i className="fa-solid fa-industry text-[8px] text-indigo-500"></i>
                <span>{roleConfig.department || 'Nhà máy MEVN'}</span>
              </div>
            </div>
          </div>
        )}

        {/* Collapsed Mini Role Icon */}
        {collapsed && currentUser && (
          <div className="p-3 border-b border-slate-200/50 dark:border-slate-800/80 flex justify-center">
            <div
              className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-base border border-indigo-500/20"
              title={`${currentUser.fullName} (${currentUser.role})`}
            >
              <i className={`fa-solid ${roleConfig.icon || 'fa-user'}`}></i>
            </div>
          </div>
        )}

        {/* Navigation Items (Filtered by User Role) */}
        <div className="flex-1 py-3 overflow-y-auto space-y-5">
          {roleNavDomains.map((domain, idx) => (
            <div key={idx} className="px-2.5">
              {!collapsed && (
                <div className="flex items-center justify-between px-2.5 mb-1.5">
                  <h3 className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest font-mono">
                    {domain.group}
                  </h3>
                  <span className="text-[8px] font-mono text-slate-400 bg-white/60 dark:bg-slate-900/60 px-1 py-0.5 rounded border border-slate-200/60 dark:border-slate-800">
                    0{idx+1}
                  </span>
                </div>
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
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all group relative cursor-pointer active:scale-98 ${
                        isActive
                          ? 'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white shadow-md shadow-indigo-500/25'
                          : 'text-slate-600 dark:text-slate-300 hover:bg-white/80 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-white'
                      } ${collapsed ? 'justify-center' : ''}`}
                    >
                      <div className="flex items-center gap-2.5">
                        <i
                          className={`fa-solid ${item.icon} text-sm w-4 text-center transition-transform group-hover:scale-110 ${
                            isActive ? 'text-white' : 'text-slate-400 group-hover:text-indigo-500'
                          }`}
                        ></i>
                        {!collapsed && <span className="truncate">{item.label}</span>}
                      </div>

                      {!collapsed && badgeCount > 0 && (
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-bold font-mono transition ${
                            isActive
                              ? 'bg-white/20 text-white'
                              : item.id === 'pos'
                              ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 border border-rose-200 dark:border-rose-900'
                              : item.id === 'dispatch'
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900'
                              : 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-900'
                          }`}
                        >
                          {badgeCount}
                        </span>
                      )}

                      {collapsed && badgeCount > 0 && (
                        <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-indigo-500 ring-2 ring-white dark:ring-slate-950"></span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Desktop Footer Actions: Logout & Version Info */}
        <div className="p-3 border-t border-slate-200/50 dark:border-slate-800/80 space-y-2">
          {onLogout && !collapsed && (
            <button
              onClick={onLogout}
              className="w-full flex items-center justify-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 border border-rose-500/20 transition font-mono cursor-pointer active:scale-95"
              title="Đăng xuất khỏi phiên làm việc"
            >
              <i className="fa-solid fa-arrow-right-from-bracket text-xs"></i>
              <span>ĐĂNG XUẤT</span>
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

          {!collapsed && (
            <div className="bg-white/60 dark:bg-slate-900/60 p-2 rounded-xl border border-slate-200/80 dark:border-slate-800 text-[10px] text-slate-500 dark:text-slate-400 flex items-center justify-between font-mono">
              <span className="flex items-center gap-1">
                <i className="fa-solid fa-shield-halved text-indigo-500"></i>
                <span className="font-bold">ISO 9001</span>
              </span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">
                PRO 2026
              </span>
            </div>
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
          <div className="relative w-80 max-w-[85vw] h-full liquid-glass border-r border-white/40 dark:border-white/10 shadow-2xl flex flex-col z-10 animate-slide-in-left overflow-hidden">
            {/* Safe Area Inset Top Spacer */}
            <div className="h-[env(safe-area-inset-top,0px)]"></div>

            {/* Drawer Header */}
            <div className="p-4 border-b border-slate-200/50 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center font-bold text-sm text-white border border-white/30 font-display">
                  ME
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold tracking-tight text-slate-900 dark:text-white font-display">
                      MAX ELECTRIC
                    </span>
                    <span className="text-[8px] uppercase font-bold tracking-wider bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 px-1 py-0.5 rounded border border-indigo-500/20 font-mono">
                      WMS
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
                className="w-7 h-7 rounded-xl bg-white/60 dark:bg-slate-900/60 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center justify-center border border-slate-200/80 dark:border-slate-800 cursor-pointer active:scale-95"
                title="Đóng menu"
              >
                <i className="fa-solid fa-xmark text-xs"></i>
              </button>
            </div>

            {/* Current User Card inside Drawer */}
            {currentUser && (
              <div className="p-3 mx-3 mt-3 rounded-2xl bg-white/60 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 space-y-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-sm font-bold flex-shrink-0 border border-indigo-500/20">
                    <i className={`fa-solid ${roleConfig.icon || 'fa-user'}`}></i>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-bold text-slate-900 dark:text-white truncate font-display">
                      {currentUser.fullName}
                    </div>
                    <div className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold font-mono truncate">
                      {roleConfig.roleName || currentUser.role}
                    </div>
                  </div>
                </div>

                {/* Quick Role Selection Dropdown */}
                {users && users.length > 0 && setCurrentUser && (
                  <select
                    value={currentUser.id || ''}
                    onChange={e => {
                      const user = users.find(u => u.id === e.target.value);
                      if (user) setCurrentUser(user);
                    }}
                    className="w-full bg-white dark:bg-slate-950 px-2.5 py-1.5 border border-slate-200/80 dark:border-slate-800 rounded-xl text-[11px] font-mono font-bold text-slate-800 dark:text-slate-200 focus:outline-none"
                  >
                    {users.map(u => (
                      <option key={u.id} value={u.id}>
                        {u.fullName} ({u.role})
                      </option>
                    ))}
                  </select>
                )}
              </div>
            )}

            {/* Navigation Domains List (Filtered by Role) */}
            <div className="flex-1 py-3 px-3 overflow-y-auto space-y-4">
              {roleNavDomains.map((domain, idx) => (
                <div key={idx} className="space-y-1">
                  <h3 className="px-2 text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest font-mono">
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
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer active:scale-98 ${
                            isActive
                              ? 'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white shadow-md shadow-indigo-500/25'
                              : 'text-slate-700 dark:text-slate-200 hover:bg-white/60 dark:hover:bg-slate-800/60'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <i
                              className={`fa-solid ${item.icon} text-sm w-4 text-center ${
                                isActive ? 'text-white' : 'text-slate-400'
                              }`}
                            ></i>
                            <span>{item.label}</span>
                          </div>

                          {badgeCount > 0 && (
                            <span
                              className={`px-1.5 py-0.5 rounded text-[10px] font-bold font-mono ${
                                isActive
                                  ? 'bg-white/20 text-white'
                                  : item.id === 'pos'
                                  ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                                  : item.id === 'dispatch'
                                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                                  : 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
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
            <div className="p-3 border-t border-slate-200/50 dark:border-slate-800 space-y-2 bg-white/40 dark:bg-slate-900/40">
              {/* Logout Button */}
              {onLogout && (
                <button
                  onClick={() => {
                    setMobileDrawerOpen(false);
                    onLogout();
                  }}
                  className="w-full px-3 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 rounded-xl text-xs font-bold font-mono flex items-center justify-center gap-2 border border-rose-500/20 cursor-pointer active:scale-95"
                >
                  <i className="fa-solid fa-arrow-right-from-bracket"></i>
                  <span>ĐĂNG XUẤT</span>
                </button>
              )}

              {/* Quick Search Shortcut */}
              {onOpenCommandPalette && (
                <button
                  onClick={() => {
                    setMobileDrawerOpen(false);
                    onOpenCommandPalette();
                  }}
                  className="w-full px-3 py-2 bg-white/60 dark:bg-slate-950/60 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold flex items-center justify-between border border-slate-200/80 dark:border-slate-800 cursor-pointer active:scale-95"
                >
                  <span className="flex items-center gap-2">
                    <i className="fa-solid fa-magnifying-glass text-indigo-500"></i>
                    <span>Tìm kiếm nhanh</span>
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">Ctrl+K</span>
                </button>
              )}

              {/* Theme Toggle in Drawer */}
              {setDarkMode && (
                <button
                  onClick={() => setDarkMode(!darkMode)}
                  className="w-full px-3 py-2 bg-white/60 dark:bg-slate-950/60 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold flex items-center justify-between border border-slate-200/80 dark:border-slate-800 cursor-pointer active:scale-95"
                >
                  <span className="flex items-center gap-2">
                    <i className={`fa-solid ${darkMode ? 'fa-sun text-amber-400' : 'fa-moon text-indigo-500'}`}></i>
                    <span>{darkMode ? 'Giao diện Sáng' : 'Giao diện Tối'}</span>
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    {darkMode ? 'Light' : 'Dark'}
                  </span>
                </button>
              )}

              {/* ISO 9001:2015 Badge */}
              <div className="px-2 py-1 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                <span className="flex items-center gap-1 font-bold text-emerald-600 dark:text-emerald-400">
                  <i className="fa-solid fa-shield-halved"></i>
                  ISO 9001:2015
                </span>
                <span>v2.6 Enterprise</span>
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
