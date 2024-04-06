const mongoose = require("mongoose");
const User = require("../models/user");
const Profile = require("../models/Profile");
require("dotenv").config()
const bcrypt = require("bcryptjs")

//controller for creating new account by the admin
exports.newAccount = async (req, res) => {
    try {
      // Destructure fields from the request body
      const {
        firstName,
        lastName,
        email,
        password,
        role,
        contact,
        aadharNo,
      } = req.body
      // Check if All Details are there or not
      if (
        !firstName ||
        !lastName ||
        !email ||
        !password ||
        !role ||
        !contact ||
        !aadharNo
      ) {
        return res.status(403).send({
          success: false,
          message: "All Fields are required",
        })
      }
      
  
      // Check if user already exists
      const existingUser = await User.findOne({ email })
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "User already exists.",
        })
      }
  
      
  
      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10)
  
      // Create the Additional Profile For User
      const profileDetails = await Profile.create({
        firstName: firstName,
        lastName: lastName,
      })

      //make an entry of new user in the database
      const user = await User.create({
        firstName: firstName,
        lastName: lastName,
        email: email,
        password: hashedPassword,
        role: role,
        profile: profileDetails._id,
        contact: contact,
        aadharNo: aadharNo,
      })
  
      return res.status(200).json({
        success: true,
        user,
        message: "User registered successfully",
      })
    } catch (error) {
      console.error(error)
      return res.status(500).json({
        success: false,
        message: "User cannot be registered. Please try again.",
      })
    }
  }

  //have to add mailing facility so that user can get email notification with id and password and account access

  //Controller for deleting the user account
  exports.deleteAccount = async (req, res) => {
    try {
        const { aadharNo, email } = req.body;

        if (!aadharNo && !email) {
            return res.status(400).json({
                success: false,
                message: "At least one field (aadharNo or email) is required",
            });
        }

        let userDetail;
        if (aadharNo) {
            userDetail = await User.findOne({ aadharNo });
        } else if (email) {
            userDetail = await User.findOne({ email });
        }

        if (!userDetail) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        if (userDetail.cases && userDetail.cases.length > 0) {
            return res.status(400).json({
                success: false,
                message: "User is involved in cases, account can't be deleted",
            });
        }

        await Profile.findByIdAndDelete(userDetail.profile);
        await User.findByIdAndDelete(userDetail._id);

        return res.status(200).json({
            success: true,
            message: "User account deleted successfully",
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Could not delete the user account, please try again",
        });
    }
};
