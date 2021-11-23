/** @format */

"use strict";

/** Express app for jobly. */

// Node.js web application framework
const express = require("express");

// Node.js package by which a browser and server can interact and determine whether or not to accept requests from external origins
const cors = require("cors");

// import error
const { NotFoundError } = require("./expressError");

// authenticate middleware of JavaScript Web Token
const { authenticateJWT } = require("./middleware/auth");

// Routes
const authRoutes = require("./routes/auth");
const companiesRoutes = require("./routes/companies");
const usersRoutes = require("./routes/users");

// morgan is a module that (once installed) automatically creates logs on any requests being made.
const morgan = require("morgan");

// launch app
const app = express();

// activate modules on each request
app.use(cors());
app.use(express.json());
app.use(morgan("tiny"));
app.use(authenticateJWT);

// connect to Routes
app.use("/auth", authRoutes);
app.use("/companies", companiesRoutes);
app.use("/users", usersRoutes);

/** Handle 404 errors -- this matches everything */
app.use(function (req, res, next) {
  return next(new NotFoundError());
});

/** Generic error handler; anything unhandled goes here. */
app.use(function (err, req, res, next) {
  if (process.env.NODE_ENV !== "test") console.error(err.stack);
  const status = err.status || 500;
  const message = err.message;

  return res.status(status).json({
    error: { message, status },
  });
});

module.exports = app;
