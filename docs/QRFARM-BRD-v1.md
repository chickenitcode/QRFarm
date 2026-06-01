# BRD - Hệ thống QRFarm

## 1. Thông tin tài liệu

| Hạng mục | Giá trị |
| --- | --- |
| Tên sản phẩm | QRFarm - Hệ thống truy xuất nguồn gốc nông sản |
| Loại tài liệu | Tài liệu yêu cầu nghiệp vụ |
| Phiên bản | 1.0 |
| Trạng thái | Bản chính |
| Người phụ trách | Business Analyst |
| Ngày lập | 2026-06-01 |

## 2. Mục đích

Tài liệu này mô tả bối cảnh kinh doanh, mục tiêu, phạm vi, các bên liên quan, mô hình nghiệp vụ và các quy tắc kinh doanh cấp cao của hệ thống QRFarm. Tài liệu được dùng để thống nhất cách hiểu giữa người làm nghiệp vụ, người phát triển, người kiểm thử và người đánh giá hồ sơ dự án.

## 3. Bối cảnh kinh doanh

### 3.1 Vấn đề hiện tại

- Dữ liệu về lô hàng nông sản thường bị phân tán ở nhiều kênh khác nhau, dẫn đến khó đối soát.
- Người tiêu dùng khó kiểm tra nhanh nguồn gốc thật sự của sản phẩm bằng một quy trình thống nhất.
- Nhân sự vận hành phải cập nhật trạng thái lô hàng và sản phẩm thủ công, dễ sai lệch lịch sử.
- Khi quét QR, nếu không có một luồng nghiệp vụ rõ ràng thì dữ liệu truy xuất dễ bị hiểu sai giữa xem thông tin và cập nhật trạng thái.
- Việc xác thực lịch sử trên blockchain cần được đặt đúng vai trò để tăng độ tin cậy mà không làm phức tạp trải nghiệm người dùng.

### 3.2 Cơ hội kinh doanh

- Số hóa toàn bộ vòng đời truy xuất từ lúc tạo batch đến khi người dùng tra cứu trên web.
- Chuẩn hóa quy trình cập nhật batch/product theo vai trò nông dân, vận chuyển và bán lẻ.
- Tạo một kênh tra cứu nguồn gốc đơn giản cho người tiêu dùng bằng QR.
- Tăng khả năng minh bạch, kiểm tra và giải trình nhờ lưu lịch sử trạng thái và lớp xác thực phụ bằng blockchain.

## 4. Mục tiêu kinh doanh

- Cho phép farmer khởi tạo batch và ghi nhận dữ liệu đầu vào chuẩn hóa.
- Cho phép transporter cập nhật trạng thái và vị trí trong quá trình vận chuyển.
- Cho phép retailer ghi nhận các mốc cuối của sản phẩm hoặc lô hàng.
- Cho phép consumer quét QR để xem nguồn gốc, lịch sử và trạng thái hiện tại.
- Tạo một nguồn dữ liệu tập trung cho toàn hệ thống backend - web - blockchain.

## 5. Mô hình nghiệp vụ được chọn

### 5.1 Nguyên tắc nghiệp vụ

- Batch là thực thể trung tâm của hệ thống.
- Product là đơn vị con thuộc batch, dùng để mô tả sản phẩm cụ thể bên trong lô hàng.
- QR là đường dẫn truy xuất, có thể chứa ID của batch hoặc product.
- Khi quét QR bằng web thông thường, hệ thống mở trang tra cứu công khai.
- Khi quét bằng app vận hành, hệ thống có thể mở màn hình cập nhật trạng thái batch hoặc product, tùy theo ngữ cảnh sử dụng.
- Blockchain chỉ đóng vai trò lớp xác thực phụ để lưu hoặc đối chiếu dấu vết nghiệp vụ quan trọng.

### 5.2 Dữ liệu nghiệp vụ cốt lõi

- Batch: mã batch, tên lô, số lượng, loại nông sản, người tạo, ngày tạo, vị trí hiện tại, trạng thái hiện tại và lịch sử trạng thái.
- Product: mã product, batch cha, tên sản phẩm, loại sản phẩm, cân nặng, kích thước, ngày tạo, người tạo, vị trí hiện tại và lịch sử trạng thái.
- QR: mã định danh truy xuất, liên kết tới batch hoặc product, có thể dùng cho in tem hoặc chia sẻ link.

### 5.3 Ví dụ theo bài toán sầu riêng

- Batch có thể đại diện cho một lô sầu riêng được thu hoạch trong cùng thời gian và cùng vùng.
- Product có thể đại diện cho từng thùng, từng kiện hoặc từng đơn vị kiểm soát riêng bên trong batch.
- Với product sầu riêng, hệ thống cần lưu ít nhất: loại sầu riêng, cân nặng, kích thước hoặc phân hạng, ngày đóng gói, người xử lý và mốc cập nhật cuối.

## 6. Các bên liên quan

| Bên liên quan | Vai trò | Nhu cầu chính |
| --- | --- | --- |
| Farmer | Người tạo batch và khởi tạo dữ liệu đầu vào | Tạo lô, nhập thông tin gốc, gắn QR |
| Transporter | Người vận chuyển | Cập nhật trạng thái, vị trí, bằng chứng vận chuyển |
| Retailer | Người tiếp nhận và bán lẻ | Xem dữ liệu lô, cập nhật mốc cuối, đối soát |
| Consumer | Người tra cứu nguồn gốc | Quét QR, xem lịch sử và trạng thái hiện tại |
| Hệ thống | Dịch vụ tự động | Lưu dữ liệu, đồng bộ, xác thực và truy xuất |

## 7. Phạm vi

### 7.1 Phạm vi bao gồm

- Tạo batch và tạo product thuộc batch.
- Gán QR cho batch/product.
- Tra cứu nguồn gốc qua web.
- Cập nhật trạng thái batch/product qua ứng dụng vận hành.
- Ghi nhận vị trí, ảnh/chứng từ và lịch sử trạng thái.
- Xác thực phụ bằng blockchain để tăng độ tin cậy của lịch sử.
- Phân tích logistics ở mức tổng quan, bao gồm theo dõi trạng thái và dữ liệu vận chuyển.

### 7.2 Phạm vi không bao gồm

- Thanh toán điện tử.
- Bán hàng thương mại điện tử.
- Quản lý kho chuyên sâu như WMS.
- ERP doanh nghiệp.
- Các chức năng mạng xã hội hoặc chat cộng đồng.

## 8. Giá trị kỳ vọng

- Người tiêu dùng nhìn thấy nguồn gốc sản phẩm rõ ràng hơn.
- Người vận hành có quy trình cập nhật thống nhất thay vì ghi tay hoặc cập nhật rời rạc.
- Dữ liệu được tập trung nên dễ tra cứu, kiểm tra và giải trình.
- Blockchain bổ sung tính bất biến cho các mốc quan trọng, giúp tăng niềm tin của người dùng và đối tác.

## 9. Chỉ số thành công

- Tỷ lệ batch có dữ liệu đầu vào đầy đủ.
- Tỷ lệ product được gắn QR và tra cứu thành công.
- Tỷ lệ lượt quét QR mở đúng trang truy xuất.
- Tỷ lệ cập nhật trạng thái vận chuyển được ghi nhận đúng hạn.
- Số lượng truy xuất thành công trên web theo ngày hoặc theo chiến dịch.

## 10. Giả định

- Người dùng vận hành có quyền cập nhật batch/product theo vai trò.
- QR luôn trỏ tới một nguồn dữ liệu hợp lệ trong hệ thống.
- Hệ thống blockchain chỉ dùng để xác thực phụ, không thay thế hoàn toàn cơ sở dữ liệu vận hành.
- Sản phẩm đầu vào có thể chuẩn hóa theo nhóm nông sản, trong đó sầu riêng là ví dụ chính để mô tả chi tiết.

## 11. Ràng buộc

- QR phải dẫn được đến đúng batch hoặc product tương ứng.
- Dữ liệu lịch sử phải giữ được thứ tự thời gian.
- Các thay đổi trạng thái chỉ được thực hiện bởi vai trò phù hợp.
- Giao diện web phải ưu tiên khả năng tra cứu đơn giản cho consumer.

## 12. Rủi ro kinh doanh

- Người dùng có thể nhầm giữa chức năng xem truy xuất và chức năng cập nhật trạng thái nếu luồng QR không được mô tả rõ.
- Nếu dữ liệu đầu vào cho batch/product không chuẩn hóa, lịch sử truy xuất sẽ thiếu nhất quán.
- Blockchain nếu mô tả quá sâu có thể làm tăng độ phức tạp tài liệu mà không mang lại lợi ích nghiệp vụ rõ rệt.

## 13. Yêu cầu kinh doanh cấp cao

### 13.1 Chức năng

- BR-01: Farmer có thể tạo batch và khởi tạo dữ liệu đầu vào.
- BR-02: Hệ thống có thể tạo product thuộc batch và lưu thông tin cơ bản của sầu riêng hoặc các nông sản tương tự.
- BR-03: Hệ thống có thể tạo QR cho batch hoặc product.
- BR-04: Consumer có thể quét QR để tra cứu nguồn gốc qua web.
- BR-05: Transporter có thể cập nhật trạng thái, vị trí và chứng từ vận chuyển.
- BR-06: Retailer có thể cập nhật mốc cuối và đối soát thông tin nhận hàng.
- BR-07: Hệ thống có thể lưu lịch sử trạng thái và đối chiếu bằng lớp blockchain xác thực phụ.
- BR-08: Hệ thống có thể tổng hợp dữ liệu logistics ở mức báo cáo cơ bản.

### 13.2 Phi chức năng

- BR-NF-01: Trang truy xuất phải dễ đọc trên cả di động và máy tính.
- BR-NF-02: Trạng thái batch/product phải được cập nhật nhất quán.
- BR-NF-03: Dữ liệu lịch sử phải có thể truy vết theo thời gian.
- BR-NF-04: Hệ thống phải tách bạch rõ giữa chức năng tra cứu công khai và chức năng cập nhật nội bộ.

## 14. Các câu hỏi mở còn lại

- Bạn muốn có danh sách trạng thái chi tiết nào ngoài Created, Packed, In Transit, Delivered, Cancelled, Rejected không?
- Blockchain xác thực nên lưu toàn bộ lịch sử hay chỉ các mốc quan trọng?
- Có cần thêm đánh giá chất lượng nông sản theo batch/product không?
