const express = require("express");
const cors = require("cors");
const path = require("path");
const morgan = require("morgan");

const app = express();

const api = require("./routes/api");

app.use(
  cors({
    origin: "https://nasa-9vxg.onrender.com/v1",
  })
);

app.use(morgan("combined"));

app.use(express.json());
app.use(express.static(path.join('__dirname, "..", "public"')));

app.use("/v1", api);

app.get("/*", (req, res) => {
  res.sendFile(path.resolve('__dirname, "..", "public", "index.html"')); //
});

module.exports = app;
