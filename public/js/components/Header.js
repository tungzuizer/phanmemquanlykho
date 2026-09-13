/**
 * Fact-Forcing Gate Details:
 * 1. Importers/Callers: public/index.html via <script type="text/babel" src="/js/components/Header.js"></script> and public/js/app.js
 * 2. Affected API: Top Header Navigation Bar with Role Switcher & Fast Actions (window.WMS_COMPONENTS.Header)
 * 3. Data schemas: currentUser, setCurrentUser, users, onOpenCommandPalette, onResetSeed, onLogout, sidebarCollapsed, setSidebarCollapsed, mobileDrawerOpen, setMobileDrawerOpen, isSyncing, onRefresh
 * 4. User's verbatim instruction: "mấy cái không cần thiết như server0ms hay chế độ sáng tối ios9001 pro2026 , vân vân quá loạn và lan mang giao diện thì trắng đen quá xấu và đơn sắc hãy mix nhiều màu với nhau và cần thật sáng sủa và tách menu và trang ra làm 2 bên độc lập có thẻ vuốt lên xuống độc lập và cấm dùng màu tím hồng trắng đen sửa lại giao diện sáng sủa nhiều màu mix và cả phông nền ở đằng sau"
 */

function Header({
  currentUser,
  setCurrentUser,
  users = [],
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
    <header className="sticky top-0 z-30 select-none liquid-glass border-b border-cyan-500/20 shadow-sm transition-colors duration-200 font-sans">
      {/* Safe Area Inset Top Spacer for Notch */}
      <div className="h-[env(safe-area-inset-top,0px)]"></div>

      <div className="px-3 sm:px-5 h-14 sm:h-16 flex items-center justify-between gap-2.5 sm:gap-4 max-w-7xl mx-auto">
        {/* Left: Hamburger & Brand */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Desktop Hamburger */}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="hidden md:flex p-2 rounded-xl text-slate-700 hover:text-cyan-600 dark:text-slate-200 dark:hover:text-cyan-400 bg-white/80 dark:bg-slate-900/80 border border-cyan-500/20 transition active:scale-95 cursor-pointer shadow-xs"
            title={sidebarCollapsed ? "Mở rộng thanh menu" : "Thu gọn thanh menu"}
          >
            <i className={`fa-solid ${sidebarCollapsed ? 'fa-bars-staggered' : 'fa-bars'} text-xs sm:text-sm`}></i>
          </button>

          {/* Mobile Hamburger */}
          <button
            onClick={() => setMobileDrawerOpen(true)}
            className="md:hidden p-2 rounded-xl text-slate-700 hover:text-cyan-600 dark:text-slate-200 dark:hover:text-cyan-400 bg-white/80 dark:bg-slate-900/80 border border-cyan-500/20 transition active:scale-95 cursor-pointer"
            title="Mở menu điều hướng"
          >
            <i className="fa-solid fa-bars text-sm text-cyan-600 dark:text-cyan-400"></i>
          </button>

          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-cyan-400 via-teal-400 to-emerald-400 flex items-center justify-center font-bold text-xs sm:text-sm shadow-md shadow-cyan-500/25 text-slate-950 border border-white/50 font-display">
              ME
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs sm:text-sm font-bold tracking-tight text-slate-900 dark:text-white font-display">
                  MAX ELECTRIC
                </span>
                <span className="text-[9px] uppercase font-bold tracking-wider bg-gradient-to-r from-cyan-500/15 to-emerald-500/15 text-cyan-700 dark:text-cyan-300 px-1.5 py-0.5 rounded-md border border-cyan-500/25 font-mono">
                  WMS
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Center: Command Palette Trigger */}
        <div className="flex-1 max-w-md hidden md:block">
          <button
            onClick={onOpenCommandPalette}
            className="w-full flex items-center justify-between px-3.5 py-2 bg-white/80 dark:bg-slate-900/80 hover:bg-white dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-xl border border-cyan-500/20 text-xs transition group shadow-xs cursor-pointer active:scale-98"
          >
            <span className="flex items-center gap-2">
              <i className="fa-solid fa-magnifying-glass text-cyan-500 group-hover:scale-110 transition-transform"></i>
              <span>Tìm nhanh SKU, đơn hàng, lệnh xuất, kệ...</span>
            </span>
            <kbd className="hidden lg:inline-flex items-center gap-1 px-2 py-0.5 bg-white/90 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-md border border-slate-200 dark:border-slate-700 text-[10px] font-mono shadow-xs">
              <span className="text-xs">⌘</span> K
            </kbd>
          </button>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Sync Status Button */}
          <button
            onClick={() => onRefresh && onRefresh(true)}
            disabled={isSyncing}
            className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-semibold transition-all shadow-xs cursor-pointer active:scale-95 ${
              isSyncing
                ? 'bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border-cyan-500/40 animate-pulse'
                : 'bg-white/80 dark:bg-slate-900/80 hover:bg-white dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 border-cyan-500/20'
            }`}
            title={isSyncing ? "Đang đồng bộ dữ liệu..." : "Đã kết nối. Bấm để làm mới"}
          >
            <i className={`fa-solid ${isSyncing ? 'fa-arrows-rotate fa-spin text-cyan-500' : 'fa-database text-teal-500 text-xs'}`}></i>
            <span className="hidden xl:inline font-mono text-[11px] font-bold">{isSyncing ? 'ĐANG ĐỒNG BỘ...' : 'ĐỒNG BỘ'}</span>
          </button>

          {/* User & Role Switcher */}
          {currentUser && (
            <div className="flex items-center gap-1.5 bg-white/80 dark:bg-slate-900/80 px-2.5 py-1.5 rounded-xl border border-cyan-500/25 shadow-xs">
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

          {/* Reset Seed Button (Admin) */}
          {(!currentUser || currentUser.role === 'ADMIN') && (
            <button
              onClick={onResetSeed}
              className="hidden sm:flex px-2.5 py-1.5 bg-white/80 dark:bg-slate-900/80 hover:bg-white dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold border border-cyan-500/20 items-center gap-1.5 transition active:scale-95 cursor-pointer shadow-xs"
              title="Khôi phục dữ liệu mẫu chuẩn MEVN"
            >
              <i className="fa-solid fa-rotate-left text-amber-500 text-xs"></i>
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
