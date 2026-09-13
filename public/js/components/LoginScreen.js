/**
 * Fact-Forcing Gate Details:
 * 1. Importers/Callers: public/index.html via <script type="text/babel" src="/js/components/LoginScreen.js?v=2026.09.13"></script>
 * 2. Affected API: window.WMS_COMPONENTS.LoginScreen (Single Centered Glass Card with Oceanic Emerald & Solar Gold Mesh)
 * 3. Data schemas: Credentials { usernameOrEmail, password }, onLoginSuccess(user), darkMode, setDarkMode
 * 4. User's verbatim instruction: "hãy dùng /impeccable để sửa lại toàn bộ giao diện đăng nhập chỉ có 1 phần đăng nhập không có các phần khác và cần hiếu ứng hoạt anh sinh động và cần màu sắc sinh động sáng sủa và không dùng màu tím hồng hay chỉ màu đen hay chỉ màu trắng"
 */

function LoginScreen({ onLoginSuccess, darkMode, setDarkMode }) {
  const [usernameOrEmail, setUsernameOrEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);
  const [rememberMe, setRememberMe] = React.useState(true);
  const [isLoading, setIsLoading] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState('');
  const [showHelpModal, setShowHelpModal] = React.useState(false);
  const [mousePos, setMousePos] = React.useState({ x: 250, y: 250 });

  // Mouse Move for Interactive Dynamic Spotlight on the Card
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
      setErrorMsg('Vui lòng nhập tài khoản hoặc email.');
      return;
    }
    if (!password) {
      setErrorMsg('Vui lòng nhập mật khẩu.');
      return;
    }
    executeLogin(usernameOrEmail, password);
  };

  return (
    <div className="min-h-screen flex flex-col justify-between relative overflow-hidden select-none font-sans text-slate-100 bg-gradient-to-br from-cyan-950/80 via-slate-900 to-emerald-950/90">
      {/* 1. Dynamic Living Oceanic Emerald & Solar Gold Mesh Orbs (Zero Purple / Zero Pink) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        {/* Top-Left Cyan Ice Orb */}
        <div className="absolute -top-[12%] -left-[8%] w-[620px] h-[620px] rounded-full bg-gradient-to-tr from-cyan-400/40 via-sky-500/30 to-blue-600/25 blur-[120px] animate-oceanic-1"></div>
        {/* Bottom-Right Solar Gold Amber Orb */}
        <div className="absolute -bottom-[12%] -right-[8%] w-[680px] h-[680px] rounded-full bg-gradient-to-br from-amber-400/35 via-orange-500/25 to-yellow-500/20 blur-[130px] animate-oceanic-2"></div>
        {/* Center-Right Emerald Mint Orb */}
        <div className="absolute top-[30%] right-[15%] w-[500px] h-[500px] rounded-full bg-gradient-to-r from-emerald-400/30 via-teal-500/25 to-cyan-500/20 blur-[115px] animate-oceanic-3"></div>
        {/* Bottom-Left Electric Sky Orb */}
        <div className="absolute bottom-[10%] left-[10%] w-[480px] h-[480px] rounded-full bg-gradient-to-tr from-sky-400/30 via-blue-500/25 to-teal-400/20 blur-[110px] animate-oceanic-4"></div>
      </div>

      {/* Subtle CAD Ambient Grid Pattern */}
      <div className="absolute inset-0 bg-industrial-grid opacity-20 pointer-events-none z-0"></div>

      {/* Top Header Bar */}
      <header className="relative z-20 px-6 py-4 flex items-center justify-between max-w-5xl mx-auto w-full">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-400 via-teal-500 to-emerald-500 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-cyan-500/30 border border-white/40">
            <i className="fa-solid fa-cube text-base"></i>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display font-black text-base tracking-tight text-white drop-shadow-sm">MEVN WMS</span>
              <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-400/30 backdrop-blur-md">
                PRO 2026
              </span>
            </div>
            <p className="text-[11px] text-cyan-200/80 font-medium">Kho & Sản Xuất Tủ Điện</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-xs text-white backdrop-blur-md shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-semibold text-cyan-100 text-[11px]">Hệ Thống Trực Tuyến</span>
          </div>

          {setDarkMode && (
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="w-9 h-9 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white transition-all shadow-sm active:scale-95 cursor-pointer"
              title="Chế độ giao diện"
            >
              <i className={`fa-solid ${darkMode ? 'fa-sun text-amber-300' : 'fa-moon text-cyan-200'} text-xs`}></i>
            </button>
          )}
        </div>
      </header>

      {/* Main Single Centered Login Card */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-4 sm:p-6 my-auto">
        <div
          onMouseMove={handleMouseMove}
          style={{
            '--mouse-x': `${mousePos.x}px`,
            '--mouse-y': `${mousePos.y}px`,
          }}
          className="w-full max-w-md rounded-[32px] bg-slate-900/75 backdrop-blur-3xl border border-white/20 shadow-2xl shadow-cyan-950/60 p-7 sm:p-9 relative spotlight-card transition-all duration-300 animate-fade-in"
        >
          {/* Card Header & Brand Symbol */}
          <div className="text-center mb-6">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-cyan-400 via-teal-500 to-emerald-400 flex items-center justify-center text-slate-950 text-2xl font-black shadow-xl shadow-teal-500/25 border-2 border-white/50 mx-auto mb-4 animate-bounce-subtle">
              <i className="fa-solid fa-boxes-stacked"></i>
            </div>
            <h1 className="text-2xl font-black text-white font-display tracking-tight">
              Đăng Nhập Hệ Thống
            </h1>
            <p className="text-xs text-cyan-200/80 mt-1 font-medium">
              Phần mềm Quản Trị Kho & Cung Ứng Chuẩn ISO
            </p>
          </div>

          {/* Error Notification Alert */}
          {errorMsg && (
            <div className="p-3 mb-4 rounded-2xl bg-rose-500/20 border border-rose-400/40 text-rose-200 text-xs flex items-center gap-2.5 font-medium animate-shake">
              <i className="fa-solid fa-circle-exclamation text-rose-400 text-sm shrink-0"></i>
              <span className="flex-1 leading-snug">{errorMsg}</span>
            </div>
          )}

          {/* Single Form Authentication */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username / Email Field */}
            <div>
              <label className="block text-xs font-semibold text-cyan-100 mb-1.5">
                Tài khoản hoặc Email
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-cyan-300/70 group-focus-within:text-cyan-300 transition">
                  <i className="fa-solid fa-user-tie text-xs"></i>
                </div>
                <input
                  type="text"
                  value={usernameOrEmail}
                  onChange={(e) => setUsernameOrEmail(e.target.value)}
                  placeholder="Nhập tên đăng nhập (VD: admin, thukho...)"
                  disabled={isLoading}
                  required
                  autoFocus
                  className="w-full pl-10 pr-4 py-3 bg-white/10 hover:bg-white/15 focus:bg-white/20 border border-white/20 focus:border-cyan-400 rounded-2xl text-xs text-white placeholder-cyan-200/40 focus:outline-none input-oceanic-glow transition-all font-medium"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-cyan-100">
                  Mật khẩu
                </label>
                <button
                  type="button"
                  onClick={() => setShowHelpModal(true)}
                  className="text-[11px] text-cyan-300 hover:text-amber-300 hover:underline transition cursor-pointer"
                >
                  Trợ giúp đăng nhập?
                </button>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-cyan-300/70 group-focus-within:text-cyan-300 transition">
                  <i className="fa-solid fa-lock-keyhole text-xs"></i>
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Nhập mật khẩu..."
                  disabled={isLoading}
                  required
                  className="w-full pl-10 pr-10 py-3 bg-white/10 hover:bg-white/15 focus:bg-white/20 border border-white/20 focus:border-cyan-400 rounded-2xl text-xs text-white placeholder-cyan-200/40 focus:outline-none input-oceanic-glow transition-all font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-cyan-300/70 hover:text-white transition cursor-pointer"
                  tabIndex="-1"
                  title={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                >
                  <i className={`fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'} text-xs`}></i>
                </button>
              </div>
            </div>

            {/* Remember Me Toggle */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded bg-white/20 border-white/30 text-emerald-500 focus:ring-0 cursor-pointer"
                />
                <span className="text-xs text-cyan-200/90 font-medium">Ghi nhớ phiên làm việc</span>
              </label>
              <span className="text-[11px] text-emerald-400/90 font-mono flex items-center gap-1">
                <i className="fa-solid fa-shield-check text-[10px]"></i>
                <span>Mã hóa SSL</span>
              </span>
            </div>

            {/* Glowing Multi-Color Action Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-4 btn-oceanic-solar text-slate-950 font-black text-xs rounded-2xl shadow-xl shadow-teal-500/30 flex items-center justify-center gap-2 transition-all duration-200 hover:scale-[1.02] active:scale-95 disabled:opacity-50 cursor-pointer mt-4"
            >
              {isLoading ? (
                <>
                  <i className="fa-solid fa-spinner fa-spin text-sm"></i>
                  <span>Đang Xác Thực...</span>
                </>
              ) : (
                <>
                  <i className="fa-solid fa-arrow-right-to-bracket text-xs"></i>
                  <span>VÀO HỆ THỐNG WMS</span>
                </>
              )}
            </button>
          </form>

          {/* Card Footer & Version */}
          <div className="pt-4 mt-5 border-t border-white/10 flex items-center justify-between text-[11px] text-cyan-200/70 font-medium font-mono">
            <span className="flex items-center gap-1 text-emerald-400">
              <i className="fa-solid fa-shield-halved"></i>
              <span>ISO 9001:2015</span>
            </span>
            <span className="text-amber-300">Enterprise v2.6</span>
          </div>
        </div>
      </main>

      {/* Global Bottom Footer */}
      <footer className="relative z-10 px-6 py-3.5 text-center text-xs text-cyan-200/60 max-w-4xl mx-auto w-full flex flex-wrap items-center justify-between gap-2 font-medium">
        <div className="flex items-center gap-2">
          <i className="fa-solid fa-building-circle-check text-teal-400"></i>
          <span>MAX ELECTRIC VIETNAM (MEVN)</span>
        </div>
        <div className="text-[11px] text-cyan-300/70 font-mono">
          Nghiệp Vụ Kho Tủ Điện & Cung Ứng Vật Tư
        </div>
      </footer>

      {/* IT Support Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div
            onClick={() => setShowHelpModal(false)}
            className="fixed inset-0 bg-slate-950/75 backdrop-blur-md"
          ></div>
          <div className="relative w-full max-w-sm bg-slate-900/90 backdrop-blur-2xl border border-cyan-400/30 rounded-3xl p-6 shadow-2xl z-10 space-y-4 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-cyan-400">
                <i className="fa-solid fa-circle-question text-lg"></i>
                <h3 className="font-display font-bold text-sm text-white">HỖ TRỢ ĐĂNG NHẬP</h3>
              </div>
              <button
                onClick={() => setShowHelpModal(false)}
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition cursor-pointer"
              >
                <i className="fa-solid fa-xmark text-xs"></i>
              </button>
            </div>
            <p className="text-xs text-cyan-200 leading-relaxed font-medium">
              Nếu bạn chưa có tài khoản hoặc cần đặt lại mật khẩu, vui lòng liên hệ Ban Quản Trị Hệ Thống:
            </p>
            <div className="p-3.5 bg-white/5 rounded-2xl border border-white/10 text-xs space-y-2 font-medium">
              <div className="flex items-center justify-between">
                <span className="text-cyan-300">Bộ phận:</span>
                <span className="text-white font-bold">Phòng CNTT MEVN</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-cyan-300">Hotline:</span>
                <span className="text-amber-300 font-mono font-bold">024 3999 xxxx</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-cyan-300">Email:</span>
                <span className="text-emerald-300 font-mono font-bold">it@maxelectric.vn</span>
              </div>
            </div>
            <button
              onClick={() => setShowHelpModal(false)}
              className="w-full py-2.5 bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-md transition active:scale-95 cursor-pointer"
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
