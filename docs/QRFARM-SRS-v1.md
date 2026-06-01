# SRS - Hệ thống QRFarm

## 1. Thông tin tài liệu

| Hạng mục | Giá trị |
| --- | --- |
| Tên sản phẩm | QRFarm - Hệ thống truy xuất nguồn gốc nông sản |
| Loại tài liệu | Đặc tả yêu cầu phần mềm |
| Phiên bản | 1.0 |
| Trạng thái | Bản chính |
| Người phụ trách | Business Analyst |
| Ngày lập | 2026-06-01 |

## 2. Giới thiệu

### 2.1 Mục đích

Tài liệu này mô tả đầy đủ các yêu cầu phần mềm của hệ thống QRFarm. Nội dung bao gồm phạm vi hệ thống, thuật ngữ, yêu cầu chức năng, quy tắc nghiệp vụ, yêu cầu phi chức năng, giao diện tích hợp và yêu cầu dữ liệu.

### 2.2 Phạm vi

Hệ thống cho phép farmer tạo batch, tạo product thuộc batch, gắn QR, transporter cập nhật trạng thái vận chuyển, retailer cập nhật mốc cuối và consumer tra cứu nguồn gốc bằng web. Hệ thống sử dụng blockchain như một lớp xác thực phụ để tăng tính tin cậy của lịch sử nghiệp vụ.

### 2.3 Thuật ngữ

| Thuật ngữ | Diễn giải |
| --- | --- |
| Batch | Lô hàng hoặc lô nông sản trung tâm của hệ thống |
| Product | Đơn vị sản phẩm con thuộc batch |
| QR | Mã truy xuất dẫn đến trang web hoặc màn hình ứng dụng |
| Consumer | Người dùng cuối tra cứu nguồn gốc |
| Farmer | Người tạo batch và dữ liệu đầu vào |
| Transporter | Người cập nhật trạng thái vận chuyển |
| Retailer | Người cập nhật mốc nhận và bàn giao cuối |
| Blockchain verification | Lớp xác thực phụ cho một số mốc nghiệp vụ |

## 3. Mô tả tổng quan

### 3.1 Góc nhìn sản phẩm

Hệ thống gồm ba lớp chính:

- Lớp vận hành nội bộ: app hoặc màn hình cập nhật để tạo batch, tạo product và ghi nhận trạng thái.
- Lớp tra cứu công khai: web service cho consumer quét QR và xem nguồn gốc.
- Lớp xác thực phụ: blockchain dùng để đối chiếu và tăng tính bất biến cho các dấu vết quan trọng.

### 3.2 Nhóm người dùng

- Farmer: tạo batch, nhập dữ liệu đầu vào và khởi tạo QR.
- Transporter: cập nhật trạng thái, vị trí, ảnh/chứng từ trong quá trình vận chuyển.
- Retailer: xác nhận nhận hàng, cập nhật trạng thái cuối và đối soát.
- Consumer: truy xuất nguồn gốc, xem lịch sử và trạng thái hiện tại.

### 3.3 Môi trường vận hành

- Truy cập web bằng trình duyệt trên điện thoại hoặc máy tính.
- Ứng dụng vận hành có thể mở bằng thiết bị di động để quét QR và cập nhật trạng thái.
- Hệ thống backend cung cấp API trung tâm cho cả web và app.
- Blockchain được dùng như nguồn đối chiếu bổ sung cho các dữ liệu đã xác nhận.

## 4. Yêu cầu chức năng

### 4.1 Quản lý batch

- FR-01: Farmer có thể tạo batch mới với các thông tin bắt buộc.
- FR-02: Hệ thống phải lưu mã batch duy nhất.
- FR-03: Hệ thống phải cho phép xem chi tiết batch theo batch ID hoặc QR.
- FR-04: Hệ thống phải lưu lịch sử trạng thái của batch theo thứ tự thời gian.
- FR-05: Hệ thống phải cho phép cập nhật vị trí hiện tại của batch.

### 4.2 Quản lý product

- FR-06: Hệ thống cho phép tạo product thuộc batch.
- FR-07: Product phải lưu thông tin cơ bản như tên sản phẩm, loại sản phẩm, cân nặng, kích thước hoặc phân hạng.
- FR-08: Product phải liên kết được với batch cha.
- FR-09: Hệ thống phải cho phép xem chi tiết product bằng QR hoặc product ID.
- FR-10: Hệ thống phải lưu lịch sử trạng thái của product.

### 4.3 QR và tra cứu

- FR-11: Hệ thống phải sinh QR cho batch hoặc product.
- FR-12: Khi consumer quét QR, web phải mở đúng trang tra cứu nguồn gốc.
- FR-13: Khi app vận hành quét QR, hệ thống có thể mở màn hình cập nhật tương ứng.
- FR-14: QR phải chứa hoặc ánh xạ đến đúng định danh batch hoặc product.

### 4.4 Cập nhật vận hành

- FR-15: Transporter có thể cập nhật trạng thái vận chuyển.
- FR-16: Transporter có thể ghi nhận vị trí hiện tại của batch hoặc product.
- FR-17: Transporter có thể đính kèm ảnh hoặc chứng từ.
- FR-18: Retailer có thể xác nhận nhận hàng và cập nhật trạng thái cuối.
- FR-19: Hệ thống phải lưu người cập nhật, thời gian cập nhật và nội dung cập nhật.

### 4.5 Tra cứu công khai

- FR-20: Consumer có thể xem thông tin batch từ trang web công khai.
- FR-21: Consumer có thể xem thông tin product từ trang web công khai.
- FR-22: Consumer có thể xem lịch sử trạng thái theo timeline.
- FR-23: Consumer có thể xem vị trí hiện tại và mốc cập nhật gần nhất.

### 4.6 Xác thực phụ bằng blockchain

- FR-24: Hệ thống có thể ghi hoặc đối chiếu một số mốc quan trọng lên blockchain.
- FR-25: Hệ thống phải cho phép kiểm tra dấu vết xác thực của batch/product.
- FR-26: Blockchain không được làm gián đoạn luồng vận hành chính nếu xảy ra lỗi đối chiếu.

### 4.7 Báo cáo logistics

- FR-27: Hệ thống phải hiển thị tổng quan trạng thái batch/product.
- FR-28: Hệ thống phải hỗ trợ xem số lượng batch theo từng trạng thái.
- FR-29: Hệ thống phải cho phép tổng hợp dữ liệu theo vùng, thời gian hoặc nhóm sản phẩm.

## 5. Quy tắc nghiệp vụ

- BR-01: Batch là thực thể trung tâm của toàn hệ thống.
- BR-02: Product phải luôn thuộc về một batch hợp lệ.
- BR-03: QR phải ánh xạ đúng đến batch hoặc product tương ứng.
- BR-04: Trạng thái batch/product chỉ được cập nhật bởi vai trò phù hợp.
- BR-05: Các trạng thái hợp lệ gồm Created, Packed, In Transit, Delivered, Cancelled và Rejected.
- BR-06: Khi quét QR bằng web, hệ thống phải ưu tiên chế độ tra cứu công khai.
- BR-07: Khi quét QR bằng app vận hành, hệ thống có thể chuyển sang màn hình cập nhật nội bộ.
- BR-08: Blockchain chỉ là lớp xác thực phụ và không thay thế dữ liệu vận hành trong DB.
- BR-09: Mỗi bản ghi lịch sử phải có người tạo, thời gian tạo và nội dung thay đổi.
- BR-10: Nếu dữ liệu batch hoặc product thiếu thông tin bắt buộc, hệ thống không được cho phép tạo mới.

## 6. Yêu cầu phi chức năng

### 6.1 Hiệu năng

- NFR-01: Trang tra cứu phải phản hồi tốt trên điện thoại với kết nối di động thông thường.
- NFR-02: API truy xuất batch/product phải có thời gian phản hồi phù hợp cho truy vấn thông dụng.
- NFR-03: Hệ thống phải xử lý được đồng thời nhiều lượt quét QR trong thời gian cao điểm.

### 6.2 Bảo mật

- NFR-04: Người cập nhật nội bộ phải được xác thực trước khi ghi trạng thái.
- NFR-05: Dữ liệu nhạy cảm không được hiển thị công khai cho consumer.
- NFR-06: Ảnh/chứng từ phải được kiểm soát truy cập theo vai trò.

### 6.3 Độ tin cậy

- NFR-07: Lịch sử trạng thái phải không bị mất khi hệ thống gặp lỗi tạm thời.
- NFR-08: Nếu blockchain lỗi, hệ thống vẫn phải lưu được dữ liệu vận hành chính.
- NFR-09: Ghi nhận lịch sử phải đảm bảo thứ tự và tính nhất quán.

### 6.4 Bảo trì

- NFR-10: API phải được tài liệu hóa rõ ràng.
- NFR-11: Hệ thống phải có logging và truy vết lỗi.
- NFR-12: Các quy tắc trạng thái và mapping QR phải cấu hình được khi cần.

## 7. Giao diện tích hợp

- EIR-01: REST API cho web tra cứu và app vận hành.
- EIR-02: Dịch vụ lưu ảnh/chứng từ cho dữ liệu cập nhật.
- EIR-03: Dịch vụ blockchain để ghi hoặc đối chiếu mốc xác thực.
- EIR-04: Dịch vụ định vị hoặc thông tin địa điểm nếu cần ghi nhận vị trí chi tiết.

## 8. Yêu cầu dữ liệu

- DR-01: Batch phải có mã, tên, loại nông sản, số lượng, người tạo, ngày tạo và trạng thái.
- DR-02: Product phải có mã, batch cha, tên, loại, cân nặng, kích thước hoặc phân hạng, người tạo và ngày tạo.
- DR-03: Mỗi batch hoặc product phải có QR mapping duy nhất.
- DR-04: Mỗi lần cập nhật phải ghi thời gian, người cập nhật, trạng thái cũ, trạng thái mới và nội dung mô tả.
- DR-05: Với sản phẩm sầu riêng, hệ thống phải lưu thêm thông tin loại, cân nặng và kích thước hoặc phân hạng.

## 9. Tiêu chí chấp nhận ở cấp hệ thống

- AC-01: Farmer tạo batch và sinh QR thành công.
- AC-02: Farmer tạo product thuộc batch thành công.
- AC-03: Consumer quét QR mở đúng trang tra cứu nguồn gốc.
- AC-04: Transporter cập nhật trạng thái và vị trí thành công.
- AC-05: Retailer xác nhận nhận hàng và cập nhật trạng thái cuối thành công.
- AC-06: Hệ thống lưu được lịch sử trạng thái đầy đủ và có thể tra cứu lại.
- AC-07: Hệ thống có thể đối chiếu mốc xác thực phụ bằng blockchain khi cần.

## 10. Ánh xạ yêu cầu

Mỗi yêu cầu FR, BR và AC trong tài liệu này phải được ánh xạ sang ít nhất một user story, một use case và một test case để bảo đảm khả năng truy vết.
