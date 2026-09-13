/**
 * Fact-Forcing Gate Details:
 * 1. Importers/Callers: public/index.html via <script type="text/babel" src="/js/components/Sidebar.js"></script> and public/js/app.js
 * 2. Affected API: Desktop Collapsible Sidebar & Mobile Navigation Drawer with Independent Scrolling (window.WMS_COMPONENTS.Sidebar)
 * 3. Data schemas: NAV_DOMAINS (filtered by role), currentUser, setCurrentUser, users, onOpenCommandPalette, onLogout, counts, mobileDrawerOpen, setMobileDrawerOpen, activeTab, setActiveTab, collapsed
 * 4. User's verbatim instruction: "giao diện máy tính tôi nhìn đang quá rối mắt nền thì trắng hoa mắt chữ thì lan man không rõ rằng chữ thì cách nhau mấy cái không cần thiết như server0ms hay chế độ sáng tối ios9001 pro2026 , vân vân quá loạn và lan mang giao diện thì trắng đen quá xấu và đơn sắc hãy mix nhiều màu với nhau và cần thật sáng sủa và tách menu và trang ra làm 2 bên độc lập có thẻ vuốt lên xuống độc lập và cấm dùng màu tím hồng trắng đen sửa lại giao diện sáng sủa nhiều màu mix và cả phông nền ở đằng sau"
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
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500/20 to-teal-500/20 text-cyan-700 dark:text-cyan-300 flex items-center justify-center text-sm font-bold shrink-0 border border-cyan-500/30">
                    <i className={`fa-solid ${roleConfig.icon || 'fa-user-tie'}`}></i>
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-slate-900 dark:text-white truncate font-display">
                      {currentUser.fullName}
                    </div>
                    <div className="text-[10px] text-cyan-700 dark:text-cyan-300 font-bold font-mono truncate">
                      {roleConfig.roleName || currentUser.role}
                    </div>
                  </div>
                </div>
              </div>
              <div className="text-[9px] text-slate-500 dark:text-slate-400 line-clamp-1 font-mono flex items-center gap-1">
                <i className="fa-solid fa-industry text-[8px] text-teal-500"></i>
                <span>{roleConfig.department || 'Nhà máy MEVN'}</span>
              </div>
            </div>
          </div>
        )}

        {/* Collapsed Mini Role Icon */}
        {collapsed && currentUser && (
          <div className="p-3 border-b border-cyan-500/20 flex justify-center shrink-0">
            <div
              className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500/20 to-teal-500/20 text-cyan-700 dark:text-cyan-300 flex items-center justify-center text-base border border-cyan-500/30 shadow-xs"
              title={`${currentUser.fullName} (${currentUser.role})`}
            >
              <i className={`fa-solid ${roleConfig.icon || 'fa-user-tie'}`}></i>
            </div>
          </div>
        )}

        {/* Navigation Items (Filtered by User Role) - Independent Scroll Body */}
        <div className="flex-1 py-3 overflow-y-auto space-y-4">
          {roleNavDomains.map((domain, idx) => (
            <div key={idx} className="px-2.5">
              {!collapsed && (
                <div className="flex items-center justify-between px-2.5 mb-1.5">
                  <h3 className="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest font-mono">
                    {domain.group}
                  </h3>
                  <span className="text-[8px] font-mono text-cyan-700 dark:text-cyan-300 bg-cyan-500/10 px-1 py-0.5 rounded border border-cyan-500/20">
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
                          ? 'bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-500 text-slate-950 shadow-md shadow-cyan-500/20 font-extrabold'
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
                        {!collapsed && <span className="truncate">{item.label}</span>}
                      </div>

                      {!collapsed && badgeCount > 0 && (
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-bold font-mono transition ${
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
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-400 via-teal-400 to-emerald-400 flex items-center justify-center font-bold text-sm text-slate-950 border border-white/40 font-display">
                  ME
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold tracking-tight text-slate-900 dark:text-white font-display">
                      MAX ELECTRIC
                    </span>
                    <span className="text-[8px] uppercase font-bold tracking-wider bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 px-1 py-0.5 rounded border border-cyan-500/25 font-mono">
                      WMS
                    </span>
                  </div>
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
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500/20 to-teal-500/20 text-cyan-700 dark:text-cyan-300 flex items-center justify-center text-sm font-bold shrink-0 border border-cyan-500/30">
                    <i className={`fa-solid ${roleConfig.icon || 'fa-user-tie'}`}></i>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-bold text-slate-900 dark:text-white truncate font-display">
                      {currentUser.fullName}
                    </div>
                    <div className="text-[10px] text-cyan-700 dark:text-cyan-300 font-bold font-mono truncate">
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
                    className="w-full bg-white dark:bg-slate-950 px-2.5 py-1.5 border border-cyan-500/25 rounded-xl text-[11px] font-mono font-bold text-slate-800 dark:text-slate-200 focus:outline-none"
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

            {/* Navigation Domains List (Filtered by Role) - Scrollable */}
            <div className="flex-1 py-3 px-3 overflow-y-auto space-y-4">
              {roleNavDomains.map((domain, idx) => (
                <div key={idx} className="space-y-1">
                  <h3 className="px-2 text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest font-mono">
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
                              ? 'bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-500 text-slate-950 font-extrabold shadow-sm'
                              : 'text-slate-700 dark:text-slate-200 hover:bg-white/80 dark:hover:bg-slate-800/80'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <i
                              className={`fa-solid ${item.icon} text-xs w-4 text-center ${
                                isActive ? 'text-slate-950 font-bold' : 'text-slate-400'
                              }`}
                            ></i>
                            <span>{item.label}</span>
                          </div>

                          {badgeCount > 0 && (
                            <span
                              className={`px-1.5 py-0.5 rounded text-[10px] font-bold font-mono ${
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
                  className="w-full px-3 py-2 bg-white/80 dark:bg-slate-950/80 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold flex items-center justify-between border border-cyan-500/20 cursor-pointer active:scale-95"
                >
                  <span className="flex items-center gap-2">
                    <i className="fa-solid fa-magnifying-glass text-cyan-500"></i>
                    <span>Tìm kiếm nhanh</span>
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">Ctrl+K</span>
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
