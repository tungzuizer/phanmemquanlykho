/*
1. Importers/Callers: public/index.html via <script type="text/babel" src="/js/components/CommandPalette.js"></script>
2. Affected API: iOS 26 Liquid Glass Universal Command Palette & Spotlight Search (triggered by Ctrl+K / Search Button).
3. Data schemas: Uses data.orders, data.skus, data.purchaseOrders, data.goodsDispatchNotes and NAV_DOMAINS.
4. User's verbatim instruction: "cải thiện cả giao diện trên iphone và adroi và thiết kế theo phong cách Giao Diện Ios 26 Liquid Glass" / "theo khuyến nghị của bạn"
*/

function CommandPalette({ isOpen, onClose, data, onSelectOrder, onNavigateTab }) {
  const [query, setQuery] = React.useState('');
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const inputRef = React.useRef(null);

  React.useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 60);
    }
  }, [isOpen]);

  // Handle global shortcut Ctrl+K and Escape
  React.useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else onClose(true);
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !data) return null;

  const q = query.trim().toLowerCase();

  const matchedOrders = q
    ? (data.orders || []).filter(o =>
        o.code.toLowerCase().includes(q) ||
        o.title.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q)
      ).slice(0, 4)
    : (data.orders || []).slice(0, 3);

  const matchedSkus = q
    ? (data.skus || []).filter(s =>
        s.code.toLowerCase().includes(q) ||
        s.name.toLowerCase().includes(q) ||
        (s.specification && s.specification.toLowerCase().includes(q))
      ).slice(0, 4)
    : [];

  const matchedPos = q
    ? (data.purchaseOrders || []).filter(p => p.code.toLowerCase().includes(q)).slice(0, 3)
    : [];

  const matchedGdns = q
    ? (data.goodsDispatchNotes || []).filter(g => g.code.toLowerCase().includes(q)).slice(0, 3)
    : [];

  const allResults = [
    ...matchedOrders.map(o => ({ type: 'order', title: `${o.code} - ${o.title}`, sub: o.customerName, icon: 'fa-cubes', item: o })),
    ...matchedSkus.map(s => ({ type: 'sku', title: `${s.code} - ${s.name}`, sub: s.specification, icon: 'fa-microchip', item: s })),
    ...matchedPos.map(p => ({ type: 'po', title: `PO Mua hàng: ${p.code}`, sub: `Trạng thái: ${p.status}`, icon: 'fa-cart-shopping', item: p })),
    ...matchedGdns.map(g => ({ type: 'gdn', title: `Phiếu xuất: ${g.code}`, sub: `Người nhận: ${g.receiverName}`, icon: 'fa-dolly', item: g }))
  ];

  const handleSelect = (result) => {
    if (result.type === 'order') {
      onSelectOrder(result.item);
      onNavigateTab('orders');
    } else if (result.type === 'sku') {
      onNavigateTab('inventory');
    } else if (result.type === 'po') {
      onNavigateTab('pos');
    } else if (result.type === 'gdn') {
      onNavigateTab('dispatch');
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/65 backdrop-blur-md z-50 flex items-end sm:items-start justify-center pt-0 sm:pt-20 p-0 sm:p-4 animate-fade-in">
      <div className="w-full max-w-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl rounded-t-3xl sm:rounded-3xl shadow-2xl border-t sm:border border-white/80 dark:border-white/10 overflow-hidden flex flex-col max-h-[85vh] liquid-specular pb-[max(1rem,env(safe-area-inset-bottom))] sm:pb-0">

        {/* Mobile Drag Handle */}
        <div className="sm:hidden pt-2 flex justify-center">
          <div className="liquid-sheet-handle"></div>
        </div>

        {/* Search Header Input */}
        <div className="flex items-center px-4 sm:px-5 border-b border-slate-200/80 dark:border-slate-800 h-14 sm:h-16 gap-3 bg-slate-50/50 dark:bg-slate-800/50">
          <i className="fa-solid fa-magnifying-glass text-blue-500 text-sm"></i>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Tìm nhanh đơn hàng, SKU, PO, GDN, vị trí kệ..."
            className="flex-1 bg-transparent text-xs sm:text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs p-1"
            >
              <i className="fa-solid fa-circle-xmark"></i>
            </button>
          )}
          <kbd className="hidden sm:inline-block px-2 py-0.5 bg-slate-200 dark:bg-slate-800 text-slate-500 rounded-lg text-[10px] font-mono">
            ESC
          </kbd>
          <button
            onClick={onClose}
            className="sm:hidden text-slate-500 text-xs font-bold px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-xl"
          >
            Đóng
          </button>
        </div>

        {/* Results List */}
        <div className="p-3 sm:p-4 overflow-y-auto space-y-1.5 flex-1">
          {allResults.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <i className="fa-solid fa-search text-3xl mb-2 text-slate-300 dark:text-slate-700"></i>
              <p className="text-xs">Không tìm thấy kết quả nào khớp với "{query}".</p>
            </div>
          ) : (
            allResults.map((res, i) => (
              <div
                key={i}
                onClick={() => handleSelect(res)}
                className={`p-3 rounded-2xl flex items-center justify-between cursor-pointer transition liquid-touch ${
                  i === selectedIndex
                    ? 'bg-blue-50/80 dark:bg-blue-950/40 text-blue-900 dark:text-blue-100 border border-blue-200 dark:border-blue-800'
                    : 'hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-200 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-blue-600 dark:text-blue-400 text-xs shrink-0">
                    <i className={`fa-solid ${res.icon}`}></i>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-bold truncate">{res.title}</div>
                    <div className="text-[11px] text-slate-400 dark:text-slate-500 truncate">{res.sub}</div>
                  </div>
                </div>
                <span className="text-[10px] uppercase font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full ml-2 shrink-0">
                  {res.type}
                </span>
              </div>
            ))
          )}
        </div>

        {/* Footer Shortcut Tips */}
        <div className="hidden sm:flex px-4 py-2 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-3">
            <span><kbd className="font-mono bg-white dark:bg-slate-900 px-1.5 py-0.5 rounded-md border text-[10px]">↑↓</kbd> Di chuyển</span>
            <span><kbd className="font-mono bg-white dark:bg-slate-900 px-1.5 py-0.5 rounded-md border text-[10px]">Enter</kbd> Chọn</span>
          </div>
          <span>MEVN WMS Universal Search</span>
        </div>
      </div>
    </div>
  );
}

window.WMS_COMPONENTS = window.WMS_COMPONENTS || {};
window.WMS_COMPONENTS.CommandPalette = CommandPalette;
