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
  deleteConfirmTarget,
  onConfirmDelete,
  onCancelDelete,
}) {
  if ((!activeModal && !deleteConfirmTarget) || !data) return null;

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

  // 0. CONFIRM DELETE MODAL (ISO AUDIT TRAIL & ACID ROLLBACK)
  if (deleteConfirmTarget) {
    const typeNames = {
      ORDER: 'Đơn Hàng & Toàn Bộ BOM Liên Quan',
      PO: 'Đơn Mua Hàng (PO)',
      GDN: 'Phiếu Xuất Kho (GDN)',
      GRN: 'Phiếu Nhập Kho (GRN)',
      PICKUP: 'Đăng Ký Ca Lấy Vật Tư (Mẫu 1)',
      RETURN: 'Phiếu Nhập Trả / Phế Liệu',
    };

    const typeTitle = typeNames[deleteConfirmTarget.type] || deleteConfirmTarget.type;

    return (
      <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
        <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-red-200 dark:border-red-900/50 space-y-4 liquid-specular">
          {/* Header */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-red-100 dark:bg-red-950/80 text-red-600 dark:text-red-400 flex items-center justify-center text-xl shrink-0 shadow-inner">
              <i className="fa-solid fa-triangle-exclamation animate-bounce"></i>
            </div>
            <div>
              <h3 className="text-base font-black text-red-600 dark:text-red-400 font-mono tracking-tight">
                XÁC NHẬN XÓA CHỨNG TỪ
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Thao tác dành riêng cho Ban Giám Đốc (ADMIN)
              </p>
            </div>
          </div>

          {/* Details Box */}
          <div className="p-4 bg-red-50/70 dark:bg-red-950/30 rounded-2xl border border-red-200/80 dark:border-red-900/40 space-y-2 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-slate-600 dark:text-slate-400 font-medium">Loại chứng từ:</span>
              <strong className="text-slate-900 dark:text-white font-bold">{typeTitle}</strong>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-600 dark:text-slate-400 font-medium">Mã số:</span>
              <span className="font-mono font-black text-red-600 dark:text-red-400 bg-white dark:bg-slate-800 px-2.5 py-0.5 rounded-lg border border-red-200 dark:border-red-900">
                {deleteConfirmTarget.code || deleteConfirmTarget.id}
              </span>
            </div>
            {deleteConfirmTarget.title && (
              <div className="flex justify-between items-start pt-1 border-t border-red-200/60 dark:border-red-900/40">
                <span className="text-slate-600 dark:text-slate-400 font-medium">Tiêu đề / Đối tượng:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200 text-right max-w-[240px] truncate">
                  {deleteConfirmTarget.title}
                </span>
              </div>
            )}
          </div>

          {/* Impact Warning */}
          <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-200 dark:border-amber-800 text-[11px] text-amber-800 dark:text-amber-300 flex items-start gap-2.5 leading-relaxed">
            <i className="fa-solid fa-shield-halved text-amber-600 mt-0.5 shrink-0"></i>
            <div>
              <strong className="block font-bold">Cơ chế bảo toàn tồn kho (ACID Rollback):</strong>
              {deleteConfirmTarget.details || 'Hệ thống sẽ tự động hoàn trả toàn bộ số lượng giữ chỗ (Reserved Stock) của BOM về lại Tồn kho khả dụng (Available Stock), giúp mở khóa vật tư cho các đơn hàng khác mà không làm sai lệch số dư vật lý.'}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onCancelDelete}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-2xl font-bold text-xs liquid-touch"
            >
              Hủy Bỏ
            </button>
            <button
              type="button"
              onClick={() => onConfirmDelete(deleteConfirmTarget)}
              className="px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-2xl shadow-lg shadow-red-500/30 flex items-center gap-2 liquid-touch"
            >
              <i className="fa-solid fa-trash-can"></i> Xác Nhận Xóa Vĩnh Viễn
            </button>
          </div>
        </div>
      </div>
    );
  }

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
              supplierId: fd.get('supplierId') || undefined,
              expectedDeliveryDate: fd.get('expectedDate') ? new Date(fd.get('expectedDate')).toISOString() : new Date(Date.now() + 5 * 86400000).toISOString(),
              note: fd.get('note') || 'PO mua bổ sung vật tư thiếu hụt theo BOM',
              items: [{
                skuId: fd.get('skuId'),
                quantityPurchased: Number(fd.get('quantity') || 1),
                unitPrice: Number(fd.get('unitPrice') || 100000),
              }]
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
              {(data.orders || []).map(o => (
                <option key={o.id} value={o.id}>
                  {o.code} - {o.title}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Nhà Cung Cấp Thiết Bị</label>
            <select
              name="supplierId"
              className="w-full px-3.5 py-2.5 bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl font-bold text-slate-900 dark:text-white"
            >
              {(data.suppliers || []).map(s => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.code})
                </option>
              ))}
              {(!data.suppliers || data.suppliers.length === 0) && (
                <option value="">-- Mặc định: Schneider Electric / MEVN Supply --</option>
              )}
            </select>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Mã Vật Tư (SKU)</label>
              <select
                name="skuId"
                className="w-full px-3.5 py-2.5 bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl font-mono text-[11px] text-slate-900 dark:text-white"
              >
                {(data.skus || []).map(s => (
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
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Ghi Chú Đơn Hàng PO</label>
            <input
              name="note"
              defaultValue="PO mua bổ sung vật tư thiếu hụt theo BOM"
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

  // 7. PRINT PREVIEW & INVOICE EXPORT MODAL (ISO 9001:2015 PRINT ENGINE)
  if (activeModal === 'PRINT' && printPreviewData) {
    const docType = printPreviewData.docType || printPreviewData.type || 'GDN';
    const entity = printPreviewData.entity || printPreviewData.doc || printPreviewData;

    // Resolve Form Code & Title
    const formConfig = {
      GDN: {
        code: 'BM-WMS-PXK-01',
        title: 'PHIẾU XUẤT KHO VẬT TƯ SẢN XUẤT (PXK-BOM-01)',
        subTitle: 'Căn cứ theo định mức kỹ thuật BOM & Đăng ký lấy hàng ca sản xuất'
      },
      PO: {
        code: 'BM-WMS-PO-01',
        title: 'ĐƠN ĐẶT HÀNG NHÀ CUNG CẤP / HÓA ĐƠN MUA HÀNG (PURCHASE ORDER)',
        subTitle: 'Mua bù vật tư thiếu hụt theo Delta âm đối chiếu tồn BOM đơn hàng'
      },
      GRN: {
        code: 'BM-WMS-PNK-01',
        title: 'PHIẾU NHẬP KHO VẬT TƯ & THIẾT BỊ (GOODS RECEIPT NOTE)',
        subTitle: 'Tiếp nhận hàng hóa, vật tư thiết bị điện theo đơn mua hàng PO'
      },
      RETURN: {
        code: 'BM-WMS-NTK-01',
        title: 'PHIẾU NHẬP TRẢ & THU HỒI PHẾ LIỆU ĐỒNG / ĐIỆN',
        subTitle: 'Thu hồi đầu mẩu thừa và vật tư sau công đoạn lắp ráp về Kho Cách Ly'
      },
      BOM: {
        code: 'BM-WMS-BOM-01',
        title: 'BẢNG ĐỊNH MỨC KỸ THUẬT BÓC TÁCH VẬT TƯ (BOM SPECIFICATION)',
        subTitle: 'Định mức tiêu hao vật tư cho từng tủ điện theo hồ sơ thiết kế MEVN'
      },
      ORDER: {
        code: 'BM-WMS-LSX-01',
        title: 'LỆNH SẢN XUẤT & CHẾ TẠO VỎ TỦ ĐIỆN (MANUFACTURING WORK ORDER)',
        subTitle: 'Lệnh sản xuất chế tạo vỏ tủ và lắp ráp thiết bị điện công nghiệp'
      },
      PICKUP: {
        code: 'BM-WMS-CA-01',
        title: 'PHIẾU ĐĂNG KÝ CA LẤY VẬT TƯ (MẪU 1 - THEO CA SẢN XUẤT)',
        subTitle: 'Tuân thủ quy chuẩn lấy hàng theo ca và hạn chót đăng ký KPI'
      }
    };

    const currentDoc = formConfig[docType] || formConfig.GDN;
    const rawItems = entity?.items || entity?.panels || (Array.isArray(entity) ? entity : [entity]);

    // Calculate Financial and Quantity Totals
    let totalItemsCount = 0;
    let grandTotalAmount = 0;

    const normalizedItems = rawItems.map((it, idx) => {
      const sku = (data.skus || []).find(s => s.id === (it.skuId || it.id || it.sku?.id));
      const uom = (data.uoms || []).find(u => u.id === (sku?.baseUomId || it.uomId || it.purchasingUomId || it.sku?.baseUomId));
      const wh = (data.warehouses || []).find(w => w.id === (it.warehouseId || sku?.warehouseId));

      const skuCode = it.skuCode || it.sku?.code || sku?.code || it.code || `SKU-MEVN-${idx + 1}`;
      const skuName = it.skuName || it.sku?.name || sku?.name || it.name || it.panelName || 'Vật tư chuẩn dự án MEVN';
      const uomName = it.uomName || it.purchasingUomName || uom?.name || 'Cái';
      const whName = wh?.name || it.warehouseName || 'Kho Điện';

      const qtyBom = Number(it.quantityBom || it.quantityRequired || it.quantity || 1);
      const qtyReal = Number(it.quantityReal || it.quantityReceived || it.quantityPurchased || it.quantityDispatched || it.quantity || 1);
      const unitCost = Number(it.unitCost || it.unitPrice || it.baseUnitCost || sku?.unitCost || 0);
      const lineTotal = Number(it.lineTotal || (unitCost * qtyReal) || 0);

      totalItemsCount += qtyReal;
      grandTotalAmount += lineTotal;

      return {
        idx: idx + 1,
        skuCode,
        skuName,
        uomName,
        whName,
        qtyBom,
        qtyReal,
        unitCost,
        lineTotal,
        binCode: it.binCode || it.location || 'Vị trí chuẩn',
        note: it.note || it.defectReason || it.reusableStatus || '',
        panelName: it.name || it.panelName || '',
        panelCode: it.code || it.panelCode || '',
        panelQty: it.quantity || 1,
      };
    });

    return (
      <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-end md:items-center justify-center p-0 md:p-4 animate-fade-in print:p-0 print:bg-white">
        <div className="bg-white text-slate-900 rounded-t-3xl md:rounded-3xl max-w-4xl w-full p-5 sm:p-8 shadow-2xl border-t md:border border-slate-200 max-h-[92vh] flex flex-col print:shadow-none print:border-none print:max-h-full print:p-0 pb-[max(1.25rem,env(safe-area-inset-bottom))] md:pb-8">
          {/* Header Controls (Hidden on print) */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-200 print:hidden">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm">
                <i className="fa-solid fa-file-invoice"></i>
              </div>
              <div>
                <span className="font-extrabold text-xs sm:text-sm text-slate-900 block">Xuất Biểu Mẫu & Hóa Đơn Chuẩn ISO 9001:2015</span>
                <span className="text-[10px] text-slate-500 font-mono">Định dạng A4 Landscape / Portrait tự động</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/25 flex items-center gap-1.5 liquid-touch"
              >
                <i className="fa-solid fa-print"></i> In Chứng Từ / Xuất PDF
              </button>
              <button onClick={onClose} className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center liquid-touch">
                <i className="fa-solid fa-xmark text-sm"></i>
              </button>
            </div>
          </div>

          {/* Printable Document Container */}
          <div className="printable-doc my-4 space-y-6 flex-1 overflow-y-auto print:overflow-visible pr-1">
            {/* Factory Header */}
            <div className="flex items-start justify-between border-b-2 border-slate-900 pb-3 gap-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black text-lg">
                  MEVN
                </div>
                <div>
                  <h1 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-900">
                    CÔNG TY CỔ PHẦN MAX ELECTRIC VIỆT NAM (MEVN)
                  </h1>
                  <p className="text-[10px] text-slate-600">
                    Nhà máy sản xuất tủ bảng điện công nghiệp & Trạm biến áp hợp bộ
                  </p>
                  <p className="text-[10px] text-slate-500 font-mono">
                    Hệ thống Quản lý Chất lượng đạt chuẩn Quốc tế ISO 9001:2015
                  </p>
                </div>
              </div>
              <div className="text-right text-[10px] font-mono whitespace-nowrap">
                <div className="font-bold text-slate-900">Mã biểu mẫu: {currentDoc.code}</div>
                <div className="text-slate-600">Ngày in: {new Date().toLocaleDateString('vi-VN')} {new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</div>
                <div className="text-slate-500">Người in: {currentUser?.fullName || currentUser?.name || 'Hệ thống WMS'}</div>
              </div>
            </div>

            {/* Document Title */}
            <div className="text-center space-y-1">
              <h2 className="text-base sm:text-xl font-black uppercase tracking-wider text-slate-900">
                {currentDoc.title}
              </h2>
              <p className="text-xs text-slate-600 italic">
                {currentDoc.subTitle}
              </p>
              <div className="inline-block font-mono text-xs font-black text-blue-700 bg-blue-50 px-3 py-0.5 rounded-md border border-blue-200 mt-1">
                Số chứng từ: {entity?.code || entity?.id || 'N/A'}
              </div>
            </div>

            {/* Metadata Info Box */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 text-xs bg-slate-50 p-3.5 rounded-2xl border border-slate-200 font-medium">
              <div>
                <span className="text-slate-500">Đơn hàng / Dự án:</span>{' '}
                <strong className="text-slate-900">{entity?.orderCode || entity?.order?.code || entity?.title || entity?.project || 'DH-2026-MEVN-01 (Tòa Nhà Landmark Core)'}</strong>
              </div>
              <div>
                <span className="text-slate-500">Tủ điện / Panel:</span>{' '}
                <strong className="text-slate-900">{entity?.panelName || entity?.panel?.name || entity?.panelCode || 'Tủ MSB 2500A Main Switchboard'}</strong>
              </div>
              <div>
                <span className="text-slate-500">Ngày lập / Ngày xuất:</span>{' '}
                <strong className="text-slate-900">{formatDate(entity?.dispatchedAt || entity?.receivedAt || entity?.createdAt || entity?.pickupDate || entity?.orderDate)}</strong>
              </div>
              <div>
                <span className="text-slate-500">Kho thực hiện:</span>{' '}
                <strong className="text-slate-900">{entity?.warehouseName || entity?.warehouse?.name || 'Kho Điện & Kho Đồng MEVN'}</strong>
              </div>
              <div>
                <span className="text-slate-500">Đại diện nhận / NCC:</span>{' '}
                <strong className="text-slate-900">{entity?.receiverName || entity?.supplierName || entity?.customerName || entity?.customer || entity?.registeredByName || 'Đội Lắp Ráp Sản Xuất MEVN'}</strong>
              </div>
              <div>
                <span className="text-slate-500">Trạng thái phê duyệt:</span>{' '}
                <strong className="text-emerald-700 font-bold">{entity?.status === 'DISPATCHED' ? 'ĐÃ XUẤT KHO & KÝ NHẬN' : entity?.status === 'COMPLETED' ? 'HOÀN TẤT 100%' : entity?.status === 'APPROVED' ? 'ĐÃ DUYỆT XUẤT' : (entity?.status || 'ĐÃ DUYỆT')}</strong>
              </div>
              {entity?.note && (
                <div className="col-span-full border-t border-slate-200 pt-1.5 text-slate-600 italic">
                  <span className="font-bold text-slate-700 not-italic">Ghi chú:</span> {entity.note}
                </div>
              )}
            </div>

            {/* Table of items */}
            <div className="border border-slate-900 rounded-xl overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-900 font-black border-b border-slate-900 text-[11px]">
                    <th className="py-2.5 px-3 w-10 text-center">STT</th>
                    <th className="py-2.5 px-3 w-32">Mã SKU / Mã Tủ</th>
                    <th className="py-2.5 px-3">Tên Vật Tư / Quy Cách Kỹ Thuật</th>
                    <th className="py-2.5 px-2 text-center w-16">ĐVT</th>
                    {docType === 'GDN' && <th className="py-2.5 px-2 text-right w-20">Định Mức</th>}
                    <th className="py-2.5 px-2 text-right w-20">
                      {docType === 'GDN' ? 'Thực Xuất' : docType === 'PO' ? 'Số Lượng Mua' : docType === 'GRN' ? 'Nhập Kho' : docType === 'RETURN' ? 'Thu Hồi' : 'Số Lượng'}
                    </th>
                    {(docType === 'GDN' || docType === 'PO' || docType === 'GRN' || docType === 'RETURN') && (
                      <>
                        <th className="py-2.5 px-3 text-right w-28">Đơn Giá (đ)</th>
                        <th className="py-2.5 px-3 text-right w-32">Thành Tiền (đ)</th>
                      </>
                    )}
                    <th className="py-2.5 px-3 text-center w-24">Vị Trí / Ghi Chú</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-300">
                  {normalizedItems.map(it => (
                    <tr key={it.idx} className="hover:bg-slate-50">
                      <td className="py-2 px-3 font-mono text-center">{it.idx}</td>
                      <td className="py-2 px-3 font-mono font-bold text-slate-900">{it.skuCode}</td>
                      <td className="py-2 px-3 font-medium">{it.skuName}</td>
                      <td className="py-2 px-2 text-center font-semibold text-slate-600">{it.uomName}</td>
                      {docType === 'GDN' && <td className="py-2 px-2 text-right font-mono text-slate-500">{it.qtyBom}</td>}
                      <td className="py-2 px-2 text-right font-mono font-black text-slate-900">{it.qtyReal}</td>
                      {(docType === 'GDN' || docType === 'PO' || docType === 'GRN' || docType === 'RETURN') && (
                        <>
                          <td className="py-2 px-3 text-right font-mono text-slate-700">{formatMoney(it.unitCost)}</td>
                          <td className="py-2 px-3 text-right font-mono font-black text-slate-900">{formatMoney(it.lineTotal)}</td>
                        </>
                      )}
                      <td className="py-2 px-3 text-center font-mono text-[11px] text-slate-600">
                        {it.binCode || it.whName}
                      </td>
                    </tr>
                  ))}
                </tbody>
                {/* Financial Summary Footer */}
                {(docType === 'GDN' || docType === 'PO' || docType === 'GRN' || docType === 'RETURN') && (
                  <tfoot>
                    <tr className="bg-slate-100 border-t-2 border-slate-900 font-black text-slate-900">
                      <td colSpan={docType === 'GDN' ? 5 : 4} className="py-2.5 px-3 text-right uppercase tracking-wider text-[11px]">
                        Tổng Cộng Giá Trị:
                      </td>
                      <td className="py-2.5 px-2 text-right font-mono font-black text-blue-700">
                        {totalItemsCount}
                      </td>
                      <td></td>
                      <td className="py-2.5 px-3 text-right font-mono font-black text-sm text-blue-700">
                        {formatMoney(grandTotalAmount)}
                      </td>
                      <td></td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>

            {/* In-Words Text Box */}
            {(docType === 'GDN' || docType === 'PO' || docType === 'GRN' || docType === 'RETURN') && grandTotalAmount > 0 && (
              <div className="text-xs text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <strong>Số tiền bằng số:</strong> <span className="font-mono font-bold text-slate-900">{formatMoney(grandTotalAmount)} VNĐ</span>
                <br />
                <strong>Chứng từ kèm theo:</strong> Bảng đối chiếu định mức kỹ thuật BOM & Phiếu đăng ký ca lấy hàng hợp lệ.
              </div>
            )}

            {/* ISO 9001:2015 4-Signature Block */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center pt-6 text-xs text-slate-900">
              <div className="space-y-12">
                <div>
                  <div className="font-black uppercase">Người Lập Biểu</div>
                  <div className="text-slate-500 italic text-[11px]">(Ký, ghi rõ họ tên)</div>
                </div>
                <div className="font-bold text-slate-800 pt-4 border-t border-dotted border-slate-300 mx-4">
                  {currentUser?.fullName || currentUser?.name || 'Nhân viên lập'}
                </div>
              </div>
              <div className="space-y-12">
                <div>
                  <div className="font-black uppercase">Người Nhận Hàng</div>
                  <div className="text-slate-500 italic text-[11px]">(Ký, ghi rõ họ tên)</div>
                </div>
                <div className="font-bold text-slate-800 pt-4 border-t border-dotted border-slate-300 mx-4">
                  {entity?.receiverName || 'Tổ Trưởng Sản Xuất'}
                </div>
              </div>
              <div className="space-y-12">
                <div>
                  <div className="font-black uppercase">Thủ Kho Bàn Giao</div>
                  <div className="text-slate-500 italic text-[11px]">(Ký, ghi rõ họ tên)</div>
                </div>
                <div className="font-bold text-slate-800 pt-4 border-t border-dotted border-slate-300 mx-4">
                  {entity?.warehouseName?.includes('Đồng') ? 'Thủ Kho Đồng' : 'Thủ Kho Điện'}
                </div>
              </div>
              <div className="space-y-12">
                <div>
                  <div className="font-black uppercase">Ban Giám Đốc / Kế Toán</div>
                  <div className="text-slate-500 italic text-[11px]">(Ký, đóng dấu duyệt)</div>
                </div>
                <div className="font-bold text-slate-800 pt-4 border-t border-dotted border-slate-300 mx-4">
                  MEVN Phê Duyệt
                </div>
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
