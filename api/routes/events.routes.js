const express = require("express");
const {
  addEventController,
  getEventsController,
  editEventController,
  deleteEventController,
  getAllUsersController,
} = require("../controllers/events.controller");
const router = express.Router();

router.get("/getAllUsers", getAllUsersController);
router.get("/getEvents", getEventsController);
router.post("/addEvent", addEventController);
router.put("/editEvent", editEventController);
router.delete("/deleteEvent", deleteEventController);

module.exports = router;
