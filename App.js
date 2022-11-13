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

  Schedule.deleteMany();

  app.listen(process.env.PORT, () =>
    console.log(`Example app listening on port ${process.env.PORT}!`)
  );
}

app.get("/schedule/get-current", (req, res) => {
  return res.send("Received a GET HTTP method");
});

app.post("/schedule/change-status", (req, res) => {
  return res.send("Received a POST HTTP method");
});

app.post("/event/change-status", (req, res) => {
  return res.send("Received a POST HTTP method");
});

main();
