/*
Fact-Forcing Gate Info:
1. Importers/Callers: public/index.html via <script type="text/babel" src="/js/components/LoginScreen.js"></script>
2. Affected API: Authentication UI & Quick Department Account Selector (window.WMS_COMPONENTS.LoginScreen).
3. Data schemas: User credentials { usernameOrEmail, password }, role permissions preview, remember login state.
4. User's verbatim instruction: "cần bạn tách các dự liệu tài khoản và phân luồng các tài khoản và có phần đăng nhập"
*/

function LoginScreen({ onLoginSuccess, darkMode, setDarkMode }) {
  const [usernameOrEmail, setUsernameOrEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);
  const [rememberMe, setRememberMe] = React.useState(true);
  const [isLoading, setIsLoading] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState('');

  const PRESET_ACCOUNTS = [
    {
      roleKey: 'ADMIN',
      label: 'Ban Giám Đốc',
      username: 'admin',
      fullName: 'Ban Giám Đốc MEVN',
      department: 'Ban Quản Trị Cấp Cao',
      icon: 'fa-crown',
      color: 'from-amber-500 to-yellow-400 text-white',
      badgeBg: 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-800',
      scope: 'Toàn quyền điều hành, phê duyệt, giám sát 10 phân hệ & 3 KPI ISO'
    },
    {
      roleKey: 'THU_KHO',
      label: 'Thủ Kho Điện',
      username: 'thukho_dien',
      fullName: 'Nguyễn Văn Khoa',
      department: 'Kho Vật Tư Điện (Tầng 1)',
      icon: 'fa-bolt',
      color: 'from-blue-600 to-cyan-500 text-white',
      badgeBg: 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-800',
      scope: 'Đối chiếu BOM, nhập kho GRN, xuất kho GDN & nhập trả phế phẩm'
    },
    {
      roleKey: 'THU_KHO',
      label: 'Thủ Kho Đồng',
      username: 'thukho_dong',
      fullName: 'Trần Văn Đồng',
      department: 'Kho Đồng & Cơ Khí (Xưởng A)',
      icon: 'fa-cubes-stacked',
      color: 'from-orange-500 to-amber-500 text-white',
      badgeBg: 'bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-300 border-orange-300 dark:border-orange-800',
      scope: 'Kiểm soát thanh cái đồng, quy đổi Cây/Kg/Mét, cấp phát theo BOM'
    },
    {
      roleKey: 'KY_THUAT',
      label: 'Kỹ Thuật BOM',
      username: 'kythuat_bom',
      fullName: 'Lê Minh Kỹ',
      department: 'Phòng Kỹ Thuật & Thiết Kế',
      icon: 'fa-ruler-combined',
      color: 'from-indigo-600 to-blue-500 text-white',
      badgeBg: 'bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border-indigo-300 dark:border-indigo-800',
      scope: 'Bóc tách bản vẽ kỹ thuật, nạp định mức BOM & tính toán delta'
    },
    {
      roleKey: 'MUA_HANG',
      label: 'Mua Hàng (PO)',
      username: 'muahang_po',
      fullName: 'Phạm Thị Mua',
      department: 'Phòng Thu Mua & Cung Ứng',
      icon: 'fa-cart-shopping',
      color: 'from-rose-600 to-pink-500 text-white',
      badgeBg: 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border-rose-300 dark:border-rose-800',
      scope: 'Tạo đơn đặt mua PO theo delta thiếu hụt & quản lý nhà cung cấp'
    },
    {
      roleKey: 'SAN_XUAT',
      label: 'Sản Xuất Tủ',
      username: 'sanxuat_to1',
      fullName: 'Hoàng Văn Ráp',
      department: 'Xưởng Lắp Ráp Tủ Điện MEVN',
      icon: 'fa-helmet-safety',
      color: 'from-emerald-600 to-teal-500 text-white',
      badgeBg: 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800',
      scope: 'Đăng ký lấy hàng (PXK-01), ký nhận GDN & hoàn trả vật tư thừa'
    },
    {
      roleKey: 'SALE_ADMIN',
      label: 'Sale Admin',
      username: 'sale_admin',
      fullName: 'Đỗ Thị Huệ',
      department: 'Phòng Kinh Doanh & Dự Án',
      icon: 'fa-briefcase',
      color: 'from-sky-600 to-blue-600 text-white',
      badgeBg: 'bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 border-sky-300 dark:border-sky-800',
      scope: 'Khởi tạo đơn hàng dự án tủ điện mới & theo dõi tiến độ vòng đời'
    },
    {
      roleKey: 'KE_TOAN',
      label: 'Kế Toán Kho',
      username: 'ketoan_kho',
      fullName: 'Vũ Thị Toán',
      department: 'Phòng Kế Toán & Kiểm Toán',
      icon: 'fa-calculator',
      color: 'from-violet-600 to-purple-500 text-white',
      badgeBg: 'bg-violet-100 dark:bg-violet-950 text-violet-700 dark:text-violet-300 border-violet-300 dark:border-violet-800',
      scope: 'Kiểm toán Sổ cái biến động kho bất biến & giám sát 3 KPI ISO 9001'
    }
  ];

  const handleSelectPreset = (acc) => {
    setUsernameOrEmail(acc.username);
    setPassword('mevn@2026');
    setErrorMsg('');
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!usernameOrEmail.trim()) {
      setErrorMsg('Vui lòng nhập tên đăng nhập hoặc email.');
      return;
    }
    if (!password) {
      setErrorMsg('Vui lòng nhập mật khẩu.');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          usernameOrEmail: usernameOrEmail.trim(),
          password: password
        })
      });

      const json = await res.json();
      if (json.success && json.user) {
        if (rememberMe) {
          localStorage.setItem('mevn_auth_user', JSON.stringify(json.user));
          localStorage.setItem('mevn_remember_login', 'true');
        } else {
          localStorage.removeItem('mevn_auth_user');
          localStorage.removeItem('mevn_remember_login');
        }
        if (onLoginSuccess) {
          onLoginSuccess(json.user);
        }
      } else {
        setErrorMsg(json.message || 'Đăng nhập không thành công. Vui lòng kiểm tra lại!');
      }
    } catch (err) {
      console.error('[Login Error]:', err);
      setErrorMsg('Không thể kết nối đến máy chủ xác thực WMS.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col justify-between p-4 sm:p-6 lg:p-8 select-none relative overflow-x-hidden">
      {/* Safe Area Inset Top */}
      <div className="h-[env(safe-area-inset-top,0px)]"></div>

      {/* Top Navigation Bar: Brand & Theme Switcher */}
      <header className="w-full max-w-6xl mx-auto flex items-center justify-between py-2">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 flex items-center justify-center font-black text-lg text-white shadow-md shadow-blue-500/25 border border-white/40">
            ME
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-black tracking-tight text-slate-900 dark:text-white">
                MAX ELECTRIC
              </span>
              <span className="text-[9px] uppercase font-black tracking-wider bg-blue-500/15 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full border border-blue-500/25">
                WMS 26
              </span>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">
              Quản Trị Kho & Cung Ứng Sản Xuất Chuẩn ISO
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {setDarkMode && (
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2.5 rounded-2xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-700/80 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white liquid-touch shadow-xs text-xs font-bold flex items-center gap-2"
              title={darkMode ? 'Chuyển sang Giao diện Sáng' : 'Chuyển sang Giao diện Tối'}
            >
              <i className={`fa-solid ${darkMode ? 'fa-sun text-amber-400' : 'fa-moon text-blue-500'}`}></i>
              <span className="hidden sm:inline text-xs">{darkMode ? 'Giao diện Sáng' : 'Giao diện Tối'}</span>
            </button>
          )}
        </div>
      </header>

      {/* Main Login Card Container */}
      <main className="w-full max-w-5xl mx-auto my-auto py-6 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
        {/* Left Col: System Identity, Process Flow & Compliance */}
        <div className="lg:col-span-5 space-y-5 text-left">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 text-xs font-bold border border-blue-200 dark:border-blue-800 shadow-xs">
            <i className="fa-solid fa-shield-halved text-blue-500"></i>
            <span>Hệ Thống Phân Quyền Vai Trò (RBAC Matrix)</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
            Quản Trị Kho & Cung Ứng Tủ Điện Chuẩn ISO 9001
          </h1>

          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            Hệ thống phân luồng chuyên biệt theo từng chức năng nghiệp vụ của nhà máy sản xuất tủ điện: từ lập định mức BOM, tính toán delta thiếu hụt, mua hàng PO, quản lý 2 kho vật lý, đến đăng ký lấy hàng và kiểm toán bất biến.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2.5 pt-2">
            <div className="p-3 rounded-2xl bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/80 dark:border-white/10 flex items-start gap-3 shadow-xs">
              <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center text-sm shrink-0">
                <i className="fa-solid fa-lock"></i>
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">Bảo Mật & Phân Quyền Nghiêm Ngặt</h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Mỗi vai trò chỉ thao tác đúng thẩm quyền được phân công.</p>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/80 dark:border-white/10 flex items-start gap-3 shadow-xs">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-sm shrink-0">
                <i className="fa-solid fa-bolt-lightning"></i>
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">Giao Tác ACID & Khóa Giữ Chỗ Tồn</h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Ngăn ngừa xung đột giữ chỗ vật tư giữa các đơn hàng tủ điện.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Login Form & Quick Role Preset Switcher */}
        <div className="lg:col-span-7">
          <div className="w-full bg-white/85 dark:bg-slate-900/85 backdrop-blur-2xl border border-white/80 dark:border-white/10 rounded-3xl shadow-2xl p-6 sm:p-8 space-y-6 liquid-specular">
            <div>
              <div className="flex items-center justify-between">
                <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                  Đăng Nhập Tài Khoản
                </h2>
                <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  Supabase Live
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Nhập tài khoản được cấp hoặc chọn nhanh vai trò phòng ban bên dưới để trải nghiệm.
              </p>
            </div>

            {/* Error Message Box */}
            {errorMsg && (
              <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/80 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-bold flex items-center gap-2.5 animate-fade-in">
                <i className="fa-solid fa-triangle-exclamation text-sm text-rose-500 shrink-0"></i>
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                  <span>Tên đăng nhập hoặc Email</span>
                  <span className="text-[10px] text-slate-400 font-normal">admin / thukho_dien / kythuat_bom...</span>
                </label>
                <div className="relative">
                  <i className="fa-solid fa-circle-user absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
                  <input
                    type="text"
                    required
                    value={usernameOrEmail}
                    onChange={e => {
                      setUsernameOrEmail(e.target.value);
                      if (errorMsg) setErrorMsg('');
                    }}
                    placeholder="Nhập tên đăng nhập hoặc email..."
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 rounded-2xl text-xs font-bold text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                  <span>Mật khẩu</span>
                  <span className="text-[10px] text-slate-400 font-normal">Mặc định: mevn@2026</span>
                </label>
                <div className="relative">
                  <i className="fa-solid fa-key absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={e => {
                      setPassword(e.target.value);
                      if (errorMsg) setErrorMsg('');
                    }}
                    placeholder="Nhập mật khẩu của bạn..."
                    className="w-full pl-9 pr-10 py-2.5 bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 rounded-2xl text-xs font-bold text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs p-1"
                    title={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                  >
                    <i className={`fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1 text-xs">
                <label className="flex items-center gap-2 cursor-pointer text-slate-600 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={e => setRememberMe(e.target.checked)}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                  />
                  <span className="font-semibold text-[11px]">Ghi nhớ đăng nhập trên thiết bị này</span>
                </label>

                <span className="text-[11px] text-blue-600 dark:text-blue-400 font-bold">
                  ISO 9001 Audit Trail
                </span>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-800 text-white font-black text-xs sm:text-sm rounded-2xl shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 liquid-touch transition disabled:opacity-60"
              >
                {isLoading ? (
                  <>
                    <i className="fa-solid fa-circle-notch fa-spin text-sm"></i>
                    <span>Đang xác thực bảo mật...</span>
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-right-to-bracket text-sm"></i>
                    <span>Đăng Nhập Vào Hệ Thống MEVN WMS</span>
                  </>
                )}
              </button>
            </form>

            {/* Quick Department Role Selector (1-Click Switcher for Testing) */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Chọn Nhanh Tài Khoản Phòng Ban (Demo RBAC)
                </span>
                <span className="text-[10px] text-slate-400 font-mono">Click để tự điền</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {PRESET_ACCOUNTS.map((acc, idx) => {
                  const isSelected = usernameOrEmail === acc.username;

                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectPreset(acc)}
                      className={`p-2 rounded-2xl border text-left transition-all liquid-touch flex flex-col justify-between ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50/80 dark:bg-blue-950/60 ring-2 ring-blue-500/30 shadow-sm'
                          : 'border-slate-200/80 dark:border-slate-700/80 bg-slate-50/60 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                      title={`${acc.fullName} - ${acc.department}`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className={`w-6 h-6 rounded-xl bg-gradient-to-tr ${acc.color} flex items-center justify-center text-[10px] shadow-xs`}>
                          <i className={`fa-solid ${acc.icon}`}></i>
                        </div>
                        <span className={`text-[8px] font-mono font-black uppercase px-1.5 py-0.5 rounded-md border ${acc.badgeBg}`}>
                          {acc.roleKey}
                        </span>
                      </div>
                      <div className="text-[11px] font-black text-slate-900 dark:text-white truncate">
                        {acc.label}
                      </div>
                      <div className="text-[9px] text-slate-400 truncate">
                        {acc.username}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-6xl mx-auto py-3 border-t border-slate-200/60 dark:border-slate-800/60 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-400">
        <div className="flex items-center gap-2 font-bold">
          <i className="fa-solid fa-industry text-blue-500"></i>
          <span>MAX ELECTRIC VIETNAM JSC — Industrial Switchboard Manufacturing</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 font-mono font-bold text-emerald-600 dark:text-emerald-400">
            <i className="fa-solid fa-circle-check"></i>
            ISO 9001:2015 Audit
          </span>
          <span>v2.6 Enterprise</span>
        </div>
      </footer>

      {/* Safe Area Inset Bottom */}
      <div className="h-[env(safe-area-inset-bottom,0px)]"></div>
    </div>
  );
}

window.WMS_COMPONENTS = window.WMS_COMPONENTS || {};
window.WMS_COMPONENTS.LoginScreen = LoginScreen;
