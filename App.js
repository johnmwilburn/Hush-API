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

  Schedule.remove({}, getSchedule);

  const newSchedule = Schedule(scheduleStub);
  newSchedule.save();

  app.listen(process.env.PORT, () =>
    console.log(`Example app listening on port ${process.env.PORT}!`)
  );
}

const changeScheduleStatus = async (req, res) => {
  console.log("Received request for changeScheduleStatus");
  console.log(req.body);

  if (!req.body?.command) {
    return res.status(400).send("missing parameter 'command'");
  }

  if (
    req.body.command != "gHush" &&
    req.body.command != "gFree" &&
    req.body.command != "normal"
  ) {
    return res
      .status(400)
      .send("invalid command, specify 'gFree', 'gHush', or 'normal'");
  }

  const schedules = await Schedule.find({});
  const currentSchedule = schedules[schedules.length - 1];

  if (!currentSchedule) {
    return res.status(400);
  }

  switch (req.body.command) {
    case "gHush":
      currentSchedule.gHush = true;
      currentSchedule.gFree = false;
      break;
    case "gFree":
      currentSchedule.gHush = false;
      currentSchedule.gFree = true;
      break;
    case "normal":
    default:
      currentSchedule.gHush = false;
      currentSchedule.gFree = false;
      break;
  }

  currentSchedule.save();

  return res.status(200).send("success!");
};

const changeEventStatus = async (req, res) => {
  console.log("Received request for changeEventStatus");
  console.log(req.body);

  if (!(req.body?.eventUUID && req.body?.status)) {
    return res
      .status(400)
      .send("missing one or both parameters 'eventUUID', 'status'");
  }

  if (req.body.status != "free" && req.body.status != "hush") {
    return res.status(400).send("invalid status, specify 'free' or 'hush'");
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

  await Schedule.findOneAndUpdate({ scheduleUUID: 1 }, { events: events });

  return res.status(200).send("success!");
};

const getSchedule = async (req, res) => {
  console.log("Received request for getSchedule");
  const schedules = await Schedule.find({});
  let currentSchedule = schedules[schedules.length - 1];

  if (!currentSchedule) {
    return res.status(400);
  }

  let events = currentSchedule.events;
  let trimmedEvents = [];

  for (i = 0; i < events.length; i++) {
    if (events[i].to > Date.now()) {
      trimmedEvents.push(events[i]);
    }
  }
  let previousEvent;
  if (trimmedEvents.length != 0) {
    if (trimmedEvents[0].from > Date.now()) {
      currentSchedule.state = "free";
      currentSchedule.nextChange = trimmedEvents[0].from;
    } else if (
      trimmedEvents[0].from <= Date.now() &&
      Date.now() < trimmedEvents[0].to
    ) {
      currentSchedule.state = "hush";
      previousEvent = trimmedEvents[0];
      for (event of trimmedEvents) {
        if (event.from > previousEvent.to) {
          currentSchedule.nextChange = previousEvent.to;
          break;
        }
        previousEvent = event;
      }
    }
  }

  currentSchedule = await Schedule.findOneAndUpdate(
    { scheduleUUID: 1 },
    { events: trimmedEvents }
  );
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
