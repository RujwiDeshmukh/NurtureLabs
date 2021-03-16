const express = require("express");
require("dotenv").config();
const mongoose = require("mongoose");

const App = express();

mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
  })
  .then((db) => console.log("database connected"))
  .catch((err) => console.log(err));

//port
const PORT = process.env.PORT || 3001;

//Middlewares global
App.use(express.json());
App.use(express.urlencoded({ extended: true }));


//ROUTES
App.use("/user", require("./routes/user"));
App.use("/admin", require("./routes/admin"));

//TEST ROUTE
App.get("/", (req, res) => {
  res.status(200).send("server running");
});

//  Listening Server


App.listen(PORT, () => {
  console.log(`server started on port ${PORT}`);
});
