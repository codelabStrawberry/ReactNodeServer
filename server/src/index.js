const cors = require("cors");
const boardRouter = require("./routes/board_router");
const userRouter = require("./routes/user_router");
const jobCategoryRouter = require("./routes/question_router");
const jobResumeRouter = require("./routes/job_resume_router");
const customRouter = require("./routes/custom_router");
const uuidRouter = require("./routes/uuid_router");

// app.js 또는 server.js
const express = require("express");
const session = require("express-session");

require("dotenv").config({
  path: require("path").resolve(__dirname, "../.env"),
});

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173", // React dev
    credentials: true,
  })
);

// 필수 미들웨어들
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ★★★ 여기서 세션 미들웨어 등록 (라우터보다 먼저!) ★★★
app.use(
  session({
    secret: "임의의강력한비밀키123!@#",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false, // HTTPS일 때만 true
      maxAge: 1000 * 60 * 60 * 24, // 1일
    },
  })
);

// 라우터 등록 (세션 설정 이후에!)
// 게시판 라우터 연결
app.use("/posts", boardRouter);
// 사용자 라우터 연결
app.use("/users", userRouter);
// 직무 카테고리 API 라우터 연결
app.use("/job-categories", jobCategoryRouter);
// 자기소개서 업로드 API 라우터 연결
app.use("/job-resumes", jobResumeRouter);
// 맞춤채용 라우터 연결
app.use("/api/custom", customRouter);
// uuid 생성
app.use("/api", uuidRouter);

// 기본 라우트
app.get("/posts", (req, res) => {
  res.send("🚀 /간단 게시판 API 서버 실행 중");
});

// 기본 라우트
app.get("/", (req, res) => {
  res.send("🚀 /간단 게시판 API 서버 실행 중");
});

const PORT = process.env.SERVER_PORT || 4000;
app.listen(PORT, () => {
  console.log(`서버 실행 중: http://localhost:${PORT}`);
});
