// server/src/db/custom_db.js
const pool = require("./db");


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


function escapeLike(s) {
  return String(s).replace(/([\\%_])/g, "\\$1");
}


function splitPhrases(v, max = 10) {
  if (Array.isArray(v)) {
    const out = [];
    const seen = new Set();
    for (const item of v) {
      const s = String(item ?? "").trim();
      if (!s || seen.has(s)) continue;
      seen.add(s);
      out.push(s);
      if (out.length >= max) break;
    }
    return out;
  }

  const s = String(v || "").trim();
  if (!s) return [];

  const parts = s
    .split(/[\n,;|]+/g)
    .map((t) => t.trim())
    .filter(Boolean);

  const out = [];
  const seen = new Set();
  for (const p of parts) {
    if (seen.has(p)) continue;
    seen.add(p);
    out.push(p);
    if (out.length >= max) break;
  }
  return out;
}


async function selectKeywordsByJobCat(
  job_cat,
  { limit = 200, outLimit = 80 } = {}
) {
  if (!job_cat) return [];

  const table = "job_trend";

  const [cols] = await pool.query(`SHOW COLUMNS FROM ${table}`);
  const set = new Set(cols.map((c) => c.Field));
  if (!set.has("job_cat")) return [];
  if (!set.has("job_keyword") && !set.has("job_tech")) return [];

  const selectCols = [
    set.has("job_keyword") ? "job_keyword" : "NULL AS job_keyword",
    set.has("job_tech") ? "job_tech" : "NULL AS job_tech",
  ].join(", ");

  const sql = `
    SELECT ${selectCols}
    FROM ${table}
    WHERE job_cat = ?
    ORDER BY id DESC
    LIMIT ?
  `;
  const [rows] = await pool.query(sql, [job_cat, Number(limit) || 200]);

  const bag = new Set();

  for (const r of rows) {
    if (r.job_keyword) {
      try {
        const obj = JSON.parse(r.job_keyword);

        if (Array.isArray(obj["핵심_직무_역량"])) {
          for (const x of obj["핵심_직무_역량"]) {
            const s = String(x ?? "").trim();
            if (s) bag.add(s);
          }
        }

        const q = obj["자격_요건_및_우대사항"];
        if (q && typeof q === "object") {
          for (const key of ["자격_요건", "우대사항"]) {
            if (Array.isArray(q[key])) {
              for (const x of q[key]) {
                const s = String(x ?? "").trim();
                if (s) bag.add(s);
              }
            }
          }
        }

        if (Array.isArray(obj["필수_기술_스택"])) {
          for (const x of obj["필수_기술_스택"]) {
            const s = String(x ?? "").trim();
            if (s) bag.add(s);
          }
        }
      } catch {}
    }

    if (r.job_tech) {
      try {
        const arr = JSON.parse(r.job_tech);
        if (Array.isArray(arr)) {
          for (const x of arr) {
            const s = String(x ?? "").trim();
            if (s) bag.add(s);
          }
        }
      } catch {}
    }
  }

  return Array.from(bag).slice(0, outLimit);
}



// 공고 조회
async function selectPostingsByFilters({
  job_cat,
  role_text = "",
  tech_text = "",
  role_phrases = null,
  tech_phrases = null,
  limit = 4,
} = {}) {
  if (!job_cat) return [];

  const table = "job_trend";

  const [cols] = await pool.query(`SHOW COLUMNS FROM ${table}`);
  const set = new Set(cols.map((c) => c.Field));

  if (!set.has("id")) throw new Error(`${table} 테이블에 id 컬럼이 없습니다.`);
  if (!set.has("job_cat"))
    throw new Error(`${table} 테이블에 job_cat 컬럼이 없습니다.`);

  const col = (name, alias) =>
    set.has(name) ? `${name} AS ${alias}` : `NULL AS ${alias}`;

  const selectCols = [
    col("id", "id"),
    col("job_cat", "job_cat"),
    col("job_title", "job_title"),
    col("job_company", "job_company"),
    col("job_url", "job_url"),
    col("job_keyword", "job_keyword"),
    col("job_tech", "job_tech"),
  ].join(", ");

  let sql = `
    SELECT ${selectCols}
    FROM ${table}
    WHERE job_cat = ?
  `;
  const params = [job_cat];

  // 매칭 키워드
  const rolePhrases = splitPhrases(role_phrases ?? role_text);
  if (rolePhrases.length && set.has("job_keyword")) {
    const orParts = rolePhrases.map(
      () => `(job_keyword LIKE ? ESCAPE '\\\\')`
    );
    sql += ` AND (${orParts.join(" OR ")})`;
    params.push(...rolePhrases.map((p) => `%${escapeLike(p)}%`));
  }

  // 기술 입력칸
  const techPhrases = splitPhrases(tech_phrases ?? tech_text);
  if (techPhrases.length && set.has("job_tech")) {
    const orParts = techPhrases.map(() => `(job_tech LIKE ? ESCAPE '\\\\')`);
    sql += ` AND (${orParts.join(" OR ")})`;
    params.push(...techPhrases.map((p) => `%${escapeLike(p)}%`));
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
