/*
Fact-Forcing Gate Info:
1. Importers/Callers: public/index.html via <script type="text/babel" src="/js/components/Header.js"></script>
2. Affected API: iOS 26 Liquid Glass Top Navigation Bar with Logout & Role Switcher
3. Data schemas: currentUser, setCurrentUser, users, darkMode, setDarkMode, onOpenCommandPalette, onResetSeed, onLogout
4. User verbatim: "cần bạn tách các dự liệu tài khoản và phân luồng các tài khoản và có phần đăng nhập"
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
  setMobileDrawerOpen
}) {
  const { getRoleConfig } = window.WMS_CONSTANTS || { getRoleConfig: () => ({}) };
  const roleConfig = getRoleConfig(currentUser?.role);

  return (
    <header className="sticky top-0 z-30 select-none liquid-glass border-b border-white/60 dark:border-white/10 shadow-xs transition-colors duration-200">
      {/* Safe Area Inset Top Spacer for iPhone Notch / Dynamic Island */}
      <div className="h-[env(safe-area-inset-top,0px)]"></div>

      <div className="px-3 sm:px-5 h-16 flex items-center justify-between gap-2.5 sm:gap-4 max-w-7xl mx-auto">
        {/* Left: Hamburger & Brand */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Desktop Hamburger: Collapse/Expand Sidebar */}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="hidden md:flex p-2 rounded-2xl text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 liquid-touch"
            title={sidebarCollapsed ? "Mở rộng thanh điều hướng (16rem)" : "Thu gọn thanh điều hướng (4.5rem)"}
          >
            <i className={`fa-solid ${sidebarCollapsed ? 'fa-bars-staggered' : 'fa-bars'} text-sm`}></i>
          </button>

          {/* Mobile Hamburger: Open Slide-Over Drawer */}
          <button
            onClick={() => setMobileDrawerOpen(true)}
            className="md:hidden p-2 rounded-2xl text-slate-700 hover:text-slate-900 dark:text-slate-200 dark:hover:text-white bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 liquid-touch"
            title="Mở menu điều hướng"
          >
            <i className="fa-solid fa-bars text-sm text-blue-600 dark:text-blue-400"></i>
          </button>

          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 flex items-center justify-center font-black text-lg shadow-md shadow-blue-500/25 text-white border border-white/40 liquid-touch">
              ME
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs sm:text-sm font-black tracking-tight text-slate-900 dark:text-white">
                  MAX ELECTRIC
                </span>
                <span className="text-[9px] uppercase font-black tracking-wider bg-blue-500/15 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full border border-blue-500/25">
                  WMS 26
                </span>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 hidden sm:block">
                Quản Trị Kho & Cung Ứng Sản Xuất Chuẩn ISO
              </p>
            </div>
          </div>
        </div>

        {/* Center: Universal Command Palette (Ctrl+K) Trigger */}
        <div className="flex-1 max-w-md hidden md:block">
          <button
            onClick={onOpenCommandPalette}
            className="w-full flex items-center justify-between px-3.5 py-2 bg-slate-100/80 dark:bg-slate-800/80 hover:bg-slate-200/60 dark:hover:bg-slate-700/60 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-2xl border border-slate-200/80 dark:border-slate-700/80 text-xs transition group shadow-xs liquid-touch"
          >
            <span className="flex items-center gap-2">
              <i className="fa-solid fa-magnifying-glass text-slate-400 group-hover:text-blue-500 transition"></i>
              <span>Tìm nhanh mã SKU, đơn hàng, vị trí kệ...</span>
            </span>
            <kbd className="hidden lg:inline-flex items-center gap-1 px-2 py-0.5 bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 rounded-lg border border-slate-200 dark:border-slate-700 text-[10px] font-mono shadow-xs">
              <span className="text-xs">⌘</span> K
            </kbd>
          </button>
        </div>

        {/* Right Controls: Role Switcher, Theme, Reset & Logout */}
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          {/* Mobile Search Button */}
          <button
            onClick={onOpenCommandPalette}
            className="md:hidden w-9 h-9 flex items-center justify-center text-slate-600 dark:text-slate-300 bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 rounded-2xl liquid-touch"
            title="Tìm kiếm (Ctrl+K)"
          >
            <i className="fa-solid fa-magnifying-glass text-xs"></i>
          </button>

          {/* User & Role Selector Pill */}
          {currentUser && (
            <div className="flex items-center gap-1.5 bg-slate-100/80 dark:bg-slate-800/80 px-2.5 py-1.5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-xs">
              <i className={`fa-solid ${roleConfig.icon || 'fa-circle-user'} text-xs text-blue-600 dark:text-blue-400`}></i>
              {users && users.length > 0 && setCurrentUser ? (
                <select
                  value={currentUser?.id || ''}
                  onChange={e => {
                    const user = users.find(u => u.id === e.target.value);
                    if (user) setCurrentUser(user);
                  }}
                  className="bg-transparent text-xs text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer font-bold max-w-[120px] sm:max-w-[170px] truncate"
                >
                  {users.map(u => (
                    <option key={u.id} value={u.id} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                      {u.fullName} ({u.role})
                    </option>
                  ))}
                </select>
              ) : (
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate max-w-[120px]">
                  {currentUser.fullName}
                </span>
              )}
            </div>
          )}

          {/* Theme Toggle Button */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="w-9 h-9 flex items-center justify-center rounded-2xl text-slate-600 dark:text-slate-300 bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 liquid-touch shadow-xs"
            title={darkMode ? "Chuyển sang Giao diện Sáng" : "Chuyển sang Giao diện Tối"}
          >
            <i className={`fa-solid ${darkMode ? 'fa-sun text-amber-400' : 'fa-moon text-blue-500'} text-xs`}></i>
          </button>

          {/* Reset Demo Seed (For Admins) */}
          {(!currentUser || currentUser.role === 'ADMIN') && (
            <button
              onClick={onResetSeed}
              className="hidden sm:flex px-3 py-1.5 bg-slate-100/80 dark:bg-slate-800/80 hover:bg-slate-200/70 dark:hover:bg-slate-700/70 text-slate-700 dark:text-slate-300 rounded-2xl text-xs font-bold border border-slate-200/80 dark:border-slate-700/80 items-center gap-1.5 liquid-touch shadow-xs"
              title="Khôi phục dữ liệu mẫu chuẩn MEVN vào Supabase"
            >
              <i className="fa-solid fa-rotate-left text-blue-500 text-xs"></i>
              <span>Khôi phục mẫu</span>
            </button>
          )}

          {/* Logout Button */}
          {onLogout && (
            <button
              onClick={onLogout}
              className="w-9 h-9 flex items-center justify-center rounded-2xl text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 hover:bg-red-100 dark:hover:bg-red-900/60 border border-red-200/80 dark:border-red-800/80 liquid-touch shadow-xs"
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
