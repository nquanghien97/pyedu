# GitHub Actions keep-alive

Workflow `.github/workflows/render-keep-alive.yml` gọi `GET /livez` mỗi 10 phút
để đánh thức backend Render và tránh trạng thái sleep giữa các lần gọi.

Trong GitHub repository, tạo Actions secret:

- **Name:** `BACKEND_URL`
- **Value:** `https://<ten-backend>.onrender.com`

Có thể chạy thủ công tại **Actions → Keep Render backend awake → Run workflow**.
GitHub Actions cron dùng múi giờ UTC và có thể chạy trễ vài phút.
