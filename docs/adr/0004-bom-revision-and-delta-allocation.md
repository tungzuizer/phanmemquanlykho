# ADR 0004: Xử lý Điều chỉnh BOM (BOM Revision) và Cơ chế Tính Delta Giữ chỗ

## Bối cảnh
Trong sản xuất tủ điện công nghiệp, việc thay đổi thiết kế cơ điện hoặc đổi mã vật tư sau khi đã duyệt BOM diễn ra thường xuyên. Cần một cơ chế an toàn để điều chỉnh BOM mà không làm sai lệch số lượng vật tư đã giữ chỗ hoặc đã xuất kho.

## Quyết định
1. Quản lý BOM theo phiên bản (`version = 1, 2, ...`). Chỉ có 01 phiên bản BOM có hiệu lực (`status: ACTIVE`) cho mỗi Đơn hàng tại một thời điểm.
2. Khi ban hành BOM Revision mới:
   - Các dòng vật tư **chưa xuất kho**: Hệ thống tự động tính độ lệch (Delta). Nếu định mức giảm $\rightarrow$ hoàn trả lượng chênh lệch vào Tồn khả dụng; nếu định mức tăng $\rightarrow$ tự động giữ chỗ thêm phần chênh lệch (nếu kho có sẵn) hoặc sinh yêu cầu mua bổ sung (`cho_mua`).
   - Các dòng vật tư **đã xuất kho một phần hoặc toàn bộ**: Không cho phép xóa hoặc giảm định mức thấp hơn số lượng đã xuất thực tế. Nếu thực tế thừa hàng do thay đổi thiết kế, bắt buộc phải lập Phiếu nhập trả lại kho (Stock Return Note).
3. Lưu vết đầy đủ lịch sử thay đổi (Audit log: ai sửa, lý do sửa, thời gian phát hành).

## Hệ quả
- Đảm bảo tính toàn vẹn dữ liệu, chống thất thoát và ngăn chặn triệt để tình trạng lệch tồn khi thay đổi thiết kế.
