/*
1. Importers/Callers: public/index.html via <script type="text/babel" src="/js/components/Modals.js"></script>
2. Affected API: Client-side modal components suite rendered as iOS 26 Liquid Glass Bottom Action Sheets on Mobile (window.WMS_COMPONENTS.Modals).
3. Data schemas: Uses data.orders, data.skus, data.uoms, data.warehouses, data.bins, data.purchaseOrders, data.goodsDispatchNotes, currentUser.
4. User's verbatim instruction: "cải thiện cả giao diện trên iphone và adroi và thiết kế theo phong cách Giao Diện Ios 26 Liquid Glass" / "theo khuyến nghị của bạn"
*/

function Modals({
  data,
  currentUser,
  activeModal,
  onClose,
  onSubmitOrder,
  onSubmitBom,
  onSubmitPo,
  onSubmitGrn,
  onSubmitPickup,
  onSubmitGdn,
  onSubmitReturn,
  printPreviewData,
}) {
  if (!activeModal || !data) return null;

  const { formatMoney, formatNumber, formatDate } = window.WMS_CONSTANTS || {
    formatMoney: n => n,
    formatNumber: n => n,
    formatDate: d => d
  };

  // Reusable Modal / Sheet Wrapper with iOS 26 Liquid Glass Styling
  const ModalShell = ({ title, icon, iconColor = 'text-blue-600', children, maxWidth = 'max-w-lg' }) => (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-end md:items-center justify-center p-0 md:p-4 animate-fade-in">
      <div
        className={`w-full ${maxWidth} bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl rounded-t-3xl md:rounded-3xl p-5 sm:p-6 shadow-2xl border-t md:border border-white/80 dark:border-white/10 space-y-4 max-h-[92vh] flex flex-col liquid-specular pb-[max(1.25rem,env(safe-area-inset-bottom))] md:pb-6`}
      >
        {/* Mobile Drag Handle */}
        <div className="md:hidden flex justify-center -mt-2 -mb-1">
          <div className="liquid-sheet-handle"></div>
        </div>

        <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-slate-800 pb-3">
          <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
            <i className={`fa-solid ${icon} ${iconColor}`}></i>
            <span>{title}</span>
          </h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center justify-center liquid-touch"
            aria-label="Đóng"
          >
            <i className="fa-solid fa-xmark text-sm"></i>
          </button>
        </div>

        <div className="overflow-y-auto flex-1 pr-0.5 space-y-3">
          {children}
        </div>
      </div>
    </div>
  );

  // 1. ORDER MODAL
  if (activeModal === 'ORDER') {
    return (
      <ModalShell
        title="Tạo Lệnh Sản Xuất Đơn Hàng Mới"
        icon="fa-folder-plus"
        iconColor="text-blue-600"
      >
        <form
          onSubmit={e => {
            e.preventDefault();
            const fd = new FormData(e.target);
            onSubmitOrder({
              code: fd.get('code'),
              title: fd.get('title'),
              customer: fd.get('customer'),
              deliveryDate: fd.get('deliveryDate'),
              cabinetType: fd.get('cabinetType'),
              priority: fd.get('priority'),
            });
          }}
          className="space-y-3 text-xs"
        >
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Mã Đơn Hàng (Order Code)</label>
            <input
              name="code"
              defaultValue={`DH-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`}
              required
              className="w-full px-3.5 py-2.5 bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl font-mono font-bold text-slate-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Tên Dự Án / Tủ Điện</label>
            <input
              name="title"
              placeholder="VD: Tủ Phân Phối MSB 2500A - Tòa Nhà Bitexco"
              required
              className="w-full px-3.5 py-2.5 bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Khách Hàng / Chủ Đầu Tư</label>
              <input
                name="customer"
                placeholder="Tập đoàn Vingroup"
                required
                className="w-full px-3.5 py-2.5 bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Hạn Giao Hàng</label>
              <input
                name="deliveryDate"
                type="date"
                defaultValue={new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0]}
                required
                className="w-full px-3.5 py-2.5 bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white font-mono"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Chủng Loại Tủ</label>
              <select
                name="cabinetType"
                className="w-full px-3.5 py-2.5 bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl font-bold text-slate-900 dark:text-white"
              >
                <option value="MSB">Tủ Tổng MSB</option>
                <option value="DB">Tủ Phân Phối DB</option>
                <option value="MCC">Tủ Điều Khiển Động Cơ MCC</option>
                <option value="ATS">Tủ Chuyển Nguồn ATS</option>
              </select>
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Độ Ưu Tiên</label>
              <select
                name="priority"
                className="w-full px-3.5 py-2.5 bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl font-bold text-amber-600 dark:text-amber-400"
              >
                <option value="NORMAL">Bình Thường (Normal)</option>
                <option value="HIGH">Cao (High)</option>
                <option value="URGENT">Khẩn Cấp (Urgent)</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-200/80 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-2xl font-bold liquid-touch"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold shadow-md shadow-blue-500/20 liquid-touch"
            >
              Tạo Đơn Hàng
            </button>
          </div>
        </form>
      </ModalShell>
    );
  }

  // 2. BOM MODAL
  if (activeModal === 'BOM') {
    const [selectedOrderId, setSelectedOrderId] = React.useState(data.orders?.[0]?.id || '');
    const [rows, setRows] = React.useState([
      { skuId: data.skus?.[0]?.id || '', quantityRequired: 1, note: '' },
    ]);

    const addRow = () => {
      setRows([...rows, { skuId: data.skus?.[0]?.id || '', quantityRequired: 1, note: '' }]);
    };

    const removeRow = idx => {
      if (rows.length > 1) setRows(rows.filter((_, i) => i !== idx));
    };

    return (
      <ModalShell
        title="Bóc Tách Định Mức Kỹ Thuật (BOM Setup)"
        icon="fa-layer-group"
        iconColor="text-blue-600"
        maxWidth="max-w-2xl"
      >
        <div className="space-y-3 text-xs">
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Gán Cho Đơn Hàng</label>
            <select
              value={selectedOrderId}
              onChange={e => setSelectedOrderId(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl font-bold text-slate-900 dark:text-white"
            >
              {data.orders.map(o => (
                <option key={o.id} value={o.id}>
                  {o.code} - {o.title} ({o.customer})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-700 dark:text-slate-300">Danh Sách Vật Tư & Số Lượng Định Mức</span>
              <button
                onClick={addRow}
                type="button"
                className="px-3 py-1 bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 font-bold rounded-xl border border-blue-200 dark:border-blue-800 flex items-center gap-1 liquid-touch"
              >
                <i className="fa-solid fa-plus"></i> Thêm Dòng
              </button>
            </div>

            {rows.map((row, idx) => (
              <div key={idx} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 bg-slate-100/80 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-200/80 dark:border-slate-700">
                <div className="flex-1">
                  <select
                    value={row.skuId}
                    onChange={e => {
                      const next = [...rows];
                      next[idx].skuId = e.target.value;
                      setRows(next);
                    }}
                    className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-[11px] text-slate-900 dark:text-white"
                  >
                    {data.skus.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.code} - {s.name} ({s.specification || 'Chuẩn'})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-24">
                    <input
                      type="number"
                      min="1"
                      value={row.quantityRequired}
                      onChange={e => {
                        const next = [...rows];
                        next[idx].quantityRequired = Number(e.target.value);
                        setRows(next);
                      }}
                      className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-right font-mono font-bold text-slate-900 dark:text-white"
                    />
                  </div>
                  <div className="flex-1">
                    <input
                      type="text"
                      placeholder="Vị trí lắp/ghi chú"
                      value={row.note}
                      onChange={e => {
                        const next = [...rows];
                        next[idx].note = e.target.value;
                        setRows(next);
                      }}
                      className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-[11px] text-slate-900 dark:text-white"
                    />
                  </div>
                  {rows.length > 1 && (
                    <button
                      onClick={() => removeRow(idx)}
                      type="button"
                      className="p-2 text-red-500 hover:text-red-700 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/40 liquid-touch"
                    >
                      <i className="fa-solid fa-trash"></i>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-200/80 dark:border-slate-800">
            <button
              onClick={onClose}
              className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-2xl font-bold text-xs liquid-touch"
            >
              Hủy
            </button>
            <button
              onClick={() => {
                onSubmitBom({
                  orderId: selectedOrderId,
                  version: 'v1.0',
                  items: rows,
                });
              }}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold text-xs shadow-md shadow-blue-500/20 liquid-touch"
            >
              Lưu & Phát Hành BOM
            </button>
          </div>
        </div>
      </ModalShell>
    );
  }

  // 3. PO MODAL
  if (activeModal === 'PO') {
    return (
      <ModalShell
        title="Lập Đơn Mua Hàng PO Bù Thiếu Vật Tư"
        icon="fa-cart-shopping"
        iconColor="text-red-600"
      >
        <form
          onSubmit={e => {
            e.preventDefault();
            const fd = new FormData(e.target);
            onSubmitPo({
              code: fd.get('code'),
              orderId: fd.get('orderId'),
              supplierName: fd.get('supplierName'),
              expectedDate: fd.get('expectedDate'),
              skuId: fd.get('skuId'),
              quantity: Number(fd.get('quantity')),
              unitPrice: Number(fd.get('unitPrice')),
            });
          }}
          className="space-y-3 text-xs"
        >
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Mã Đơn PO</label>
            <input
              name="code"
              defaultValue={`PO-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`}
              required
              className="w-full px-3.5 py-2.5 bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl font-mono font-bold text-slate-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Đơn Hàng Cần Bù Thiếu</label>
            <select
              name="orderId"
              className="w-full px-3.5 py-2.5 bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl font-bold text-slate-900 dark:text-white"
            >
              {data.orders.map(o => (
                <option key={o.id} value={o.id}>
                  {o.code} - {o.title}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Nhà Cung Cấp</label>
            <input
              name="supplierName"
              defaultValue="Schneider Electric VN / Cadivi"
              required
              className="w-full px-3.5 py-2.5 bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Mã Vật Tư (SKU)</label>
              <select
                name="skuId"
                className="w-full px-3.5 py-2.5 bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl font-mono text-[11px] text-slate-900 dark:text-white"
              >
                {data.skus.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.code} - {s.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Số Lượng Mua</label>
              <input
                name="quantity"
                type="number"
                defaultValue="20"
                min="1"
                required
                className="w-full px-3.5 py-2.5 bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl font-mono font-bold text-slate-900 dark:text-white"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Đơn Giá Dự Kiến (VNĐ)</label>
              <input
                name="unitPrice"
                type="number"
                defaultValue="1500000"
                min="1000"
                required
                className="w-full px-3.5 py-2.5 bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl font-mono font-bold text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Dự Kiến Về Kho</label>
              <input
                name="expectedDate"
                type="date"
                defaultValue={new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0]}
                required
                className="w-full px-3.5 py-2.5 bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl font-mono text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-200/80 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-2xl font-bold liquid-touch"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-2xl font-bold shadow-md shadow-red-500/20 liquid-touch"
            >
              Tạo Đơn PO
            </button>
          </div>
        </form>
      </ModalShell>
    );
  }

  // 4. SHIFT PICKUP REGISTRATION (MẪU 1)
  if (activeModal === 'PICKUP') {
    return (
      <ModalShell
        title="Đăng Ký Khung Giờ Ca Lấy Vật Tư (Mẫu 1)"
        icon="fa-calendar-check"
        iconColor="text-emerald-600"
      >
        <form
          onSubmit={e => {
            e.preventDefault();
            const fd = new FormData(e.target);
            onSubmitPickup({
              orderId: fd.get('orderId'),
              shift: fd.get('shift'),
              pickupDate: fd.get('pickupDate'),
              teamLeaderName: fd.get('teamLeaderName'),
              gateNumber: fd.get('gateNumber'),
              note: fd.get('note'),
            });
          }}
          className="space-y-3 text-xs"
        >
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Đơn Hàng Xuất Lắp Ráp</label>
            <select
              name="orderId"
              className="w-full px-3.5 py-2.5 bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl font-bold text-slate-900 dark:text-white"
            >
              {data.orders.map(o => (
                <option key={o.id} value={o.id}>
                  {o.code} - {o.title}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Khung Giờ Ca Lấy</label>
              <select
                name="shift"
                className="w-full px-3.5 py-2.5 bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl font-bold text-emerald-600 dark:text-emerald-400"
              >
                <option value="CA_SANG">Ca Sáng (08:00 - 11:30)</option>
                <option value="CA_CHIEU">Ca Chiều (13:30 - 16:30)</option>
                <option value="CA_TOI">Ca Tăng Ca (17:30 - 20:30)</option>
              </select>
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Ngày Lấy Hàng</label>
              <input
                name="pickupDate"
                type="date"
                defaultValue={new Date().toISOString().split('T')[0]}
                required
                className="w-full px-3.5 py-2.5 bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl font-mono text-slate-900 dark:text-white"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Tổ Trưởng Tiếp Nhận</label>
              <input
                name="teamLeaderName"
                defaultValue="Nguyễn Văn An (Tổ Lắp Ráp 1)"
                required
                className="w-full px-3.5 py-2.5 bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Cửa Kho Chỉ Định</label>
              <input
                name="gateNumber"
                defaultValue="Cửa A1 (Kho Điện)"
                required
                className="w-full px-3.5 py-2.5 bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-200/80 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-2xl font-bold liquid-touch"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-bold shadow-md shadow-emerald-500/20 liquid-touch"
            >
              Đăng Ký Ca Lấy
            </button>
          </div>
        </form>
      </ModalShell>
    );
  }

  // 5. GDN MODAL
  if (activeModal === 'GDN') {
    return (
      <ModalShell
        title="Lập Phiếu Xuất Kho Vật Tư (PXK-BOM-01)"
        icon="fa-dolly"
        iconColor="text-blue-600"
      >
        <form
          onSubmit={e => {
            e.preventDefault();
            const fd = new FormData(e.target);
            onSubmitGdn({
              code: fd.get('code'),
              orderId: fd.get('orderId'),
              receiverName: fd.get('receiverName'),
              skuId: fd.get('skuId'),
              quantityDispatched: Number(fd.get('quantityDispatched')),
            });
          }}
          className="space-y-3 text-xs"
        >
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Mã Phiếu Xuất</label>
            <input
              name="code"
              defaultValue={`PXK-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`}
              required
              className="w-full px-3.5 py-2.5 bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl font-mono font-bold text-slate-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Đơn Hàng Sản Xuất</label>
            <select
              name="orderId"
              className="w-full px-3.5 py-2.5 bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl font-bold text-slate-900 dark:text-white"
            >
              {data.orders.map(o => (
                <option key={o.id} value={o.id}>
                  {o.code} - {o.title}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Người Nhận Vật Tư</label>
            <input
              name="receiverName"
              defaultValue="Nguyễn Văn An (Tổ Trưởng Lắp Ráp)"
              required
              className="w-full px-3.5 py-2.5 bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Vật Tư Xuất</label>
              <select
                name="skuId"
                className="w-full px-3.5 py-2.5 bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl font-mono text-[11px] text-slate-900 dark:text-white"
              >
                {data.skus.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.code} - {s.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Số Lượng Xuất</label>
              <input
                name="quantityDispatched"
                type="number"
                defaultValue="2"
                min="1"
                required
                className="w-full px-3.5 py-2.5 bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl font-mono font-bold text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-200/80 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-2xl font-bold liquid-touch"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold shadow-md shadow-blue-500/20 liquid-touch"
            >
              Tạo Phiếu Xuất
            </button>
          </div>
        </form>
      </ModalShell>
    );
  }

  // 6. RETURN VOUCHER MODAL
  if (activeModal === 'RETURN') {
    return (
      <ModalShell
        title="Lập Phiếu Nhập Trả & Thu Hồi Phế Liệu"
        icon="fa-arrow-rotate-left"
        iconColor="text-purple-600"
      >
        <form
          onSubmit={e => {
            e.preventDefault();
            const fd = new FormData(e.target);
            onSubmitReturn({
              code: fd.get('code'),
              orderId: fd.get('orderId'),
              type: fd.get('type'),
              returnedByName: fd.get('returnedByName'),
              skuId: fd.get('skuId'),
              quantity: Number(fd.get('quantity')),
              reason: fd.get('reason'),
            });
          }}
          className="space-y-3 text-xs"
        >
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Mã Phiếu Trả</label>
            <input
              name="code"
              defaultValue={`NT-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`}
              required
              className="w-full px-3.5 py-2.5 bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl font-mono font-bold text-slate-900 dark:text-white"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Loại Nhập Trả</label>
              <select
                name="type"
                className="w-full px-3.5 py-2.5 bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl font-bold text-slate-900 dark:text-white"
              >
                <option value="EXCESS_MATERIAL">Vật Tư Dư Thừa Sau Lắp Ráp</option>
                <option value="SCRAP_DEFECT">Phế Liệu / Đầu Mẩu Đồng Gia Công</option>
              </select>
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Người Bàn Giao Trả</label>
              <input
                name="returnedByName"
                defaultValue="Nguyễn Văn An (Tổ Trưởng)"
                required
                className="w-full px-3.5 py-2.5 bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white"
              />
            </div>
          </div>
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Từ Đơn Hàng</label>
            <select
              name="orderId"
              className="w-full px-3.5 py-2.5 bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl font-bold text-slate-900 dark:text-white"
            >
              {data.orders.map(o => (
                <option key={o.id} value={o.id}>
                  {o.code} - {o.title}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Mã Vật Tư</label>
              <select
                name="skuId"
                className="w-full px-3.5 py-2.5 bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl font-mono text-[11px] text-slate-900 dark:text-white"
              >
                {data.skus.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.code} - {s.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Số Lượng Trả</label>
              <input
                name="quantity"
                type="number"
                defaultValue="1"
                min="1"
                required
                className="w-full px-3.5 py-2.5 bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl font-mono font-bold text-slate-900 dark:text-white"
              />
            </div>
          </div>
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Lý Do Nhập Trả</label>
            <input
              name="reason"
              defaultValue="Đầu mẩu thanh cái đồng dư thừa sau khi đột dập uốn"
              required
              className="w-full px-3.5 py-2.5 bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white"
            />
          </div>

          <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-200/80 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-2xl font-bold liquid-touch"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-2xl font-bold shadow-md shadow-purple-500/20 liquid-touch"
            >
              Tạo Phiếu Trả
            </button>
          </div>
        </form>
      </ModalShell>
    );
  }

  // 7. PRINT PREVIEW MODAL (ISO 9001:2015 PRINT ENGINE)
  if (activeModal === 'PRINT' && printPreviewData) {
    const { docType, entity } = printPreviewData;

    return (
      <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-end md:items-center justify-center p-0 md:p-4 animate-fade-in print:p-0 print:bg-white">
        <div className="bg-white text-slate-900 rounded-t-3xl md:rounded-3xl max-w-3xl w-full p-5 sm:p-8 shadow-2xl border-t md:border border-slate-200 max-h-[92vh] flex flex-col print:shadow-none print:border-none print:max-h-full print:p-0 pb-[max(1.25rem,env(safe-area-inset-bottom))] md:pb-8">
          {/* Header Controls (Hidden on print) */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-200 print:hidden">
            <div className="flex items-center gap-2">
              <i className="fa-solid fa-print text-blue-600"></i>
              <span className="font-extrabold text-xs sm:text-sm">Biểu Mẫu Chuẩn ISO 9001:2015</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => window.print()}
                className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5 liquid-touch"
              >
                <i className="fa-solid fa-print"></i> In Ngay
              </button>
              <button onClick={onClose} className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center liquid-touch">
                <i className="fa-solid fa-xmark text-sm"></i>
              </button>
            </div>
          </div>

          {/* Printable Document Container */}
          <div className="printable-doc my-4 space-y-6 flex-1 overflow-y-auto print:overflow-visible pr-1">
            {/* Factory Header */}
            <div className="flex items-start justify-between border-b-2 border-slate-900 pb-3 gap-2">
              <div>
                <h1 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-900">
                  CÔNG TY CỔ PHẦN MAX ELECTRIC VIỆT NAM (MEVN)
                </h1>
                <p className="text-[10px] text-slate-600">
                  Nhà máy sản xuất tủ bảng điện công nghiệp & Hệ thống phân phối
                </p>
                <p className="text-[10px] text-slate-500 font-mono">
                  ISO 9001:2015 Quality Management System
                </p>
              </div>
              <div className="text-right text-[10px] font-mono whitespace-nowrap">
                <div className="font-bold">Mã biểu mẫu: {docType === 'GDN' ? 'BM-WMS-PXK-01' : docType === 'PICKUP' ? 'BM-WMS-CA-01' : 'BM-WMS-GEN'}</div>
                <div>Ngày in: {new Date().toLocaleDateString('vi-VN')}</div>
              </div>
            </div>

            {/* Document Title */}
            <div className="text-center space-y-1">
              <h2 className="text-base sm:text-lg font-black uppercase tracking-wider">
                {docType === 'GDN' && 'PHIẾU XUẤT KHO VẬT TƯ SẢN XUẤT (PXK-BOM-01)'}
                {docType === 'PICKUP' && 'PHIẾU ĐĂNG KÝ CA LẤY VẬT TƯ (MẪU 1)'}
                {docType === 'PO' && 'ĐƠN ĐẶT HÀNG BÙ THIẾU VẬT TƯ (PURCHASE ORDER)'}
                {docType === 'GRN' && 'PHIẾU NHẬP KHO TIẾP NHẬN HÀNG (GRN)'}
                {docType === 'RETURN' && 'PHIẾU NHẬP TRẢ & THU HỒI PHẾ LIỆU ĐỒNG/ĐIỆN'}
                {docType === 'BOM' && 'BẢNG ĐỊNH MỨC KỸ THUẬT VẬT TƯ (BOM SPECIFICATION)'}
              </h2>
              <div className="font-mono text-xs font-bold text-slate-700">
                Mã chứng từ: {entity?.code || entity?.id || 'N/A'}
              </div>
            </div>

            {/* Meta info box */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 text-xs bg-slate-50 p-3 rounded-2xl border border-slate-200">
              <div>
                <strong>Người lập/Đại diện:</strong> {entity?.receiverName || entity?.teamLeaderName || entity?.returnedByName || entity?.supplierName || currentUser?.name || 'Thủ kho'}
              </div>
              <div>
                <strong>Ngày chứng từ:</strong> {formatDate(entity?.createdAt || entity?.pickupDate || entity?.returnDate)}
              </div>
              <div>
                <strong>Trạng thái:</strong> {entity?.status || 'ĐÃ PHÊ DUYỆT'}
              </div>
              <div>
                <strong>Bộ phận liên quan:</strong> Xưởng Lắp Ráp & Kho Vận MEVN
              </div>
            </div>

            {/* Table of items */}
            <div className="border border-slate-900 rounded-xl overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-900 font-black border-b border-slate-900">
                    <th className="py-2 px-3">STT</th>
                    <th className="py-2 px-3">Mã SKU</th>
                    <th className="py-2 px-3">Tên Vật Tư / Thông Số</th>
                    <th className="py-2 px-2 text-right">Số Lượng</th>
                    <th className="py-2 px-3 text-center">Vị Trí</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-300">
                  {((entity?.items) || [entity]).map((it, idx) => {
                    const sku = (data.skus || []).find(s => s.id === (it.skuId || it.id));
                    const uom = (data.uoms || []).find(u => u.id === (sku?.baseUomId || it.uomId));

                    return (
                      <tr key={idx}>
                        <td className="py-2 px-3 font-mono">{idx + 1}</td>
                        <td className="py-2 px-3 font-mono font-bold">{sku?.code || it.code || 'SKU-MEVN'}</td>
                        <td className="py-2 px-3">{sku?.name || it.name || 'Vật tư chuẩn dự án'}</td>
                        <td className="py-2 px-2 text-right font-mono font-bold">
                          {it.quantityDispatched || it.quantityReceived || it.quantityRequired || it.quantity || 1} {uom?.name || 'Cái'}
                        </td>
                        <td className="py-2 px-3 text-center font-mono text-[11px] text-slate-600">
                          {it.binCode || it.gateNumber || 'Khu vực chính'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Signature Blocks */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center pt-6 text-xs">
              <div className="space-y-8">
                <div className="font-bold">Người Lập Phiếu</div>
                <div className="text-slate-400 italic text-[11px]">(Ký, họ tên)</div>
              </div>
              <div className="space-y-8">
                <div className="font-bold">Người Nhận Hàng</div>
                <div className="text-slate-400 italic text-[11px]">(Ký, họ tên)</div>
              </div>
              <div className="space-y-8">
                <div className="font-bold">Thủ Kho Bàn Giao</div>
                <div className="text-slate-400 italic text-[11px]">(Ký, họ tên)</div>
              </div>
              <div className="space-y-8">
                <div className="font-bold">Giám Đốc / Kế Toán</div>
                <div className="text-slate-400 italic text-[11px]">(Ký, đóng dấu)</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

window.WMS_COMPONENTS = window.WMS_COMPONENTS || {};
window.WMS_COMPONENTS.Modals = Modals;
