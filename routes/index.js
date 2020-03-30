var express = require("express");
var router = express.Router();
const axios = require("axios");

/* GET home page. */
router.get("/", async function(req, res, next) {
  try {
    const response = await axios.get(process.env.api_endpoint);
    const orders = response.data;
    const claimUser = `${req.session.tokenSet.claims.first_name} ${req.session.tokenSet.claims.last_name} `;
    const claimUserId = req.session.tokenSet.claims.sub;
    res.render("index", { user: claimUser, userId: claimUserId, title: "Orders", data: orders });
  } catch (error) {
    console.log(error);
    res.render("error", { message: "An error occurred", error: error });
  }
});

module.exports = router;
