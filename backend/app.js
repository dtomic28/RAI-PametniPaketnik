var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
const swaggerUi = require("swagger-ui-express");
const swaggerJsdoc = require("swagger-jsdoc");

require("dotenv").config(); // Load .env if present
const { db, mongoURI } = require("./db"); // This sets up the connection

var userRouter = require("./routes/userRoutes");
var tokenRouter = require("./routes/tokenRoutes");
var lockboxRouter = require("./routes/lockboxRoutes");
var transactionController = require("./routes/transactionRoutes");
var itemsController = require("./routes/itemRoutes");

var app = express();

var cors = require("cors");
var allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  "http://192.168.64.147",
  "https://pp.dtomic.com"
];
app.use(
  cors({
    credentials: true,
    origin: function (origin, callback) {
      console.log("Request origin:", origin);
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1) {
        var msg =
          "The CORS policy does not allow access from the specified Origin.";
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
  })
);

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

var session = require("express-session");
var MongoStore = require("connect-mongo");
app.use(
  session({
    secret: "work hard",
    resave: true,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: mongoURI }),
  })
);

app.use(function (req, res, next) {
  res.locals.session = req.session;
  next();
});

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Pametni Paketnik API",
      version: "1.0.0",
      description: "API Dokumentacija za pametni paketnik.",
    },
    servers: [
      {
        url: "http://pp.dtomic.com/api/", // Change if you're behind reverse proxy or use HTTPS
      },
    ],
  },
  apis: ["./routes/*.js"], // Adjust to your route files
};
const swaggerSpec = swaggerJsdoc(swaggerOptions);

app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use("/api/user", userRouter);
app.use("/api/token", tokenRouter);
app.use("/api/lockbox", lockboxRouter);
app.use("/api/transaction", transactionController);
app.use("/api/item", itemsController);
app.use('/images', express.static(path.join(__dirname, 'images')));

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
