const express = require("express");
const { authenticate } = require("../middleware/auth.middleware");
const { authorize } = require("../middleware/role.middleware");

const router = express.Router();


router.get(
  "/dispatcher",
  authenticate,
  authorize("Dispatcher"),
  (req,res)=>{

    res.json({
      message:"Dispatcher dashboard access granted",
      user:req.user
    });

  }
);


router.get(
  "/fleet",
  authenticate,
  authorize("Fleet Manager"),
  (req,res)=>{

    res.json({
      message:"Fleet access granted",
      user:req.user
    });

  }
);


module.exports = router;