let express = require("express");
let body = require("express-validator").body;
let validationResult = require("express-validator").validationResult;
let compare = require("bcrypt").compare;
let router = express.Router();
let UserModel = require("./models").UserModel;

// CHECK AUTH GET ROUTE
router.get("/checkAuth", async (req, res) => {
  try {
    if (!req.session.userId) return res.json({ success: false });
    let user = await UserModel.findById(req.session.userId).populate({
      path: "rooms",
      populate: {
        path: "chat",
        model: "Message",
      },
    });
    if (!user) return res.json({ success: false });
    return res.json({ user });
  } catch (err) {
    console.log(err);
  }
});

module.exports = router;
