require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const uri = "mongodb://127.0.0.1:27017/";

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
  mongoose.connect(uri);

  app.listen(process.env.PORT, () =>
    console.log(`Example app listening on port ${process.env.PORT}!`)
  );
}

main().catch((err) => console.log(err));
