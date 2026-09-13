/**
 * Fact-Forcing Gate Details:
 * 1. Importers/Callers: public/index.html via <script type="text/babel" src="/js/components/Header.js"></script> and public/js/app.js
 * 2. Affected API: Top Header Navigation Bar with User Profile Card & Aligned Brand Logo (window.WMS_COMPONENTS.Header)
 * 3. Data schemas: currentUser, setCurrentUser, users, onOpenCommandPalette, onResetSeed, onLogout, sidebarCollapsed, setSidebarCollapsed, mobileDrawerOpen, setMobileDrawerOpen, isSyncing, onRefresh
 * 4. User's verbatim instruction: "bỏ phần chuyển đổi tài khoản 1click bỏ đi và sửa lại vị trí của MAX ELECTRIC đang bị lệch"
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
    <header className="sticky top-0 z-30 select-none liquid-glass border-b border-cyan-500/20 shadow-sm transition-colors duration-200 font-sans w-full">
      {/* Safe Area Inset Top Spacer for Notch */}
      <div className="h-[env(safe-area-inset-top,0px)]"></div>

      <div className="w-full px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-3 sm:gap-4">
        {/* Left: Hamburger & Brand Alignment */}
        <div className="flex items-center gap-2.5 sm:gap-3.5 shrink-0">
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

          {/* Brand Logo & Name */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-cyan-400 via-teal-400 to-emerald-400 flex items-center justify-center font-bold text-xs sm:text-sm shadow-md shadow-cyan-500/25 text-slate-950 border border-white/50 font-display shrink-0">
              ME
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm sm:text-base font-bold tracking-tight text-slate-900 dark:text-white font-display whitespace-nowrap">
                MAX ELECTRIC
              </span>
              <span className="text-[10px] uppercase font-extrabold bg-gradient-to-r from-cyan-500/15 to-emerald-500/15 text-cyan-700 dark:text-cyan-300 px-1.5 py-0.5 rounded-md border border-cyan-500/25 tracking-wider">
                WMS
              </span>
            </div>
          </div>
        </div>

        {/* Center: Command Palette Trigger */}
        <div className="flex-1 max-w-md hidden md:block mx-2">
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
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
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

          {/* User Profile Popover (Clean User Details & Logout) */}
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
                title="Xem thông tin tài khoản người dùng"
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
                <div className="absolute right-0 mt-2 w-80 sm:w-88 rounded-2xl liquid-glass border border-cyan-500/30 shadow-2xl z-50 p-4 animate-fade-in font-sans space-y-3.5 backdrop-blur-2xl">
                  {/* Top Profile Card */}
                  <div className="p-3.5 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-cyan-500/25 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-cyan-400 via-teal-400 to-emerald-400 text-slate-950 flex items-center justify-center text-lg font-bold shadow-md shadow-cyan-500/30 shrink-0">
                        <i className={`fa-solid ${roleConfig.icon || 'fa-user-tie'}`}></i>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-bold text-slate-900 dark:text-white truncate font-display">
                          {currentUser.fullName}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                          {currentUser.email || `${currentUser.username}@maxelectric.vn`}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-cyan-500/20 text-[11px]">
                      <div>
                        <span className="text-slate-400 text-[10px] block">Vai trò nghiệp vụ:</span>
                        <span className={`inline-block px-1.5 py-0.5 mt-0.5 rounded-md border font-bold text-[10px] ${getRoleBadgeStyle(currentUser.role)}`}>
                          {currentUser.role}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[10px] block">Phòng ban:</span>
                        <span className="font-semibold text-slate-700 dark:text-slate-300 block truncate mt-0.5">
                          {roleConfig.department || 'Nhà máy MEVN'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Account Session Info */}
                  <div className="p-2.5 rounded-xl bg-cyan-500/5 dark:bg-slate-900/50 border border-cyan-500/15 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-500 dark:text-slate-400">Trạng thái xác thực:</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        <span>JWT 24h Active</span>
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-500 dark:text-slate-400">Phân hệ truy cập:</span>
                      <span className="font-semibold text-cyan-700 dark:text-cyan-300">
                        {currentUser.role === 'ADMIN' ? 'Tất cả (10/10)' : `${roleConfig.allowedTabs?.length || 0} Phân hệ`}
                      </span>
                    </div>
                  </div>

                  {/* Footer Action: Logout */}
                  {onLogout && (
                    <div className="pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          setProfileOpen(false);
                          onLogout();
                        }}
                        className="w-full py-2.5 px-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 font-bold text-xs border border-rose-500/20 transition active:scale-98 cursor-pointer flex items-center justify-center gap-2"
                      >
                        <i className="fa-solid fa-arrow-right-from-bracket"></i>
                        <span>Đăng xuất khỏi hệ thống</span>
                      </button>
                    </div>
                  )}
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
