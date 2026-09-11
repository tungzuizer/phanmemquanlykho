# ADR 0001: Quản lý Tồn kho theo Đơn vị tính cơ sở (Base UoM) và Cơ chế Quy đổi

## Bối cảnh
MEVN có một số vật tư mua theo quy cách bao bì/cuộn/cây (vd: Cuộn dây điện, Cây đồng, Thùng ốc vít) nhưng khi xuất kho cho sản xuất lại dùng đơn vị chi tiết (Mét, Cái). Đồng thời, hệ thống bắt buộc phải tính giá vốn bình quân gia quyền cho từng mã vật tư.

## Quyết định
1. Mọi biến động tồn kho (Tồn thực tế, Tồn giữ chỗ, Tồn khả dụng) và đơn giá vốn bình quân trong database đều được lưu trữ và tính toán duy nhất theo **Đơn vị tính cơ sở (Base UoM)**.
2. Thiết lập bảng quan hệ `uom_conversions` (hoặc cấu hình quy đổi trên SKU) lưu tỷ lệ `conversion_rate` (1 Purchasing UoM = $N$ Base UoM).
3. Khi tạo PO và lập Phiếu nhập kho (GRN) bằng Đơn vị mua hàng, hệ thống tự động nhân hệ số quy đổi để chuyển đổi số lượng và đơn giá về Base UoM trước khi cập nhật vào sổ kho và giá vốn.

## Hệ quả
- Loại bỏ hoàn toàn rủi ro sai lệch số tồn do làm tròn hoặc sai lệch giữa các đơn vị tính khác nhau.
- Các màn hình xuất kho, giữ chỗ và BOM chỉ cần thao tác trên Base UoM, giúp giao diện đơn giản và thủ kho dễ kiểm đếm.
