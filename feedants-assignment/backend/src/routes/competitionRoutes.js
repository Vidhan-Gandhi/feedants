const express = require("express");
const { getCompetition, registerForCompetition, submitEntry, listWinners } = require("../controllers/competitionController");
const { requireAuth, optionalAuth } = require("../middleware/auth");

const router = express.Router();

// Viewable without login; includes viewer-specific fields only if authenticated.
router.get("/:id", optionalAuth, getCompetition);
router.get("/:id/winners", listWinners);

// Require login.
router.post("/:id/register", requireAuth, registerForCompetition);
router.post("/:id/submissions", requireAuth, submitEntry);

module.exports = router;
