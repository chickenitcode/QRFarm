# UCS - Hệ thống QRFarm

## UC-01: Tạo batch và khởi tạo dữ liệu đầu vào

### Mục tiêu

Tạo một batch mới trong hệ thống, lưu dữ liệu đầu vào chuẩn hóa và sinh QR cho batch.

### Tác nhân

- Farmer.
- Nhân sự vận hành nội bộ.

### Điều kiện tiên quyết

- Người dùng đã đăng nhập và có quyền tạo batch.
- Hệ thống kết nối được backend và DB.
- Các trường bắt buộc của batch đã được chuẩn bị.

### Kích hoạt

- Người dùng chọn chức năng tạo batch trên app hoặc màn hình vận hành.

### Luồng chính

1. Người dùng mở màn hình tạo batch.
2. Hệ thống hiển thị form nhập thông tin batch.
3. Người dùng nhập dữ liệu batch và gửi yêu cầu tạo mới.
4. Hệ thống kiểm tra tính hợp lệ của dữ liệu.
5. Backend tạo batch và sinh mã định danh.
6. Hệ thống sinh QR liên kết đến batch.
7. Hệ thống trả kết quả tạo thành công.

### Luồng thay thế

- Nếu thiếu thông tin bắt buộc, hệ thống hiển thị lỗi và không tạo batch.
- Nếu mã batch trùng, hệ thống yêu cầu tạo lại hoặc sinh mã mới.
- Nếu backend lỗi, hệ thống thông báo thất bại và không hoàn tất giao dịch.

### Hậu điều kiện

- Batch mới được lưu trong DB.
- QR batch được tạo và gắn với batch.
- Batch có trạng thái ban đầu là Created.

## UC-02: Thêm product vào batch

### Mục tiêu

Tạo product thuộc batch để mô tả chi tiết từng đơn vị hoặc kiện hàng.

### Tác nhân

- Farmer.
- Nhân sự vận hành.

### Điều kiện tiên quyết

- Batch cha đã tồn tại.
- Người dùng có quyền thêm product.

### Luồng chính

1. Người dùng chọn batch cần thêm product.
2. Hệ thống hiển thị form tạo product.
3. Người dùng nhập thông tin product như tên, loại, cân nặng, kích thước hoặc phân hạng.
4. Hệ thống kiểm tra dữ liệu.
5. Backend lưu product vào batch cha.
6. Hệ thống sinh QR cho product nếu cần.
7. Hệ thống trả kết quả thành công.

### Luồng thay thế

- Nếu batch cha không tồn tại, hệ thống không cho phép tạo product.
- Nếu dữ liệu product không hợp lệ, hệ thống trả lỗi và yêu cầu nhập lại.

### Hậu điều kiện

- Product được gắn với batch hợp lệ.
- Product có lịch sử khởi tạo ban đầu.

## UC-03: Tra cứu nguồn gốc bằng QR trên web

### Mục tiêu

Người dùng quét QR để xem thông tin batch hoặc product trên web công khai.

### Tác nhân

- Consumer.

### Điều kiện tiên quyết

- QR phải trỏ đến một batch hoặc product tồn tại.

### Luồng chính

1. Consumer quét QR bằng camera hoặc mở đường dẫn QR.
2. Hệ thống xác định định danh batch hoặc product từ QR.
3. Web gọi backend để lấy dữ liệu truy xuất.
4. Backend trả thông tin batch/product và lịch sử trạng thái.
5. Web hiển thị thông tin nguồn gốc cho consumer.

### Luồng thay thế

- Nếu QR không hợp lệ, web hiển thị thông báo không tìm thấy dữ liệu.
- Nếu backend không phản hồi, web hiển thị trạng thái lỗi tạm thời.

### Hậu điều kiện

- Consumer xem được dữ liệu công khai của batch hoặc product.

## UC-04: Cập nhật trạng thái batch hoặc product bằng app

### Mục tiêu

Người dùng vận hành cập nhật trạng thái batch hoặc product trong quá trình xử lý và vận chuyển.

### Tác nhân

- Transporter.
- Retailer.
- Farmer trong một số tình huống khởi tạo hoặc điều chỉnh.

### Điều kiện tiên quyết

- Người dùng có quyền cập nhật.
- Batch/product tồn tại và đang ở trạng thái hợp lệ.

### Luồng chính

1. Người dùng quét QR bằng app vận hành.
2. Hệ thống mở màn hình cập nhật tương ứng.
3. Người dùng nhập trạng thái mới, vị trí hiện tại và có thể đính kèm ảnh/chứng từ.
4. Hệ thống kiểm tra quyền và tính hợp lệ của trạng thái mới.
5. Backend lưu lịch sử trạng thái.
6. Hệ thống cập nhật trạng thái hiện tại và trả kết quả.

### Luồng thay thế

- Nếu trạng thái mới không hợp lệ, hệ thống từ chối cập nhật.
- Nếu người dùng không có quyền, hệ thống chặn thao tác.
- Nếu mất kết nối, hệ thống báo lỗi và không ghi nhận thay đổi chưa đồng bộ.

### Hậu điều kiện

- Lịch sử batch/product được cập nhật.
- Trạng thái hiện tại phản ánh đúng mốc vừa ghi nhận.

## UC-05: Đối chiếu xác thực bằng blockchain

### Mục tiêu

Đối chiếu một số mốc quan trọng của batch hoặc product với lớp xác thực blockchain.

### Tác nhân

- Hệ thống backend.
- Dịch vụ blockchain.

### Điều kiện tiên quyết

- Mốc nghiệp vụ đã được ghi trong DB.

### Luồng chính

1. Backend chọn mốc cần xác thực.
2. Hệ thống chuẩn hóa dữ liệu để gửi sang lớp blockchain.
3. Blockchain lưu hoặc đối chiếu dấu vết.
4. Hệ thống nhận kết quả xác thực.
5. Người dùng hoặc hệ thống vận hành có thể xem trạng thái đối chiếu.

### Luồng thay thế

- Nếu blockchain lỗi, hệ thống vẫn lưu dữ liệu vận hành chính và đánh dấu trạng thái xác thực chưa hoàn tất.

