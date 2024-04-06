const User = require("../models/user");
const Profile = require("../models/Profile");
const mongoose = require("mongoose");

//Controller for sending the profile data

exports.getProfile = async (req, res) => {
    try {
        // Destructure the profileID from request body
        //const {profileID}=req.body;
        const profileID = await User.findOne({email: req.user.email});
        // Find profile by ID
        const profileData = await Profile.findById(profileID.profile);
        // Check if profile exists
        if (!profileData) {
            return res.status(404).json({
                success: false,
                message: "Profile not found",
            });
        }

        // Return profile data
        return res.status(200).json({
            success: true,
            data: profileData,
            message: "Profile found successfully",
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Unexpected error occurred while retrieving the profile",
        });
    }
};

//Controller for updating the profile
exports.updateProfile = async (req, res) => {
    try {
        // Destructure the profile data from req.body
        const { DOB, education, experience, achievement } = req.body;

        // Find the user details
        const userDetails = await User.findOne({ email: req.user.email });
        if (!userDetails) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        // Update the profile data
        const updatedProfile = await Profile.findByIdAndUpdate(userDetails.profile, {
            dateOfBirth: DOB,
            achievement: achievement,
            education: education,
            experience: experience,
        }, { new: true }); // Set { new: true } to return the updated document

        if (!updatedProfile) {
            return res.status(404).json({
                success: false,
                message: "Profile not found",
            });
        }

        // Send a success response with the updated profile data
        res.status(200).json({
            success: true,
            data: updatedProfile,
            message: "Profile updated successfully",
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Profile couldn't be updated",
        });
    }
};

 