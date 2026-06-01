# User Stories & Acceptance Criteria - Hệ thống QRFarm

## US-01: Tạo batch nông sản

**As a** farmer, **I want** tạo batch nông sản với thông tin chuẩn hóa, **so that** tôi có thể khởi tạo nguồn dữ liệu truy xuất cho cả lô hàng.

### Acceptance Criteria

- Người dùng tạo batch thành công với thông tin bắt buộc.
- Batch có mã định danh duy nhất.
- Batch sinh được QR để truy xuất.
- Batch ở trạng thái ban đầu là Created.

## US-02: Tạo product thuộc batch

**As a** farmer, **I want** thêm product vào batch, **so that** tôi có thể mô tả chi tiết từng đơn vị hàng hóa trong lô.

### Acceptance Criteria

- Product được gắn vào đúng batch cha.
- Product lưu được tên, loại, cân nặng và thông tin mô tả phù hợp.
- Product có thể sinh QR riêng nếu cần.
- Product được lưu vào lịch sử khởi tạo.

## US-03: Tra cứu nguồn gốc bằng QR

**As a** consumer, **I want** quét QR để xem nguồn gốc sản phẩm, **so that** tôi có thể kiểm tra thông tin một cách nhanh chóng và minh bạch.

### Acceptance Criteria

- QR hợp lệ mở đúng trang truy xuất.
- Trang truy xuất hiển thị batch hoặc product tương ứng.
- Lịch sử trạng thái và vị trí hiện tại được hiển thị rõ ràng.
- QR không hợp lệ hiển thị thông báo phù hợp.

## US-04: Cập nhật trạng thái trong vận chuyển

**As a** transporter, **I want** cập nhật trạng thái và vị trí của batch hoặc product, **so that** người dùng có thể theo dõi hành trình hàng hóa theo thời gian thực tế.

### Acceptance Criteria

- Chỉ vai trò hợp lệ mới được cập nhật.
- Mỗi lần cập nhật tạo ra một bản ghi lịch sử mới.
- Hệ thống lưu người cập nhật, thời gian cập nhật và vị trí.
- Có thể đính kèm ảnh hoặc chứng từ khi cập nhật.

## US-05: Xác thực nghiệp vụ bằng blockchain

**As a** system owner, **I want** dùng blockchain như lớp xác thực phụ cho các mốc quan trọng, **so that** lịch sử truy xuất có tính tin cậy cao hơn.

### Acceptance Criteria

- Hệ thống có thể ghi hoặc đối chiếu mốc xác thực lên blockchain.
- Lỗi blockchain không làm gián đoạn luồng vận hành chính.
- Trạng thái xác thực được hiển thị hoặc lưu lại cho người dùng nội bộ.

