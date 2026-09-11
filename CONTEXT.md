# Hệ Thống Quản Lý Kho MAX ELECTRIC VIỆT NAM (MEVN WMS)

Hệ thống quản lý vòng đời vật tư từ khâu tiếp nhận đơn hàng, bóc tách BOM kỹ thuật, kiểm tra tồn và giữ chỗ, mua hàng bổ sung, đến xuất kho cấp phát cho sản xuất tủ điện theo khung giờ cố định.

## Language

### 1. Đơn hàng & Cấu trúc Sản phẩm

**Order (Đơn hàng / Dự án)**:
Hợp đồng hoặc đơn đặt hàng sản xuất tủ điện đã được Sale chốt và Sale Admin kích hoạt vào luồng sản xuất.
_Avoid_: Deal, Hợp đồng, Giao dịch

**Panel (Tủ điện / Hạng mục thi công)**:
Một tủ điện cụ thể hoặc một phân khu lắp ráp vật lý cấu thành nên Đơn hàng (vd: Tủ MSB, Tủ DB1, Tủ Tụ bù).
_Avoid_: Box, Cabinet, Phân đoạn, Giai đoạn

**BOM (Bill of Materials / Danh mục vật tư)**:
Danh sách định mức vật tư kỹ thuật (điện, cơ khí, đồng) cần thiết để lắp ráp hoàn chỉnh một Tủ điện hoặc Đơn hàng.
_Avoid_: Bảng bóc tách, Bảng kê, Recipe, Part list

**BOM Item (Dòng vật tư BOM)**:
Một chi tiết vật tư trong BOM kèm số lượng định mức, kho xuất mặc định, số lượng đã giữ chỗ, số lượng cần mua và số lượng đã xuất.
_Avoid_: Chi tiết BOM, Dòng định mức

---

### 2. Danh mục & Đơn vị tính

**SKU (Mã vật tư)**:
Mã định danh duy nhất cho từng loại vật tư, thiết bị điện, thanh đồng, phụ kiện cơ khí trong toàn hệ thống.
_Avoid_: Part number, Item code, Mã hàng

**Base UoM (Đơn vị tính cơ sở)**:
Đơn vị đo lường nhỏ nhất, chuẩn hóa của SKU dùng để ghi nhận tồn kho thực tế, tồn giữ chỗ và tính giá vốn bình quân (vd: mét, cái, kg).
_Avoid_: ĐVT chính, ĐVT chuẩn, Default unit

**Purchasing UoM (Đơn vị mua hàng)**:
Đơn vị đóng gói quy cách khi mua từ nhà cung cấp (vd: cuộn, thùng, túi, cây) được quy đổi về Base UoM qua hệ số tỷ lệ.
_Avoid_: ĐVT phụ, Đơn vị bao bì, Pack unit

**UoM Conversion (Hệ số quy đổi)**:
Tỷ lệ cố định hoặc cấu hình được để quy đổi giữa Purchasing UoM và Base UoM (vd: 1 Cuộn = 100 Mét).
_Avoid_: Tỷ giá, Hệ số phụ

---

### 3. Tồn kho & Kho bãi

**Warehouse (Kho vật lý)**:
Khu vực lưu trữ vật lý độc lập có thủ kho quản lý (`Kho vật tư điện - Tầng 1` hoặc `Kho đồng - Nhà xưởng A`).
_Avoid_: Kho tổng, Location, Bãi

**Physical Stock (Tồn thực tế)**:
Số lượng vật tư thực tế đang nằm trên kệ/vị trí của kho tại thời điểm hiện tại.
_Avoid_: Tồn trên tay, Tồn sổ sách, On-hand

**Reserved Stock (Tồn đã giữ chỗ)**:
Số lượng vật tư đã được hệ thống khóa cứng cho các BOM Đơn hàng đã duyệt nhưng chưa xuất thực tế.
_Avoid_: Tồn treo, Tồn phân bổ, Allocated stock

**Available Stock (Tồn khả dụng)**:
Số lượng vật tư tự do có thể cấp phát cho các đơn hàng mới ($Qty_{available} = Qty_{physical} - Qty_{reserved}$).
_Avoid_: Tồn rảnh, Tồn tự do, Free stock

**Safety Stock / Min Stock (Tồn tối thiểu)**:
Ngưỡng tồn khả dụng cảnh báo để kích hoạt đề xuất mua hàng bù tồn cho ~100-200 mã vật tư dùng thường xuyên.
_Avoid_: Ngưỡng an toàn, Điểm báo mua

---

### 4. Giao dịch & Chứng từ

**PO (Purchase Order / Đơn mua hàng)**:
Chứng từ Mua hàng phát hành cho nhà cung cấp để mua các mã vật tư còn thiếu theo BOM hoặc mua bù tồn an toàn.
_Avoid_: Phiếu đặt, Đơn hàng mua

**GRN (Goods Receipt Note / Phiếu nhập kho)**:
Chứng từ ghi nhận hàng về kho từ nhà cung cấp theo PO hoặc nạp tồn đầu kỳ, làm tăng Tồn thực tế và cập nhật Giá vốn bình quân.
_Avoid_: Phiếu nhập, Biên bản nhận hàng

**GDN (Goods Dispatch Note / Phiếu xuất kho - Mẫu PXK-BOM-01)**:
Chứng từ xuất vật tư từ kho cho Đội sản xuất lắp ráp theo BOM (trọn gói hoặc theo tủ), làm giảm Tồn thực tế và Tồn đã giữ chỗ.
_Avoid_: Phiếu xuất hàng, Lệnh xuất, Outbound note

**Stock Return Note (Phiếu nhập trả lại kho)**:
Chứng từ nhập lại kho vật tư thừa hoặc vật tư hỏng sau sản xuất kèm lý do, làm tăng Tồn thực tế.
_Avoid_: Phiếu trả hàng, Biên bản hoàn kho

**Production Pickup Registration (Phiếu đăng ký lấy hàng sản xuất - Mẫu 1)**:
Đăng ký trước của đại diện Sản xuất trên hệ thống trước hạn chót (chiều hôm trước cho ca sáng, sáng sớm cho ca chiều) để Kho gom hàng.
_Avoid_: Lịch lấy hàng, Hẹn giờ lấy, Booking

**Stocktake (Phiếu kiểm kê)**:
Biên bản kiểm đếm thực tế định kỳ (hàng quý) hoặc đột xuất để đối chiếu chênh lệch giữa thực tế và phần mềm, tạo bút toán điều chỉnh.
_Avoid_: Kiểm kê kho, Báo cáo tồn
