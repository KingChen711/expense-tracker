# Chi tiêu

Ứng dụng quản lý chi tiêu cá nhân xây bằng Next.js và Supabase.

## Kiến trúc local-first

- UI đọc và ghi dữ liệu từ IndexedDB trên thiết bị, vì vậy các thao tác chính không phải chờ mạng.
- Mỗi thay đổi được đưa vào outbox và tự đồng bộ lên Supabase khi có mạng.
- Khi mở app, quay lại foreground hoặc bấm **Đồng bộ ngay**, app đẩy outbox rồi tải snapshot mới nhất về máy.
- Supabase Auth và Row Level Security vẫn bảo vệ bản dữ liệu từ xa.
- Nếu chưa đăng nhập hoặc Supabase tạm chậm, dữ liệu local vẫn sử dụng bình thường.

Quy tắc xung đột phù hợp cho app cá nhân hai thiết bị là lần đồng bộ cuối cùng thắng. Giao dịch định kỳ dùng ID xác định theo template và tháng để tránh tạo trùng giữa các thiết bị.

> Dữ liệu chưa đồng bộ chỉ tồn tại trong browser hiện tại. Không xóa site data trước khi trạng thái hiển thị **Đã đồng bộ**, và nên xuất JSON định kỳ.

## Chạy local

Tạo `.env.local` từ `.env.local.example`, điền Supabase URL và anon key, sau đó:

```bash
npm install
npm run dev
```

Mở [http://localhost:3000](http://localhost:3000).

## Kiểm tra production

```bash
npm run lint
npm run build
```

App có thể tiếp tục deploy trên Vercel Free. Các route dữ liệu chính được prerender thành static shell; Supabase chỉ nằm trên đường đồng bộ nền thay vì chặn render UI.
