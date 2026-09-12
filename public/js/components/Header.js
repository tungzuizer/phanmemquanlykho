/*
Fact-Forcing Gate Info:
1. Importers/Callers: public/index.html via <script type="text/babel" src="/js/components/Header.js?v=2026.09.12"></script>
2. Affected API: Industrial CAD Top Control Bar with Zero-Flicker Sync Status, Live Telemetry & Role Switcher
3. Data schemas: currentUser, setCurrentUser, users, darkMode, setDarkMode, onOpenCommandPalette, onResetSeed, onLogout, isSyncing, onRefresh
4. User verbatim: "theo khuyến nghị của bạn" / "web không thay đổi gì cả ?"
*/

function Header({
  currentUser,
  setCurrentUser,
  users = [],
  darkMode,
  setDarkMode,
  onOpenCommandPalette,
  onResetSeed,
  onLogout,
  sidebarCollapsed,
  setSidebarCollapsed,
  mobileDrawerOpen,
  setMobileDrawerOpen,
  isSyncing = false,
  onRefresh
}) {
  const { getRoleConfig } = window.WMS_CONSTANTS || { getRoleConfig: () => ({}) };
  const roleConfig = getRoleConfig(currentUser?.role);

  return (
    <header className="sticky top-0 z-30 select-none bg-white/90 dark:bg-slate-950/90 backdrop-blur-2xl border-b border-slate-200/80 dark:border-slate-800/80 shadow-xs transition-colors duration-200">
      {/* Safe Area Inset Top Spacer for iPhone Notch / Dynamic Island */}
      <div className="h-[env(safe-area-inset-top,0px)]"></div>

      <div className="px-3 sm:px-5 h-16 flex items-center justify-between gap-2.5 sm:gap-4 max-w-7xl mx-auto">
        {/* Left: Hamburger & Industrial Brand */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Desktop Hamburger: Collapse/Expand Sidebar */}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="hidden md:flex p-2 rounded-xl text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 liquid-touch"
            title={sidebarCollapsed ? "Mở rộng thanh điều hướng (16rem)" : "Thu gọn thanh điều hướng (4.5rem)"}
          >
            <i className={`fa-solid ${sidebarCollapsed ? 'fa-bars-staggered' : 'fa-bars'} text-sm`}></i>
          </button>

          {/* Mobile Hamburger: Open Slide-Over Drawer */}
          <button
            onClick={() => setMobileDrawerOpen(true)}
            className="md:hidden p-2 rounded-xl text-slate-700 hover:text-slate-900 dark:text-slate-200 dark:hover:text-white bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 liquid-touch"
            title="Mở menu điều hướng"
          >
            <i className="fa-solid fa-bars text-sm text-blue-600 dark:text-blue-400"></i>
          </button>

          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-cyan-500 flex items-center justify-center font-black text-sm shadow-md shadow-blue-500/20 text-white border border-white/30 liquid-touch">
              ME
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs sm:text-sm font-black tracking-tight text-slate-900 dark:text-white font-mono">
                  MAX ELECTRIC
                </span>
                <span className="text-[9px] uppercase font-black tracking-wider bg-blue-500/10 text-blue-600 dark:text-blue-400 px-1.5 py-0.5 rounded border border-blue-500/20 font-mono">
                  WMS 26
                </span>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 hidden sm:flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span>
                <span>IEC 61439 & ISO 9001:2015</span>
              </p>
            </div>
          </div>
        </div>

        {/* Center: Universal Command Palette (Ctrl+K) Trigger */}
        <div className="flex-1 max-w-md hidden md:block">
          <button
            onClick={onOpenCommandPalette}
            className="w-full flex items-center justify-between px-3.5 py-2 bg-slate-100/80 dark:bg-slate-900/80 hover:bg-slate-200/60 dark:hover:bg-slate-800/60 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-xl border border-slate-200 dark:border-slate-800 text-xs transition group shadow-xs liquid-touch"
          >
            <span className="flex items-center gap-2">
              <i className="fa-solid fa-magnifying-glass text-slate-400 group-hover:text-blue-500 transition"></i>
              <span>Tìm nhanh SKU, đơn hàng, lệnh xuất, kệ...</span>
            </span>
            <kbd className="hidden lg:inline-flex items-center gap-1 px-2 py-0.5 bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded border border-slate-200 dark:border-slate-700 text-[10px] font-mono shadow-xs">
              <span className="text-xs">⌘</span> K
            </kbd>
          </button>
        </div>

        {/* Right Controls: Telemetry, Role Switcher, Theme, Reset & Logout */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Live Node Telemetry Pill */}
          <div className="hidden lg:flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px] font-mono">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-slate-500 dark:text-slate-400">TOKYO NODE</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">18ms</span>
          </div>

          {/* SWR Zero-Flicker Sync Status Pill */}
          <button
            onClick={() => onRefresh && onRefresh(true)}
            disabled={isSyncing}
            className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-semibold transition-all shadow-xs ${
              isSyncing
                ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800 animate-pulse'
                : 'bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800 liquid-touch'
            }`}
            title={isSyncing ? "Đang đồng bộ dữ liệu ngầm với Supabase..." : "Đã đồng bộ ngầm. Bấm để làm mới dữ liệu"}
          >
            <i className={`fa-solid ${isSyncing ? 'fa-arrows-rotate fa-spin text-blue-500' : 'fa-database text-blue-500 text-xs'}`}></i>
            <span className="hidden xl:inline font-mono text-[11px]">{isSyncing ? 'SYNCING...' : 'SYNCED'}</span>
          </button>

          {/* User & Role Selector Pill */}
          {currentUser && (
            <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-900 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
              <i className={`fa-solid ${roleConfig.icon || 'fa-circle-user'} text-xs text-blue-600 dark:text-blue-400`}></i>
              {users && users.length > 0 && setCurrentUser ? (
                <select
                  value={currentUser?.id || ''}
                  onChange={e => {
                    const user = users.find(u => u.id === e.target.value);
                    if (user) setCurrentUser(user);
                  }}
                  className="bg-transparent text-xs text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer font-bold max-w-[120px] sm:max-w-[170px] truncate font-mono"
                >
                  {users.map(u => (
                    <option key={u.id} value={u.id} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                      {u.fullName} ({u.role})
                    </option>
                  ))}
                </select>
              ) : (
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate max-w-[120px] font-mono">
                  {currentUser.fullName}
                </span>
              )}
            </div>
          )}

          {/* Theme Toggle Button */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="w-8 h-8 flex items-center justify-center rounded-xl text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 liquid-touch shadow-xs"
            title={darkMode ? "Chuyển sang Giao diện Sáng" : "Chuyển sang Giao diện Tối"}
          >
            <i className={`fa-solid ${darkMode ? 'fa-sun text-amber-400' : 'fa-moon text-blue-500'} text-xs`}></i>
          </button>

          {/* Reset Demo Seed (For Admins) */}
          {(!currentUser || currentUser.role === 'ADMIN') && (
            <button
              onClick={onResetSeed}
              className="hidden sm:flex px-2.5 py-1.5 bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-800 items-center gap-1.5 liquid-touch shadow-xs"
              title="Khôi phục dữ liệu mẫu chuẩn MEVN vào Supabase"
            >
              <i className="fa-solid fa-rotate-left text-blue-500 text-xs"></i>
              <span className="font-mono text-[11px]">RESET</span>
            </button>
          )}

          {/* Logout Button */}
          {onLogout && (
            <button
              onClick={onLogout}
              className="w-8 h-8 flex items-center justify-center rounded-xl text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 hover:bg-red-100 dark:hover:bg-red-900/60 border border-red-200/80 dark:border-red-800/80 liquid-touch shadow-xs"
              title="Đăng xuất khỏi hệ thống MEVN"
            >
              <i className="fa-solid fa-arrow-right-from-bracket text-xs"></i>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

window.WMS_COMPONENTS = window.WMS_COMPONENTS || {};
window.WMS_COMPONENTS.Header = Header;
