# Cron-job keep-alive

Sử dụng [cron-job.org](https://cron-job.org) để gọi `GET /livez` mỗi 10 phút,
giúp đánh thức backend Render và tránh trạng thái sleep giữa các lần gọi.

Tạo một cron job với:

- **URL:** `https://<ten-backend>.onrender.com/livez`
- **Method:** `GET`
- **Schedule:** mỗi 10 phút
- **Expected response:** HTTP `200`

Endpoint `/livez` đã có sẵn trong backend và kiểm tra kết nối database.
