const expressAsyncHandler = require("express-async-handler");
const eventsModel = require("../models/events.model");
const usersModel = require("../models/auth.model");
const { default: mongoose } = require("mongoose");
const nodemailer = require("nodemailer");

const getEventsController = expressAsyncHandler(async (req, res, next) => {
  const { id } = req.body;
  const { sort } = req.query;

  let sortField = 1;
  if (sort) {
    sortField = -1;
  }

  try {
    const idAsObject = new mongoose.Types.ObjectId(id);
    const events = await eventsModel
      .find({ userId: { $eq: idAsObject } })
      .sort({ createdAt: sortField });
    res.json({
      success: true,
      events: events,
    });
  } catch (err) {
    res.status(400);
    next(err, req, res);
  }
});

const addEventController = expressAsyncHandler(async (req, res, next) => {
  const { name, createdAt, id, userId, createdByAdmin, emailIds } = req.body;

  if (!name) {
    res.status(400);
    throw new Error("Event name is missing");
  }

  if (createdByAdmin) {
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

    let emailString = "";
    emailIds.forEach((e) => {
      emailString += e + ",";
    });
    console.log(emailString);

    transporter.sendMail(
      {
        from: "kumarsai1312@gmail.com",
        to: emailString,
        subject: "Event",
        html: `<h1>${name}</h1>`,
      },
      (err, info) => {
        if (err) {
          console.log(err);
        } else {
          console.log("Mail is released.");
        }
      }
    );
  }

  try {
    await eventsModel.create({
      name,
      createdAt,
      userId: userId || id,
      createdByAdmin,
    });
    res.json({
      success: true,
    });
  } catch (err) {
    res.status(400);
    next(err, req, res);
  }
});

const editEventController = expressAsyncHandler(async (req, res, next) => {
  const { id, name } = req.body;

  if (!name || !id) {
    throw new Error("Name or Id is missing");
  }

  try {
    await eventsModel.findByIdAndUpdate(id, {
      name: name,
      updatedAt: new Date(),
    });
    res.json({
      success: true,
    });
  } catch (err) {
    res.status(400);
    next(err, req, res);
  }
});

const deleteEventController = expressAsyncHandler(async (req, res, next) => {
  const { id } = req.query;

  if (!id) {
    throw new Error("Event id is missing");
  }

  try {
    await eventsModel.findByIdAndDelete(id);
    res.json({
      success: true,
    });
  } catch (err) {
    res.status(400);
    next(err, req, res);
  }
});

const getAllUsersController = expressAsyncHandler(async (req, res, next) => {
  try {
    const data = await usersModel.find({ role: { $eq: "USER" } });
    res.json({
      success: true,
      users: data,
    });
  } catch (err) {
    res.status(400);
    next(err, req, res);
  }
});

module.exports = {
  addEventController,
  editEventController,
  getEventsController,
  deleteEventController,
  getAllUsersController,
};
