const express = require("express");
const launchesRouter = express.Router();

const {
  httpGetAllLaunches,
  httpAddNewLaunches,
  httpAbortLaunch,
} = require("./launches.controller");

launchesRouter.get("/", httpGetAllLaunches);
launchesRouter.post("/", httpAddNewLaunches);
launchesRouter.delete("/:id", httpAbortLaunch);

module.exports = launchesRouter;
