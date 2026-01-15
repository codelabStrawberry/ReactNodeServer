const express = require("express");
const crypto = require("crypto");

const router = express.Router();

router.get("/uuid", (req, res) => {
  const sessionId = crypto.randomUUID();

  res.json({ sessionId });
});

module.exports = router;
