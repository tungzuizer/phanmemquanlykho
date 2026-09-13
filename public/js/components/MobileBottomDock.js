/*
Fact-Forcing Gate Details:
1. Importers/Callers: public/index.html via <script type="text/babel" src="/js/components/MobileBottomDock.js"></script>
2. Affected API: iOS Floating Liquid Bottom Dock & Quick SKU Field Lens with Role-Adaptive Filtering (window.WMS_COMPONENTS.MobileBottomDock)
3. Data schemas: activeTab, setActiveTab, counts, data (skus, stockBalances, bins, warehouses), currentUser, onOpenCommandPalette
4. User's verbatim instruction: "sửa lại toàn bộ giao diện đnăg nahạp cho sáng sủa nhiều hiệu ứng sinh động tương tác và phông chữ sủa lại cho phù hợp với tiếng việt trong các mục và các trang hãy tối ưu hóa toàn bộ chữ khôgn viết dài dòng lan man hãy tập chung vào các ý chính và hãy tôn trong người dùng thiết không dùng icon quê mùa và đặc biệt không dùng phông nền màu đen hoặc trắng hãy mix nhiều màu lại và mang phong cách sáng sủa nhìn vào không biết trang web là ai làm"
*/

function MobileBottomDock({
  activeTab,
  setActiveTab,
  counts = {},
  data,
  currentUser,
  onOpenCommandPalette
}) {
  const [showMoreMenu, setShowMoreMenu] = React.useState(false);
  const [showSkuLens, setShowSkuLens] = React.useState(false);
  const [skuQuery, setSkuQuery] = React.useState('');
  const { formatNumber, isTabAllowed } = window.WMS_CONSTANTS || {
    formatNumber: n => n,
    isTabAllowed: () => true
  };

  const skus = (data?.skus) || [];
  const balances = (data?.stockBalances) || [];
  const warehouses = (data?.warehouses) || [];
  const bins = (data?.bins) || [];

  const filteredSkus = skuQuery.trim()
    ? skus.filter(s =>
        s.code.toLowerCase().includes(skuQuery.toLowerCase()) ||
        s.name.toLowerCase().includes(skuQuery.toLowerCase())
      )
    : skus.slice(0, 5);

  const allMainTabs = [
    { id: 'dashboard', label: 'Tổng quan', icon: 'fa-house' },
    { id: 'orders', label: 'Đơn hàng', icon: 'fa-boxes-packing', badge: counts.orders },
    { id: 'lens', label: 'Tra cứu SKU', icon: 'fa-qrcode', isAction: true },
    { id: 'inventory', label: 'Kho & Kệ', icon: 'fa-warehouse' },
    { id: 'more', label: 'Mở rộng', icon: 'fa-cubes', isMore: true, badge: (counts.pos || 0) + (counts.dispatch || 0) },
  ];

  const mainTabs = allMainTabs.filter(t => t.isAction || t.isMore || isTabAllowed(currentUser, t.id));

  const allMoreItems = [
    { id: 'boms', label: 'BOM & Delta', icon: 'fa-diagram-project', color: 'text-indigo-500', badge: counts.boms },
    { id: 'pos', label: 'Mua Hàng PO', icon: 'fa-cart-shopping', color: 'text-amber-500', badge: counts.pos },
    { id: 'grns', label: 'Nhập Kho GRN', icon: 'fa-truck-ramp-box', color: 'text-teal-500', badge: counts.grns },
    { id: 'dispatch', label: 'Xuất Kho GDN', icon: 'fa-truck-fast', color: 'text-emerald-500', badge: counts.dispatch },
    { id: 'returns', label: 'Nhập Trả / Phế Phẩm', icon: 'fa-arrow-rotate-left', color: 'text-purple-500' },
    { id: 'kpi', label: '3 Chỉ Số KPI ISO', icon: 'fa-chart-pie', color: 'text-blue-500' },
    { id: 'ledger', label: 'Sổ Cái Biến Động', icon: 'fa-shield-halved', color: 'text-cyan-500' },
  ];

  const moreItems = allMoreItems.filter(m => isTabAllowed(currentUser, m.id));

  return (
    <>
      {/* Liquid Floating Capsule Bottom Dock (Visible only on Mobile md:hidden) */}
      <nav className="md:hidden liquid-bottom-dock flex items-center justify-around select-none font-sans">
        {mainTabs.map(tab => {
          if (tab.isAction) {
            return (
              <button
                key={tab.id}
                onClick={() => setShowSkuLens(true)}
                className="relative -top-3 w-12 h-12 rounded-full bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 text-white flex items-center justify-center shadow-lg shadow-indigo-500/40 border-2 border-white/80 dark:border-slate-800 cursor-pointer active:scale-95"
                aria-label="Tra cứu nhanh SKU hiện trường"
              >
                <i className={`fa-solid ${tab.icon} text-lg`}></i>
              </button>
            );
          }

          if (tab.isMore) {
            const isMoreActive = moreItems.some(m => m.id === activeTab);
            return (
              <button
                key={tab.id}
                onClick={() => setShowMoreMenu(true)}
                className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-2xl relative cursor-pointer active:scale-95 ${
                  isMoreActive
                    ? 'text-indigo-600 dark:text-indigo-400 font-bold'
                    : 'text-slate-500 dark:text-slate-400 font-medium'
                }`}
              >
                <i className={`fa-solid ${tab.icon} text-base`}></i>
                <span className="text-[10px] mt-0.5">{tab.label}</span>
                {tab.badge > 0 && (
                  <span className="absolute -top-0.5 right-1 w-4 h-4 bg-rose-500 text-white text-[9px] font-black rounded-full flex items-center justify-center">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          }

          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-2xl relative cursor-pointer active:scale-95 ${
                isActive
                  ? 'text-indigo-600 dark:text-indigo-400 font-bold'
                  : 'text-slate-500 dark:text-slate-400 font-medium'
              }`}
            >
              <i className={`fa-solid ${tab.icon} text-base`}></i>
              <span className="text-[10px] mt-0.5">{tab.label}</span>
              {tab.badge > 0 && (
                <span className="absolute -top-0.5 right-1 w-4 h-4 bg-indigo-600 text-white text-[9px] font-black rounded-full flex items-center justify-center">
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Quick SKU Field Lens Bottom Sheet */}
      {showSkuLens && (
        <div className="liquid-sheet-overlay" onClick={() => setShowSkuLens(false)}>
          <div
            className="liquid-sheet-content p-5 space-y-4 font-sans"
            onClick={e => e.stopPropagation()}
          >
            <div className="liquid-sheet-handle"></div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold border border-indigo-500/20">
                  <i className="fa-solid fa-qrcode"></i>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white font-display">
                    Tra Cứu Vật Tư & Vị Trí Kệ
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Tra cứu tồn vật lý, giữ chỗ & khả dụng tức thì
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowSkuLens(false)}
                className="w-8 h-8 rounded-xl bg-white/60 dark:bg-slate-800 text-slate-500 flex items-center justify-center cursor-pointer active:scale-95"
              >
                <i className="fa-solid fa-xmark text-xs"></i>
              </button>
            </div>

            {/* Quick Search Input */}
            <div className="relative">
              <i className="fa-solid fa-barcode absolute left-3.5 top-1/2 -translate-y-1/2 text-indigo-500 text-sm"></i>
              <input
                type="text"
                value={skuQuery}
                onChange={e => setSkuQuery(e.target.value)}
                placeholder="Nhập mã SKU, quét barcode hoặc tên..."
                className="w-full pl-10 pr-4 py-2.5 bg-white/60 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 rounded-2xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                autoFocus
              />
            </div>

            {/* SKU Result Cards */}
            <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
              {filteredSkus.map(sku => {
                const skuBalances = balances.filter(b => b.skuId === sku.id);
                const totalPhys = skuBalances.reduce((s, b) => s + Number(b.quantityPhysical), 0);
                const totalResv = skuBalances.reduce((s, b) => s + Number(b.quantityReserved), 0);
                const totalAvail = Math.max(0, totalPhys - totalResv);

                return (
                  <div
                    key={sku.id}
                    className="p-3.5 rounded-2xl bg-white/60 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 shadow-xs space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-xs text-indigo-600 dark:text-indigo-400">
                        {sku.code}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                        {sku.type}
                      </span>
                    </div>

                    <div className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
                      {sku.name}
                    </div>

                    <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-100 dark:border-slate-700/50 text-center font-mono text-[11px]">
                      <div className="bg-slate-50 dark:bg-slate-900/50 p-1.5 rounded-xl">
                        <div className="text-[9px] text-slate-400">Vật Lý</div>
                        <div className="font-bold text-slate-900 dark:text-white">{formatNumber(totalPhys)}</div>
                      </div>
                      <div className="bg-indigo-50 dark:bg-indigo-950/40 p-1.5 rounded-xl">
                        <div className="text-[9px] text-indigo-400">Giữ Chỗ</div>
                        <div className="font-bold text-indigo-600 dark:text-indigo-400">{formatNumber(totalResv)}</div>
                      </div>
                      <div className="bg-emerald-50 dark:bg-emerald-950/40 p-1.5 rounded-xl">
                        <div className="text-[9px] text-emerald-400">Khả Dụng</div>
                        <div className="font-bold text-emerald-600 dark:text-emerald-400">{formatNumber(totalAvail)}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Extended More Menu Bottom Sheet */}
      {showMoreMenu && (
        <div className="liquid-sheet-overlay" onClick={() => setShowMoreMenu(false)}>
          <div
            className="liquid-sheet-content p-5 space-y-4 font-sans"
            onClick={e => e.stopPropagation()}
          >
            <div className="liquid-sheet-handle"></div>

            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white font-display">
                Phân Hệ Mở Rộng
              </h3>
              <button
                onClick={() => setShowMoreMenu(false)}
                className="w-8 h-8 rounded-xl bg-white/60 dark:bg-slate-800 text-slate-500 flex items-center justify-center cursor-pointer active:scale-95"
              >
                <i className="fa-solid fa-xmark text-xs"></i>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {moreItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setShowMoreMenu(false);
                  }}
                  className={`p-3.5 rounded-2xl border text-left flex items-center gap-3 cursor-pointer active:scale-95 relative ${
                    activeTab === item.id
                      ? 'bg-indigo-50/80 dark:bg-indigo-950/50 border-indigo-300 dark:border-indigo-700 shadow-xs'
                      : 'bg-white/60 dark:bg-slate-800/60 border-slate-200/80 dark:border-slate-700/60'
                  }`}
                >
                  <div className={`w-9 h-9 rounded-xl bg-white/80 dark:bg-slate-700 flex items-center justify-center text-sm shadow-xs ${item.color}`}>
                    <i className={`fa-solid ${item.icon}`}></i>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
                      {item.label}
                    </div>
                  </div>
                  {item.badge > 0 && (
                    <span className="w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] font-black flex items-center justify-center">
                      {item.badge}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

window.WMS_COMPONENTS = window.WMS_COMPONENTS || {};
window.WMS_COMPONENTS.MobileBottomDock = MobileBottomDock;
