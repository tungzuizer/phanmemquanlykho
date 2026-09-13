/**
 * Fact-Forcing Gate Details:
 * 1. Importers/Callers: public/index.html via <script type="text/babel" src="/js/components/Tabs/InventoryTab.js"></script>
 * 2. Affected API: window.WMS_COMPONENTS.InventoryTab (Action-Direct 2-Warehouse Inventory & Bin Map)
 * 3. Data schemas: data ({ stockBalances, skus, uoms, warehouses, bins }), currentUser
 * 4. User's verbatim instruction: "giao diện quá hỗn loạn không biết ở trong có cái gì quá loạn và chữ thì nhiều và hỗn loạn hãy kiểm tra lại vè mấy cái huy chương hay icon tương tự đi phèn quá"
 */

function InventoryTab({ data, currentUser }) {
  const [selectedWhId, setSelectedWhId] = React.useState('ALL');
  const [searchQuery, setSearchQuery] = React.useState('');
  const { formatNumber } = window.WMS_CONSTANTS || { formatNumber: n => n };
  if (!data) return null;

  const warehouses = data.warehouses || [];
  const bins = data.bins || [];
  const skus = data.skus || [];
  const balances = data.stockBalances || [];

  // Filter balances
  const filteredBalances = balances.filter(b => {
    const sku = skus.find(s => s.id === b.skuId);
    const matchWh = selectedWhId === 'ALL' || b.warehouseId === selectedWhId;
    const matchQ = !searchQuery ||
      (sku?.code || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (sku?.name || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchWh && matchQ;
  });

  return (
    <div className="space-y-4 sm:space-y-5 animate-fade-in font-sans">
      {/* Top Header Card */}
      <div className="liquid-glass p-4 sm:p-5 rounded-2xl border border-white/40 dark:border-white/10 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3.5">
        <div>
          <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 font-display">
            <i className="fa-solid fa-boxes-stacked text-cyan-500"></i>
            Quản Lý Tồn Kho & Vị Trí Kệ Hàng
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Phân loại 3 trạng thái: <strong className="text-slate-700 dark:text-slate-300">Vật lý</strong>, <strong className="text-amber-600 dark:text-amber-400">Giữ chỗ BOM</strong> và <strong className="text-cyan-600 dark:text-cyan-400">Khả dụng tự do</strong>.
          </p>
        </div>

        {/* Warehouse Filter Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setSelectedWhId('ALL')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition active:scale-95 cursor-pointer ${
              selectedWhId === 'ALL'
                ? 'bg-slate-900 text-white dark:bg-cyan-500 dark:text-slate-950 shadow-xs'
                : 'liquid-glass text-slate-600 dark:text-slate-300 hover:bg-white/90 dark:hover:bg-slate-800/90'
            }`}
          >
            Tất Cả Kho
          </button>
          {warehouses.map(wh => (
            <button
              key={wh.id}
              onClick={() => setSelectedWhId(wh.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 active:scale-95 cursor-pointer ${
                selectedWhId === wh.id
                  ? 'bg-slate-900 text-white dark:bg-cyan-500 dark:text-slate-950 shadow-xs'
                  : 'liquid-glass text-slate-600 dark:text-slate-300 hover:bg-white/90 dark:hover:bg-slate-800/90'
              }`}
            >
              <i className={`fa-solid ${wh.code.includes('DONG') ? 'fa-cubes text-amber-500' : 'fa-bolt text-cyan-500'}`}></i>
              <span>{wh.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Visual Warehouse Bin Map Section */}
      <div className="liquid-glass p-4 sm:p-5 rounded-2xl border border-white/40 dark:border-white/10 shadow-sm space-y-3.5">
        <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <i className="fa-solid fa-map text-cyan-500 text-xs"></i>
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider font-display">
              Sơ Đồ Mặt Bằng Kệ Hàng (Bin Map)
            </h3>
          </div>
          <span className="text-[11px] text-slate-400 font-mono font-medium">
            {bins.length} vị trí định danh
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
          {bins.map(bin => {
            const wh = warehouses.find(w => w.id === bin.warehouseId);
            const binBalances = balances.filter(b => b.binId === bin.id);
            const totalQty = binBalances.reduce((s, b) => s + Number(b.quantityPhysical), 0);
            const hasItems = totalQty > 0;

            return (
              <div
                key={bin.id}
                className={`p-3 rounded-xl border text-center transition ${
                  hasItems
                    ? 'bg-cyan-500/10 border-cyan-500/30 text-slate-900 dark:text-white shadow-xs'
                    : 'bg-white/30 dark:bg-slate-800/20 border-dashed border-slate-200 dark:border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between text-[10px] mb-1 font-mono">
                  <span className="font-bold text-cyan-700 dark:text-cyan-300">{bin.code}</span>
                  <span className="text-slate-400 text-[9px]">{wh?.code?.slice(0, 4)}</span>
                </div>
                <div className="text-lg font-bold font-mono text-slate-900 dark:text-white my-1">
                  {formatNumber(totalQty)}
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                  {bin.zone} • Dãy {bin.aisle || '01'}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Balances Section: Adaptive Mobile Cards & Desktop Table */}
      <div className="liquid-glass rounded-2xl border border-white/40 dark:border-white/10 overflow-hidden shadow-sm space-y-3.5 p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <i className="fa-solid fa-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Tìm nhanh SKU, tên vật tư, thông số..."
              className="w-full pl-9 pr-4 py-2 bg-white/50 dark:bg-slate-900/50 border border-slate-200/80 dark:border-slate-700/80 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
            />
          </div>
          <span className="text-xs text-slate-500 font-mono font-bold">
            {filteredBalances.length} bản ghi số dư
          </span>
        </div>

        {/* Mobile Adaptive Liquid Cards (Visible on Mobile < 768px) */}
        <div className="md:hidden space-y-2.5">
          {filteredBalances.map(b => {
            const sku = skus.find(s => s.id === b.skuId);
            const uom = (data.uoms || []).find(u => u.id === sku?.baseUomId);
            const wh = warehouses.find(w => w.id === b.warehouseId);
            const bin = bins.find(bn => bn.id === b.binId);

            const phys = Number(b.quantityPhysical);
            const resv = Number(b.quantityReserved);
            const avail = Math.max(0, phys - resv);
            const minSafe = sku?.minSafetyStock || 10;
            const isLow = avail < minSafe;

            return (
              <div
                key={b.id}
                className="p-4 rounded-2xl liquid-glass space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs text-cyan-700 dark:text-cyan-300 bg-cyan-500/10 px-2 py-0.5 rounded-lg border border-cyan-500/20">
                      {sku?.code}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200/60 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {sku?.type}
                    </span>
                  </div>
                  {isLow ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-700 dark:text-rose-300 border border-rose-500/20">
                      Dưới an toàn
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
                      Đảm bảo
                    </span>
                  )}
                </div>

                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">{sku?.name}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">{sku?.specification || 'Chuẩn MEVN'}</div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 bg-white/40 dark:bg-slate-900/60 p-2 rounded-xl border border-slate-200/60 dark:border-slate-800">
                  <span className="font-medium"><i className="fa-solid fa-warehouse mr-1 text-slate-400"></i>{wh?.name}</span>
                  <span className="font-mono font-bold text-cyan-700 dark:text-cyan-300"><i className="fa-solid fa-layer-group mr-1 text-slate-400"></i>Kệ: {bin?.code || 'Kệ mặc định'}</span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center font-mono pt-1">
                  <div className="bg-white/50 dark:bg-slate-900/80 p-2 rounded-xl border border-slate-200/60 dark:border-slate-800">
                    <div className="text-[9px] uppercase font-bold text-slate-400">Vật Lý</div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white mt-0.5">
                      {formatNumber(phys)} <span className="text-[9px] font-normal text-slate-400">{uom?.name}</span>
                    </div>
                  </div>
                  <div className="bg-amber-500/10 p-2 rounded-xl border border-amber-500/20">
                    <div className="text-[9px] uppercase font-bold text-amber-500">Giữ Chỗ</div>
                    <div className="text-xs font-bold text-amber-600 dark:text-amber-400 mt-0.5">
                      {formatNumber(resv)}
                    </div>
                  </div>
                  <div className="bg-cyan-500/10 p-2 rounded-xl border border-cyan-500/20">
                    <div className="text-[9px] uppercase font-bold text-cyan-500">Khả Dụng</div>
                    <div className="text-xs font-bold text-cyan-600 dark:text-cyan-400 mt-0.5">
                      {formatNumber(avail)}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Desktop Table (Visible on Desktop >= 768px) */}
        <div className="hidden md:block border border-slate-200/60 dark:border-slate-800 rounded-xl overflow-hidden">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-white/40 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 border-b border-slate-200/60 dark:border-slate-800 font-bold">
                <th className="py-3 px-4">Mã SKU</th>
                <th className="py-3 px-4">Tên Vật Tư / Thông Số</th>
                <th className="py-3 px-4">Kho & Vị Trí Kệ</th>
                <th className="py-3 px-3 text-right">Tồn Vật Lý</th>
                <th className="py-3 px-3 text-right">Đang Giữ Chỗ</th>
                <th className="py-3 px-3 text-right">Khả Dụng</th>
                <th className="py-3 px-4 text-center">Tình Trạng</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/60 dark:divide-slate-800">
              {filteredBalances.map(b => {
                const sku = skus.find(s => s.id === b.skuId);
                const uom = (data.uoms || []).find(u => u.id === sku?.baseUomId);
                const wh = warehouses.find(w => w.id === b.warehouseId);
                const bin = bins.find(bn => bn.id === b.binId);

                const phys = Number(b.quantityPhysical);
                const resv = Number(b.quantityReserved);
                const avail = Math.max(0, phys - resv);
                const minSafe = sku?.minSafetyStock || 10;
                const isLow = avail < minSafe;

                return (
                  <tr key={b.id} className="hover:bg-white/60 dark:hover:bg-slate-800/40 transition">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-white">
                      {sku?.code}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-800 dark:text-slate-100">{sku?.name}</div>
                      <div className="text-[10px] text-slate-400">{sku?.specification || 'Chuẩn MEVN'}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-700 dark:text-slate-300">{wh?.name}</div>
                      <div className="font-mono text-[10px] text-cyan-600 dark:text-cyan-400">{bin?.code || 'Kệ mặc định'}</div>
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-slate-900 dark:text-white">
                      {formatNumber(phys)} <span className="text-[10px] text-slate-400 font-normal">{uom?.name}</span>
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-amber-600 dark:text-amber-400 font-bold">
                      {formatNumber(resv)}
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold">
                      <span className={isLow ? 'text-rose-600 dark:text-rose-400' : 'text-cyan-600 dark:text-cyan-400'}>
                        {formatNumber(avail)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      {isLow ? (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-700 dark:text-rose-300 border border-rose-500/20">
                          Dưới mức an toàn
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
                          Đảm bảo
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

window.WMS_COMPONENTS = window.WMS_COMPONENTS || {};
window.WMS_COMPONENTS.InventoryTab = InventoryTab;
