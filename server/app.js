if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}
const express = require("express");
const app = express();
const cors = require("cors");


// ngrok passes https requests on to this server as http
// Without this, Stripe would send people back to http:// instead of https://.
app.set("trust proxy", true);

const router = require("./routes/index");
const errorHandler = require("./middlewares/errorHandler");

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(router);
app.use(errorHandler);

module.exports = app;