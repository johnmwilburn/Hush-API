const mongoose = require("mongoose");
const { Schema } = mongoose;

const scheduleSchema = new Schema({
  totalHush: Boolean,
  totalFree: Boolean,
  scheduleUUID: String,
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
