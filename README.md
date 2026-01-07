# React + Node.js Server (Docker 기반)

React(Client)와 Node.js(Server)를 Docker로 구성하고,
개발 환경과 배포 환경을 명확히 분리한 **실무용 풀스택 템플릿**입니다.

* React: Vite 기반
* API Server: Node.js (Express)
* DB: MySQL / Redis (외부 Docker 컨테이너)
* 배포: Nginx + GitHub Actions 자동 배포

---

## 📁 프로젝트 구조

```
project-root/
├── client/                 # React (Vite)
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── .env.development
│   ├── .env.production
│   └── src/
│       ├── components/
│       ├── store/
│       ├── App.css
│       ├── App.jsx
│       ├── index.css
│       └── main.jsx
│
├── server/                 # Node.js API Server
│   ├── Dockerfile
│   ├── .env
│   └── src/
│       ├── db/
│       │   ├── db.js           # MySQL 공통 연결
│       │   ├── board_db.js     # 게시판 DB 로직
│       │   └── user_db.js      # 유저 DB 로직
│       ├── routes/
│       │   ├── board_router.js
│       │   └── user_router.js
│       └── index.js            # 서버 엔트리 포인트
│
├── docker-compose.yml
├── .env                    # 서버 배포용 환경 변수
└── .github/
    └── workflows/
        └── deploy.yml       # GitHub Actions 자동 배포
```

---

## 🧩 아키텍처 개요

```
[React Dev (Vite :5173)] ── axios ─▶ [Node API :3000]

[React Prod (Nginx :80)] ── /api proxy ─▶ [Node API]
                                   │
                                   ├── MySQL (외부 Docker)
                                   └── Redis (외부 Docker)
```

---

## ⚙️ 환경 변수 설정

### 📁 React 환경 변수

#### `.env.development`

```env
VITE_API_URL=http://localhost:3000
VITE_AI_URL=http://localhost:3333
```

#### `.env.production`

```env
VITE_API_URL=/api
VITE_AI_URL=/ai
```

> 개발 환경에서는 Node 서버에 직접 접근하고,
> 배포 환경에서는 Nginx를 통해 `/api`로 프록시됩니다.

---

### 📁 Node 서버 환경 변수 (`server/.env`)

```env
# MYSQL_HOST=localhost
MYSQL_HOST=host.docker.internal
MYSQL_PORT=3307
MYSQL_USER=root
MYSQL_PASSWORD=1234
MYSQL_DB=board_db

REDIS_HOST=redis
SERVER_PORT=3000
```

---

## 🚀 개발 환경 실행

### 1️⃣ MySQL / Redis 실행 (외부 Docker)

```bash
docker run -d --name mysql \
  -e MYSQL_ROOT_PASSWORD=pass \
  -e MYSQL_DATABASE=test \
  -p 3306:3306 mysql:8

docker run -d --name redis \
  -p 6379:6379 redis
```

---

### 2️⃣ Node Server 실행

```bash
cd server
npm install
npm run dev
```

* 서버 주소: `http://localhost:3000`
* API Prefix: `/api`

---

### 3️⃣ React Client 실행

```bash
cd client
npm install
npm run dev
```

* React 개발 서버: `http://localhost:5173`
* API 요청은 `VITE_API_URL` 기준으로 처리됨

---

## 🗄️ MySQL 초기 테이블 생성

* `server/src/db/init.sql` 참고
* 서버 실행 전 1회 실행 권장

```bash
docker exec -it mysql mysql -u root -p test < init.sql
```

---

## 🐳 Docker 기반 배포

### 실행

```bash
docker compose up -d --build
```

* React: `http://서버IP`
* API: `http://서버IP/api`

---

## 🔁 React 개발 / 배포 차이

| 구분       | 개발              | 배포    |
| -------- | --------------- | ----- |
| React 실행 | Vite Dev Server | Nginx |
| API 호출   | localhost:3000  | /api  |
| 프록시      | ❌               | ✅     |

---

## 🔐 GitHub Actions 자동 배포

* `main` 브랜치 push 시 자동 배포
docker build -t vawing21/node ./server
docker build -t vawing21/nginx ./client
docker push vawing21/node
docker push vawing21/nginx

* 
docker pull vawing21/node
docker pull vawing21/nginx
docker-compose up -d --pull always

필요 Secrets:

* `SERVER_HOST`
* `SERVER_USER`
* `SERVER_KEY`

---

## ✅ 외부 db 데이터 세팅
파일의 내용으로 db 및 테이블 생성
* init.sql 
  
export 파일
* board_db_users.sql
* board_db_posts.sql

