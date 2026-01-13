// custom_db.js
const pool = require("./db");

// 1) 직업별(카테고리) - job_cat distinct
async function selectJobCats() {
  const sql = `
    SELECT DISTINCT job_cat
    FROM recruit_posts
    WHERE job_cat IS NOT NULL AND job_cat <> ''
    ORDER BY job_cat ASC
  `;
  const [rows] = await pool.query(sql);
  return rows.map((r) => r.job_cat);
}

// 2) (선택) 직업별에 따른 직무 키워드 후보 - job_keyword distinct
async function selectKeywordsByJobCat(job_cat) {
  const sql = `
    SELECT DISTINCT job_keyword
    FROM recruit_posts
    WHERE job_cat = ?
      AND job_keyword IS NOT NULL AND job_keyword <> ''
    ORDER BY job_keyword ASC
  `;
  const [rows] = await pool.query(sql, [job_cat]);
  return rows.map((r) => r.job_keyword);
}


// - job_cat: 필수
// - role_text: 직무 입력(자유 텍스트) -> job_title / job_keyword에서 검색
// - tech_text: 기술 입력(자유 텍스트) -> job_tech에서 검색
async function selectPostingsByFilters({
  job_cat,
  role_text = "",
  tech_text = "",
  limit = 4,
} = {}) {
  if (!job_cat) return [];

  let sql = `
    SELECT
      id, recruit_id, job_cat, job_title, job_company, job_url, job_keyword, job_tech
    FROM recruit_posts
    WHERE job_cat = ?
  `;
  const params = [job_cat];

  // 직무 (키워드)
  if (role_text && role_text.trim()) {
    const role = role_text.trim();
    sql += ` AND (job_title LIKE ? OR job_keyword LIKE ?)`;
    params.push(`%${role}%`, `%${role}%`);
  }

  // 기술
  if (tech_text && tech_text.trim()) {
    const tech = tech_text.trim();
    sql += ` AND (job_tech LIKE ?)`;
    params.push(`%${tech}%`);
  }

  sql += ` ORDER BY id DESC LIMIT ?`;
  params.push(Number(limit) || 4);

  const [rows] = await pool.query(sql, params);
  return rows;
}

module.exports = {
  selectJobCats,
  selectKeywordsByJobCat,
  selectPostingsByFilters,
};
