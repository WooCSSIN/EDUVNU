FROM python:3.12-slim

RUN apt-get update && apt-get install -y curl apt-transport-https gnupg2 unixodbc-dev && \
    curl -fsSL https://packages.microsoft.com/keys/microsoft.asc | gpg --dearmor -o /usr/share/keyrings/microsoft-prod.gpg && \
    curl -fsSL https://packages.microsoft.com/config/debian/12/prod.list | tee /etc/apt/sources.list.d/mssql-release.list && \
    apt-get update && \
    ACCEPT_EULA=Y apt-get install -y msodbcsql18 && \
    apt-get clean

WORKDIR /app

# Copy thư viện và cài đặt
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy source code project
COPY . .

EXPOSE 8000

# Gunicorn thay thế cho runserver (Chạy với 4 Workers)
CMD ["gunicorn", "--workers", "4", "--bind", "0.0.0.0:8000", "core.wsgi:application"]
