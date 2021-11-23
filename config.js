/** @format */

"use strict";

/** Shared config for application; can be required many places. */

// dotenv loads enviornment variables from .env
require("dotenv").config();

// colors allows you to modify your node.js console font
require("colors");

// pull secret key from the environment, if none, default to secret-dev
const SECRET_KEY = process.env.SECRET_KEY || "secret-dev";

// modify the local port to 3001, instead of default 3000
const PORT = +process.env.PORT || 3001;

// Use dev database, testing database, or via env var, production database
function getDatabaseUri() {
  return process.env.NODE_ENV === "test"
    ? "jobly_test"
    : process.env.DATABASE_URL || "jobly";
}

// Speed up bcrypt during tests, since the algorithm safety isn't being tested
const BCRYPT_WORK_FACTOR = process.env.NODE_ENV === "test" ? 1 : 13;

// logs config info at launch
console.log("Jobly Config:".green);
console.log("SECRET_KEY:".yellow, SECRET_KEY);
console.log("PORT:".yellow, PORT.toString());
console.log("BCRYPT_WORK_FACTOR".yellow, BCRYPT_WORK_FACTOR);
console.log("Database:".yellow, getDatabaseUri());
console.log("---");

module.exports = {
  SECRET_KEY,
  PORT,
  BCRYPT_WORK_FACTOR,
  getDatabaseUri,
};
