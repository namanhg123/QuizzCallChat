# Tính năng Video Call - GroupChat

## Tổng quan

Tính năng Video Call được tích hợp vào dự án GroupChat sử dụng **WebRTC** (Web Real-Time Communication) cho kết nối peer-to-peer trực tiếp, không phụ thuộc vào API bên ngoài. Hệ thống sử dụng Socket.IO làm signaling server để thiết lập kết nối WebRTC giữa các người dùng.

## Kiến trúc hệ thống

### 1. **Backend (Server)**

#### Socket.IO Signaling Server

- **File**: `server/index.js`
- **Port**: 5000 (mặc định)
- **Chức năng**:
  - Quản lý rooms và người dùng trong mỗi room
  - Trung gian signaling cho WebRTC (offer/answer/ICE candidates)
  - Thông báo khi người dùng join/leave room
  - Đồng bộ trạng thái media (video/audio on/off)

#### Events được hỗ trợ:

```javascript
// Client -> Server
- join-room: Tham gia phòng video call
- offer: Gửi WebRTC offer đến peer khác
- answer: Gửi WebRTC answer
- ice-candidate: Trao đổi ICE candidates
- toggle-media: Thông báo bật/tắt camera/mic
- leave-room: Rời khỏi phòng

// Server -> Client
- existing-users: Danh sách người dùng đã có trong room
- user-joined: Thông báo người dùng mới join
- user-left: Thông báo người dùng rời đi
- user-media-toggle: Cập nhật trạng thái media của user
```

### 2. **Frontend (Client)**

#### Cấu trúc thư mục

```
client/src/
├── services/
│   └── webrtcService.js          # Service quản lý WebRTC connections
└── components/
    └── meeting/
        ├── VideoCall.jsx          # Component chính video call
        ├── VideoCall.css
        ├── VideoGrid.jsx          # Hiển thị grid các video
        ├── VideoGrid.css
        ├── VideoControls.jsx      # Controls (mic, camera, share screen)
        └── VideoControls.css
```

#### WebRTC Service (`webrtcService.js`)

Service singleton quản lý:

- Kết nối Socket.IO
- Khởi tạo và quản lý RTCPeerConnection
- Xử lý local/remote streams
- ICE negotiation
- Screen sharing
- Media controls (audio/video toggle)

#### Components

**VideoCall.jsx**

- Component container chính
- Quản lý lifecycle của video call
- Xử lý callbacks từ WebRTC service
- Hiển thị error states

**VideoGrid.jsx**

- Hiển thị video tiles trong grid layout
- Responsive grid (1-9 participants)
- Hiển thị avatar khi camera tắt
- Hiển thị trạng thái media (mic/camera)

**VideoControls.jsx**

- Nút điều khiển: Mic, Camera, Share Screen, Leave
- Visual feedback cho trạng thái active/inactive
- Responsive trên mobile

## WebRTC Configuration

### STUN Servers

Sử dụng Google's public STUN servers (miễn phí):

```javascript
{
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
    { urls: "stun:stun2.l.google.com:19302" },
  ];
}
```

**Lưu ý**: Trong môi trường production với NAT phức tạp, có thể cần thêm TURN server.

## Cài đặt

### 1. Cài đặt dependencies

#### Server

```bash
cd server
npm install
# socket.io đã được thêm vào package.json
```

#### Client

```bash
cd client
npm install
# socket.io-client đã có sẵn
```

### 2. Khởi động server

```bash
cd server
npm start
# hoặc
npm run dev  # với nodemon
```

Server sẽ chạy trên port 5000 (mặc định) hoặc PORT trong .env

### 3. Khởi động client

```bash
cd client
npm start
```

Client sẽ chạy trên http://localhost:3000

## Sử dụng

### Bắt đầu Video Call

1. Đăng nhập vào ứng dụng GroupChat
2. Chọn một channel (team hoặc messaging)
3. Nhấn nút **"📹 Video Call"** ở góc phải trên header
4. Cho phép truy cập camera và microphone khi trình duyệt yêu cầu
5. Video call sẽ bắt đầu

### Các tính năng trong Video Call

#### 🎤 Toggle Microphone

- Nhấn để bật/tắt microphone
- Màu đỏ khi tắt
- Người khác sẽ thấy icon 🔇 khi bạn tắt mic

#### 📹 Toggle Camera

- Nhấn để bật/tắt camera
- Màu đỏ khi tắt
- Hiển thị avatar với chữ cái đầu khi camera tắt
- Người khác sẽ thấy icon 📷 khi bạn tắt camera

#### 🖥️ Share Screen

- Nhấn để chia sẻ màn hình
- Chọn màn hình/cửa sổ/tab muốn chia sẻ
- Màu xanh khi đang chia sẻ
- Tự động quay về camera khi dừng chia sẻ

#### 📞 Leave Call

- Nhấn để rời khỏi cuộc gọi
- Màu đỏ
- Đóng video call và dọn dẹp resources

### Grid Layout

Video call tự động điều chỉnh layout dựa trên số người tham gia:

- **1 người**: Full screen
- **2 người**: 2 cột
- **3-4 người**: Grid 2x2
- **5-6 người**: Grid 3x2
- **7-9 người**: Grid 3x3
- **>9 người**: Scrollable grid

### Responsive Design

- **Desktop**: Full features, grid layout tối ưu
- **Tablet**: Grid 2 cột
- **Mobile**: Grid 1 cột, controls nhỏ gọn

## Troubleshooting

### Camera/Microphone không hoạt động

**Nguyên nhân**: Trình duyệt chặn quyền truy cập
**Giải pháp**:

1. Kiểm tra settings trình duyệt
2. Cho phép camera/microphone cho trang web
3. Sử dụng HTTPS trong production (bắt buộc cho WebRTC)

### Không kết nối được với người dùng khác

**Nguyên nhân**:

- Server signaling không chạy
- Firewall chặn WebRTC
- NAT/Firewall phức tạp

**Giải pháp**:

1. Kiểm tra server đang chạy trên port 5000
2. Kiểm tra console logs cho errors
3. Trong production, cấu hình TURN server cho NAT traversal

### Video bị lag hoặc không mượt

**Nguyên nhân**: Băng thông không đủ, CPU cao
**Giải pháp**:

1. Giảm số người trong call
2. Tắt video, chỉ dùng audio
3. Đóng các ứng dụng khác

### Screen sharing không hoạt động

**Nguyên nhân**: Trình duyệt không hỗ trợ hoặc bị chặn
**Giải pháp**:

1. Sử dụng Chrome/Edge/Firefox hiện đại
2. Cấp quyền screen capture
3. Trên macOS: Settings > Security & Privacy > Screen Recording

## Giới hạn hiện tại

1. **Không có recording**: Chưa hỗ trợ ghi lại cuộc gọi
2. **Không có chat trong call**: Chat vẫn ở channel chính
3. **Mesh topology**: Với >5 người có thể lag (nên dùng SFU trong production)
4. **Không persistence**: Cuộc gọi kết thúc khi tất cả rời đi

## Mở rộng trong tương lai

### Ngắn hạn

- [ ] Background blur/virtual background
- [ ] Recording cuộc gọi
- [ ] Hand raise gesture
- [ ] Reactions (👍, 👏, ❤️)

### Dài hạn

- [ ] SFU (Selective Forwarding Unit) thay vì mesh
- [ ] End-to-end encryption
- [ ] Breakout rooms
- [ ] Live streaming
- [ ] AI transcription

## Bảo mật

### Hiện tại

- Peer-to-peer encryption (mặc định của WebRTC)
- Authentication qua Stream Chat
- Room ID dựa trên channel ID

### Khuyến nghị Production

- Sử dụng HTTPS/WSS
- Implement rate limiting
- Validate room permissions
- Add TURN server với authentication
- Implement end-to-end encryption layer

## Performance Tips

1. **Giới hạn số người**: Tối đa 6-8 người cho mesh topology
2. **Adaptive bitrate**: WebRTC tự động điều chỉnh
3. **Fallback to audio**: Khi network yếu
4. **Close inactive connections**: Auto cleanup khi disconnect

## API Reference

### WebRTCService Methods

```javascript
// Kết nối signaling server
webrtcService.connect(serverUrl);

// Join room
await webrtcService.joinRoom(roomId, userId, userName, mediaConstraints);

// Leave room
webrtcService.leaveRoom();

// Toggle media
webrtcService.toggleVideo(); // Returns: boolean (enabled state)
webrtcService.toggleAudio(); // Returns: boolean (enabled state)

// Screen sharing
await webrtcService.shareScreen(); // Returns: MediaStream
webrtcService.stopScreenShare();

// Cleanup
webrtcService.disconnect();

// Callbacks
webrtcService.onRemoteStream = (socketId, stream, userInfo) => {};
webrtcService.onUserJoined = (user) => {};
webrtcService.onUserLeft = (socketId) => {};
webrtcService.onUserMediaToggle = (socketId, type, enabled) => {};
```

## Hỗ trợ trình duyệt

| Browser | Version | Support |
| ------- | ------- | ------- |
| Chrome  | 74+     | ✅ Full |
| Firefox | 66+     | ✅ Full |
| Safari  | 12+     | ✅ Full |
| Edge    | 79+     | ✅ Full |
| Opera   | 62+     | ✅ Full |
| IE      | Any     | ❌ No   |

## License

MIT License - Tự do sử dụng trong dự án cá nhân và thương mại.

## Liên hệ & Đóng góp

Nếu có vấn đề hoặc đề xuất tính năng mới, vui lòng tạo issue trong repository.

---

**Phát triển bởi**: GroupChat Team  
**Ngày cập nhật**: December 3, 2025  
**Version**: 1.0.0
