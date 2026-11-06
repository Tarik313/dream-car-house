FROM python:3.12-slim

# Install system dependencies for PostgreSQL, Pillow image processing, and networking
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    libpq-dev \
    libjpeg-dev \
    zlib1g-dev \
    netcat-openbsd \
    curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install Python dependencies
COPY requirements.txt requirements_sqlite.txt* ./
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir gunicorn psycopg2-binary redis celery && \
    pip install --no-cache-dir -r requirements.txt

# Copy backend application
COPY . .

EXPOSE 8000

CMD ["gunicorn", "core.wsgi:application", "--bind", "0.0.0.0:8000", "--workers", "4", "--threads", "2", "--timeout", "60"]
