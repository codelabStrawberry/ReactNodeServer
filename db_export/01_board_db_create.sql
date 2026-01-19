-- 1️⃣ 기존 DB 삭제
DROP DATABASE IF EXISTS board_db;

-- 2️⃣ 기존 USER 삭제
DROP USER IF EXISTS 'user'@'%';

-- 3️⃣ DB 생성
CREATE DATABASE board_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

-- 4️⃣ USER 생성
CREATE USER 'user'@'%' IDENTIFIED BY 'pass';

-- 5️⃣ 권한 부여
GRANT ALL PRIVILEGES ON board_db.* TO 'user'@'%';

-- 6️⃣ 권한 반영
FLUSH PRIVILEGES;
