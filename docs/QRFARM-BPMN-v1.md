# BPMN - Hệ thống QRFarm

## 1. Quy trình tổng thể

```mermaid
flowchart LR
    subgraph Farmer
        A1[Khởi tạo batch]
        A2[Thêm product]
    end

    subgraph Transporter
        B1[Quét QR]
        B2[Cập nhật trạng thái]
        B3[Ghi nhận vị trí]
        B4[Đính kèm ảnh/chứng từ]
    end

    subgraph Retailer
        C1[Nhận batch/product]
        C2[Xác nhận trạng thái cuối]
    end

    subgraph Consumer
        D1[Quét QR công khai]
        D2[Xem nguồn gốc]
    end

    subgraph Hệ thống
        E1[Kiểm tra quyền và tính hợp lệ]
        E2[Lưu batch/product/history]
        E3[Sinh và ánh xạ QR]
        E4[Trả dữ liệu truy xuất]
        E5[Đối chiếu blockchain]
    end

    A1 --> E1
    A2 --> E1
    B1 --> E1
    B2 --> E1
    B3 --> E1
    B4 --> E1
    C1 --> E1
    C2 --> E1
    D1 --> E4
    D2 --> E4

    E1 --> E2
    E2 --> E3
    E2 --> E5
    E3 --> E4
    E4 --> D2
```

## 2. Swimlane PlantUML cho luồng chính

Luồng dưới đây mô tả chuỗi nghiệp vụ quan trọng nhất của QRFarm: tạo batch, thêm product, cập nhật trạng thái vận chuyển, và consumer quét QR để truy xuất nguồn gốc.

```plantuml
@startuml
title QRFarm - Swimlane luong chinh tu batch den truy xuat

|Farmer|
start
:Khoi tao batch moi;
:Nhap thong tin batch;

|He thong|
:Kiem tra hop le batch;
:Luu batch vao DB;
:Sinh QR cho batch;

|Farmer|
:Them product vao batch;

|He thong|
:Kiem tra thong tin product;
:Luu product vao DB;
:Cap nhat QR mapping;

|Transporter|
:Quet QR cua batch/product;
:Cap nhat trang thai;
:Ghi nhan vi tri;
:Dinh kem anh/chung tu;

|He thong|
:Kiem tra quyen cap nhat;
:Luu lich su trang thai;
:Neu can thi doi chieu blockchain;

|Consumer|
:Quet QR cong khai;

|He thong|
:Nhan dinh danh batch/product tu QR;
:Tra du lieu truy xuat;

|Consumer|
:Xem thong tin batch/product;
:Xem lich su trang thai;
stop
@enduml
```

![BPMN](BPMN.png)

## 3. Quy trình tạo batch và product

1. Farmer khởi tạo batch mới trên app hoặc màn hình vận hành.
2. Hệ thống kiểm tra dữ liệu batch.
3. Hệ thống lưu batch vào DB và sinh QR.
4. Farmer thêm product vào batch.
5. Hệ thống lưu product, liên kết với batch cha và sinh QR nếu cần.
6. Mốc tạo mới có thể được đẩy sang lớp blockchain xác thực phụ.

## 4. Quy trình cập nhật vận chuyển

1. Transporter quét QR của batch hoặc product.
2. Hệ thống xác định đúng thực thể cần cập nhật.
3. Transporter nhập trạng thái mới, vị trí và chứng từ.
4. Hệ thống kiểm tra quyền, kiểm tra tính hợp lệ và lưu lịch sử.
5. Nếu cần, hệ thống gửi mốc nghiệp vụ sang blockchain.

## 5. Quy trình tra cứu công khai

1. Consumer quét QR hoặc mở link truy xuất.
2. Web gọi backend để lấy dữ liệu batch hoặc product.
3. Backend trả về thông tin chính, lịch sử trạng thái và vị trí hiện tại.
4. Web hiển thị thông tin theo dạng dễ đọc cho người tiêu dùng.

## 6. Quy trình đối chiếu blockchain

1. Backend chọn các mốc quan trọng cần xác thực.
2. Dữ liệu được chuẩn hóa trước khi gửi sang lớp blockchain.
3. Blockchain ghi nhận hoặc đối chiếu dấu vết.
4. Hệ thống nhận phản hồi và đánh dấu trạng thái xác thực.
5. Nếu blockchain lỗi, luồng nghiệp vụ chính vẫn tiếp tục hoạt động.
