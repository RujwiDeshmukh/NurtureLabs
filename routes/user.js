const router = require("express").Router();
const jwt = require("jsonwebtoken");
const expressjwt = require("express-jwt");
const { validateUserInputLogin } = require("../utils/validateInput");
const { getUserById, getAdvisorById } = require("../utils/idExtractor");

const User = require("../models/User");
const Advisor = require("../models/advisor");
const Booking = require("../models/Booking");

router.param("userId", getUserById);
router.param("advisorId", getAdvisorById);


router.post("/login", async (req, res) => {
  const data = req.body;
  if (!validateUserInputLogin(data)) {
    return res.sendStatus(400);
  }
  try {
    const user = await User.findOne({ email: data.email });
    if (!user) {
      return res.sendStatus(401);
    }
    if (!user.authenticate(data.password)) {
      return res.sendStatus(401);
    }
  
    return res.status(200).json({  user_id: user.id });
  } catch (error) {
    console.log(error);
  }
  return res.sendStatus(500);
});



router.post("/register", async (req, res) => {
  const data = req.body;
  try {
    if (!data.name || !data.email || !data.password) {
      return res.sendStatus(400);

    }
    let newuser = new User(data);
    newuser = await newuser.save();
    

    return res.status(200).json({  user_id: newuser.id });
  } catch (error) {
    console.log(error);
  }
  return res.sendStatus(500);
});


router.get("/:userId/advisor", async (req, res) => {
  try {
    const advisors = await Advisor.find({});
    return res.status(200).json({ advisors });
  } catch (error) {
    console.log(error);
  }
  return res.sendStatus(500);
});



router.post("/:userId/advisor/:advisorId", async (req, res) => {
  try {
    //  new Booking
    let newbooking = new Booking({
      advisor: req.advisor_profile._id,
      bookingTime: req.body.bookingTime,
    });
    newbooking = await newbooking.save();
    if (!newbooking) {
      return res.sendStatus(500);
    }
    // put the booking into users booking list
    let user = await User.findOneAndUpdate(
      { _id: req.profile._id },
      {
        $push: { bookings: newbooking.id },
      },
      {
        new: true,
        upsert: true,
      }
    );
    console.log(user);
    if (!user) {
      return res.sendStatus(500);
    }
    return res.sendStatus(200);
  } catch (error) {
    console.log(error);
  }
  return res.sendStatus(500);
});


router.get("/:userId/advisor/booking", async (req, res) => {
  try {
    const user = await User.findById(req.profile._id).populate({
      path: "bookings",
      populate: { path: "advisor" },
    });
    if (!user) {
      return res.sendStatus(400);
    }
    return res.status(200).json({ bookings: user.bookings });
  } catch (error) {}
  return res.status(200).send("List of bookings");
});

module.exports = router;
