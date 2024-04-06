const mongoose = require("mongoose");
const user = require("../models/user");
const Party = require("../models/Party");
const Case = require("../models/Case");

//Controller for creating or adding a party to the case.

exports.createParty = async (req, res) => {
    try {
        // Destructure fields from the request body
        const { caseNo, lawyers, clients } = req.body;

        // Check if all required fields are provided
        if (!caseNo || !lawyers || !clients) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        }
        const caseId = await Case.findOne({caseNo});
        // Convert caseID to ObjectId
        const caseID = caseId._id;
        console.log(caseID);
        const caseObjectId = caseID;

        // Find the case details
        const caseDetail = await Case.findById(caseObjectId);
        if (!caseDetail) {
            return res.status(404).json({ success: false, message: 'Case not found' });
        }
        //bhari blunder or we can say architectural flaw or due to designing issue, we have to do this
        const lawyerIDs = await user.find({ email: { $in: lawyers } });
        const clientIDs = await user.find({ email: { $in: clients } });

        // Convert lawyerIDs and clientIDs to ObjectIds
        const lawyerObjectIds = lawyerIDs.map(id => id.profile);
        const clientObjectIds = clientIDs.map(id => id.profile);

        //check if user is already registered in the given case
        // Call the function to check cases for lawyers and clients
        const lawyerCheckResult = await checkCases(lawyerObjectIds, caseID);
        const clientCheckResult = await checkCases(clientObjectIds, caseID);

        // Handle response
        if (!lawyerCheckResult.success || !clientCheckResult.success) {
            return res.status(400).json({
                success: false,
                message: "Error occurred while checking cases",
                error: lawyerCheckResult.message || clientCheckResult.message
            });
        }

        for (const keyID of lawyerObjectIds) {
            await user.findOneAndUpdate(
                { profile: keyID },
                { $push: { cases: caseObjectId } }
            );
        }

        for (const keyID of clientObjectIds) {
            await user.findOneAndUpdate(
                { profile: keyID },
                { $push: { cases: caseObjectId } }
            );
        }

        // Create a new Party
        const newParty = await Party.create({
            lawyer: lawyerObjectIds,
            client: clientObjectIds,
        });
        console.log(newParty);

        // Update the case's parties array with the new party ID
        await Case.findOneAndUpdate({ _id: caseObjectId }, { $push: { Party: newParty._id } });

        // Return success response with the created party ID
        return res.status(200).json({
            success: true,
            partyID: newParty._id,
            message: "Party created successfully",
        });
    } catch (error) {
        // Log error
        console.error(error);

        // Return error response
        return res.status(500).json({
            success: false,
            message: "Party cannot be created. Please try again.",
            error,
        });
    }
};

//Controller for deleting the party from the case
exports.deleteParty = async (req, res) => {
    try {
        // Destructure fields from the request body
        const { partyID } = req.body;

        // Check if required fields are provided
        if (!partyID) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        }

        // Convert partyID to ObjectId
        const partyObjectId = new mongoose.Types.ObjectId(partyID);

        // Find the party details
        const partyDetail = await Party.findById(partyObjectId);
        // console.log(partyDetail);
        if (!partyDetail) {
            return res.status(404).json({ success: false, message: 'Party not found' });
        }

        //lawyers IDs & client IDs involved in party
        const lawyerObjectIds = partyDetail.lawyer;
        const clientObjectIds = partyDetail.client;
        const caseObjectId = await Case.findOne({Party :partyObjectId});
       // console.log(caseObjectId);
        // Update the case's parties array by removing the party ID
        await Case.updateOne({ Party: partyObjectId }, { $pull: { Party: partyObjectId } });

        //update the user cases array by removing the caseId 
        for (const keyID of lawyerObjectIds) {
            await user.findOneAndUpdate(
                { profile: keyID },
                { $pull: { cases: caseObjectId._id } }
            );
        }

        for (const keyID of clientObjectIds) {
            await user.findOneAndUpdate(
                { profile: keyID },
                { $pull: { cases: caseObjectId._id } }
            );
        }
        //delete the party
        await Party.findByIdAndDelete(partyObjectId);

        // Return success response
        return res.status(200).json({
            success: true,
            message: "Party deleted successfully",
        });
    } catch (error) {
        // Log error
        console.error(error);

        // Return error response
        return res.status(500).json({
            success: false,
            message: "Party cannot be deleted. Please try again.",
        });
    }
};

// Check if caseID already exists in users' cases array
const checkCases = async (userIds, caseId) => {
    try {
        for (const userId of userIds) {
            const userDetail = await user.findOne({profile: userId});
            if (!userDetail) {
                throw new Error(`User with ID ${userId} not found`);
            }

            // Check if caseID already exists in user's cases array
            if (userDetail.cases.includes(caseId)) {
                console.log(`User with ID ${userId} already has case ${caseId}`);
                return {
                    success: false,
                    message: `User with ID ${userId} already has case ${caseId}`
                };
            }
        }
        return { success: true };
    } catch (error) {
        console.error(error.message);
        return {
            success: false,
            message: error.message
        };
    }
};