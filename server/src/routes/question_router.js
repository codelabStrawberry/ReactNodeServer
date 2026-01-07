const express = require("express")
const router = express.Router()

const { getAllJobCategories } = require("../db/board_db")

/**
 * 직무 카테고리 전체 조회
 * - 경로: GET /job-categories
 * - 반환: [{ jc_code, jc_name }, ...]
 */
router.get("/", async (req, res) => {
  try {
    const rows = await getAllJobCategories()
    return res.json(rows)
  } catch (err) {
    console.error("직무 카테고리 조회 오류:", err)
    return res.status(500).json({ message: "직무 카테고리 조회 실패" })
  }
})

module.exports = router
