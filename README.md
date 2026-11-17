# Khe Suối Thái Cổ 3D — starter 0.2

Bộ khung game web 3D góc nhìn thứ ba, hồ lớn, cá thường + cá phát sáng phong cách fantasy, có cầu nối WebSocket cho sự kiện TikTok LIVE.

## Triển khai miễn phí chỉ bằng iPhone (thử nghiệm)
1. Giải nén ZIP trong ứng dụng Files trên iPhone.
2. Tạo repository GitHub mới, tải các tệp đã giải nén lên repository (không tải riêng file ZIP).
3. Trên Render, tạo **New → Web Service**, kết nối repository GitHub.
4. Cấu hình:
   - Runtime: Node
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Instance Type: `Free`
5. Trong Environment, thêm `TIKTOK_USERNAME` = username TikTok đang LIVE (không có @).
6. Deploy. Khi trạng thái Live, mở URL `https://ten-dich-vu.onrender.com` trên Safari iPhone.

Frontend và WebSocket cùng chạy trên một dịch vụ/host; production tự dùng WSS. Client gửi ping định kỳ để Render biết WebSocket còn hoạt động.

## Chạy local trên máy tính
```bash
npm install
npm run dev
npm run server
```
Mở URL Vite hiển thị trong terminal. WebSocket dev dùng cổng 8787.

## TikTok LIVE
- Bình luận `CÂU CÁ` để tạo marker người chơi thật (khử trùng lặp theo user ID).
- Bình luận `RỜI GAME` để rời hồ.
- Quà tặng tạo hiệu ứng vòng sáng.
- `tiktok-live-connector` là thư viện không chính thức; không phải API TikTok được bảo đảm, có thể hỏng khi TikTok đổi giao thức hoặc giới hạn kết nối.
- Không đưa cookie, mật khẩu hoặc khóa bí mật vào frontend. Chỉ đặt biến môi trường trên máy chủ.
- Kiểm thử trên một LIVE ngắn trước; không xem đây là hệ thống vận hành thương mại.

## Giới hạn
Render Free có thể ngủ sau 15 phút không nhận HTTP request hoặc WebSocket message; lần truy cập đầu có thể cần chờ khoảng một phút. Render có thể khởi động lại dịch vụ. Miễn phí phù hợp demo, không bảo đảm LIVE liên tục.
Dữ liệu người chơi hiện chỉ lưu trong RAM và mất khi server restart. Chưa có timeout rời LIVE, avatar ảnh thật, GLB nhân vật/cá chất lượng cao, gameplay bắt cá/kho đồ, hoặc xác thực WebSocket.
30 FPS là mục tiêu tối ưu chứ chưa phải benchmark iPhone 11.
