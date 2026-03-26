# Hướng dẫn Deploy (Không dùng Docker)

## Yêu cầu hệ thống
- Python 3.11+
- Node.js 20+
- SQL Server (đã cài ODBC Driver 18)
- Nginx (cho production)

---

## 1. Backend (Django)

### Cài đặt môi trường
```bash
cd VNU
python -m venv venv
venv\Scripts\activate        # Windows
pip install -r requirements.txt
```

### Cấu hình database
Mở `VNU/config/settings.py`, cập nhật:
```python
DATABASES = {
    'default': {
        'ENGINE': 'mssql',
        'NAME': 'Courses',          # tên database
        'HOST': 'localhost\\KMS',   # tên SQL Server instance
        ...
    }
}
```

### Chạy migrations và tạo superuser
```bash
python manage.py migrate
python manage.py createsuperuser
python manage.py collectstatic
```

### Chạy development server
```bash
python manage.py runserver 0.0.0.0:8000
```

### Chạy production với Waitress (Windows)
```bash
pip install waitress
waitress-serve --port=8000 config.wsgi:application
```

---

## 2. Frontend (React + Vite)

### Cài đặt và build
```bash
cd frontend
npm install
npm run build        # tạo thư mục dist/
```

### Chạy development
```bash
npm run dev          # chạy tại http://localhost:5173
```

### Serve production với serve
```bash
npm install -g serve
serve -s dist -l 3000
```

---

## 3. Nginx (Production - reverse proxy)

Cài Nginx, tạo file config `/etc/nginx/sites-available/elearning`:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Frontend
    location / {
        root /path/to/frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # Media files
    location /media/ {
        alias /path/to/VNU/media/;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/elearning /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

## 4. Cấu hình production

### Backend `settings.py`
```python
DEBUG = False
ALLOWED_HOSTS = ['your-domain.com', 'your-server-ip']
CORS_ALLOW_ALL_ORIGINS = False
CORS_ALLOWED_ORIGINS = ['https://your-domain.com']
```

### Frontend — cập nhật API URL
Tạo file `frontend/.env.production`:
```
VITE_API_URL=https://your-domain.com/api
```

Cập nhật `frontend/src/api/axios.js`:
```js
baseURL: import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api'
```

---

## 5. Chạy nhanh local (development)

Terminal 1 — Backend:
```powershell
cd "D:\Thương mại điện tử\VNU"
venv\Scripts\activate
python manage.py runserver
```

Terminal 2 — Frontend (mở terminal mới):
```powershell
cd "D:\Thương mại điện tử\frontend"
npm run dev
```

Truy cập: http://localhost:5173
Admin panel: http://localhost:8000/admin
