# Bộ hình Chánh Điện của Cherry

Giao diện dùng tông gỗ nâu, kem và vàng ấm; cảnh chùa và nhân vật mới được tạo bằng công cụ **imagegen tích hợp**. Các prompt cuối cùng được lưu trong [art-prompts.json](art-prompts.json).

## Xem trước

- [Chọn một trong bảy nhân vật](previews/web-entry.jpg)
- [Bảy nhân vật mới trong chánh điện](previews/seven-characters.jpg)
- [Overlay với 100 người](previews/overlay-100.jpg)
- [Thông báo hồi hướng](previews/overlay-gift.jpg)
- [Website trên điện thoại](previews/web-390.jpg)
- [Bảng điều khiển](previews/control.jpg)

## Tài nguyên và cách thay hình

| Thành phần | Vị trí |
|---|---|
| Cảnh chùa mới | `assets/scene/hall-warm.png` |
| Bảy sprite sheet PNG trong suốt | `assets/characters/{man,woman,granny,monk,nun,child,master}.png` |
| Nhãn, tỷ lệ và vùng ảnh của từng tư thế | `assets/characters/manifest.js` |
| Hàm tải ảnh, vẽ nhân vật, xem trước và bồ đoàn dùng chung | `assets/characters/characters.js` |
| Màu và kiểu chữ chung | `assets/theme.css` |
| Bố cục từng màn hình | `assets/visitor.css`, `assets/overlay.css`, `assets/control.css` |

Mỗi sprite sheet có tám tư thế, xếp bốn cột và hai hàng. Khung 0–3 là bước đi, khung 4–7 là ngồi xuống; khung 7 cũng dùng cho ảnh chọn nhân vật và trạng thái an tọa. Nhân vật không chứa bồ đoàn: bồ đoàn được vẽ tại vị trí ghế trong cảnh.

`frames` trong manifest chứa tám vùng nguồn `[x, y, width, height]`, đo bằng pixel trên ảnh gốc. Các vùng này được căn theo tâm ngang và đáy khi vẽ, giúp loại bỏ khoảng trống khác nhau giữa các tư thế. `seatedHeight` phải bằng chiều cao vùng nguồn của khung 7; `scale` điều chỉnh vóc dáng tương đối, ví dụ chú tiểu nhỏ hơn người lớn.

Khi thay sprite sheet, cập nhật kích thước ảnh, tám vùng nguồn và chiều cao ngồi trong manifest; giữ đủ lề trong suốt để không cắt tóc, bàn tay hoặc bàn chân. Kiểm tra mép ảnh trên cả nền sáng và tối. Không thay mã nhân vật nếu muốn giữ các lệnh bình luận hiện có.

Khi ảnh mới tải lỗi, bộ vẽ tự dùng hình gốc tương ứng. Cảnh mới cũng có ảnh nền gốc dự phòng. Các tài nguyên gốc được giữ trong `assets/`.

## Hành vi hiển thị

- Website cho chọn đủ bảy vai. Overlay tiếp tục nhận các lệnh `nam`, `nữ`, `bà`, `sư`, `ni`, `tiểu`, `cao tăng`.
- Cao tăng có tạo hình riêng; cả bảy vai đều đi vào và ngồi xuống. Không đổi giao thức WebSocket hay cách kết nối TikTok.
- Khi có 64–100 chỗ, overlay giảm nhãn tên của người im lặng để cảnh không bị che; tên xuất hiện khi người đó bình luận hoặc có công đức. Danh sách trong bảng điều khiển vẫn đầy đủ.
- Thông báo quà được ưu tiên hơn banner tụng kinh. Văn bản dài được xuống dòng hoặc rút gọn trong vùng thông báo.
- Khi thiết bị bật giảm chuyển động, nhân vật an tọa ngay; tắt bước đi, hiệu ứng thở, cúi và hạt trang trí.
- Website có vùng riêng phía dưới cho nút tương tác. Khung chọn y phục cuộn được trên màn hình thấp; mọi vai đều chọn được bằng bàn phím.
- Giao diện không hiển thị dòng ghi công cá nhân hoặc nguồn gốc; thông tin dự án nằm trong README và thông báo bản quyền MIT gốc được giữ trong `LICENSE`.

## Kiểm tra

Chạy `cd live && npm test` để kiểm tra cấu trúc sprite, vùng ảnh, phương án dự phòng, cú pháp trình duyệt, hàng đợi âm thanh và giới hạn truy cập server.

Đã kiểm tra bằng Chrome: bảy vai đi/ngồi; overlay với 24, 36, 64, 100 người; ưu tiên thông báo; giảm chuyển động; web ở 360px, 390px và desktop; bảng điều khiển trên màn hình hẹp và rộng. Kết quả được lưu tại [visual-qa.json](visual-qa.json). Ảnh xem trước dùng dữ liệu mô phỏng.

Kết nối TikTok LIVE thật và giọng đọc trực tuyến cần kiểm tra riêng trên máy phát. QR ngân hàng vẫn để bổ sung sau.
