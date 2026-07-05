# G-Scores - THPT 2024 Exam Results Dashboard

G-Scores là ứng dụng Fullstack giúp tra cứu điểm thi, phân tích phổ điểm các môn học và vinh danh thủ khoa Khối A từ tập dữ liệu điểm thi tốt nghiệp THPT Quốc gia 2024 với hơn **1 triệu thí sinh**.

Dự án được xây dựng đáp ứng đầy đủ yêu cầu bài test phỏng vấn của **Golden Owl Solutions**, tối ưu hiệu năng xử lý dữ liệu lớn và thiết kế giao diện hiện đại.

---

## 🔗 Live Demo Links
* **Giao diện Web (Live Demo):** [https://g-scorehuy.netlify.app](https://g-scorehuy.netlify.app)
* **Máy chủ Backend API:** [https://g-scores-backend-x19i.onrender.com](https://g-scores-backend-x19i.onrender.com)

---

## 🛠️ Công Nghệ Sử Dụng (Tech Stack)

### Backend
* **Runtime**: Node.js & TypeScript
* **Framework**: Express.js
* **ORM**: Prisma ORM
* **Database**: SQLite (tiện lợi chạy trực tiếp không cần cài đặt SQL server bên ngoài, dễ chuyển sang PostgreSQL/MySQL qua env)

### Frontend
* **Library**: React & TypeScript (scaffolded via Vite)
* **Visualizations**: Recharts (vẽ biểu đồ cột chồng chất lượng cao)
* **Styling**: Vanilla CSS (Premium Dark Mode & Glassmorphism)
* **Icons**: Lucide React

---

## ⚡ Các Điểm Tối Ưu Nổi Bật (Optimizations & OOP)

1. **Lập Trình Hướng Đối Tượng (OOP - Bắt buộc)**:
   * Logic quản lý các môn học được xây dựng theo kiến trúc OOP trong tệp `backend/src/domain/subject.ts`.
   * Định nghĩa lớp cha trừu tượng `Subject` chứa các luật kiểm tra tính hợp lệ (`validate`) và phân loại học lực (`classify`).
   * Các lớp môn học con (như `MathSubject`, `PhysicsSubject`,...) kế thừa và triển khai các thuộc tính cụ thể của môn học đó.
   * Quản lý tập trung qua lớp `SubjectManager` áp dụng mẫu thiết kế **Singleton** để đảm bảo tính đồng nhất và dễ mở rộng.

2. **Xử Lý Dữ Liệu Lớn (1,061,605 dòng)**:
   * **Streaming Parser**: Đọc file CSV bằng luồng (`readline` stream) giúp giữ RAM ở mức cực thấp (< 50MB) thay vì đọc toàn bộ file 43MB vào bộ nhớ làm crash Node.js.
   * **Bulk Insert & Indexes**: Dữ liệu được đẩy vào SQLite theo các gói nhỏ (chunks 2000 dòng) và lập chỉ mục (index) tại cột số báo danh (`sbd`) và bộ ba môn Khối A (`toan, vat_li, hoa_hoc`) giúp tìm kiếm và xếp hạng chỉ mất vài mili-giây.
   * **Pre-Computed Statistics**: Phổ điểm phân phối theo 4 mốc cấp độ được tính toán tích lũy ngay trong quá trình seed và lưu vào bảng `SubjectStatistic`. Nhờ vậy, biểu đồ thống kê tải ngay lập tức khi mở trang thay vì quét lại 1 triệu dòng dữ liệu.

---

## 🚀 Hướng Dẫn Chạy Dự Án

### Cách 1: Chạy bằng Docker (Khuyên Dùng)

Dữ liệu SQLite đã được seed sẵn hoàn chỉnh. Bạn chỉ cần gõ 1 lệnh duy nhất tại thư mục gốc của dự án để chạy toàn bộ hệ thống:

```bash
docker compose up --build
```

Sau khi các container khởi động thành công:
* **Frontend UI (React):** [http://localhost:3000](http://localhost:3000)
* **Backend API (Express):** [http://localhost:5000](http://localhost:5000)

---

### Cách 2: Chạy Thủ Công (Local NPM)

Nếu muốn chạy trực tiếp trên máy không dùng Docker, bạn mở 2 cửa sổ terminal riêng biệt:

#### 1. Khởi động Backend
```bash
cd backend
npm install
npm run dev
```
* API sẽ chạy tại: [http://localhost:5000](http://localhost:5000)
* *Lưu ý*: SQLite database đã được seed sẵn ở file `backend/prisma/dev.db`. Nếu bạn muốn xóa và seed lại từ đầu, hãy chạy lệnh: `npm run db:seed`.

#### 2. Khởi động Frontend
```bash
cd frontend
npm install
npm run dev
```
* Trang web sẽ chạy tại: [http://localhost:5173/](http://localhost:5173/)

---

## 🧪 Các Tính Năng & Hướng Dẫn Kiểm Thử (E2E Testing)

Mở trang web trên trình duyệt và kiểm thử các tính năng sau:

### 1. Tra cứu điểm (Score Search)
* **Kiểm tra Validation:** Thử nhập các ký tự chữ cái (ví dụ: `abc12345`) hoặc SBD thiếu số (ví dụ: `12345`). Nhấn **Tìm kiếm**, hệ thống sẽ báo lỗi màu đỏ yêu cầu nhập đúng định dạng 8 chữ số.
* **Tìm kiếm hợp lệ:** Nhập SBD `01000001` (hoặc các số tiếp theo `01000002`, `01000003`, v.v.). Giao diện hiển thị card báo cáo điểm chi tiết, tính điểm trung bình và liệt kê đầy đủ 9 môn học (môn vắng thi hiển thị badge xám `Vắng`).
* **Không tìm thấy:** Nhập SBD không tồn tại như `99999999` để kiểm tra thông báo lỗi.

### 2. Thống kê phổ điểm (Distribution Stats)
* Nhấp vào tab **Thống kê phổ điểm**.
* Biểu đồ Stacked Bar Chart hiển thị tỷ lệ học lực của 9 môn học theo 4 phân khúc điểm: Giỏi (`>=8`), Khá (`6-8`), Trung bình (`4-6`), và Kém (`<4`).
* Di chuột vào từng cột để xem thông số chi tiết qua tooltip. Phía dưới có bảng tóm tắt số liệu rõ ràng.

### 3. Bảng vàng Khối A (Top 10 Leaderboard)
* Nhấp vào tab **Bảng vàng Khối A**.
* Bục vinh quang (Podium) 3D hiển thị rực rỡ vinh danh 3 thủ khoa đạt điểm Toán + Lý + Hóa cao nhất kỳ thi (Thủ khoa đạt `29.6` điểm, SBD `26020938`).
* Phía dưới là bảng xếp hạng chi tiết từ Hạng 4 đến Hạng 10 kèm bảng điểm thành phần.
