# ADR 0006: Ràng buộc Khung giờ Xuất kho & Cơ chế Đo lường KPI Vận hành

## Bối cảnh
Quy trình ISO MEVN quy định 2 khung giờ xuất kho cố định (09:00-11:00 và 15:00-16:30) kèm thời hạn chót Sản xuất phải đăng ký trước. Hệ thống cần đo lường 3 chỉ số KPI (Thời gian phản hồi BOM $\le$ 2-4h, Độ chính xác soạn hàng 100%, Tỷ lệ tuân thủ báo trước $\ge$ 95%) mà không gây tắc nghẽn khi có yêu cầu xuất gấp.

## Quyết định
1. **Ràng buộc Mềm (Soft Constraint)** khi tạo Phiếu xuất kho (GDN):
   - Cho phép chọn 2 ca chuẩn (`CA_SANG: 09:00 - 11:00`, `CA_CHIEU: 15:00 - 16:30`).
   - Nếu thời gian thực tế chênh lệch so với ca hoặc xuất đột xuất ngoài khung giờ: Tự động bật cờ `is_out_of_shift = true` và bắt buộc nhập lý do (`out_of_shift_reason`).
2. **Theo dõi Đăng ký lấy hàng (Pickup Registration)**:
   - Đại diện Sản xuất gửi đăng ký lấy hàng trực tiếp trên hệ thống (Mẫu 1).
   - Hệ thống so khớp thời điểm gửi với hạn chót (15:30 chiều hôm trước cho ca sáng, 09:00 sáng cho ca chiều) để tính tỷ lệ tuân thủ.
3. **Audit Log & KPI Engine**:
   - Ghi nhận đầy đủ các mốc thời gian: `bom_received_at`, `bom_verified_at`, `registered_pickup_at`, `dispatched_at`.
   - Tự động xuất báo cáo KPI theo tháng/quý phục vụ đánh giá năng suất.

## Hệ quả
- Vừa giữ vững kỷ luật vận hành vừa đáp ứng tính linh hoạt trong sản xuất thực tế.
- Cung cấp số liệu minh bạch, khách quan cho Ban Giám đốc.
