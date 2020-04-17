var express = require("express");
var router = express.Router();
const axios = require("axios");

/* GET home page. */
router.get("/", async function (req, res, next) {
  try {
    const token = req.session.tokenSet.id_token;
    const claimUser = `${req.session.tokenSet.claims.first_name} ${req.session.tokenSet.claims.last_name} `;
    const claimUserId = req.session.tokenSet.claims.sub;
    const orders = await getOrders(token, claimUserId);
    res.render("index", { user: claimUser, userId: claimUserId, title: "Orders", data: orders });
  } catch (error) {
    console.log(error);
    res.render("error", { message: "An error occurred", error: error });
  }
});

async function getOrders(token, claimUserId) {
  try {
    const AuthStr = "Bearer ".concat(token);
    const response = await axios.get(process.env.api_endpoint, {
      headers: {
        Authorization: AuthStr,
        claimuserid: claimUserId,
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(error);
  }
}

module.exports = router;
