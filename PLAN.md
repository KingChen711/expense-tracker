# App ghi chú chi tiêu cá nhân — Kế hoạch triển khai

## Context
Người dùng muốn một app ghi chép chi tiêu cá nhân (chỉ 1 người dùng), chạy được cả trên laptop và điện thoại Android, tự động đồng bộ dữ liệu giữa 2 thiết bị, và không tốn chi phí hosting/lưu trữ. Vault Obsidian hiện tại không chứa code nào — đây là project hoàn toàn mới, đặt trong 1 thư mục riêng ở Desktop, tách biệt hoàn toàn với vault ghi chú.

**Ghi chú quan trọng — áp dụng xuyên suốt:** người dùng muốn được hỏi thêm bất cứ lúc nào nếu có điểm chưa rõ, kể cả **giữa lúc đang code sau khi plan đã được duyệt**, không chỉ trong giai đoạn lên kế hoạch. Đừng ngại dừng lại hỏi khi gặp quyết định cần ý kiến người dùng.

## Quyết định đã chốt với người dùng
- **Vị trí code**: thư mục riêng trên Desktop (`C:\Users\Kingc\OneDrive\Desktop\expense-tracker-app`), là 1 git repo độc lập.
- **Stack**: Next.js (App Router, TypeScript) + Supabase (Postgres + Auth, free tier) + deploy free trên Vercel. Cài như PWA (installable) trên cả laptop và Android — không build app native riêng.
- **Rủi ro Supabase free tier đã xác nhận**: tự pause sau 7 ngày không hoạt động (không đáng lo vì dùng hàng ngày), không có backup tự động (khắc phục bằng tính năng Export/Import thủ công).
- **Auth**: Supabase email/password, chỉ 1 tài khoản (chủ app). Không cần trang đăng ký công khai — tạo user 1 lần qua Supabase Dashboard, app chỉ có trang `/login`.
- **Đơn vị tiền tệ**: VND (định dạng kiểu `1.000.000 đ`, không số thập phân).
- **Tài khoản**: người dùng đã có sẵn GitHub, Supabase, Vercel — sẽ tự thực hiện các bước đăng nhập/tạo project khi tới bước deploy (Claude không tự tạo tài khoản).
- **Theo dõi nợ**: chỉ 1 chiều — "tôi nợ người khác" (không cần chiều người khác nợ tôi).
- **Export/Import**: cả 2 chiều — xuất JSON/CSV và nhập lại (phục vụ backup thực sự dùng được).
- **Cách triển khai**: theo milestone, người dùng test từng phần rồi mới làm tiếp phần sau (không làm 1 lần toàn bộ).

## Kiến trúc kỹ thuật

### Cấu trúc thư mục (Next.js App Router)
```
expense-tracker-app/
  src/
    app/
      login/page.tsx
      (app)/layout.tsx              # layout được bảo vệ, kiểm tra session
      (app)/dashboard/page.tsx
      (app)/transactions/page.tsx
      (app)/categories/page.tsx
      (app)/budgets/page.tsx
      (app)/recurring/page.tsx
      (app)/debts/page.tsx
      (app)/settings/export/page.tsx
    components/
      ui/          # shadcn/ui: button, input, dialog, form...
      charts/       # wrapper Recharts: CategoryPieChart, MonthlyTrendChart
    lib/
      supabase/client.ts   # browser client
      supabase/server.ts   # server client (RSC/Server Actions)
      actions/
        transactions.ts
        categories.ts
        budgets.ts
        recurring.ts
        debts.ts
        export.ts
      recurring/generate.ts   # logic catch-up sinh giao dịch định kỳ
      format.ts               # format tiền VND
    proxy.ts    # (Next.js 16 đổi tên từ middleware.ts) refresh session Supabase, chặn route chưa login
  public/
    manifest.json
    icons/icon-192.png, icon-512.png
  next.config.js     # bọc bởi @ducanh2912/next-pwa (từ milestone 6)
  .env.local         # NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY
```

> Lưu ý: dự án được scaffold bằng Next.js 16, phiên bản này đổi `middleware.ts` → `proxy.ts` (named export `proxy` thay vì `middleware`), `cookies()`/`params`/`searchParams` đều là async/Promise. Đã áp dụng đúng theo docs bundled trong `node_modules/next/dist/docs`.

### Schema Supabase Postgres
Tất cả bảng có `user_id uuid references auth.users`, bật RLS với policy `auth.uid() = user_id` cho mọi thao tác (kể cả chỉ 1 user, vẫn scope đúng chuẩn).

- **categories**: id, user_id, name, type (`income`|`expense`), color, created_at — ✅ đã tạo (milestone 1)
- **transactions**: id, user_id, category_id → categories, type (`income`|`expense`), amount numeric(14,2), occurred_on date, note, created_at — ✅ đã tạo (milestone 1)
- **budgets**: id, user_id, category_id → categories, month (date, ngày đầu tháng), limit_amount numeric(14,2), created_at — milestone 3
- **recurring_templates**: id, user_id, category_id, type, amount, note, frequency (`monthly` là chính, để mở rộng `weekly`/`yearly`), day_of_month, start_date, last_generated_on (nullable), active bool — milestone 4
- **debts** (chỉ chiều "tôi nợ"): id, user_id, creditor_name, total_amount, due_date (nullable), note, status (`active`|`paid`), created_at — milestone 5
- **debt_payments**: id, user_id, debt_id → debts, amount, paid_on, note — milestone 5

### Thư viện chính
- **Biểu đồ**: Recharts (nhẹ, đủ pie/bar/line cho nhu cầu này) — milestone 3
- **UI**: Tailwind CSS + shadcn/ui (style `base-nova`, dùng `@base-ui/react` làm primitive thay vì Radix — lưu ý: Button component của Base UI **không hỗ trợ `asChild`**, dùng `buttonVariants()` áp trực tiếp vào `<Link>` khi cần link trông giống nút)
- **PWA**: `@ducanh2912/next-pwa` (fork còn maintain, tương thích App Router) — milestone 6
- **Data/state**: Server Components + Server Actions của Next.js (không cần React Query/SWR — 1 user, ít traffic, `revalidatePath` sau mỗi Server Action là đủ)

### Sinh giao dịch định kỳ (recurring) — không cần cron server
Khi tải trang `/dashboard` (Server Component), chạy hàm catch-up trước khi render: với mỗi `recurring_templates` đang active, so `last_generated_on` với ngày hôm nay, sinh các giao dịch còn thiếu (giới hạn tối đa ví dụ 24 lần để tránh vòng lặp bất thường), cập nhật `last_generated_on`. Vì người dùng mở app hàng ngày nên cách này đủ dùng cho MVP. Ghi chú hướng nâng cấp sau này nếu cần: Vercel Cron (1 cron job/ngày miễn phí ở gói Hobby) gọi 1 API route làm việc tương tự kể cả khi không mở app.

### PWA
`manifest.json` với `name`, `short_name`, `icons` (192x192, 512x512 — sẽ tạo icon placeholder đơn giản), `display: standalone`, `theme_color`. Service worker cache app shell tĩnh; dữ liệu vẫn cần mạng vì backend là Supabase.

### Deploy
1. Khởi tạo git repo trong thư mục mới (✅ đã có), tạo repo GitHub (người dùng tự đăng nhập/tạo repo, Claude hỗ trợ lệnh git push).
2. Tạo project Supabase (✅ đã tạo), chạy SQL script (✅ đã chạy `supabase/schema.sql`) qua Supabase SQL Editor để tạo bảng + RLS.
3. Vercel: import repo GitHub, set env vars `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, deploy.
4. Trên Android: mở URL Vercel bằng Chrome → "Add to Home screen". Trên laptop: Chrome/Edge → icon "Install app" trên thanh địa chỉ.

## Milestone (làm tuần tự, test từng mốc trước khi qua mốc kế)
1. ✅ **Scaffold + Auth + Giao dịch cơ bản** — hoàn tất, test local OK.
2. ✅ **Danh mục + Tổng quan** — hoàn tất, test local OK. Quản lý category đầy đủ (thêm/sửa/xoá/màu), trang Dashboard hiển thị số dư hiện tại, tổng thu/chi tháng này.
3. ✅ **Biểu đồ + Ngân sách** — hoàn tất, test local OK (kèm fix sự cố CSS theme, xem mục "Sự cố đã xử lý").
4. ✅ **Giao dịch định kỳ** — hoàn tất, test local OK.
5. ✅ **Theo dõi nợ** — hoàn tất, test local OK.
6. 🔄 **Export/Import + PWA + Deploy**: ✅ Export/Import (JSON+CSV) test OK. ✅ PWA (manifest, icon, service worker) — đã xác nhận SW active qua devtools, chưa test "Add to Home screen" thật trên thiết bị (cần deploy trước vì cần HTTPS thật). Còn lại: deploy lên Vercel.

> Lưu ý kỹ thuật milestone 6: **không dùng `@ducanh2912/next-pwa`** (hay next-pwa nói chung) như plan gốc dự tính — các plugin PWA hiện tại đều dựa vào Webpack build plugin, trong khi Next.js 16 mặc định build bằng Turbopack (mix 2 thứ này rủi ro cao, đã gặp nhiều bất ngờ tương thích trong dự án này rồi). Thay vào đó tự viết `public/sw.js` (service worker tối giản, cache app shell) + `public/manifest.json` tay — đủ để đạt tiêu chí "installable" trên Android/Chrome mà không phụ thuộc build plugin dễ vỡ.

## Backlog (ghi nhận từ phản hồi test milestone 2, chưa xử lý)
- **Optimistic UI**: hiện tại form submit → chờ Server Action → redirect/revalidate, chưa cập nhật UI ngay lập tức. Cân nhắc `useOptimistic`/`useFormStatus` sau khi các milestone chức năng đã xong.
- **Bug: double-submit tạo giao dịch trùng**: bấm nút submit 2 lần liên tiếp (double-click) có thể tạo 2 bản ghi giống nhau, do nút submit chưa bị disable khi đang xử lý. Cần disable nút submit khi pending (ví dụ dùng `useFormStatus`) hoặc chặn double-submit phía client.

## Sự cố đã xử lý
- **Toàn bộ màu theme (primary/muted/destructive/border...) không hiển thị**: do lần chạy `shadcn init` đầu tiên bị crash (exit code lạ trên Windows) trước khi kịp ghi các biến CSS theme vào `src/app/globals.css` — file chỉ có `--background`/`--foreground` mặc định của `create-next-app`. Hậu quả: mọi class như `bg-primary`, `text-destructive`, `bg-muted`... đều trỏ tới biến CSS không tồn tại, khiến các nút, viền, và thanh tiến độ ngân sách trong suốt/không thấy màu. Đã thử chạy lại `shadcn init` nhưng bị treo ~10 phút không rõ nguyên nhân (nghi do môi trường Windows) → đã huỷ và tự viết lại đầy đủ bộ token màu chuẩn (neutral, oklch) trực tiếp vào `globals.css` dựa trên danh sách token thực tế được các component trong `src/components/ui` sử dụng. Đã xác minh qua computed style rằng các biến CSS giờ có giá trị hợp lệ và phân biệt rõ ràng.

## Kiểm tra (verification) cho mỗi milestone
- Chạy `npm run dev`, dùng Browser tool để thao tác trực tiếp qua giao diện (không chỉ dựa vào build/type-check thành công). Lưu ý: Claude không bao giờ tự nhập mật khẩu đăng nhập thay người dùng — người dùng tự đăng nhập và xác nhận kết quả.
- Kiểm tra dữ liệu thực sự lưu đúng trong Supabase (qua Supabase Table Editor) sau mỗi thao tác CRUD.
- Từ milestone 6: kiểm tra thêm bản deploy thật trên Vercel URL, thử "Add to Home screen" trên điện thoại Android nếu người dùng có mặt để test cùng.
