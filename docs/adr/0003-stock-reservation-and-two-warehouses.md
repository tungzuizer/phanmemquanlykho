# ADR 0003: Cơ chế Giữ chỗ vật tư (Reservation) tại 2 Kho vật lý độc lập

## Bối cảnh
MEVN vận hành 2 kho riêng biệt: Kho vật tư điện (Tầng 1) và Kho đồng (Nhà xưởng A). Khi nhiều đơn hàng cùng phát sinh đồng thời, nếu không có cơ chế giữ chỗ tức thời (Allocation / Reservation), nhiều đơn hàng sẽ cùng "nhìn thấy" một lượng tồn thực tế, dẫn tới cam kết sản xuất ảo và hụt vật tư.

## Quyết định
1. Bảng `stock_balances` lưu trữ theo cặp khóa `(sku_id, warehouse_id)` gồm 3 cột số lượng:
   - `quantity_physical` (Tồn thực tế đếm được trong kho)
   - `quantity_reserved` (Tồn đã giữ chỗ cho các đơn hàng)
   - `quantity_available` (Cột tính toán hoặc generated column: `physical - reserved`)
2. Bảng `stock_reservations` ghi nhận chi tiết số lượng giữ chỗ cho từng `(bom_item_id, warehouse_id, order_id)`.
3. Khi Kho xác nhận BOM hợp lệ (chuyển sang `da_giu_cho`):
   - Chạy một ACID Transaction trong PostgreSQL với `SELECT ... FOR UPDATE` trên các dòng `stock_balances`.
   - $Qty_{hold} = \min(Qty_{available}, Qty_{required})$.
   - Tăng `quantity_reserved` trên `stock_balances` thêm $Qty_{hold}$.
   - Ghi nhận `stock_reservations`.
   - Nếu $Qty_{hold} < Qty_{required}$, tự động sinh yêu cầu mua hàng $Qty_{missing} = Qty_{required} - Qty_{hold}$ đẩy sang `cho_mua`.
4. Khi Xuất kho thực tế (GDN):
   - Giảm đồng thời cả `quantity_physical` và `quantity_reserved` tương ứng với số lượng thực xuất.
   - Giải phóng bản ghi `stock_reservations`.
5. Khi Hàng mua về nhập kho (GRN) theo PO của đơn hàng:
   - Tăng `quantity_physical` đồng thời tự động chuyển ngay vào `quantity_reserved` cho đơn hàng đó nếu PO được tạo từ BOM thiếu.

## Hệ quả
- Đảm bảo tính nhất quán dữ liệu 100%, không xảy ra race condition khi nhiều thủ kho thao tác đồng thời.
- Phản ánh trung thực tồn kho khả dụng cho các đơn hàng đến sau.
