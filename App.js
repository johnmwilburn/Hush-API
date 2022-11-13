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

  // Schedule.remove({}, getSchedule);

  app.listen(process.env.PORT, () =>
    console.log(`Example app listening on port ${process.env.PORT}!`)
  );
}

const changeScheduleStatus = async (req, res) => {
  console.log("Received request for changeScheduleStatus");
  const reqBody = { command: "hush" };
  console.log(req.body);

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

  return res.status(200).json(currentSchedule);
};

const changeEventStatus = async (req, res) => {
  console.log("Received request for changEventStatus");
  console.log(req.body);

  if (!(req.body?.eventUUID && req.body?.status)) {
    return res.status(400);
  }

  const schedules = await Schedule.find({});
  const currentSchedule = schedules[schedules.length - 1];

  if (!currentSchedule) {
    return res.status(400);
  }

  let events = currentSchedule.events;
  for (i = 0; i < events.length; i++) {
    if (events[i].eventUUID == req.body.eventUUID) {
      events[i].status = req.body.status;
      break;
    }
  }

  Schedule.findOneAndUpdate({ scheduleUUID: 1 }, { events: events });

  return res.status(200);
};

const getSchedule = async (req, res) => {
  console.log("Received request for getSchedule");
  const schedules = await Schedule.find({});
  const currentSchedule = schedules[schedules.length - 1];

  if (!currentSchedule) {
    return res.status(400);
  }

  console.log("GET SCHEDULE", currentSchedule);
  return res.status(200).json(currentSchedule);
};

app.get("/schedule/get-current", getSchedule);
app.post("/schedule/change-status", changeScheduleStatus);
app.post("/event/change-status", changeEventStatus);
app.use("/", (req, res) => {
  console.log("Default route");
  res.send("Default route");
});

main();
