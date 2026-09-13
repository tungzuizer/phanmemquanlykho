/**
 * Fact-Forcing Gate Details:
 * 1. Importers/Callers: public/index.html via <script type="text/babel" src="/js/components/Header.js"></script> and public/js/app.js
 * 2. Affected API: Top Header Navigation Bar with Live Telemetry & Role Switcher (window.WMS_COMPONENTS.Header)
 * 3. Data schemas: currentUser, setCurrentUser, users, darkMode, setDarkMode, onOpenCommandPalette, onResetSeed, onLogout, sidebarCollapsed, setSidebarCollapsed, mobileDrawerOpen, setMobileDrawerOpen, isSyncing, onRefresh
 * 4. User's verbatim instruction: "sửa lại toàn bộ giao diện đnăg nahạp cho sáng sủa nhiều hiệu ứng sinh động tương tác và phông chữ sủa lại cho phù hợp với tiếng việt trong các mục và các trang hãy tối ưu hóa toàn bộ chữ khôgn viết dài dòng lan man hãy tập chung vào các ý chính và hãy tôn trong người dùng thiết không dùng icon quê mùa và đặc biệt không dùng phông nền màu đen hoặc trắng hãy mix nhiều màu lại và mang phong cách sáng sủa nhìn vào không biết trang web là ai làm"
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
    <header className="sticky top-0 z-30 select-none liquid-glass border-b border-slate-200/80 dark:border-slate-800 shadow-xs transition-colors duration-200 font-sans">
      {/* Safe Area Inset Top Spacer for Notch */}
      <div className="h-[env(safe-area-inset-top,0px)]"></div>

      <div className="px-3 sm:px-5 h-14 sm:h-16 flex items-center justify-between gap-2.5 sm:gap-4 max-w-7xl mx-auto">
        {/* Left: Hamburger & Brand */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Desktop Hamburger */}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="hidden md:flex p-2 rounded-xl text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white bg-white/70 dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800 transition active:scale-95 cursor-pointer"
            title={sidebarCollapsed ? "Mở rộng thanh menu" : "Thu gọn thanh menu"}
          >
            <i className={`fa-solid ${sidebarCollapsed ? 'fa-bars-staggered' : 'fa-bars'} text-xs sm:text-sm`}></i>
          </button>

          {/* Mobile Hamburger */}
          <button
            onClick={() => setMobileDrawerOpen(true)}
            className="md:hidden p-2 rounded-xl text-slate-700 hover:text-slate-900 dark:text-slate-200 dark:hover:text-white bg-white/70 dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800 transition active:scale-95 cursor-pointer"
            title="Mở menu điều hướng"
          >
            <i className="fa-solid fa-bars text-sm text-cyan-600 dark:text-cyan-400"></i>
          </button>

          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-cyan-400 via-teal-500 to-emerald-500 flex items-center justify-center font-bold text-xs sm:text-sm shadow-md shadow-cyan-500/20 text-slate-950 border border-white/40 font-display">
              ME
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs sm:text-sm font-bold tracking-tight text-slate-900 dark:text-white font-display">
                  MAX ELECTRIC
                </span>
                <span className="text-[9px] uppercase font-bold tracking-wider bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 px-1.5 py-0.5 rounded border border-cyan-500/20 font-mono">
                  WMS
                </span>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 hidden sm:flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span>
                <span>Kho Tủ Điện & Cung Ứng ISO 9001:2015</span>
              </p>
            </div>
          </div>
        </div>

        {/* Center: Command Palette Trigger */}
        <div className="flex-1 max-w-md hidden md:block">
          <button
            onClick={onOpenCommandPalette}
            className="w-full flex items-center justify-between px-3.5 py-2 bg-white/70 dark:bg-slate-900/70 hover:bg-white dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-xl border border-slate-200/80 dark:border-slate-800 text-xs transition group shadow-xs cursor-pointer active:scale-98"
          >
            <span className="flex items-center gap-2">
              <i className="fa-solid fa-magnifying-glass text-slate-400 group-hover:text-cyan-500 transition"></i>
              <span>Tìm nhanh SKU, đơn hàng, lệnh xuất, kệ...</span>
            </span>
            <kbd className="hidden lg:inline-flex items-center gap-1 px-2 py-0.5 bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded border border-slate-200 dark:border-slate-700 text-[10px] font-mono shadow-xs">
              <span className="text-xs">⌘</span> K
            </kbd>
          </button>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Live Telemetry */}
          <div className="hidden lg:flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-white/70 dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800 text-[11px] font-mono">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-slate-500 dark:text-slate-400">SERVER</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">0ms</span>
          </div>

          {/* Sync Status Button */}
          <button
            onClick={() => onRefresh && onRefresh(true)}
            disabled={isSyncing}
            className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-semibold transition-all shadow-xs cursor-pointer active:scale-95 ${
              isSyncing
                ? 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/30 animate-pulse'
                : 'bg-white/70 dark:bg-slate-900/70 hover:bg-white dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200/80 dark:border-slate-800'
            }`}
            title={isSyncing ? "Đang đồng bộ dữ liệu..." : "Đã đồng bộ. Bấm để làm mới"}
          >
            <i className={`fa-solid ${isSyncing ? 'fa-arrows-rotate fa-spin text-cyan-500' : 'fa-database text-cyan-500 text-xs'}`}></i>
            <span className="hidden xl:inline font-mono text-[11px]">{isSyncing ? 'SYNCING...' : 'SYNCED'}</span>
          </button>

          {/* User & Role Switcher */}
          {currentUser && (
            <div className="flex items-center gap-1.5 bg-white/70 dark:bg-slate-900/70 px-2.5 py-1.5 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
              <i className={`fa-solid ${roleConfig.icon || 'fa-user-tie'} text-xs text-cyan-600 dark:text-cyan-400`}></i>
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

          {/* Theme Toggle */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="w-8 h-8 flex items-center justify-center rounded-xl text-slate-600 dark:text-slate-300 bg-white/70 dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800 transition active:scale-95 cursor-pointer shadow-xs"
            title={darkMode ? "Chuyển sang Giao diện Sáng" : "Chuyển sang Giao diện Tối"}
          >
            <i className={`fa-solid ${darkMode ? 'fa-sun text-amber-400' : 'fa-moon text-cyan-500'} text-xs`}></i>
          </button>

          {/* Reset Seed Button (Admin) */}
          {(!currentUser || currentUser.role === 'ADMIN') && (
            <button
              onClick={onResetSeed}
              className="hidden sm:flex px-2.5 py-1.5 bg-white/70 dark:bg-slate-900/70 hover:bg-white dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold border border-slate-200/80 dark:border-slate-800 items-center gap-1.5 transition active:scale-95 cursor-pointer shadow-xs"
              title="Khôi phục dữ liệu mẫu chuẩn MEVN"
            >
              <i className="fa-solid fa-rotate-left text-cyan-500 text-xs"></i>
              <span className="font-mono text-[11px]">RESET</span>
            </button>
          )}

          {/* Logout Button */}
          {onLogout && (
            <button
              onClick={onLogout}
              className="w-8 h-8 flex items-center justify-center rounded-xl text-rose-600 dark:text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 transition active:scale-95 cursor-pointer shadow-xs"
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
