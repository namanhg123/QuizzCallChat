# Tính năng Quiz - GroupChat Application

## Tổng quan

Tính năng Quiz đã được tích hợp vào dự án GroupChat với đầy đủ phân quyền:

- **Admin**: Xem, chỉnh sửa, xóa tất cả quiz của mọi người
- **Teacher (Giáo viên)**: Tạo, quản lý quiz của mình, xem kết quả học sinh
- **Student (Học sinh)**: Xem quiz đang mở và làm bài

## Cài đặt

### 1. Cài đặt dependencies cho Server

```bash
cd server
npm install
```

Server đã có sẵn `mongoose` trong package.json.

### 2. Cấu hình MongoDB

Đảm bảo MongoDB đang chạy trên máy tính của bạn. File `.env` đã được cấu hình:

```
MONGODB_URI=mongodb://localhost:27017/groupchat_quiz
```

Nếu bạn sử dụng MongoDB Atlas hoặc cổng khác, hãy cập nhật `MONGODB_URI` trong file `.env`.

### 3. Khởi động Server

```bash
cd server
npm start
```

Server sẽ chạy trên port 5000 và tự động kết nối đến MongoDB.

### 4. Khởi động Client

```bash
cd client
npm install
npm start
```

Client sẽ chạy trên port 3000.

## Cấu trúc dự án

### Backend (Server)

```
server/
├── models/
│   ├── Quiz.js          # Model cho quiz
│   ├── Question.js      # Model cho câu hỏi
│   └── Result.js        # Model cho kết quả
├── controllers/
│   └── quiz.js          # Logic xử lý quiz
├── routes/
│   └── quiz.js          # API routes cho quiz
├── middleware/
│   └── quizAuth.js      # Authentication & Authorization
└── index.js             # MongoDB connection & quiz routes
```

### Frontend (Client)

```
client/src/components/
├── QuizDashboard.jsx    # Component chính cho Quiz
├── QuizDashboard.css    # Styles cho Quiz
├── ChannelListContainer.jsx  # Đã cập nhật để thêm nút Quiz
├── App.jsx              # Đã cập nhật để hỗ trợ Quiz view
└── index.js             # Export QuizDashboard
```

## API Endpoints

### Admin & Teacher Routes

- `POST /quiz` - Tạo quiz mới
- `GET /quiz/mine` - Lấy danh sách quiz của teacher
- `GET /quiz/all` - Lấy tất cả quiz (Admin only)
- `PUT /quiz/:quizId` - Cập nhật quiz
- `DELETE /quiz/:quizId` - Xóa quiz
- `POST /quiz/:quizId/start` - Mở quiz
- `POST /quiz/:quizId/stop` - Đóng quiz
- `POST /quiz/stop-all` - Đóng tất cả quiz
- `POST /quiz/:quizId/questions` - Thêm câu hỏi
- `GET /quiz/:quizId/questions/full` - Lấy câu hỏi với đáp án
- `PUT /quiz/:quizId/questions/:questionId` - Cập nhật câu hỏi
- `DELETE /quiz/:quizId/questions/:questionId` - Xóa câu hỏi
- `GET /quiz/:quizId/leaderboard` - Xem bảng xếp hạng
- `DELETE /quiz/:quizId/leaderboard` - Xóa bảng xếp hạng
- `GET /quiz/:quizId/results/:resultId` - Chi tiết kết quả

### Student & Public Routes

- `GET /quiz/active` - Lấy danh sách quiz đang mở
- `GET /quiz/:quizId/questions` - Lấy câu hỏi (không có đáp án)
- `POST /quiz/:quizId/submit` - Nộp bài
- `GET /quiz/:quizId/my-results` - Xem kết quả của mình

## Hướng dẫn sử dụng

### Đối với Teacher/Admin

1. **Tạo Quiz**:

   - Click vào nút Quiz (📝) trên sidebar
   - Click "Create New Quiz"
   - Nhập Quiz ID (duy nhất), Title, và Time Limit
   - Click "Create Quiz"

2. **Thêm câu hỏi**:

   - Trong danh sách quiz, click "Edit Questions"
   - Nhập câu hỏi và 4 đáp án
   - Chọn đáp án đúng bằng radio button
   - Click "Add Question"

3. **Quản lý Quiz**:

   - **Start**: Mở quiz cho học sinh làm bài
   - **Stop**: Đóng quiz
   - **Edit Questions**: Thêm/sửa/xóa câu hỏi
   - **View Results**: Xem bảng xếp hạng và kết quả chi tiết
   - **Delete**: Xóa toàn bộ quiz

4. **Xem kết quả**:
   - Click "View Results" để xem bảng xếp hạng
   - Bảng hiển thị: tên học sinh, điểm, phần trăm, số lần làm, thời gian
   - Có thể xóa toàn bộ kết quả để reset bảng

### Đối với Student

1. **Xem quiz có sẵn**:

   - Click vào nút Quiz (📝) trên sidebar
   - Danh sách quiz đang mở sẽ hiển thị

2. **Làm bài**:

   - Click "Take Quiz" trên quiz muốn làm
   - Đọc và chọn đáp án cho mỗi câu hỏi
   - Click "Submit Quiz" khi hoàn thành
   - Kết quả sẽ hiển thị ngay với điểm số và review từng câu

3. **Xem kết quả cũ**:
   - Click "My Results" để xem các lần làm trước đó
   - Mỗi lần làm sẽ được lưu riêng với số attempt

### Đối với Admin

Admin có tất cả quyền của Teacher, thêm vào đó:

- Xem, chỉnh sửa, xóa **tất cả** quiz của mọi giáo viên
- Quản lý toàn bộ hệ thống quiz

## Tính năng chính

### 1. Phân quyền rõ ràng

- **Admin**: Full access
- **Teacher**: Quản lý quiz của mình
- **Student**: Chỉ xem và làm bài

### 2. Quản lý Quiz

- Tạo/sửa/xóa quiz
- Mở/đóng quiz
- Giới hạn thời gian làm bài

### 3. Quản lý câu hỏi

- Thêm/sửa/xóa câu hỏi
- 4 đáp án mỗi câu, 1 đáp án đúng
- Hiển thị preview cho teacher

### 4. Làm bài & Chấm điểm

- Giao diện thân thiện cho học sinh
- Đếm ngược thời gian (nếu có)
- Tự động chấm điểm
- Review chi tiết sau khi nộp bài

### 5. Bảng xếp hạng

- Sắp xếp theo điểm cao nhất
- Hiển thị thời gian làm bài
- Theo dõi số lần làm
- Có thể reset bảng

## Lưu ý quan trọng

1. **MongoDB phải được cài đặt và chạy** trước khi khởi động server
2. **Token và User ID** được gửi trong header để xác thực:
   - `Authorization: Bearer <token>`
   - `X-User-Id: <userId>`
3. **Quiz ID phải unique** - không được trùng
4. **Mỗi câu hỏi phải có đúng 1 đáp án đúng**
5. **Admin có thể thao tác trên quiz của bất kỳ ai**

## Xử lý lỗi thường gặp

### 1. "MongoDB connection error"

- Kiểm tra MongoDB có đang chạy không
- Kiểm tra MONGODB_URI trong .env

### 2. "No token provided"

- Client cần gửi token trong Authorization header
- Đảm bảo đã đăng nhập

### 3. "Quiz ID already exists"

- Chọn một Quiz ID khác

### 4. "Access denied"

- Kiểm tra role của user
- Admin/Teacher mới có quyền tạo quiz

## Cải tiến trong tương lai

- [ ] Upload hình ảnh trong câu hỏi
- [ ] Nhiều loại câu hỏi (true/false, multiple choice, essay)
- [ ] Export kết quả ra Excel
- [ ] Thống kê chi tiết hơn
- [ ] Lịch sử làm bài chi tiết
- [ ] Chia sẻ quiz giữa các teacher

## Liên hệ & Hỗ trợ

Nếu gặp vấn đề, vui lòng kiểm tra:

1. Console log của browser (F12)
2. Terminal log của server
3. MongoDB logs

---

**Chúc bạn sử dụng tính năng Quiz hiệu quả!** 🎓📝
