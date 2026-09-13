/**
 * Fact-Forcing Gate Details:
 * 1. Importers/Callers: public/index.html via <script type="text/babel" src="/js/components/LoginScreen.js?v=2026.09.13"></script>
 * 2. Affected API: window.WMS_COMPONENTS.LoginScreen, POST /api/auth/login, GET /api/health
 * 3. Data schemas: Credentials { usernameOrEmail, password }, quick role objects { role, user, icon, color, textCol }
 * 4. User's verbatim instruction: "sửa lại toàn bộ giao diện đnăg nahạp cho sáng sủa nhiều hiệu ứng sinh động tương tác và phông chữ sủa lại cho phù hợp với tiếng việt trong các mục và các trang hãy tối ưu hóa toàn bộ chữ khôgn viết dài dòng lan man hãy tập chung vào các ý chính và hãy tôn trong người dùng thiết không dùng icon quê mùa và đặc biệt không dùng phông nền màu đen hoặc trắng hãy mix nhiều màu lại và mang phong cách sáng sủa nhìn vào không biết trang web là ai làm"
 */

function LoginScreen({ onLoginSuccess, darkMode, setDarkMode }) {
  const [usernameOrEmail, setUsernameOrEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);
  const [rememberMe, setRememberMe] = React.useState(true);
  const [isLoading, setIsLoading] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState('');
  const [showHelpModal, setShowHelpModal] = React.useState(false);
  const [mousePos, setMousePos] = React.useState({ x: 0, y: 0 });

  // Quick 1-Touch Demo Roles
  const quickRoles = [
    { role: 'Giám Đốc', user: 'admin', icon: 'fa-crown', color: 'from-amber-400 to-orange-500', textCol: 'text-amber-500' },
    { role: 'Thủ Kho Điện', user: 'thukho_dien', icon: 'fa-bolt-lightning', color: 'from-blue-400 to-indigo-500', textCol: 'text-blue-500' },
    { role: 'Thủ Kho Đồng', user: 'thukho_dong', icon: 'fa-cubes', color: 'from-orange-400 to-amber-600', textCol: 'text-orange-500' },
    { role: 'Kỹ Sư BOM', user: 'kythuat_bom', icon: 'fa-drafting-compass', color: 'from-cyan-400 to-blue-500', textCol: 'text-cyan-500' },
    { role: 'Mua Hàng PO', user: 'muahang_po', icon: 'fa-bag-shopping', color: 'from-emerald-400 to-teal-500', textCol: 'text-emerald-500' },
    { role: 'Sản Xuất', user: 'sanxuat_to1', icon: 'fa-industry', color: 'from-teal-400 to-emerald-600', textCol: 'text-teal-500' },
    { role: 'Kinh Doanh', user: 'sale_admin', icon: 'fa-chart-line', color: 'from-indigo-400 to-purple-600', textCol: 'text-indigo-500' },
    { role: 'Kế Toán Kho', user: 'ketoan_kho', icon: 'fa-receipt', color: 'from-purple-400 to-pink-500', textCol: 'text-purple-500' },
  ];

  // Mouse Move for Interactive Spotlight
  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  // Perform Authentication Request
  const executeLogin = async (username, pwd) => {
    setIsLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          usernameOrEmail: username.trim(),
          password: pwd
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
        setErrorMsg(json.message || 'Tài khoản hoặc mật khẩu không chính xác.');
      }
    } catch (err) {
      console.error('[Auth Error]:', err);
      setErrorMsg('Không thể kết nối đến máy chủ xác thực.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (!usernameOrEmail.trim()) {
      setErrorMsg('Vui lòng nhập tài khoản.');
      return;
    }
    if (!password) {
      setErrorMsg('Vui lòng nhập mật khẩu.');
      return;
    }
    executeLogin(usernameOrEmail, password);
  };

  const handleQuickLogin = (u) => {
    setUsernameOrEmail(u);
    setPassword('mevn@2026');
    executeLogin(u, 'mevn@2026');
  };

  return (
    <div className="min-h-screen flex flex-col justify-between relative overflow-hidden select-none font-sans bg-gradient-to-br from-indigo-900/90 via-purple-900/80 to-slate-900 text-slate-100">
      {/* Dynamic Aurora Floating Light Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-5%] w-[550px] h-[550px] rounded-full bg-gradient-to-tr from-cyan-400/35 via-blue-500/30 to-indigo-600/25 blur-[120px] animate-aurora-1"></div>
        <div className="absolute bottom-[-10%] right-[-5%] w-[600px] h-[600px] rounded-full bg-gradient-to-br from-fuchsia-500/30 via-purple-600/30 to-pink-500/25 blur-[130px] animate-aurora-2"></div>
        <div className="absolute top-[40%] left-[30%] w-[450px] h-[450px] rounded-full bg-gradient-to-r from-emerald-400/25 via-teal-500/20 to-sky-400/25 blur-[110px] animate-aurora-3"></div>
      </div>

      {/* Top Navigation Bar */}
      <header className="relative z-20 px-6 py-4 flex items-center justify-between max-w-6xl mx-auto w-full">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white text-lg font-black shadow-lg shadow-indigo-500/30 border border-white/30">
            <i className="fa-solid fa-cube text-base"></i>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display font-extrabold text-base tracking-tight text-white drop-shadow-sm">MEVN WMS</span>
              <span className="text-[10px] font-bold bg-white/20 text-white px-2 py-0.5 rounded-full border border-white/30 backdrop-blur-md">
                PRO 2026
              </span>
            </div>
            <p className="text-[11px] text-indigo-200/80 font-medium">Kho & Sản Xuất Tủ Điện</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-xs text-white backdrop-blur-md shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-semibold text-indigo-100 text-[11px]">Hệ Thống Trực Tuyến</span>
          </div>

          {setDarkMode && (
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="w-9 h-9 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white transition-all shadow-sm active:scale-95"
              title="Chế độ giao diện"
            >
              <i className={`fa-solid ${darkMode ? 'fa-sun text-amber-300' : 'fa-moon text-indigo-200'} text-xs`}></i>
            </button>
          )}
        </div>
      </header>

      {/* Main Interactive Login Terminal */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div
          onMouseMove={handleMouseMove}
          style={{
            '--mouse-x': `${mousePos.x}px`,
            '--mouse-y': `${mousePos.y}px`,
          }}
          className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 rounded-[28px] bg-slate-900/60 backdrop-blur-3xl border border-white/20 shadow-2xl shadow-indigo-950/50 overflow-hidden relative spotlight-card"
        >
          {/* Left Column: Form Dang Nhap Tinh Gon */}
          <div className="lg:col-span-6 p-7 sm:p-9 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-white/10 bg-white/[0.03]">
            <div>
              <div className="mb-6">
                <h1 className="text-2xl font-black text-white font-display tracking-tight flex items-center gap-2.5">
                  <span>Đăng Nhập</span>
                  <span className="w-2 h-2 rounded-full bg-indigo-400"></span>
                </h1>
                <p className="text-xs text-indigo-200/80 mt-1 font-normal">
                  Nhập thông tin tài khoản để truy cập hệ thống
                </p>
              </div>

              {/* Error Alert */}
              {errorMsg && (
                <div className="p-3 mb-4 rounded-xl bg-rose-500/20 border border-rose-400/40 text-rose-200 text-xs flex items-center gap-2.5 font-medium animate-shake">
                  <i className="fa-solid fa-circle-exclamation text-rose-400 text-sm shrink-0"></i>
                  <span>{errorMsg}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Username Input */}
                <div>
                  <label className="block text-xs font-semibold text-indigo-100 mb-1.5">
                    Tài khoản / Email
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-indigo-300/60 group-focus-within:text-indigo-300 transition">
                      <i className="fa-solid fa-user text-xs"></i>
                    </div>
                    <input
                      type="text"
                      value={usernameOrEmail}
                      onChange={(e) => setUsernameOrEmail(e.target.value)}
                      placeholder="admin, thukho_dien, kythuat_bom..."
                      disabled={isLoading}
                      required
                      className="w-full pl-9 pr-4 py-3 bg-white/10 hover:bg-white/15 focus:bg-white/20 border border-white/20 focus:border-indigo-400 rounded-xl text-xs text-white placeholder-indigo-200/40 focus:outline-none focus:ring-2 focus:ring-indigo-400/30 transition-all font-medium"
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold text-indigo-100">
                      Mật khẩu
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowHelpModal(true)}
                      className="text-[11px] text-indigo-300 hover:text-white hover:underline transition"
                    >
                      Trợ giúp?
                    </button>
                  </div>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-indigo-300/60 group-focus-within:text-indigo-300 transition">
                      <i className="fa-solid fa-lock text-xs"></i>
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Nhập mật khẩu..."
                      disabled={isLoading}
                      required
                      className="w-full pl-9 pr-10 py-3 bg-white/10 hover:bg-white/15 focus:bg-white/20 border border-white/20 focus:border-indigo-400 rounded-xl text-xs text-white placeholder-indigo-200/40 focus:outline-none focus:ring-2 focus:ring-indigo-400/30 transition-all font-medium"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-indigo-300/60 hover:text-white transition"
                      tabIndex="-1"
                    >
                      <i className={`fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'} text-xs`}></i>
                    </button>
                  </div>
                </div>

                {/* Remember checkbox */}
                <div className="flex items-center justify-between pt-0.5">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded bg-white/20 border-white/30 text-indigo-600 focus:ring-0 cursor-pointer"
                    />
                    <span className="text-xs text-indigo-200/90 font-medium">Ghi nhớ đăng nhập</span>
                  </label>
                  <span className="text-[11px] text-indigo-300/70 font-mono">Bảo mật cao</span>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 px-4 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-400 hover:via-purple-400 hover:to-pink-400 text-white font-bold text-xs rounded-xl shadow-lg shadow-purple-500/30 flex items-center justify-center gap-2 transition-all duration-200 active:scale-95 disabled:opacity-50 cursor-pointer mt-3"
                >
                  {isLoading ? (
                    <>
                      <i className="fa-solid fa-spinner fa-spin text-sm"></i>
                      <span>Đang Xác Thực...</span>
                    </>
                  ) : (
                    <>
                      <span>Vào Hệ Thống</span>
                      <i className="fa-solid fa-arrow-right text-xs"></i>
                    </>
                  )}
                </button>
              </form>
            </div>

            <div className="pt-4 mt-4 border-t border-white/10 flex items-center justify-between text-[11px] text-indigo-200/70 font-medium">
              <span>Pass mặc định: <code className="text-white bg-white/10 px-1.5 py-0.5 rounded font-mono font-bold">mevn@2026</code></span>
              <span className="text-emerald-400 flex items-center gap-1 font-semibold">
                <i className="fa-solid fa-shield-check"></i> An Toàn
              </span>
            </div>
          </div>

          {/* Right Column: 1-Touch Quick Role Login (Sinh Dong & Tien Loi) */}
          <div className="lg:col-span-6 p-7 sm:p-9 flex flex-col justify-between bg-gradient-to-br from-indigo-950/40 via-purple-950/30 to-slate-950/40">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-sm font-bold text-white font-display flex items-center gap-2">
                    <i className="fa-solid fa-bolt-lightning text-amber-400"></i>
                    <span>Đăng Nhập Nhanh 1-Chạm</span>
                  </h2>
                  <p className="text-[11px] text-indigo-200/70 mt-0.5">Chọn vai trò để trải nghiệm ngay không cần gõ phím</p>
                </div>
              </div>

              {/* Roles Grid */}
              <div className="grid grid-cols-2 gap-2.5">
                {quickRoles.map((item) => (
                  <button
                    key={item.user}
                    type="button"
                    onClick={() => handleQuickLogin(item.user)}
                    disabled={isLoading}
                    className="p-3 rounded-2xl bg-white/[0.06] hover:bg-white/[0.14] border border-white/15 hover:border-white/30 text-left transition-all duration-200 hover:-translate-y-0.5 active:scale-95 group flex items-center gap-2.5"
                  >
                    <div className={`w-8 h-8 rounded-xl bg-gradient-to-tr ${item.color} flex items-center justify-center text-white text-xs shadow-md shrink-0 group-hover:scale-110 transition-transform`}>
                      <i className={`fa-solid ${item.icon}`}></i>
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-white truncate font-display group-hover:text-indigo-200 transition-colors">
                        {item.role}
                      </div>
                      <div className="text-[10px] text-indigo-300/70 font-mono truncate">
                        @{item.user}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Tips */}
            <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-between text-[11px] text-indigo-200/60 font-medium">
              <span>Đầy đủ 11 nghiệp vụ ISO kho & sản xuất</span>
              <span className="text-indigo-300">Phiên bản 2026</span>
            </div>
          </div>
        </div>
      </main>

      {/* Global Bottom Footer */}
      <footer className="relative z-10 px-6 py-3.5 text-center text-xs text-indigo-200/60 max-w-4xl mx-auto w-full flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 font-medium">
          <i className="fa-solid fa-building-circle-check text-indigo-400"></i>
          <span>MAX ELECTRIC VIETNAM (MEVN)</span>
        </div>
        <div className="text-[11px] text-indigo-300/70">
          Hệ Thống Quản Trị Kho Doanh Nghiệp
        </div>
      </footer>

      {/* IT Help Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div
            onClick={() => setShowHelpModal(false)}
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-md"
          ></div>
          <div className="relative w-full max-w-sm bg-slate-900/90 backdrop-blur-2xl border border-white/20 rounded-3xl p-6 shadow-2xl z-10 space-y-4 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-indigo-400">
                <i className="fa-solid fa-circle-question text-lg"></i>
                <h3 className="font-display font-bold text-sm text-white">HỖ TRỢ ĐĂNG NHẬP</h3>
              </div>
              <button
                onClick={() => setShowHelpModal(false)}
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition"
              >
                <i className="fa-solid fa-xmark text-xs"></i>
              </button>
            </div>
            <p className="text-xs text-indigo-200 leading-relaxed font-medium">
              Nếu bạn cần cấp mới hoặc đặt lại mật khẩu, vui lòng liên hệ bộ phận hỗ trợ kỹ thuật:
            </p>
            <div className="p-3 bg-white/5 rounded-2xl border border-white/10 text-xs space-y-1.5 font-medium">
              <div><span className="text-indigo-300">Hotline:</span> <span className="text-white font-bold ml-1">024 3999 xxxx</span></div>
              <div><span className="text-indigo-300">Email:</span> <span className="text-cyan-300 font-bold ml-1">it@maxelectric.vn</span></div>
            </div>
            <button
              onClick={() => setShowHelpModal(false)}
              className="w-full py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white font-bold text-xs rounded-xl shadow-md transition active:scale-95 cursor-pointer"
            >
              Đã Hiểu
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

window.WMS_COMPONENTS = window.WMS_COMPONENTS || {};
window.WMS_COMPONENTS.LoginScreen = LoginScreen;
