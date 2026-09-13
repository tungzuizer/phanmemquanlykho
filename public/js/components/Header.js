/**
 * Fact-Forcing Gate Details:
 * 1. Importers/Callers: public/index.html via <script type="text/babel" src="/js/components/Header.js"></script> and public/js/app.js
 * 2. Affected API: Top Header Navigation Bar with Interactive Profile Popover & 1-Click 9-Staff Switcher (window.WMS_COMPONENTS.Header)
 * 3. Data schemas: currentUser, setCurrentUser, users, onOpenCommandPalette, onResetSeed, onLogout, sidebarCollapsed, setSidebarCollapsed, mobileDrawerOpen, setMobileDrawerOpen, isSyncing, onRefresh
 * 4. User's verbatim instruction: "sao chữ ở phần menu lại rời rạc vậy nhìn quá xấu"
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
  const [profileOpen, setProfileOpen] = React.useState(false);
  const profileRef = React.useRef(null);
  const { getRoleConfig } = window.WMS_CONSTANTS || { getRoleConfig: () => ({}) };
  const roleConfig = getRoleConfig(currentUser?.role);

  // Close profile dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    };
    if (profileOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [profileOpen]);

  // Color mapper for staff roles
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
                <span className="text-xs sm:text-sm font-bold tracking-normal text-slate-900 dark:text-white font-display">
                  MAX ELECTRIC
                </span>
                <span className="text-[9px] uppercase font-bold bg-gradient-to-r from-cyan-500/15 to-emerald-500/15 text-cyan-700 dark:text-cyan-300 px-1.5 py-0.5 rounded-md border border-cyan-500/25">
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
            <kbd className="hidden lg:inline-flex items-center gap-1 px-2 py-0.5 bg-white/90 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-md border border-slate-200 dark:border-slate-700 text-[10px] shadow-xs font-semibold">
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
            <span className="hidden xl:inline text-[11px] font-semibold">{isSyncing ? 'Đang đồng bộ...' : 'Đồng bộ'}</span>
          </button>

          {/* User Profile & Interactive Switcher Popover */}
          {currentUser && (
            <div className="relative" ref={profileRef}>
              <button
                type="button"
                onClick={() => setProfileOpen(!profileOpen)}
                className={`flex items-center gap-2 bg-white/80 dark:bg-slate-900/80 hover:bg-white dark:hover:bg-slate-800 px-2.5 py-1.5 rounded-xl border transition-all cursor-pointer shadow-xs active:scale-95 ${
                  profileOpen
                    ? 'border-cyan-500 ring-2 ring-cyan-500/30 bg-cyan-500/10'
                    : 'border-cyan-500/25'
                }`}
                title="Bấm để xem thông tin & chuyển đổi tài khoản nhân sự"
              >
                <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-cyan-400 via-teal-400 to-emerald-400 text-slate-950 flex items-center justify-center text-xs font-bold shrink-0 shadow-xs">
                  <i className={`fa-solid ${roleConfig.icon || 'fa-user-tie'}`}></i>
                </div>
                <div className="text-left hidden sm:block max-w-[130px] md:max-w-[180px]">
                  <div className="text-xs font-bold text-slate-900 dark:text-white truncate font-display">
                    {currentUser.fullName}
                  </div>
                  <div className="text-[11px] text-cyan-700 dark:text-cyan-300 font-semibold truncate leading-none">
                    {roleConfig.roleName || currentUser.role}
                  </div>
                </div>
                <i className={`fa-solid fa-chevron-down text-[10px] text-cyan-600 dark:text-cyan-400 transition-transform duration-200 ${profileOpen ? 'rotate-180' : ''}`}></i>
              </button>

              {/* Profile Dropdown Popover */}
              {profileOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl liquid-glass border border-cyan-500/30 shadow-2xl z-50 p-4 animate-fade-in font-sans space-y-3.5 backdrop-blur-2xl">
                  {/* Top Profile Card */}
                  <div className="p-3.5 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-cyan-500/25 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-400 via-teal-400 to-emerald-400 text-slate-950 flex items-center justify-center text-base font-bold shadow-md shadow-cyan-500/30">
                          <i className={`fa-solid ${roleConfig.icon || 'fa-user-tie'}`}></i>
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-slate-900 dark:text-white truncate font-display">
                            {currentUser.fullName}
                          </div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                            {currentUser.email || `${currentUser.username}@maxelectric.vn`}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-cyan-500/20 text-[11px]">
                      <span className={`px-2 py-0.5 rounded-lg border font-bold text-[10px] ${getRoleBadgeStyle(currentUser.role)}`}>
                        {roleConfig.roleName || currentUser.role}
                      </span>
                      <span className="text-slate-500 dark:text-slate-400 font-medium">
                        {roleConfig.department || 'Nhà máy MEVN'}
                      </span>
                    </div>
                  </div>

                  {/* Account Switcher Section Header */}
                  <div>
                    <div className="flex items-center justify-between px-1 mb-2">
                      <div className="flex items-center gap-1.5 text-[11px] font-bold text-cyan-700 dark:text-cyan-300 uppercase tracking-normal font-display">
                        <i className="fa-solid fa-users-gear text-xs"></i>
                        <span>Chuyển Đổi Tài Khoản (1-Click)</span>
                      </div>
                      <span className="text-[10px] font-semibold text-slate-400">
                        {users.length} Nhân sự MEVN
                      </span>
                    </div>

                    {/* 9 Staff List */}
                    <div className="max-h-64 overflow-y-auto space-y-1.5 pr-1 custom-scrollbar">
                      {users.map(u => {
                        const isCurrent = u.id === currentUser.id;
                        const uRoleCfg = getRoleConfig(u.role);

                        return (
                          <button
                            key={u.id}
                            type="button"
                            onClick={() => {
                              if (!isCurrent && setCurrentUser) {
                                setCurrentUser(u);
                                setProfileOpen(false);
                              }
                            }}
                            className={`w-full p-2.5 rounded-xl border text-left transition-all flex items-center justify-between gap-2.5 cursor-pointer active:scale-98 ${
                              isCurrent
                                ? 'bg-gradient-to-r from-cyan-500/20 via-teal-500/20 to-emerald-500/20 border-cyan-500/60 shadow-xs'
                                : 'bg-white/60 dark:bg-slate-900/60 hover:bg-white/95 dark:hover:bg-slate-800/95 border-cyan-500/15 hover:border-cyan-500/40'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 border ${
                                isCurrent
                                  ? 'bg-gradient-to-tr from-cyan-400 to-emerald-400 text-slate-950 border-white/40 shadow-xs'
                                  : 'bg-white/80 dark:bg-slate-800 text-cyan-600 dark:text-cyan-400 border-cyan-500/20'
                              }`}>
                                <i className={`fa-solid ${uRoleCfg.icon || 'fa-user'}`}></i>
                              </div>
                              <div className="min-w-0">
                                <div className={`text-xs font-bold truncate ${
                                  isCurrent ? 'text-cyan-700 dark:text-cyan-300' : 'text-slate-900 dark:text-white'
                                }`}>
                                  {u.fullName}
                                </div>
                                <div className="text-[10px] text-slate-400 truncate">
                                  {u.email || `${u.username}@maxelectric.vn`}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0">
                              <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold border ${getRoleBadgeStyle(u.role)}`}>
                                {u.role}
                              </span>
                              {isCurrent && (
                                <i className="fa-solid fa-circle-check text-emerald-500 text-xs"></i>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Footer Actions */}
                  <div className="pt-2 border-t border-cyan-500/20 flex items-center justify-between text-xs">
                    <span className="text-[10px] text-slate-400 flex items-center gap-1">
                      <i className="fa-solid fa-shield-halved text-emerald-500 text-[10px]"></i>
                      <span>Xác thực JWT 24h</span>
                    </span>
                    {onLogout && (
                      <button
                        type="button"
                        onClick={() => {
                          setProfileOpen(false);
                          onLogout();
                        }}
                        className="px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 font-bold text-xs border border-rose-500/20 transition active:scale-95 cursor-pointer flex items-center gap-1.5"
                      >
                        <i className="fa-solid fa-arrow-right-from-bracket"></i>
                        <span>Đăng xuất</span>
                      </button>
                    )}
                  </div>
                </div>
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
              <span className="text-[11px] font-semibold">Khôi phục</span>
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
