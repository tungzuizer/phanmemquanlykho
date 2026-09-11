# Prompt xây dựng phần mềm Quản lý Kho & Phối hợp Cung ứng Sản xuất Tủ điện
### (Dùng để đưa cho AI coding agent — vd. Claude Code, Cursor, v.v. — làm theo)

---

## 1. Bối cảnh & vai trò

Bạn là kỹ sư phần mềm full-stack. Hãy xây dựng một hệ thống quản lý kho nội bộ cho công ty
**MAX ELECTRIC VIỆT NAM** (sản xuất tủ điện). Hệ thống phục vụ 5-8 người dùng nội bộ:
thủ kho, phòng mua hàng, kỹ thuật, sản xuất, sale admin, quản lý.

Đây **không phải** phần mềm kế toán, không phải ERP đầy đủ — chỉ tập trung đúng vòng đời
một đơn hàng đi qua kho: từ lúc kỹ thuật gửi BOM đến lúc sản xuất nhận hàng.

Mục tiêu vận hành thực tế (không phải demo): mọi giao dịch phải được ghi nhận ngay tại
thời điểm phát sinh, số liệu phải khớp với kiểm đếm thực tế.

## 2. Vòng đời đơn hàng (workflow bắt buộc phải mô hình hóa đúng)

Một đơn hàng đi qua các trạng thái sau, **không được bỏ bước hay gộp bước**:

1. `moi_nhan` — Sale chốt đơn, Sale Admin thông báo nhóm làm việc.
2. `cho_bom` — Kỹ thuật gửi 2 file (chi tiết lắp ráp cho sản xuất; BOM vật tư cho kho & mua hàng).
3. `dang_doi_chieu_ton` — Kho đối chiếu BOM với tồn thực tế, xác định phần đã có / cần mua.
   SLA: hoàn thành trong 2-4 giờ làm việc kể từ khi nhận file.
4. `da_giu_cho` — Kho xác nhận BOM hợp lệ → hệ thống **giữ chỗ** đúng số lượng vật tư đã có
   sẵn cho đơn này (trừ khỏi "tồn khả dụng" nhưng chưa trừ khỏi "tồn thực tế").
5. `cho_mua` — Nếu thiếu, Mua hàng tạo PO theo đúng mã còn thiếu trong BOM.
6. `da_nhap_kho` — Hàng mua về được nhập kho, cập nhật tồn thực tế.
7. `san_sang_xuat` — Đủ vật tư theo BOM (hoặc theo từng tủ/hạng mục nếu xuất nhiều đợt).
8. `da_xuat_mot_phan` / `hoan_tat` — Kho xuất theo đúng khung giờ cố định
   (09:00–11:00 hoặc 15:00–16:30), có phiếu xuất kho được duyệt trước, có xác nhận
   ký giao nhận giữa thủ kho và đại diện sản xuất.

Một đơn hàng có thể ở trạng thái xuất "một phần" nhiều lần liên tiếp (theo từng tủ/hạng mục)
trước khi đạt `hoan_tat` — hệ thống phải theo dõi được số lượng đã xuất và số lượng còn lại
theo từng dòng vật tư trong BOM.

## 3. Quy tắc nghiệp vụ bắt buộc (đã được công ty xác nhận — không được tự suy diễn khác đi)

| Mã | Quy tắc |
|---|---|
| B1 | Khi thiếu hàng so với BOM: **cho xuất một phần**, hệ thống ghi nhận rõ số đã xuất và số còn thiếu theo từng dòng vật tư — không chặn cứng toàn bộ phiếu. |
| B2 | Một số vật tư có **đơn vị mua khác đơn vị xuất** (cuộn↔mét, thùng↔cái...) — cần cơ chế hệ số quy đổi cấu hình được theo từng mã vật tư, không hard-code. |
| B3 | Vật tư thừa/hỏng sau sản xuất → **nhập trả lại kho** kèm phiếu trả, ghi rõ mã, số lượng, lý do. |
| B4 | **Giữ chỗ vật tư** ngay khi Kho xác nhận BOM hợp lệ (bước 4 ở trên), không đợi đến lúc xuất thật — tránh 2 đơn hàng cùng nhìn thấy 1 lượng tồn. |
| B5 | Một đơn hàng có thể **xuất nhiều đợt**, mỗi đợt theo một tủ/hạng mục — không bắt buộc xuất trọn gói một lần duy nhất (khác với hướng dẫn ban đầu "không xé lẻ" — điều này áp dụng cho việc xé lẻ *từng chi tiết nhỏ trong một đợt xuất*, không áp dụng cho việc chia đơn hàng lớn thành nhiều đợt xuất theo tủ). |
| D2 | Phiếu xuất kho **phải được duyệt** trước khi xuất, trừ trường hợp khẩn cấp có xác nhận của người có thẩm quyền — cần luồng duyệt (approval) rõ ràng, có log ai duyệt, khi nào. |
| D4 | Mọi giao dịch nhập/xuất phải ghi nhận **ngay tại thời điểm phát sinh** — không thiết kế tính năng "ghi bù sau" như một luồng chính thức (chỉ cho phép sửa/điều chỉnh có log riêng, không âm thầm ghi đè). |

## 4. Phạm vi chức năng — GIAI ĐOẠN 1 (bắt buộc phải có)

- Quản lý danh mục vật tư: mã SKU, tên, quy cách, đơn vị tính, hệ số quy đổi (nếu có),
  tồn tối thiểu, giá vốn bình quân.
- Quản lý tồn kho theo **2 kho riêng** (kho vật tư điện — tầng 1, kho đồng — xưởng A),
  mỗi kho có vị trí lưu trữ riêng. Tồn kho phải tách rõ 2 cột: **tồn thực tế** và
  **tồn đã giữ chỗ** (tồn khả dụng = tồn thực tế − tồn đã giữ chỗ).
- Nạp tồn đầu kỳ (import từ Excel — cần cung cấp form mapping cột linh hoạt vì dữ liệu
  gốc chưa chuẩn hóa, khoảng 2.000–3.000 mã vật tư).
- Module BOM: nhận/nhập BOM theo đơn hàng, đối chiếu tự động với tồn kho, đánh dấu
  từng dòng là "đã có" / "cần mua thêm".
- Module giữ chỗ vật tư (reservation) gắn với BOM đã duyệt.
- Module PO cơ bản: tạo PO theo mã còn thiếu, theo dõi số lượng đặt / đã nhận / còn thiếu.
- Phiếu nhập kho, phiếu xuất kho (theo mẫu PXK-BOM-01 đính kèm), có luồng duyệt trước
  khi xuất, có xác nhận ký giao nhận (điện tử, không cần chữ ký tay trong hệ thống).
- Theo dõi giá vốn xuất kho và giá trị tồn kho (phương pháp bình quân gia quyền).
- Kiểm kê định kỳ (hằng quý) và kiểm kê đột xuất — có màn hình đối chiếu chênh lệch.
- Cảnh báo tồn tối thiểu / điểm đặt hàng lại cho nhóm vật tư dùng thường xuyên (~100-200 mã).
- Phân quyền theo vai trò: thủ kho, mua hàng, kỹ thuật, sản xuất, sale admin, quản lý.
- Xuất báo cáo nhập–xuất–tồn ra Excel để đối chiếu thủ công với kế toán.

## 5. Ngoài phạm vi giai đoạn 1 (KHÔNG xây dựng, kể cả khi "tiện tay" có thể làm)

- Quét mã vạch/QR, in tem — chưa có thiết bị, để dành giai đoạn sau.
- Tích hợp API trực tiếp với phần mềm kế toán — chỉ cần xuất file đối chiếu.
- Quản lý theo lô hàng, hạn sử dụng, số serial thiết bị.
- Phiếu "Đăng ký lấy hàng sản xuất" trên hệ thống — giai đoạn 1 vẫn qua kênh hiện tại
  (Zalo/thủ công), chỉ cần chuẩn bị data model để nối vào sau, không cần xây UI cho việc này ngay.

## 6. Ràng buộc kỹ thuật & vận hành

- Có máy tính và mạng ổn định tại khu vực kho — không cần thiết kế offline-first,
  nhưng nên có UI đơn giản, thao tác nhanh (thủ kho không phải dân IT).
- Chạy song song với Excel trong 2-4 tuần đầu sau khi ra mắt — cần có tính năng
  xuất dữ liệu dễ dàng để đối chiếu chéo trong giai đoạn này.
- Ưu tiên tốc độ triển khai (mốc mong muốn: đưa vào dùng sớm), nên chọn kiến trúc
  đơn giản, ít phụ thuộc, dễ deploy và bảo trì bởi một đội nhỏ.

## 7. Đề xuất kiến trúc (có thể điều chỉnh theo năng lực đội hiện có)

- Backend: một framework web phổ biến có ORM mạnh (vd. Node.js + NestJS/Express + Prisma,
  hoặc Python + FastAPI + SQLAlchemy) — ưu tiên thứ đội đã quen dùng.
- Database: PostgreSQL (transaction rõ ràng, cần thiết cho nghiệp vụ giữ chỗ/trừ tồn).
- Frontend: một SPA đơn giản, ưu tiên tốc độ nhập liệu bằng bàn phím hơn là giao diện đẹp.
- Authentication: đăng nhập nội bộ đơn giản (username/password), phân quyền theo vai trò
  (role-based), không cần SSO phức tạp ở giai đoạn 1.

## 8. Việc cần làm đầu tiên (trước khi sinh bất kỳ dòng code UI nào)

1. Thiết kế schema database đầy đủ cho 5 thực thể lõi: Vật tư, Tồn kho theo kho,
   BOM/Đơn hàng (kèm bảng chi tiết dòng BOM), Phiếu nhập/Phiếu xuất, PO.
   Trình bày schema này trước, chờ xác nhận rồi mới code.
2. Viết migration + seed dữ liệu mẫu để test toàn bộ vòng đời đơn hàng ở mục 2.
3. Viết API/service layer cho đúng trình tự trạng thái ở mục 2 trước, UI làm sau.
4. Viết test case cho các quy tắc ở mục 3 (đặc biệt B4 giữ chỗ và B1 xuất một phần)
   vì đây là 2 điểm dễ sai và khó phát hiện bằng mắt thường khi test thủ công.

## 9. Tiêu chí nghiệm thu (bám theo KPI công ty đã đặt ra)

- Thời gian đối chiếu BOM với tồn kho hiển thị được trên hệ thống, mục tiêu 2-4 giờ.
- Độ chính xác soạn hàng: hệ thống phải chặn được sai lệch mã vật tư/số lượng khi xuất
  so với BOM (cảnh báo nếu số lượng thực xuất khác số lượng theo BOM).
- Có báo cáo tuân thủ khung giờ đăng ký lấy hàng (phục vụ KPI ≥ 95% khi tính năng
  đăng ký được đưa vào hệ thống ở giai đoạn sau).

---

**Ghi chú cho AI thực hiện**: nếu có điểm nào trong quy tắc nghiệp vụ mâu thuẫn hoặc
chưa rõ khi triển khai chi tiết, hãy dừng lại và hỏi thay vì tự suy đoán — đặc biệt là
các điểm còn bỏ ngỏ: (1) mốc thời gian và người chịu trách nhiệm kiểm đếm tồn đầu kỳ,
(2) danh sách cụ thể các mã vật tư cần quy đổi đơn vị, (3) vai trò cụ thể của người
duyệt phiếu xuất kho.
