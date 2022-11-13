require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const Schedule = require("./src/schedule.model");
const scheduleStub = require("./src/schedule.stub");

const app = express();

app.get("/", (req, res) => {
  return res.send("Received a GET HTTP method");
});

app.post("/", (req, res) => {
  return res.send("Received a POST HTTP method");
});

app.put("/", (req, res) => {
  return res.send("Received a PUT HTTP method");
});

app.delete("/", (req, res) => {
  return res.send("Received a DELETE HTTP method");
});

async function main() {
  await mongoose.connect(process.env.MONGO_URI);
  const doc = new Schedule(scheduleStub);

  await doc.save();

  const schedules = await Schedule.find({});
  console.log(schedules);

  app.listen(process.env.PORT, () =>
    console.log(`Example app listening on port ${process.env.PORT}!`)
  );
}

main().catch((err) => console.log(err));
