// server/src/db/custom_db.js
const pool = require("./db");

// 직업별 job_categories 테이블
async function selectJobCats() {
  const [cols] = await pool.query("SHOW COLUMNS FROM job_categories");
  const set = new Set(cols.map((c) => c.Field));

  const nameCol = set.has("jc_name")
    ? "jc_name"
    : set.has("name")
    ? "name"
    : set.has("job_cat")
    ? "job_cat"
    : set.has("job_big")
    ? "job_big"
    : null;

  if (!nameCol) {
    throw new Error(
      "job_categories 테이블에 카테고리명 컬럼(jc_name/name/job_cat/job_big)이 없습니다."
    );
  }

  const sql = `
    SELECT DISTINCT ${nameCol} AS job_cat
    FROM job_categories
    WHERE ${nameCol} IS NOT NULL AND ${nameCol} <> ''
    ORDER BY ${nameCol} ASC
  `;
  const [rows] = await pool.query(sql);
  return rows.map((r) => r.job_cat);
}

// 공고 조회: job_recruit 테이블
async function selectPostingsByFilters({
  job_cat,
  role_text = "",
  tech_text = "",
  limit = 4,
} = {}) {
  if (!job_cat) return [];

  // job_recruit
  const [cols] = await pool.query("SHOW COLUMNS FROM job_recruit");
  const set = new Set(cols.map((c) => c.Field));

  const catCol = set.has("job_cat")
    ? "job_cat"
    : set.has("job_big")
    ? "job_big"
    : null;

  const titleCol = set.has("job_title") ? "job_title" : null;
  const companyCol = set.has("job_company") ? "job_company" : null;
  const urlCol = set.has("job_url") ? "job_url" : null;

  const keywordCol = set.has("job_keyword") ? "job_keyword" : null;
  const techCol = set.has("job_tech") ? "job_tech" : null;

  if (!catCol) {
    throw new Error(
      "job_recruit 테이블에 job_cat 또는 job_big 컬럼이 없습니다."
    );
  }

  const selectCols = [
    set.has("id") ? "id" : "NULL AS id",
    set.has("recruit_id") ? "recruit_id" : "NULL AS recruit_id",
    `${catCol} AS job_cat`,
    titleCol ? `${titleCol} AS job_title` : "NULL AS job_title",
    companyCol ? `${companyCol} AS job_company` : "NULL AS job_company",
    urlCol ? `${urlCol} AS job_url` : "NULL AS job_url",
    keywordCol ? `${keywordCol} AS job_keyword` : "NULL AS job_keyword",
    techCol ? `${techCol} AS job_tech` : "NULL AS job_tech",
  ].join(", ");

  let sql = `
    SELECT ${selectCols}
    FROM job_recruit
    WHERE ${catCol} = ?
  `;
  const params = [job_cat];

  const role = String(role_text || "").trim();
  if (role) {
    const parts = [];
    if (titleCol) parts.push(`${titleCol} LIKE ?`);
    if (keywordCol) parts.push(`${keywordCol} LIKE ?`);

    if (parts.length) {
      sql += ` AND (${parts.join(" OR ")})`;
      params.push(...parts.map(() => `%${role}%`));
    }
  }

  const tech = String(tech_text || "").trim();
  if (tech && techCol) {
    sql += ` AND (${techCol} LIKE ?)`;
    params.push(`%${tech}%`);
  }

  // 최신순
  const orderBy = set.has("id")
    ? "ORDER BY id DESC"
    : set.has("recruit_id")
    ? "ORDER BY recruit_id DESC"
    : "";

  sql += ` ${orderBy} LIMIT ?`;
  params.push(Number(limit) || 4);

  const [rows] = await pool.query(sql, params);
  return rows;
}

module.exports = {
  selectJobCats,
  selectPostingsByFilters,
};
