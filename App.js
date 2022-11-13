require("dotenv").config();
const express = require("express");
bodyParser = require("body-parser");
const mongoose = require("mongoose");
const Schedule = require("./src/schedule.model");
const scheduleStub = require("./src/schedule.stub");
const { MongoClient, ObjectId } = require("mongodb");
const dbURI =
  "mongodb://john-wilburn:5n2qyZGDw0jWqY67ppiorvbADPVtauzgix5xNdPK7EajH0qMQsWHjmH6bsrWGzEHEjY3h0kFiKC0ACDbsHSGCQ==@john-wilburn.mongo.cosmos.azure.com:10255/?ssl=true&replicaSet=globaldb&retrywrites=false&maxIdleTimeMS=120000&appName=@john-wilburn@";

const app = express();
app.use(bodyParser.json());

async function main() {
  await mongoose.connect(dbURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  // await Schedule.remove({}, null);

  // const newSchedule = Schedule(scheduleStub);
  // newSchedule.save();

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

const flipEventStatus = async (req, res) => {
  if (!req.body?.eventUUID) {
    return res.status(400).send("missing 'eventUUID' parameter");
  }

  const schedule = await Schedule.findOne({ scheduleUUID: "1" });

  if (!schedule) {
    return res.status(400).send("Schedule not found");
  }

  let events = schedule.events;
  for (i = 0; i < events.length; i++) {
    if (events[i].eventUUID == req.body.eventUUID) {
      switch (events[i].status) {
        case "Hush":
          events[i].status = "Free";
          break;
        case "Free":
          events[i].status = "Hush";
          break;
      }
    }
  }
};

const changeEventStatus = async (req, res) => {
  console.log("Received request for changeEventStatus");
  console.log(req.body);

  if (!(req.body?.eventUUID && req.body?.status)) {
    return res
      .status(400)
      .send("missing one or both parameters 'eventUUID', 'status'");
  }

  if (req.body.status != "Free" && req.body.status != "Hush") {
    return res.status(400).send("invalid status, specify 'Free' or 'Hush'");
  }

  const schedules = await Schedule.find({});
  const currentSchedule = schedules[schedules.length - 1];

  if (!currentSchedule) {
    return res.status(400).send("No schedules found");
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

const refreshEvents = async function (req, res, next) {
  console.log("Events Refreshed.");
  const schedules = await Schedule.find({});
  let currentSchedule = schedules[schedules.length - 1];

  if (!currentSchedule) {
    return res.status(400).send("No schedules found");
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
      currentSchedule.state = "Free";
      currentSchedule.nextChange = trimmedEvents[0].from;
    } else if (
      trimmedEvents[0].from <= Date.now() &&
      Date.now() < trimmedEvents[0].to
    ) {
      currentSchedule.state = trimmedEvents[0].status;
      previousEvent = trimmedEvents[0];
      for (event of trimmedEvents) {
        if (event.from > previousEvent.to) {
          currentSchedule.nextChange = previousEvent.to;
          break;
        }
        if (event.status != previousEvent.status) {
          currentSchedule.nextChange = event.from;
          break;
        }
        previousEvent = event;
      }
    }
  }
  currentSchedule.save();
  currentSchedule = await Schedule.findOneAndUpdate(
    { scheduleUUID: 1 },
    { events: trimmedEvents }
  );

  next();
};

const flipGHush = async (req, res) => {
  const schedule = await Schedule.findOne({ scheduleUUID: "1" });

  if (!schedule) {
    return res.status(400).send("Schedule not found");
  }

  schedule.gHush = !schedule.gHush;
  schedule.save();
};

const flipGFree = async (req, res) => {
  const schedule = await Schedule.findOne({ scheduleUUID: "1" });

  if (!schedule) {
    return res.status(400).send("Schedule not found");
  }

  schedule.gFree = !schedule.gFree;
  schedule.save();
};

const getSchedule = async (req, res) => {
  console.log("Received request for getSchedule");

  const schedule = await Schedule.findOne({ scheduleUUID: "1" });

  if (!schedule) {
    return res.status(400).send("Schedule not found");
  }

  return res.status(200).json(schedule);
};

app.use(refreshEvents);
app.post("/schedule/change-status", changeScheduleStatus);
app.post("/schedule/flip-ghush", flipGHush);
app.post("/schedule/flip-gfree", flipGFree);
app.get("/schedule/get-current", getSchedule);
app.post("/event/change-status", changeEventStatus);
app.post("/event/flip-status", flipEventStatus);
app.use("/", (req, res) => {
  console.log("Default route");
  res.send("Default route");
});

main();
