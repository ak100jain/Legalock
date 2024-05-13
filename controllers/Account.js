const mongoose = require("mongoose");
const User = require("../models/user");
const Profile = require("../models/Profile");
require("dotenv").config()
const bcrypt = require("bcryptjs");
const { log } = require("console");

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
        message: "Both Aadhar number and email are required",
      });
    }

    //const aadhar = await User.findOne({ aadharNo });
    const mail = await User.findOne({ email });

    // if (!aadhar) {
    //   return res.status(404).json({
    //     success: false,
    //     message: "Aadhar Number not found",
    //   });
    // }
 
    if (!mail) {
      return res.status(404).json({
        success: false,
        message: "Email not found",
      });
    }

    if (mail) {
      if (mail.cases && mail.cases.length > 0) {
        return res.status(400).json({
          success: false,
          message: "User is involved in cases, account can't be deleted",
        });
      }

      // Assuming user has a profile reference, you should handle it accordingly
      if (mail) {
        //console.log('hello, this is the pART where we are deleting the user account :',mail);
      await Profile.findByIdAndDelete(mail.profile);
      await User.findByIdAndDelete(mail._id);
      }
    }

    return res.status(200).json({
      success: true,
      message: "User account successfully deleted",
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Could not delete the user account, please try again",
    });
  }
};

//controller for updating the password
exports.updatePassword = async (req, res) => {
  try {
    //console.log('hello update password');
    const { aadharNo, email } = req.body;
    const { password } = req.body;

    if (!aadharNo && !email) {
      return res.status(400).json({
        success: false,
        message: "At least one field (aadharNo or email) is required",
      });
    }

    //console.log('cheking');
    let userDetail;
    if (aadharNo) {
      userDetail = await User.findOne({ aadharNo });
    } else if (email) {
      userDetail = await User.findOne({ email });
    }

    if (!userDetail) {
      console.log(userDetail);
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    await User.findByIdAndUpdate(userDetail._id, {
      password: hashedPassword
    });

    return res.status(200).json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Could not update the user password, please try again",
    });
  }
}

