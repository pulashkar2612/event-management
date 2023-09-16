const express = require("express");
const {
  LoginController,
  SignupController,
  LogoutController,
  VerifyOtpController,
} = require("../controllers/auth.controller");
const router = express.Router();

router.post("/login", LoginController);
router.post("/signup", SignupController);
router.post("/verifyOtp", VerifyOtpController);
router.post("/logout", LogoutController);

module.exports = router;
