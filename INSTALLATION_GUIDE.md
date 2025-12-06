# Hướng dẫn cài đặt và chạy Video Call

## Bước 1: Cài đặt dependencies mới

Mở PowerShell và thực hiện các lệnh sau:

### Cài đặt cho Server

```powershell
cd "d:\Dự án\Project\HCI\GroupChat\server"
npm install
```

Lệnh này sẽ cài đặt `socket.io` mới được thêm vào dependencies.

### Client đã sẵn sàng

Client đã có sẵn `socket.io-client`, không cần cài thêm.

## Bước 2: Khởi động Server

### Mở Terminal 1 (PowerShell):

```powershell
cd "d:\Dự án\Project\HCI\GroupChat\server"
npm start
```

Bạn sẽ thấy:

```
Server is running on port 5000
WebRTC Signaling Server ready
```

## Bước 3: Khởi động Client

### Mở Terminal 2 mới (PowerShell):

```powershell
cd "d:\Dự án\Project\HCI\GroupChat\client"
npm start
```

Client sẽ tự động mở browser tại `http://localhost:3000`

## Bước 4: Test Video Call

1. **Đăng nhập** với tài khoản của bạn
2. **Chọn một channel** (hoặc tạo channel mới)
3. **Nhấn nút "📹 Video Call"** ở góc phải trên header
4. **Cho phép quyền** truy cập camera và microphone khi browser hỏi
5. **Video call bắt đầu!**

### Test với nhiều người:

- Mở thêm tab/window mới (hoặc browser khác)
- Đăng nhập với tài khoản khác
- Vào cùng channel
- Nhấn "📹 Video Call"
- Hai người sẽ thấy nhau!

## Các tính năng có sẵn

### Trong Video Call:

- **🎤 Mic**: Bật/tắt microphone
- **📹 Camera**: Bật/tắt camera
- **🖥️ Share Screen**: Chia sẻ màn hình
- **📞 Leave**: Rời khỏi cuộc gọi

## Lưu ý quan trọng

### ⚠️ Server phải chạy trước!

Video call cần server Socket.IO chạy trên port 5000. Nếu không, video call sẽ không hoạt động.

### 🔒 Permissions

Trình duyệt sẽ yêu cầu quyền truy cập camera/microphone lần đầu. Nhấn **"Allow"**.

### 🌐 Network

- **Local network**: Mọi thứ hoạt động tốt trong mạng LAN
- **Internet**: Hoạt động tốt với hầu hết NAT thông thường
- **Corporate firewall**: Có thể cần cấu hình TURN server (nâng cao)

## Xử lý lỗi thường gặp

### ❌ "Cannot access camera/microphone"

**Giải pháp:**

1. Kiểm tra camera/mic có hoạt động không (test với app khác)
2. Vào browser settings → Privacy → Camera/Microphone
3. Cho phép truy cập cho `http://localhost:3000`
4. Reload trang và thử lại

### ❌ "Connection failed"

**Giải pháp:**

1. Kiểm tra server đang chạy:
   ```powershell
   # Mở browser và vào
   http://localhost:5000
   # Phải thấy "Hello World"
   ```
2. Kiểm tra console logs trong browser (F12)
3. Khởi động lại cả server và client

### ❌ Video lag hoặc không mượt

**Giải pháp:**

1. Đóng các ứng dụng khác đang dùng camera
2. Giảm số người trong call (tối đa 6 người)
3. Tắt camera, chỉ dùng audio
4. Kiểm tra băng thông internet

### ❌ Screen sharing không hoạt động

**Giải pháp:**

1. Sử dụng Chrome hoặc Edge (hỗ trợ tốt nhất)
2. Trên macOS: System Preferences → Security & Privacy → Screen Recording
3. Cho phép browser truy cập screen recording

## Kiểm tra trạng thái

### Server logs

Khi có người join video call, server sẽ log:

```
New client connected: <socket-id>
User <name> (<id>) joining room <room-id>
```

### Client console

Mở F12 trong browser, tab Console sẽ thấy:

```
Existing users in room: [...]
Received remote track from: <socket-id>
```

## Ports được sử dụng

- **5000**: Server backend + Socket.IO signaling
- **3000**: Client React app
- **Random ports**: WebRTC peer connections (tự động)

## Cấu trúc code đã thay đổi

### Server (`server/index.js`)

- ✅ Thêm Socket.IO server
- ✅ Thêm WebRTC signaling logic
- ✅ Quản lý rooms và users

### Client

- ✅ Thêm `services/webrtcService.js`
- ✅ Thêm `components/meeting/` folder
- ✅ Cập nhật `ChannelInner.jsx` với button Video Call
- ✅ Cập nhật CSS trong `App.css`

## Next Steps

Sau khi test thành công, bạn có thể:

1. **Customize UI**: Thay đổi màu sắc, icon trong CSS files
2. **Add features**: Xem `VIDEO_CALL_DOCUMENTATION.md` phần "Mở rộng"
3. **Deploy**: Hướng dẫn deploy trong documentation

## Hỗ trợ

Nếu gặp vấn đề:

1. Kiểm tra file `VIDEO_CALL_DOCUMENTATION.md` (hướng dẫn chi tiết)
2. Kiểm tra browser console (F12) để xem lỗi
3. Kiểm tra server terminal logs
4. Đảm bảo đã cài đặt đúng dependencies (`npm install`)

---

**Ready to go!** 🚀

Bây giờ bạn có thể bắt đầu sử dụng video call trong GroupChat!
