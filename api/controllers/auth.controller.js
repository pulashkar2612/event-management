const expressAsyncHandler = require("express-async-handler");
const usersModel = require("../models/auth.model");
const { v4 } = require("uuid");
const nodemailer = require("nodemailer");
const nodeCache = require("node-cache");
const userCache = new nodeCache({ stdTTL: 300 });
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const LoginController = expressAsyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  const checkUser = await usersModel.find({ email: { $eq: email } });

  if (checkUser.length === 0) {
    res.status(400);
    throw new Error("User is not signed up.");
  } else {
    const checkPassword = await bcrypt.compare(
      atob(password),
      checkUser[0].password
    );
    if (!checkPassword) {
      res.status(400);
      throw new Error("Incorrect password");
    }
  }

  try {
    const token = generateToken(email, checkUser[0]._id);
    const refreshToken = generateRefreshToken(email, checkUser[0]._id);
    res.json({
      success: true,
      token: token,
      refreshToken: refreshToken,
      role: checkUser[0].role,
    });
  } catch (err) {}
});

const SignupController = expressAsyncHandler(async (req, res, next) => {
  const { username, email, password, role } = req.body;

  const checkEmail = await usersModel.find({ email: { $eq: email } });
  if (checkEmail.length > 0) {
    res.status(400);
    throw new Error("Email already exists");
  }

  const id = v4();
  const otp = generateOtp();

  let user = new usersModel({
    username,
    email,
    password,
    role,
    id,
    otp,
  });

  try {
    await user.validate();
  } catch (err) {
    res.status(400);
    next(err, req, res);
  }
  userCache.set(user.id, user);

  const transporter = nodemailer.createTransport({
    host: "smtp.forwardemail.net",
    port: 465,
    secure: true,
    service: "Gmail",
    auth: {
      user: process.env.EMAIL_ID,
      pass: process.env.PASSWORD,
    },
  });

  try {
    transporter.sendMail(
      {
        from: "kumarsai131@gmail.com",
        to: email,
        subject: "OTP",
        html: `<h1>The OTP is - ${otp}</h1>`,
      },
      (err, info) => {
        if (err) {
        } else {
          res.json({
            success: true,
            message: "Enter the otp received in the email",
            id: id,
          });
        }
      }
    );
  } catch (err) {
    res.status(400);
    next(err, req, res);
  }
});

const LogoutController = expressAsyncHandler(async (req, res, next) => {});

const VerifyOtpController = expressAsyncHandler(async (req, res, next) => {
  const { id, otp } = req.body;

  const userCacheData = userCache.get(id);

  if (userCacheData.username) {
    if (otp == userCacheData.otp) {
    } else {
      res.status(400);
      throw new Error("Incorrect otp.");
    }
  } else {
    res.status(400);
    throw new Error("Time out. Pl signup again.");
  }

  try {
    await usersModel.create({
      username: userCacheData.username,
      password: userCacheData.password,
      role: userCacheData.role,
      email: userCacheData.email,
      createdAt: new Date().toISOString(),
    });
    userCache.del(id);
    res.json({
      success: true,
    });
  } catch (err) {
    res.status(400);
    next(err, req, res);
  }
});

function generateOtp() {
  let otp = Math.random() * 1000000;
  return parseInt(otp);
}

function generateToken(email, id) {
  return jwt.sign({ email: email, id: id }, process.env.TOKEN_SECRET, {
    expiresIn: "30m",
  });
}

function generateRefreshToken(email, id) {
  return jwt.sign({ email: email, id: id }, process.env.REFRESH_SECRET, {
    expiresIn: "5m",
  });
}

module.exports = {
  LoginController,
  SignupController,
  LogoutController,
  VerifyOtpController,
};
