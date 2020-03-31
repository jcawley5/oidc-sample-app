var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
const session = require("express-session");
const sapOIDC = require("./auth/sapOIDC");

require("dotenv").config();

var indexRouter = require("./routes/index");
var healthRouter = require("./routes/health");

var app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use(
  session({
    secret: "secret123456",
    resave: false,
    saveUninitialized: true
  })
);

//auth callback...
app.get("/oauth/callback", sapOIDC.oAuthCallback);

//set routes to check auth...
app.use("/", sapOIDC.isAuthenticated, function(req, res, next) {
  indexRouter(req, res, next);
});

//k8s health checks...
app.use("/health", function(req, res, next) {
  healthRouter(req, res, next);
});

app.use("/logout", function(req, res, next) {
  const logoutURL = sapOIDC.getLogoutUrl();
  req.session.destroy();
  res.redirect(logoutURL);
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

var port = process.env.PORT || "3000";
app.set("port", port);

app.listen(port, async () => {
  await sapOIDC.initClient();
  console.log("listening on port %s", port);
});
