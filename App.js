require("dotenv").config();
const express = require("express");
bodyParser = require("body-parser");
const mongoose = require("mongoose");
const Schedule = require("./src/schedule.model");
const scheduleStub = require("./src/schedule.stub");

const app = express();
app.use(bodyParser.json());

async function main() {
  await mongoose.connect(process.env.MONGO_URI);

  DateTime.remove({}, getSchedule);
  const doc = Schedule(scheduleStub);
  doc.save();
  changeEventStatus();
  changeScheduleStatus();

  app.listen(process.env.PORT, () =>
    console.log(`Example app listening on port ${process.env.PORT}!`)
  );
}

const changeScheduleStatus = async (req, res) => {
  const reqBody = { command: "hush" };

  if (!reqBody?.command) {
    return res.status(400);
  }

  const schedules = await Schedule.find({});
  const currentSchedule = schedules[schedules.length - 1];

  if (!currentSchedule) {
    return res.status(400);
  }

  switch (reqBody.command) {
    case "hush":
      currentSchedule.totalHush = true;
      currentSchedule.totalFree = false;
      break;
    case "free":
      currentSchedule.totalHush = false;
      currentSchedule.totalFree = true;
      break;
    case "none":
    default:
      currentSchedule.totalHush = false;
      currentSchedule.totalFree = false;
      break;
  }

  console.log("schedule STATUS", currentSchedule);

  currentSchedule.save();

  return res.send(currentSchedule);
};

const changeEventStatus = async (req, res) => {
  const reqBody = { eventUUID: "1", status: "busy" };

  if (!(reqBody?.eventUUID && reqBody?.status)) {
    return res.status(400);
  }

  const schedules = await Schedule.find({});
  const currentSchedule = schedules[schedules.length - 1];

  if (!currentSchedule) {
    return res.status(400);
  }

  for (i = 0; i < currentSchedule.events.length; i++) {
    if (currentSchedule.events[i].eventUUID == reqBody.eventUUID) {
      currentSchedule.events[i].status = reqBody.status;
      break;
    }
  }
  currentSchedule.save();

  return res.send(currentSchedule);
};

const getSchedule = async (req, res) => {
  const schedules = await Schedule.find({});
  const currentSchedule = schedules[schedules.length - 1];

  if (!currentSchedule) {
    return res.status(400);
  }

  console.log("GET SCHEDULE", currentSchedule);
  return currentSchedule;
};

app.get("/schedule/get-current", (req, res) => getSchedule);
app.post("/schedule/change-status", (req, res) => changeScheduleStatus);
app.post("/event/change-status", (req, res) => changeEventStatus);

main();
