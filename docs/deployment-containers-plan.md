# План развертывания buy-to-earn и escrow-api-1 в контейнерах

## 1. Общая архитектура

Мы будем использовать Docker и Docker Compose для развертывания следующих компонентов:

1. **buy-to-earn** - фронтенд приложение (статичный сайт)
2. **escrow-api-1** - бэкенд API на Next.js
3. **PostgreSQL** - БД для хранения данных
4. **Nginx** - отдельный веб-сервер для фронтенда и прокси для API

Схема взаимодействия:
```
Пользователь -> Nginx -> frontend (buy-to-earn)
                      -> escrow-api -> PostgreSQL
```

## 2. Структура каталогов

Для оптимальной организации файлов развертывания создадим отдельную директорию на том же уровне, что и проекты:

```
D:/ateira/
├── buy-to-earn/           # Существующий проект фронтенда
├── escrow-api-1/          # Существующий проект API
└── escrow-deploy/         # Новая директория для развертывания
    ├── docker-compose.yml
    ├── setup.sh
    ├── Dockerfile.frontend # Dockerfile для фронтенда
    ├── init-scripts/
    │   └── init-db.sql
    ├── nginx/
    │   └── nginx.conf
    └── backup/
```

## 3. Настройка Docker Compose

Создадим файл `escrow-deploy/docker-compose.yml`:

```yaml
version: '3.8'

services:
  # PostgreSQL база данных
  postgres:
    image: postgres:15-alpine
    container_name: escrow-postgres
    restart: always
    environment:
      - POSTGRES_USER=escrow_user
      - POSTGRES_PASSWORD=escrow_secure_password
      - POSTGRES_DB=escrow_db
    ports:
      - "5432:5432"
    volumes:
      - postgres-data:/var/lib/postgresql/data
      - ./init-scripts:/docker-entrypoint-initdb.d
    networks:
      - escrow-network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U escrow_user"]
      interval: 10s
      timeout: 5s
      retries: 3

  # API на Next.js
  escrow-api:
    build:
      context: ../escrow-api-1
      dockerfile: ../escrow-api-1/Dockerfile
    container_name: escrow-api
    restart: always
    depends_on:
      postgres:
        condition: service_healthy
    environment:
      - NODE_ENV=production
      # База данных
      - POSTGRES_HOST=postgres
      - POSTGRES_PORT=5432
      - POSTGRES_USER=escrow_user
      - POSTGRES_PASSWORD=escrow_secure_password
      - POSTGRES_DB=escrow_db
      - POSTGRES_SSL=false
      # Аутентификация
      - NEXTAUTH_URL=http://localhost:3000
      - AUTH_SECRET=your-auth-secret-key-change-this-in-production
    ports:
      - "3000:3000"
    networks:
      - escrow-network

  # Фронтенд (buy-to-earn)
  frontend:
    build:
      context: ../buy-to-earn
      dockerfile: ./Dockerfile.frontend
    container_name: buy-to-earn
    restart: always
    depends_on:
      - escrow-api
    networks:
      - escrow-network

  # Основной Nginx прокси
  nginx:
    image: nginx:alpine
    container_name: escrow-nginx
    restart: always
    ports:
      - "80:80"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/conf.d/default.conf
    depends_on:
      - frontend
      - escrow-api
    networks:
      - escrow-network

networks:
  escrow-network:
    driver: bridge

volumes:
  postgres-data:
    driver: local
```

## 4. Dockerfile для buy-to-earn

Создадим Dockerfile в директории `escrow-deploy/Dockerfile.frontend`:

```dockerfile
FROM nginx:alpine

# Копируем все статические файлы в директорию nginx
COPY . /usr/share/nginx/html

# Конфигурация для внутреннего сервера frontend
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

## 5. Nginx конфигурации

### 5.1. Nginx конфигурация для контейнера frontend

Создадим файл `escrow-deploy/nginx-frontend.conf` (будет скопирован в контейнер):

```nginx
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    # Статические файлы
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

### 5.2. Основная Nginx конфигурация (внешний прокси)

Создадим файл `escrow-deploy/nginx/nginx.conf`:

```nginx
server {
    listen 80;
    server_name localhost;
    
    # Проксирование запросов к API
    location /api/ {
        proxy_pass http://escrow-api:3000/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Проксирование всего остального к фронтенду
    location / {
        proxy_pass http://frontend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## 6. Инициализация базы данных PostgreSQL

### 6.1. Создание SQL-скрипта для инициализации БД

Создадим директорию `escrow-deploy/init-scripts` и файл `escrow-deploy/init-scripts/init-db.sql`:

```sql
-- Объединенный SQL скрипт для инициализации базы данных

-- 1. Создаем все ENUM типы
-- User type enum
CREATE TYPE "user_type" AS ENUM ('CUSTOMER', 'CONTRACTOR', 'PLATFORM');

-- Order status enum
CREATE TYPE "order_status" AS ENUM ('CREATED', 'FUNDED', 'IN_PROGRESS', 'COMPLETED');

-- Milestone status enum 
CREATE TYPE "milestone_status" AS ENUM ('PENDING', 'ACTIVE', 'COMPLETED', 'PAID', 'AWAITING_ACCEPTANCE', 'REJECTED');

-- Document type enum
CREATE TYPE "document_type" AS ENUM (
  'DEFINITION_OF_READY', 
  'ROADMAP', 
  'DEFINITION_OF_DONE', 
  'SPECIFICATION', 
  'DELIVERABLE',
  'ACT_OF_WORK'
);

-- Act status enum
CREATE TYPE "act_status" AS ENUM ('CREATED', 'SIGNED_CONTRACTOR', 'SIGNED_CUSTOMER', 'COMPLETED', 'REJECTED');

-- 2. Создаем базовые таблицы
-- Users table
CREATE TABLE IF NOT EXISTS "users" (
  "id" text PRIMARY KEY NOT NULL,
  "name" text NOT NULL,
  "email" text NOT NULL UNIQUE,
  "type" "user_type" NOT NULL,
  "balance" numeric(10, 2) NOT NULL DEFAULT '0',
  "created_at" timestamp NOT NULL DEFAULT now(),
  "updated_at" timestamp NOT NULL DEFAULT now()
);

-- Orders table
CREATE TABLE IF NOT EXISTS "orders" (
  "id" text PRIMARY KEY NOT NULL,
  "is_group_order" boolean NOT NULL DEFAULT false,
  "representative_id" text,
  "contractor_id" text,
  "title" text NOT NULL,
  "description" text NOT NULL,
  "status" "order_status" NOT NULL DEFAULT 'CREATED',
  "total_amount" numeric(10, 2) NOT NULL,
  "funded_amount" numeric(10, 2) NOT NULL DEFAULT '0',
  "created_at" timestamp NOT NULL DEFAULT now(),
  "updated_at" timestamp NOT NULL DEFAULT now()
);

-- Milestones table
CREATE TABLE IF NOT EXISTS "milestones" (
  "id" text PRIMARY KEY NOT NULL,
  "order_id" text NOT NULL,
  "description" text NOT NULL,
  "amount" numeric(10, 2) NOT NULL,
  "deadline" timestamp NOT NULL,
  "status" "milestone_status" NOT NULL DEFAULT 'PENDING',
  "created_at" timestamp NOT NULL DEFAULT now(),
  "updated_at" timestamp NOT NULL DEFAULT now()
);

-- Documents table
CREATE TABLE IF NOT EXISTS "documents" (
  "id" text PRIMARY KEY NOT NULL,
  "order_id" text NOT NULL,
  "type" "document_type" NOT NULL,
  "name" text NOT NULL,
  "content" jsonb NOT NULL,
  "created_by" text NOT NULL,
  "approved_by" text[],
  "created_at" timestamp NOT NULL DEFAULT now(),
  "updated_at" timestamp NOT NULL DEFAULT now()
);

-- Deliverable extensions table
CREATE TABLE IF NOT EXISTS "deliverable_extensions" (
  "document_id" text PRIMARY KEY NOT NULL,
  "phase_id" text,
  "attachments" text[]
);

-- Acts table
CREATE TABLE IF NOT EXISTS "acts" (
  "id" text PRIMARY KEY NOT NULL,
  "milestone_id" text NOT NULL,
  "deliverable_ids" text[] NOT NULL,
  "status" "act_status" NOT NULL DEFAULT 'CREATED',
  "signed_by" text[],
  "rejection_reason" text,
  "document_id" text NOT NULL,
  "created_at" timestamp NOT NULL DEFAULT now(),
  "updated_at" timestamp NOT NULL DEFAULT now()
);

-- Customer_orders junction table
CREATE TABLE IF NOT EXISTS "customer_orders" (
  "customer_id" text NOT NULL,
  "order_id" text NOT NULL,
  PRIMARY KEY ("customer_id", "order_id")
);

-- 3. Добавляем внешние ключи
ALTER TABLE "milestones" ADD CONSTRAINT "milestones_order_id_fkey" 
FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE;

ALTER TABLE "documents" ADD CONSTRAINT "documents_order_id_fkey" 
FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE;

ALTER TABLE "documents" ADD CONSTRAINT "documents_created_by_fkey" 
FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE CASCADE;

ALTER TABLE "acts" ADD CONSTRAINT "acts_milestone_id_fkey" 
FOREIGN KEY ("milestone_id") REFERENCES "milestones"("id") ON DELETE CASCADE;

ALTER TABLE "acts" ADD CONSTRAINT "acts_document_id_fkey" 
FOREIGN KEY ("document_id") REFERENCES "documents"("id") ON DELETE CASCADE;

ALTER TABLE "customer_orders" ADD CONSTRAINT "customer_orders_customer_id_fkey" 
FOREIGN KEY ("customer_id") REFERENCES "users"("id") ON DELETE CASCADE;

ALTER TABLE "customer_orders" ADD CONSTRAINT "customer_orders_order_id_fkey" 
FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE;

ALTER TABLE "deliverable_extensions" ADD CONSTRAINT "deliverable_extensions_document_id_fkey" 
FOREIGN KEY ("document_id") REFERENCES "documents"("id") ON DELETE CASCADE;

-- 4. Создаем индексы для оптимизации производительности
CREATE INDEX IF NOT EXISTS "idx_users_email" ON "users" ("email");
CREATE INDEX IF NOT EXISTS "idx_orders_status" ON "orders" ("status");
CREATE INDEX IF NOT EXISTS "idx_milestones_order_id" ON "milestones" ("order_id");
CREATE INDEX IF NOT EXISTS "idx_documents_order_id" ON "documents" ("order_id");
CREATE INDEX IF NOT EXISTS "idx_acts_milestone_id" ON "acts" ("milestone_id");
CREATE INDEX IF NOT EXISTS "idx_acts_document_id" ON "acts" ("document_id");
```

## 7. Настройка escrow-api-1

### 7.1. Создание скрипта для генерации .env файла

Создадим скрипт `escrow-deploy/setup-env.sh`:

```bash
#!/bin/bash
# Скрипт для создания .env файла в escrow-api-1

# Генерация случайного пароля если не задан
DB_PASSWORD=${DB_PASSWORD:-"escrow_secure_password"}
AUTH_SECRET_KEY=$(openssl rand -hex 32)

cat > ../escrow-api-1/.env << EOF
# База данных
POSTGRES_HOST=postgres
POSTGRES_PORT=5432
POSTGRES_USER=escrow_user
POSTGRES_PASSWORD=${DB_PASSWORD}
POSTGRES_DB=escrow_db
POSTGRES_SSL=false

# NextAuth
NEXTAUTH_URL=http://localhost:3000
AUTH_SECRET=${AUTH_SECRET_KEY}
EOF

echo "Файл .env создан в escrow-api-1/"
```

## 8. Обновление API клиента в buy-to-earn

Обновим конфигурацию API клиента в buy-to-earn для работы с контейнерами:

```javascript
// js/api/escrow-api.js
import { EscrowClient } from './escrow-client.js';

// В контейнере API доступен по внутреннему URL
const API_BASE_URL = '/api';
const API_KEY = 'Escrow-secret-test-1';

export const escrowApi = new EscrowClient(API_BASE_URL, API_KEY);
```

## 9. Создание скрипта для автоматизации развертывания

Создадим файл `escrow-deploy/setup.sh`:

```bash
#!/bin/bash

# Цвета для вывода
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Проверка структуры каталогов
if [ ! -d "../buy-to-earn" ] || [ ! -d "../escrow-api-1" ]; then
    echo -e "${YELLOW}ВНИМАНИЕ: Убедитесь что директории buy-to-earn и escrow-api-1 существуют на одном уровне с escrow-deploy${NC}"
    exit 1
fi

# Безопасный пароль для БД
DB_PASSWORD="escrow_secure_password"
export DB_PASSWORD

echo -e "${YELLOW}Создание структуры каталогов...${NC}"
mkdir -p init-scripts backup nginx

# Создание Nginx конфигурации для контейнера frontend
echo -e "${YELLOW}Создание nginx-frontend.conf...${NC}"
cat > nginx-frontend.conf << 'EOF'
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    # Статические файлы
    location / {
        try_files $uri $uri/ /index.html;
    }
}
EOF

# Создание общего nginx.conf
echo -e "${YELLOW}Создание общего nginx.conf...${NC}"
cat > nginx/nginx.conf << 'EOF'
server {
    listen 80;
    server_name localhost;
    
    # Проксирование запросов к API
    location /api/ {
        proxy_pass http://escrow-api:3000/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Проксирование всего остального к фронтенду
    location / {
        proxy_pass http://frontend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF

# Создание Dockerfile для buy-to-earn
echo -e "${YELLOW}Создание Dockerfile.frontend...${NC}"
cat > Dockerfile.frontend << 'EOF'
FROM nginx:alpine

# Копируем все статические файлы в директорию nginx
COPY . /usr/share/nginx/html

# Конфигурация для внутреннего сервера frontend
COPY ../escrow-deploy/nginx-frontend.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
EOF

# Создание SQL скрипта инициализации
echo -e "${YELLOW}Создание SQL скрипта для инициализации базы данных...${NC}"
cat > init-scripts/init-db.sql << 'EOF'
-- Объединенный SQL скрипт для инициализации базы данных

-- 1. Создаем все ENUM типы
-- User type enum
CREATE TYPE "user_type" AS ENUM ('CUSTOMER', 'CONTRACTOR', 'PLATFORM');

-- Order status enum
CREATE TYPE "order_status" AS ENUM ('CREATED', 'FUNDED', 'IN_PROGRESS', 'COMPLETED');

-- Milestone status enum 
CREATE TYPE "milestone_status" AS ENUM ('PENDING', 'ACTIVE', 'COMPLETED', 'PAID', 'AWAITING_ACCEPTANCE', 'REJECTED');

-- Document type enum
CREATE TYPE "document_type" AS ENUM (
  'DEFINITION_OF_READY', 
  'ROADMAP', 
  'DEFINITION_OF_DONE', 
  'SPECIFICATION', 
  'DELIVERABLE',
  'ACT_OF_WORK'
);

-- Act status enum
CREATE TYPE "act_status" AS ENUM ('CREATED', 'SIGNED_CONTRACTOR', 'SIGNED_CUSTOMER', 'COMPLETED', 'REJECTED');

-- 2. Создаем базовые таблицы
-- Users table
CREATE TABLE IF NOT EXISTS "users" (
  "id" text PRIMARY KEY NOT NULL,
  "name" text NOT NULL,
  "email" text NOT NULL UNIQUE,
  "type" "user_type" NOT NULL,
  "balance" numeric(10, 2) NOT NULL DEFAULT '0',
  "created_at" timestamp NOT NULL DEFAULT now(),
  "updated_at" timestamp NOT NULL DEFAULT now()
);

-- Orders table
CREATE TABLE IF NOT EXISTS "orders" (
  "id" text PRIMARY KEY NOT NULL,
  "is_group_order" boolean NOT NULL DEFAULT false,
  "representative_id" text,
  "contractor_id" text,
  "title" text NOT NULL,
  "description" text NOT NULL,
  "status" "order_status" NOT NULL DEFAULT 'CREATED',
  "total_amount" numeric(10, 2) NOT NULL,
  "funded_amount" numeric(10, 2) NOT NULL DEFAULT '0',
  "created_at" timestamp NOT NULL DEFAULT now(),
  "updated_at" timestamp NOT NULL DEFAULT now()
);

-- Milestones table
CREATE TABLE IF NOT EXISTS "milestones" (
  "id" text PRIMARY KEY NOT NULL,
  "order_id" text NOT NULL,
  "description" text NOT NULL,
  "amount" numeric(10, 2) NOT NULL,
  "deadline" timestamp NOT NULL,
  "status" "milestone_status" NOT NULL DEFAULT 'PENDING',
  "created_at" timestamp NOT NULL DEFAULT now(),
  "updated_at" timestamp NOT NULL DEFAULT now()
);

-- Documents table
CREATE TABLE IF NOT EXISTS "documents" (
  "id" text PRIMARY KEY NOT NULL,
  "order_id" text NOT NULL,
  "type" "document_type" NOT NULL,
  "name" text NOT NULL,
  "content" jsonb NOT NULL,
  "created_by" text NOT NULL,
  "approved_by" text[],
  "created_at" timestamp NOT NULL DEFAULT now(),
  "updated_at" timestamp NOT NULL DEFAULT now()
);

-- Deliverable extensions table
CREATE TABLE IF NOT EXISTS "deliverable_extensions" (
  "document_id" text PRIMARY KEY NOT NULL,
  "phase_id" text,
  "attachments" text[]
);

-- Acts table
CREATE TABLE IF NOT EXISTS "acts" (
  "id" text PRIMARY KEY NOT NULL,
  "milestone_id" text NOT NULL,
  "deliverable_ids" text[] NOT NULL,
  "status" "act_status" NOT NULL DEFAULT 'CREATED',
  "signed_by" text[],
  "rejection_reason" text,
  "document_id" text NOT NULL,
  "created_at" timestamp NOT NULL DEFAULT now(),
  "updated_at" timestamp NOT NULL DEFAULT now()
);

-- Customer_orders junction table
CREATE TABLE IF NOT EXISTS "customer_orders" (
  "customer_id" text NOT NULL,
  "order_id" text NOT NULL,
  PRIMARY KEY ("customer_id", "order_id")
);

-- 3. Добавляем внешние ключи
ALTER TABLE "milestones" ADD CONSTRAINT "milestones_order_id_fkey" 
FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE;

ALTER TABLE "documents" ADD CONSTRAINT "documents_order_id_fkey" 
FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE;

ALTER TABLE "documents" ADD CONSTRAINT "documents_created_by_fkey" 
FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE CASCADE;

ALTER TABLE "acts" ADD CONSTRAINT "acts_milestone_id_fkey" 
FOREIGN KEY ("milestone_id") REFERENCES "milestones"("id") ON DELETE CASCADE;

ALTER TABLE "acts" ADD CONSTRAINT "acts_document_id_fkey" 
FOREIGN KEY ("document_id") REFERENCES "documents"("id") ON DELETE CASCADE;

ALTER TABLE "customer_orders" ADD CONSTRAINT "customer_orders_customer_id_fkey" 
FOREIGN KEY ("customer_id") REFERENCES "users"("id") ON DELETE CASCADE;

ALTER TABLE "customer_orders" ADD CONSTRAINT "customer_orders_order_id_fkey" 
FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE;

ALTER TABLE "deliverable_extensions" ADD CONSTRAINT "deliverable_extensions_document_id_fkey" 
FOREIGN KEY ("document_id") REFERENCES "documents"("id") ON DELETE CASCADE;

-- 4. Создаем индексы для оптимизации производительности
CREATE INDEX IF NOT EXISTS "idx_users_email" ON "users" ("email");
CREATE INDEX IF NOT EXISTS "idx_orders_status" ON "orders" ("status");
CREATE INDEX IF NOT EXISTS "idx_milestones_order_id" ON "milestones" ("order_id");
CREATE INDEX IF NOT EXISTS "idx_documents_order_id" ON "documents" ("order_id");
CREATE INDEX IF NOT EXISTS "idx_acts_milestone_id" ON "acts" ("milestone_id");
CREATE INDEX IF NOT EXISTS "idx_acts_document_id" ON "acts" ("document_id");
EOF

# Генерация .env для escrow-api-1
echo -e "${YELLOW}Создание .env файла для escrow-api-1...${NC}"
AUTH_SECRET_KEY=$(openssl rand -hex 32)
cat > ../escrow-api-1/.env << EOF
# База данных
POSTGRES_HOST=postgres
POSTGRES_PORT=5432
POSTGRES_USER=escrow_user
POSTGRES_PASSWORD=${DB_PASSWORD}
POSTGRES_DB=escrow_db
POSTGRES_SSL=false

# NextAuth
NEXTAUTH_URL=http://localhost:3000
AUTH_SECRET=${AUTH_SECRET_KEY}
EOF

# Создание Docker Compose файла
echo -e "${YELLOW}Создание docker-compose.yml...${NC}"
cat > docker-compose.yml << EOF
version: '3.8'

services:
  # PostgreSQL база данных
  postgres:
    image: postgres:15-alpine
    container_name: escrow-postgres
    restart: always
    environment:
      - POSTGRES_USER=escrow_user
      - POSTGRES_PASSWORD=${DB_PASSWORD}
      - POSTGRES_DB=escrow_db
    ports:
      - "5432:5432"
    volumes:
      - postgres-data:/var/lib/postgresql/data
      - ./init-scripts:/docker-entrypoint-initdb.d
    networks:
      - escrow-network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U escrow_user"]
      interval: 10s
      timeout: 5s
      retries: 3

  # API на Next.js
  escrow-api:
    build:
      context: ../escrow-api-1
      dockerfile: ../escrow-api-1/Dockerfile
    container_name: escrow-api
    restart: always
    depends_on:
      postgres:
        condition: service_healthy
    environment:
      - NODE_ENV=production
      # База данных
      - POSTGRES_HOST=postgres
      - POSTGRES_PORT=5432
      - POSTGRES_USER=escrow_user
      - POSTGRES_PASSWORD=${DB_PASSWORD}
      - POSTGRES_DB=escrow_db
      - POSTGRES_SSL=false
      # Аутентификация
      - NEXTAUTH_URL=http://localhost:3000
      - AUTH_SECRET=${AUTH_SECRET_KEY}
    ports:
      - "3000:3000"
    networks:
      - escrow-network

  # Фронтенд (buy-to-earn)
  frontend:
    build:
      context: ../buy-to-earn
      dockerfile: ./Dockerfile.frontend
    container_name: buy-to-earn
    restart: always
    depends_on:
      - escrow-api
    networks:
      - escrow-network

  # Основной Nginx прокси
  nginx:
    image: nginx:alpine
    container_name: escrow-nginx
    restart: always
    ports:
      - "80:80"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/conf.d/default.conf
    depends_on:
      - frontend
      - escrow-api
    networks:
      - escrow-network

networks:
  escrow-network:
    driver: bridge

volumes:
  postgres-data:
    driver: local
EOF

echo -e "${GREEN}Настройка завершена успешно!${NC}"
echo -e "${YELLOW}Для запуска контейнеров выполните:${NC}"
echo -e "${GREEN}cd escrow-deploy && docker-compose up -d${NC}"
```

## 10. Инструкция по запуску

1. Клонировать оба репозитория в одну директорию (D:/ateira/)
2. Создать директорию escrow-deploy:
   ```bash
   cd D:/ateira/
   mkdir escrow-deploy
   cd escrow-deploy
   ```
   
3. Создать и настроить файлы:
   ```bash
   # Копируем план развертывания в директорию escrow-deploy
   cp ../buy-to-earn/docs/deployment-containers-plan.md ./README.md
   
   # Создаем скрипт развертывания
   echo '#!/bin/bash' > setup.sh
   # ... дополнительно создаем содержимое скрипта ...
   chmod +x setup.sh
   ```

4. Запустить скрипт setup.sh для создания всех необходимых файлов:
   ```bash
   ./setup.sh
   ```

5. Запустить контейнеры:
   ```bash
   # Собрать и запустить все контейнеры
   docker-compose up -d

   # Проверить статус
   docker-compose ps

   # Просмотр логов
   docker-compose logs -f
   ```

## 11. Интеграционное тестирование

1. После запуска проверить доступность фронтенда по адресу http://localhost
2. Проверить API по адресу http://localhost/api
3. Проверить соединение с базой данных:

```bash
docker exec -it escrow-postgres psql -U escrow_user -d escrow_db -c "SELECT count(*) FROM users;"
```

## 12. Резервное копирование данных

Для создания резервных копий базы данных:

```bash
# Создание дампа БД
docker exec -it escrow-postgres pg_dump -U escrow_user escrow_db > backup/escrow_$(date +%Y%m%d_%H%M%S).sql

# Восстановление из дампа
cat backup/escrow_YYYYMMDD_HHMMSS.sql | docker exec -i escrow-postgres psql -U escrow_user escrow_db
```

## 13. Мониторинг и управление

Для мониторинга состояния контейнеров:

```bash
# Проверка состояния контейнеров
docker-compose ps

# Просмотр логов
docker-compose logs -f

# Перезапуск отдельного контейнера
docker-compose restart escrow-api
``` 