# ADR 0002: Cấu trúc BOM phân cấp theo Tủ (Panel) và Quản lý Xuất nhiều đợt

## Bối cảnh
Quy trình ISO của MEVN yêu cầu xuất kho theo BOM trọn gói để tránh mất mát linh kiện nhỏ, nhưng trên thực tế mỗi Đơn hàng lớn bao gồm nhiều Tủ điện riêng biệt (MSB, DB1, DB2) cần xuất thành nhiều đợt theo tiến độ lắp ráp của từng tủ. Khi thiếu một phần vật tư, hệ thống cần cho phép xuất phần đã có và theo dõi phần còn thiếu.

## Quyết định
1. Mô hình hóa BOM theo cấu trúc phân cấp: `Order` $\rightarrow$ `Panel` (Tủ điện / Hạng mục) $\rightarrow$ `BOM_Item` (Dòng vật tư định mức).
2. Mỗi dòng `BOM_Item` lưu trạng thái tiến độ độc lập:
   - `quantity_required` (Định mức BOM)
   - `quantity_reserved` (Số lượng đã giữ chỗ)
   - `quantity_dispatched` (Số lượng đã xuất thực tế)
   - `quantity_pending_po` (Số lượng đang chờ mua)
3. Cho phép lập Phiếu xuất kho (GDN / PXK-BOM-01) theo phạm vi: Xuất toàn bộ đơn, xuất theo 1 Tủ điện, hoặc xuất một phần các vật tư đã sẵn sàng (`quantity_reserved > 0`).
4. Cấm tuyệt đối việc xuất vượt định mức BOM trừ khi Kỹ thuật phát hành phiên bản sửa đổi BOM (BOM Revision) được duyệt.

## Hệ quả
- Khớp hoàn toàn giữa quy định quản lý trọn gói theo Tủ và thực tế xuất kho theo tiến độ xưởng.
- Hệ thống luôn kiểm soát được tỷ lệ hoàn thành vật tư của từng Tủ/Đơn hàng.
