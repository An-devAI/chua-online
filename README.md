# Chùa Online

Bản chia sẻ của **Cherry**: [An-devAI/chua-online](https://github.com/An-devAI/chua-online).

Chính điện online 2.5D cho TikTok LIVE. Mỗi người xem bình luận là bước vào chính điện, ngồi xuống bồ đoàn tụng kinh. Ai tặng quà sẽ được xướng tên hồi hướng bằng giọng đọc tiếng Việt. Có nhạc thiền, chuông, mõ và đọc kinh định kỳ.

Mã nguồn chia sẻ miễn phí (MIT). Có hai phần:

| Thư mục | Là gì |
|---|---|
| `index.html`, `assets/` | Bản web tĩnh cho mọi người tự vào ngồi tụng (đăng lên Cloudflare Pages) |
| `live/` | Bộ công cụ phát LIVE: server Node, overlay 9:16, bảng điều khiển |

Bản Cherry có cảnh chùa ấm sáng và bảy nhóm nhân vật mới, đều có động tác đi vào và ngồi xuống. Xem [ảnh giao diện, bộ hình và hướng dẫn tùy chỉnh](docs/visual-design.md).

## Chạy bộ LIVE trên máy phát

Cần Node.js 20 trở lên và npm. Tải ZIP của dự án rồi giải nén, hoặc clone repository của bản bạn muốn dùng.

```bash
cd live
npm ci
npm start
```

1. Mở `http://localhost:3000/live/control.html` (bảng điều khiển).
2. Bấm **Mở overlay 9:16**, rồi bấm **Bật âm thanh** một lần trong cửa sổ đó (trình duyệt chặn tự phát tiếng).
3. Trong TikTok LIVE Studio: *Add source → Window capture* → chọn cửa sổ overlay. Với OBS thì dùng *Browser source* trỏ tới `http://localhost:3000/live/overlay.html`, kích thước 1080×1920.
4. Bật LIVE trên TikTok, nhập `@username` vào bảng điều khiển, bấm **Kết nối**.

Chưa LIVE vẫn thử được: mở nhóm **Thử tương tác & người mẫu** ở dưới bảng điều khiển để gửi bình luận, tặng quà mô phỏng, thêm 15/36/64/100 người hoặc bật bot. Nhóm **Nhật ký kết nối** nằm cuối trang, bấm để xem khi cần.

Giữ cửa sổ terminal chạy server trong suốt phiên LIVE. Nhấn `Ctrl+C` để dừng. Cài đặt và danh sách người xem hiện chỉ lưu trong RAM, sẽ đặt lại khi khởi động lại server.

### Tùy chỉnh và chia sẻ bản của bạn

- Đổi tiêu đề, phụ đề, giọng đọc, nhạc và số chỗ ngồi ngay trong bảng điều khiển.
- Thay nhạc trong `assets/music/` nếu muốn dùng tài nguyên riêng. Khi thay nhân vật mới trong `assets/characters/`, cập nhật vùng ảnh và tỷ lệ trong manifest theo [hướng dẫn bộ hình](docs/visual-design.md).
- Khi chia sẻ mã nguồn, gửi kèm `index.html`, `assets/`, thư mục `live/`, `README.md`, `_headers` và `LICENSE`. Không gửi `node_modules/`, `live/tts/`, `.env` hay nhật ký. Người nhận chạy `npm ci` để cài đúng các phiên bản trong lockfile.
- Giữ thông báo bản quyền MIT gốc trong `LICENSE`; ghi người duy trì bản tùy chỉnh và liên hệ trong README.

### Web tĩnh

Đưa `index.html`, `assets/` và `_headers` lên dịch vụ hosting tĩnh như Cloudflare Pages, không cần bước build. Bản này chạy độc lập trong trình duyệt, có tương tác mô phỏng; người truy cập **không ngồi chung một phòng** và bản này không kết nối sự kiện TikTok. Bộ LIVE trong `live/` cần server Node chạy trên máy phát.

### Kiểm tra trước khi chia sẻ

```bash
cd live
npm ci
npm test
```

Sau đó mở bảng điều khiển và overlay, bật âm thanh, thử thêm 100 người mẫu, bình luận, tặng quà và xóa chỗ ngồi. Kết nối TikTok và giọng đọc trực tuyến cần kiểm tra riêng với Internet và kênh đang LIVE.

### Xử lý sự cố thường gặp

| Hiện tượng | Cách xử lý |
|---|---|
| `node` hoặc `npm` không được nhận diện | Cài Node.js từ 20 trở lên rồi mở lại terminal. |
| `EADDRINUSE` | Dừng server cũ hoặc đổi cổng. macOS/Linux: `PORT=3001 npm start`; PowerShell: `$env:PORT=3001; npm start`. Sau đó dùng cổng mới cho cả bảng điều khiển và overlay. |
| Overlay không có tiếng | Bấm **Bật âm thanh** trong overlay và kiểm tra âm lượng của nguồn trong phần mềm phát. |
| Không kết nối được TikTok | Kiểm tra username, kênh đã LIVE và kết nối Internet; thư viện cộng đồng có thể cần cập nhật khi TikTok thay đổi. |
| Không đọc được giọng | Kiểm tra Internet và nhật ký trong bảng điều khiển. Yêu cầu tạo giọng đọc quá 30 giây sẽ bị bỏ qua để hàng đợi tiếp tục chạy. |

### Người xem làm được gì

- **Bình luận bất kỳ**: được vào ngồi (tối đa 100 chỗ, chỗ ngồi tự mở rộng 24 → 36 → 64 → 100). Đầy chỗ thì người im lặng lâu nhất mà chưa tặng quà sẽ nhường chỗ.
- **Bình luận đúng một từ** `nam`, `nữ`, `sư`, `ni`, `tiểu`, `bà`, `cao tăng`: đổi hình nhân vật. Câu "Nam mô A Di Đà Phật" không bị hiểu nhầm thành "nam".
- **Tặng quà**: banner xướng tên, giọng đọc hồi hướng (lấy lời nguyện từ bình luận gần nhất của người đó nếu có), hiệu ứng theo giá trị quà, cộng điểm vào bảng Công Đức.
- **Thả tim**: tim bay trên đầu nhân vật.

## Bảo mật

Dự án được viết để ai tải về chạy cũng an toàn mặc định:

- **Không dùng tài khoản TikTok.** Server chỉ đọc sự kiện công khai của phòng live theo username. Không cần, không hỏi và không lưu mật khẩu, cookie hay session. Không gửi tin nhắn thay bạn.
- **Chỉ mở trên máy mình.** Server lắng nghe `127.0.0.1`, máy khác trong mạng hay Internet không truy cập được. Muốn mở ra ngoài phải tự đặt biến `HOST`. Không nên làm vậy khi chưa thêm đăng nhập.
- **Chặn trang web lạ điều khiển.** WebSocket chỉ nhận kết nối từ chính trang của server (kiểm tra `Origin`), và header `Host` phải là localhost (chống DNS rebinding). Một trang web khác đang mở trong cùng trình duyệt không gửi được lệnh. Cửa sổ overlay chỉ nhận dữ liệu, không gửi lệnh được.
- **File tĩnh có danh sách trắng.** Chỉ phục vụ `/assets` và `/live`. Chặn file ẩn (`.git`, `.env`), `node_modules`, mã server, `package.json` và mọi đường dẫn `../`.
- **Không tin dữ liệu vào.** Tên người xem, bình luận và tên quà đều bị cắt độ dài. Cài đặt chỉ nhận đúng khóa, đúng kiểu, trong giới hạn. Văn bản đưa vào giọng đọc được escape XML. Mọi chữ trên màn hình vẽ bằng `textContent` hoặc canvas, không chèn HTML, nên bình luận chứa mã độc chỉ hiện ra như chữ thường.
- **Chống spam.** Hàng đợi giọng đọc tối đa 15 câu. Bình luận thường không đọc thành tiếng.
- **Phụ thuộc ghim phiên bản** trong `live/package.json`: `ws`, `msedge-tts`, `tiktok-live-connector`. Không có khóa API nào trong mã.

Các lớp trên đã được thử: đường dẫn `../`, `%2e%2e`, `.git/config`, `server.mjs`, `package.json` đều trả 404. Host giả trả 421. WebSocket từ Origin lạ bị từ chối. Lệnh gửi từ overlay bị bỏ qua. Cài đặt sai kiểu bị kẹp về giới hạn.

### Lưu ý

- `tiktok-live-connector` là thư viện cộng đồng, không phải API chính thức của TikTok. Nó có thể ngừng chạy khi TikTok đổi hệ thống. Kiểm tra điều khoản TikTok trước khi dùng cho kênh của bạn.
- Giọng đọc dùng dịch vụ Read Aloud của Microsoft Edge qua mạng (giọng Nam Minh, Hoài My). Máy phát cần có Internet.
- Cảnh và nhân vật mới trong `assets/scene/`, `assets/characters/` được tạo bằng imagegen tích hợp; prompt được lưu trong `docs/art-prompts.json`. Hình và hiệu ứng gốc được tạo bằng Google Flow, nhạc nền tạo bằng Gemini. Kiểm tra điều khoản của các dịch vụ đó trước khi dùng thương mại, hoặc thay bằng tài nguyên của bạn.

## Miễn trừ trách nhiệm

Dự án được chia sẻ **miễn phí, với mục đích học tập và tham khảo lập trình**. Phần mềm được cung cấp "nguyên trạng" (AS IS), không kèm bất kỳ bảo đảm nào, rõ ràng hay ngụ ý.

Khi tải về, sử dụng, chỉnh sửa hoặc phân phối lại mã nguồn này, **bạn tự chịu hoàn toàn trách nhiệm** về:

- Mọi nội dung bạn phát trên livestream hoặc đăng tải, bao gồm hình ảnh, âm thanh, giọng đọc, lời nguyện, bình luận được hiển thị.
- Việc nhận quà, donation hoặc bất kỳ khoản thu nào từ người xem.
- Việc tuân thủ điều khoản sử dụng của TikTok và các nền tảng, dịch vụ bên thứ ba khác (thư viện đọc sự kiện TikTok là thư viện cộng đồng, không chính thức).
- Việc tuân thủ pháp luật nơi bạn sinh sống và hoạt động, kể cả quy định về hoạt động tôn giáo, quảng cáo, thuế và bản quyền.
- Mọi rủi ro và thiệt hại phát sinh, trực tiếp hay gián tiếp, như bị khóa tài khoản, bị dừng live, mất dữ liệu, tranh chấp hay khiếu nại.

Tác giả **không liên quan, không bảo trợ và không chịu trách nhiệm** đối với bất kỳ kênh, tài khoản, sản phẩm hay hoạt động nào sử dụng mã nguồn này. Dự án không đại diện cho bất kỳ chùa, tu viện hay tổ chức tôn giáo nào. Khi dùng nội dung liên quan đến Phật giáo, xin giữ sự tôn kính và không dùng vào mục đích lừa đảo, trục lợi hay xúc phạm niềm tin của người khác.

Việc sử dụng mã nguồn đồng nghĩa với việc bạn đã đọc và đồng ý với các điều trên.

> **Disclaimer (EN):** This project is shared free of charge for educational purposes only and is provided "AS IS", without warranty of any kind. Anyone who uses, modifies or redistributes it is solely responsible for their own content, streams, donations, compliance with TikTok and other platforms' terms, and applicable laws. The author is not affiliated with, does not endorse, and accepts no liability for any channel, account, product or activity built with this code, nor for any direct or indirect damages.

## Nguồn gốc và người duy trì

Bản tùy chỉnh này được phát triển từ [mã nguồn gốc của Kent Juno](https://github.com/kentjuno/chanh-dien-online). Thông báo bản quyền của mã nguồn gốc được giữ trong `LICENSE`.

Người duy trì và phát triển bản tùy chỉnh: **Cherry**.

GitHub và liên hệ: [An-devAI](https://github.com/An-devAI).

## Ủng hộ Cherry

Dự án được chia sẻ miễn phí. Nếu thấy hữu ích, bạn có thể ủng hộ Cherry duy trì và phát triển thêm tính năng. Mã QR ngân hàng sẽ được bổ sung sau.

<!-- Khi có ảnh QR, lưu vào assets/qr-cherry.png rồi thay dòng thông báo phía trên bằng:
![QR ngân hàng ủng hộ Cherry](assets/qr-cherry.png)
-->

## Giấy phép

MIT, xem `LICENSE`.
