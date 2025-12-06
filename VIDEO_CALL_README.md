# Video Call Feature - Quick Start

## Cài đặt nhanh

### 1. Cài đặt dependencies

```bash
# Server
cd server
npm install

# Client (đã có sẵn socket.io-client)
cd client
npm install
```

### 2. Khởi động ứng dụng

**Terminal 1 - Server:**

```bash
cd server
npm start
```

**Terminal 2 - Client:**

```bash
cd client
npm start
```

## Sử dụng

1. Đăng nhập vào GroupChat
2. Chọn một channel
3. Nhấn nút **"📹 Video Call"** trên header
4. Cho phép truy cập camera/microphone
5. Bắt đầu video call!

## Tính năng

- ✅ **Video/Audio Call**: Peer-to-peer WebRTC
- ✅ **Screen Sharing**: Chia sẻ màn hình
- ✅ **Toggle Camera/Mic**: Bật/tắt camera và microphone
- ✅ **Multi-user**: Hỗ trợ nhiều người (tối ưu 2-6 người)
- ✅ **Responsive**: Hoạt động trên desktop, tablet, mobile
- ✅ **Local Network**: Không cần API bên ngoài

## Kiến trúc

- **Backend**: Node.js + Express + Socket.IO (signaling server)
- **Frontend**: React + WebRTC API
- **Connection**: Peer-to-peer (mesh topology)
- **STUN Servers**: Google's public STUN servers

## Yêu cầu

- Node.js 14+
- Modern browser (Chrome 74+, Firefox 66+, Safari 12+, Edge 79+)
- Camera và Microphone
- Port 5000 available (server)
- Port 3000 available (client)

## Cấu trúc file mới

```
GroupChat/
├── server/
│   └── index.js                    # ✨ Đã thêm Socket.IO signaling
├── client/src/
│   ├── services/
│   │   └── webrtcService.js       # ✨ WebRTC service
│   └── components/
│       ├── ChannelInner.jsx       # ✨ Đã tích hợp video call button
│       └── meeting/               # ✨ NEW
│           ├── VideoCall.jsx
│           ├── VideoCall.css
│           ├── VideoGrid.jsx
│           ├── VideoGrid.css
│           ├── VideoControls.jsx
│           └── VideoControls.css
└── VIDEO_CALL_DOCUMENTATION.md    # ✨ Tài liệu chi tiết
```

## Troubleshooting

**Không kết nối được?**

- Kiểm tra server đang chạy: `http://localhost:5000`
- Kiểm tra browser console cho errors
- Cho phép camera/microphone permissions

**Video bị lag?**

- Giảm số người trong call
- Kiểm tra băng thông internet
- Tắt video, chỉ dùng audio

## Tài liệu đầy đủ

Xem file [VIDEO_CALL_DOCUMENTATION.md](./VIDEO_CALL_DOCUMENTATION.md) để biết thêm chi tiết.

---

**Version**: 1.0.0  
**Last Updated**: December 3, 2025
