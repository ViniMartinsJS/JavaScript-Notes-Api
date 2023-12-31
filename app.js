var express = require("express");
var path = require("path");
var logger = require("morgan");
require("./config/database");
var notesRouter = require("./app/routes/notes");
var usersRouter = require("./app/routes/users");
const withAuth = require("./app/middlewares/auth");
var cors = require("cors");

var app = express();

app.use(cors("*"));
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));
app.use("/users", usersRouter);
app.use("/notes", notesRouter);

module.exports = app;
