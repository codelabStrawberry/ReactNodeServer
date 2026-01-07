// server/db_layer/board_db.js
const pool = require("./db")

/**
 * 모든 게시글 조회 (최신순)
 * 반환: posts[]
 */
async function getAllPosts() {
  const [rows] = await pool.query(
    "SELECT * FROM posts ORDER BY created_at DESC"
  )
  return rows
}

/**
 * 게시글 생성
 * 반환: insertId
 */
async function createPost(title, content, user_id) {
  const [result] = await pool.query(
    "INSERT INTO posts (title, content, user_id) VALUES (?, ?, ?)",
    [title, content, user_id]
  )
  return result.insertId
}

/**
 * id로 게시글 1개 조회
 * 반환: post 또는 null
 */
async function getPostById(id) {
  const [rows] = await pool.query("SELECT * FROM posts WHERE id = ?", [id])
  if (!rows || rows.length === 0) return null
  return rows[0]
}

/**
 * 게시글 삭제
 * 반환: affectedRows
 */
async function deletePostById(id) {
  const [result] = await pool.query("DELETE FROM posts WHERE id = ?", [id])
  return result.affectedRows || 0
}

/**
 * 직무 카테고리 전체 조회
 */
async function getAllJobCategories() {
  const [rows] = await pool.query(
    "SELECT jc_code, jc_name FROM job_categories ORDER BY jc_code"
  )
  return rows
}

module.exports = {
  getAllPosts,
  createPost,
  getPostById,
  deletePostById,
  getAllJobCategories,
}
