const mongoose = require("mongoose");
const { Schema } = mongoose;

const scheduleSchema = new Schema({
  scheduleUUID: String,
  nextChange: Number,
  state: String,
  gFree: Boolean,
  gHush: Boolean,
  events: [
    {
      status: String,
      from: Number,
      to: Number,
      title: String,
      eventUUID: Number,
    },
  ],
});

var Schedule = mongoose.model("Schedule", scheduleSchema);
module.exports = Schedule;
