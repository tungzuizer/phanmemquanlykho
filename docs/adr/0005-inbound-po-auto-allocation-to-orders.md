# ADR 0005: Tự động Giữ chỗ khi Nhập kho Hàng mua theo Đơn hàng (PO Inbound Direct Allocation)

## Bối cảnh
Khi BOM bị thiếu vật tư, Phòng Mua hàng phát hành PO mua bù cho Đơn hàng cụ thể. Nếu khi hàng về chỉ nhập vào tồn tự do chung, các đơn hàng khác phát sinh sau có thể chiếm dụng số lượng này, khiến đơn hàng ban đầu vẫn tiếp tục bị tắc nghẽn sản xuất.

## Quyết định
1. Mỗi dòng trong PO (`purchase_order_items`) sinh ra từ BOM thiếu đều mang khóa ngoại tham chiếu đến `(order_id, panel_id, bom_item_id)`.
2. Khi Thủ kho lập Phiếu nhập kho (GRN) theo PO:
   - Tăng `quantity_physical` trong `stock_balances`.
   - **Tự động tăng `quantity_reserved`** cho đúng `bom_item_id` của Đơn hàng mục tiêu.
   - Trạng thái dòng BOM được cập nhật từ `cho_mua` sang `da_giu_cho`.
   - Nếu tất cả các dòng BOM của Tủ/Đơn hàng đã được giữ chỗ đủ 100% $\rightarrow$ tự động chuyển trạng thái Đơn hàng sang `san_sang_xuat`.
3. Nếu PO là loại "Mua tồn an toàn / Tồn kho chung" (không gắn `order_id`): Hàng về sẽ tăng `quantity_physical` và toàn bộ rơi vào `quantity_available`.

## Hệ quả
- Loại bỏ hoàn toàn độ trễ giữa nhập kho và giữ chỗ.
- Đảm bảo vật tư mua cho đơn nào sẽ phục vụ đúng tiến độ cho đơn đó.
