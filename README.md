# QRFarm

QRFarm la du an startup huong toi bai toan truy xuat nguon goc trong nong nghiep Viet Nam, ket hop:

- Ung dung di dong (Expo React Native) de tao/quet QR va cap nhat hanh trinh lo hang.
- Demo blockchain (Hardhat + Solidity + React dApp) de mo phong quy trinh xac thuc va lich su san pham tren chuoi.

## Muc tieu du an

- So hoa thong tin lo nong san va qua trinh van chuyen.
- Tang tinh minh bach va kha nang truy xuat theo thoi gian thuc.
- Mo phong vai tro trong chuoi cung ung: Farmer, Transporter, Retailer.

## Kien truc tong the

Du an gom 2 khoi chinh:

### 1) Mobile App (thu muc src)

Cong nghe chinh:

- Expo SDK 53
- React Native 0.79
- Expo Router
- Axios

Chuc nang noi bat:

- Tao batch va tao du lieu khoi dau cho batch.
- Them san pham con vao batch.
- Tao QR cho batch/san pham.
- Quet QR de dieu huong sang man hinh cap nhat product/batch.
- Phan tich logistics (tong quan chuoi cung ung, region performance, trend, prediction).
- Tuong tac backend API de luu va lay du lieu batch/product/logistics.

Mot so endpoint backend dang duoc su dung:

- GET /api/products/location
- POST /api/batches
- GET /api/batches/:batchId
- POST /api/batches/:batchId/blocks
- GET /api/batches/:batchId/products
- POST /api/products
- GET /api/products/:productId
- POST /api/products/:productId/blocks
- GET /api/logistics/batch/:batchId
- GET /api/logistics/insights/summary

### 2) Blockchain Demo (thu muc LiskDemo)

Cong nghe chinh:

- Solidity 0.8.28
- Hardhat + Hardhat Ignition
- Ethers
- React (web dApp)

Thanh phan:

- Smart contract QRChain: quan ly role va lich su san pham theo su kien.
- Script deploy/interaction voi mang Lisk Sepolia.
- Web dApp de ket noi vi, thao tac role-based va xem lich su san pham.

## Cau truc thu muc

```text
QRFarm/
|-- README.md
|-- APK_BUILD_GUIDE.md
|-- LOGISTICS_README.md
|-- build-scripts.json
|-- src/                    # Mobile app (Expo React Native)
|   |-- app/                # Expo Router screens
|   |-- components/
|   |-- services/api.ts
|   |-- config/urls.ts
|   |-- package.json
|   `-- ...
`-- LiskDemo/               # Blockchain + dApp demo
	|-- contracts/QRChain.sol
	|-- ignition/modules/QRChain.ts
	|-- scripts/interact.ts
	|-- qrchain-dapp/
	|-- hardhat.config.ts
	`-- package.json
```

## Yeu cau moi truong

- Node.js >= 18 (khuyen nghi ban LTS moi)
- npm
- Expo CLI (co the dung npx)
- EAS CLI (neu build APK/AAB)
- Vi Web3 (MetaMask) cho dApp blockchain

## Huong dan chay nhanh

### A. Chay Mobile App

1. Cai dependency:

```bash
cd src
npm install
```

2. Cau hinh URL phu hop moi truong:

- API base URL trong file src/services/api.ts
- QR demo URL trong file src/config/urls.ts

3. Chay ung dung:

```bash
npx expo start
```

Tuy chon:

```bash
npx expo start --tunnel
```

### B. Build APK/AAB cho Android (EAS)

Tham khao chi tiet trong APK_BUILD_GUIDE.md. Lenh nhanh:

```bash
cd src
npm run build:android:preview
npm run build:android:production
npm run build:android:aab
npm run build:status
```

### C. Chay Blockchain Demo

1. Cai dependency Hardhat:

```bash
cd LiskDemo
npm install
```

2. Tao file .env va cau hinh bien can thiet (vi du):

- PRIVATE_KEY
- PRIVATE_KEY_FARMER
- PRIVATE_KEY_TRANSPORTER
- PRIVATE_KEY_RETAILER
- CONTRACT_ADDRESS

3. Compile/test/deploy (tham khao them trong hardhat.config.ts va ignition):

```bash
npx hardhat compile
npx hardhat test
npx hardhat ignition deploy ./ignition/modules/QRChain.ts --network lisk-sepolia
```

4. Chay script mo phong luong supply chain:

```bash
npx hardhat run scripts/interact.ts --network lisk-sepolia
```

### D. Chay Web dApp cho Blockchain

```bash
cd LiskDemo/qrchain-dapp
npm install
npm start
```

## Luong nghiep vu chinh

1. Farmer tao batch va tao san pham.
2. He thong sinh QR cho batch/product.
3. Transporter quet QR va cap nhat vi tri/trang thai trong qua trinh van chuyen.
4. Retailer cap nhat trang thai cuoi.
5. Nguoi dung xem lich su va phan tich logistics.

## Trang thai hien tai

- Mobile app chay on trong local development.
- Ban APK export van co mot so loi can tiep tuc sua.
- Blockchain demo da co smart contract, deployment module, script interaction va web dApp ban dau.

## Tai lieu lien quan

- APK_BUILD_GUIDE.md: Huong dan build APK/AAB
- LOGISTICS_README.md: Mo ta chi tiet tinh nang logistics tren mobile
- src/README.md: Huong dan co ban cho Expo app
- LiskDemo/VERCEL_DEPLOYMENT.md: Huong dan deploy dApp

## Huong phat trien tiep theo

- Hoan thien va on dinh ban APK production.
- Bo sung test tu dong cho luong chinh mobile va contract.
- Tach cau hinh moi truong theo .env cho mobile app.
- Dong bo metadata QR giua mobile app va blockchain demo.

## Dong gop

Neu ban muon dong gop:

1. Tao branch moi tu nhanh chinh.
2. Commit ro rang theo tung nhom thay doi.
3. Tao pull request kem mo ta, buoc test va anh/chup man hinh neu co.

## Lien he

Du an duoc phat trien cho bai toan truy xuat nong san tai Viet Nam. Neu can mo rong, co the bat dau tu 2 module cot loi: mobile va blockchain demo.
