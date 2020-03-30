var express = require("express");
var router = express.Router();
const sapOIDC = require("../auth/sapOIDC");

router.get("/readiness", async function(req, res, next) {
  if (sapOIDC.isReady()) {
    res.send("ok");
  } else {
    res.status(500).send("Health check did not pass");
  }
});

router.get("/liveness", async function(req, res, next) {
  res.send("ok");
});

module.exports = router;
