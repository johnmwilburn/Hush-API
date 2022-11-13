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

  // Schedule.deleteMany();

  getSchedule();
  changeEventStatus();
  changeScheduleStatus();

  app.listen(process.env.PORT, () =>
    console.log(`Example app listening on port ${process.env.PORT}!`)
  );
}

app.get("/schedule/get-current", (req, res) => {
  const schedules = Schedule.find({});
  const currentSchedule = schedules[schedules.length - 1];

  return res.send(currentSchedule);
});

app.post("/schedule/change-status", (req, res) => {
  const reqBody = { command: "hush" };

  if (!reqBody?.command) {
    return res.status(400);
  }

  const schedules = Schedule.find({});
  const currentSchedule = schedules[schedules.length - 1];

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

  currentSchedule.save();

  return res.send(currentSchedule);
});

app.post("/event/change-status", (req, res) => {
  const reqBody = { eventUUID: "1", status: "busy" };

  if (!(reqBody?.eventUUID && reqBody?.status)) {
    return res.status(400);
  }

  const schedules = Schedule.find({});
  const currentSchedule = schedules[schedules.length - 1];
  for (i = 0; i < currentSchedule.events.length; i++) {
    if (currentSchedule.events[i].eventUUID == reqBody.eventUUID) {
      currentSchedule.events[i].status = reqBody.status;
      break;
    }
  }
  currentSchedule.save();
  return res.send("Received a POST HTTP method");
});

function changeEventStatus() {
  const reqBody = { eventUUID: "1", status: "busy" };

  if (!(reqBody?.eventUUID && reqBody?.status)) {
    return; // res.status(400);
  }

  const schedules = Schedule.find({});
  const currentSchedule = schedules[schedules.length - 1];
  for (i = 0; i < currentSchedule.events.length; i++) {
    if (currentSchedule.events[i].eventUUID == reqBody.eventUUID) {
      currentSchedule.events[i].status = reqBody.status;
      break;
    }
  }
  currentSchedule.save();
  return currentSchedule;
}

function getSchedule() {
  const schedules = Schedule.find({});
  const currentSchedule = schedules[schedules.length - 1];

  return currentSchedule;
}

function changeScheduleStatus() {
  const reqBody = { command: "hush" };

  if (!reqBody?.command) {
    return; //res.status(400);
  }

  const schedules = Schedule.find({});
  const currentSchedule = schedules[schedules.length - 1];

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

  currentSchedule.save();

  return currentSchedule;
}

main();
