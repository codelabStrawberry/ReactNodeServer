// custom_router.js
const express = require("express");
const router = express.Router();

const {
  selectJobCats,
  selectKeywordsByJobCat, // 선택: 직무 드롭다운용
  selectPostingsByFilters,
} = require("../db/custom_db");

function toTrimmedString(v) {
  if (v === undefined || v === null) return "";
  return String(v).trim();
}

function toOptionalString(v) {
  const s = toTrimmedString(v);
  return s.length ? s : null;
}

function toPositiveInt(v, fallback) {
  const n = Number(v);
  if (!Number.isFinite(n)) return fallback;
  const i = Math.floor(n);
  return i > 0 ? i : fallback;
}

/**
 * GET /api/custom/jobs
 * - 직업별(job_cat) 목록 내려주고,
 * - (선택) job_cat 쿼리 있으면 해당 직업별 직무키워드(job_keyword)도 같이 내려줌
 *
 * 예) /api/custom/jobs?job_cat=개발
 */
router.get("/jobs", async (req, res) => {
  try {
    const job_cat = toOptionalString(req.query.job_cat);

    const jobCats = await selectJobCats();
    const keywords = job_cat ? await selectKeywordsByJobCat(job_cat) : [];

    return res.json({ jobCats, keywords });
  } catch (err) {
    console.error("커스텀 옵션 조회 오류:", err);
    return res.status(500).json({ message: "커스텀 옵션 조회 실패" });
  }
});


router.get("/job_categories", async (req, res) => {
  try {
    const jobCats = await selectJobCats();
    return res.json(jobCats);
  } catch (err) {
    console.error("직업별(job_cat) 조회 오류:", err);
    return res.status(500).json({ message: "직업별 조회 실패" });
  }
});


router.get("/job_keywords", async (req, res) => {
  try {
    const job_cat = toOptionalString(req.query.job_cat);
    if (!job_cat) return res.status(400).json({ message: "job_cat는 필수입니다." });

    const keywords = await selectKeywordsByJobCat(job_cat);
    return res.json(keywords);
  } catch (err) {
    console.error("직무 키워드 조회 오류:", err);
    return res.status(500).json({ message: "직무 키워드 조회 실패" });
  }
});


router.post("/match", async (req, res) => {
  try {
    const job_cat = toOptionalString(req.body?.job_cat);
    const role_text = toTrimmedString(req.body?.role_text);
    const tech_text = toTrimmedString(req.body?.tech_text);
    const limit = toPositiveInt(req.body?.limit, 4);

    if (!job_cat) {
      return res.status(400).json({ message: "job_cat는 필수입니다." });
    }

    const jobs = await selectPostingsByFilters({
      job_cat,
      role_text,
      tech_text,
      limit,
    });

    return res.json({ jobs });
  } catch (err) {
    console.error("공고 매칭 오류:", err);
    return res.status(500).json({ message: "공고 매칭 실패" });
  }
});

module.exports = router;
