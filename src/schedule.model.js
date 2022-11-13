const mongoose = require("mongoose");
const { Schema } = mongoose;

const scheduleSchema = new Schema({
  scheduleUUID: String,
  nextChange: String,
  state: String,
  gFree: Boolean,
  gHush: Boolean,
  events: [
    {
      status: String,
      from: String,
      to: String,
      title: String,
      eventUUID: String,
    },
  ],
});

var Schedule = mongoose.model("Schedule", scheduleSchema);
module.exports = Schedule;
