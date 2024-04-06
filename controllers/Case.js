const mongoose = require("mongoose");
const User = require("../models/user");
const Profile = require("../models/Profile");
const Case = require("../models/Case");
const Party = require("../models/Party")
require("dotenv").config()

//controller for creating a new case
exports.newCase = async (req, res) => {
  try {
      // Destructure fields from the request body
      const { title, caseDescription, judgeId ,caseNo} = req.body;

      // Check if all required fields are provided
      if (!judgeId || !caseDescription || !title ||!caseNo) {
          return res.status(400).json({ success: false, message: "All fields are required" });
      }

      // Convert judgeId to ObjectId
      const id =new mongoose.Types.ObjectId(judgeId);

      // Find the judge details
      const judgeDetail = await User.findById(id);
      if (!judgeDetail) {
          return res.status(404).json({ success: false, message: 'Judge not found' });
      }
      const caseDetail = await Case.findOne({caseNo:caseNo});
      //console.log(caseDetail);
      if(caseDetail){
        return res.status(500).json({
          success: false,
          message: "case already exist with the given caseNo",
      });
      }

      // Create a new case
      const newCase = await Case.create({
          title: title,
          judge: judgeDetail.profile,
          caseDescription: caseDescription,
          caseNo :caseNo,
      });

      // Update judge's cases array with the new case ID
      await User.updateOne({ _id: id }, { $push: { cases: newCase._id } });

      // Return success response with the created case ID
      return res.status(200).json({
          success: true,
          caseID: newCase._id,
          caseNo : caseNo,
          message: "Case created successfully",
      });
  } catch (error) {
      // Log error
      console.error(error);

      // Return error response
      return res.status(500).json({
          success: false,
          message: "Case cannot be created. Please try again.",
      });
  }
};

//Controller for deleting the case
  exports.deleteCase = async (req, res) => {
    try {
      // Destructure case id from the request body
      const { caseNo } = req.body;
  
      // Check if caseID is provided
      if (!caseNo) {
        return res.status(400).json({ success: false, message: "Case ID required" });
      }
      const caseID = await Case.findOne({caseNo});
      // Convert caseID to ObjectId
      const id = caseID._id;
  
      // Find the case details
      const caseDetail = await Case.findById(id);
      if (!caseDetail) {
        return res.status(404).json({ success: false, message: 'Case not found' });
      }
  
      // Remove case ID from associated lawyers and clients
      for (const party of caseDetail.Party) {
        let partyprofile = await Party.findById(party);
        await User.updateMany(
          { profile: { $in: [partyprofile.lawyer, partyprofile.client] } },
          { $pull: { cases: id } }
        );
        await Party.findByIdAndDelete(party);
      }
      
      // Remove case ID from the judge
      await User.updateOne(
        { profile: caseDetail.judge },
        { $pull: { cases: id } }
      );
  
      // Delete the case
      await Case.findByIdAndDelete(id);
  
      // Log success message
      console.log('Case deleted successfully');
  
      // Send success response
      return res.status(200).json({ success: true, message: "Case deleted successfully" });
    } catch (error) {
      // Log error
      console.error(error);
  
      // Send error response
      return res.status(500).json({ success: false, message: "Case cannot be deleted. Please try again." });
    }
  };

//controller for getting all cases related to user
exports.getCases = async (req, res) => {
    try {
        // Find the user document based on the email of the authenticated user
        const user = await User.findOne({ email: req.user.email }, { cases: 1 })
                                .populate('cases');

        // Check if the user document exists
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Map the populated cases to include case ID in the response
        const populatedCases = user.cases.map(caseDocument => ({
            _id: caseDocument._id,
            caseDetail: caseDocument
        }));

        // Return success response with the populated cases
        return res.status(200).json({
            success: true,
            data: populatedCases,
            message: "All the cases are successfully retrieved",
        });
    } catch (error) {
        // Log error
        console.error(error);

        // Return error response
        return res.status(500).json({
            success: false,
            message: "Cases cannot be retrieved. Please try again.",
        });
    }
};

//controller for getting case details for lawyer and client
exports.CaseDetail = async (req, res) => {
  try {
      // Extract case ID from request parameters
      const { caseID } = req.body;
      const { email } = req.user;

      // Fetch user detail
      const userDetail = await User.findOne({ email: email });

      // Check if caseID is provided
      if (!caseID) {
          return res.status(400).json({ success: false, message: "Case ID is required" });
      }

      // Find the case details
      const caseDetail = await Case.findById(caseID).populate("judge");

      // Check if case exists
      if (!caseDetail) {
          return res.status(404).json({ success: false, message: 'Case not found' });
      }

      let caseData = null;

      // Iterate through the parties of the case
      for (const partyID of caseDetail.Party) {
          // Find party details
          const partyDetail = await Party.findById(partyID);

          // Check if user is lawyer or client in this party
          if (partyDetail.lawyer.includes(userDetail.profile) || partyDetail.client.includes(userDetail.profile)) {
              caseData = await Party.findById(partyID).populate("lawyer").populate("client").populate({
                path: 'documents',
                populate: {
                  path: 'uploadedBY',
                  model: 'Profile',
                  select: 'firstName lastName'
                }
              });
              break; // Exit loop once party found
          }
      }
      //console.log(caseData);

      // If party found, return response
      if (caseData) {
          caseDetail.Party = null; // Clear Party array from caseDetail
          return res.status(200).json({
              success: true,
              caseDetail,
              caseData,
          });
      }

      // If user is not involved in the case
      return res.status(500).json({
          success: false,
          message: "You are not involved in the given case",
      });
  } catch (error) {
      // Log error
      console.error(error);

      // Return error response
      return res.status(500).json({
          success: false,
          message: "Failed to retrieve case details. Please try again.",
      });
  }
};

//Controller for returning the casedetail for the judge
exports.judgeCaseDetail = async (req, res) => {
  try {
    // Extract case ID from request parameters
    const { caseID } = req.body;

    // Check if caseID is provided
    //console.log(caseID);
    if (!caseID) {
      return res.status(400).json({ success: false, message: "Case ID is required" });
    }

    // Find the case details and populate parties
    const caseDetail = await Case.findById(caseID).populate({
      path: 'Party',
      populate: {
        path: 'lawyer client',
        model: 'Profile',
        select: 'firstName lastName'
      }
    }).populate("judge");

    // Check if case exists
    if (!caseDetail) {
      return res.status(404).json({ success: false, message: 'Case not found' });
    }

    // Modify caseDetail to include party IDs
    const caseWithPartyIDs = {
      ...caseDetail.toObject(), // Convert caseDetail to plain JavaScript object
      Party: caseDetail.Party.map(party => ({
        ...party.toObject(), // Convert party to plain JavaScript object
        _id: party._id // Include party ID
      }))
    };

    // Return success response with modified case details
    return res.status(200).json({
      success: true,
      caseDetail: caseWithPartyIDs,
      message: "Case details retrieved successfully",
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Couldn't receive the case details",
    })
  }
};

exports.judgeParty = async (req,res) => {
  try {
    // Extract case ID from request parameters
    const { partyID } = req.body;

    // Check if caseID is provided
    if (!partyID) {
      return res.status(400).json({ success: false, message: "Case ID is required" });
    }

    // Find the party details and populate documents
    const partyDetail = await Party.findById(partyID).populate("lawyer").populate("client").populate({
      path: 'documents',
      populate: {
        path: 'uploadedBY',
        model: 'Profile',
        select: 'firstName lastName',
      }
    });

    // Check if case exists
    const caseData = await Case.findOne({Party:partyID}).populate({path:"judge",model:'Profile', select:'firstName lastName'},);

    // Return success response with modified case details
    return res.status(200).json({
      success: true,
      caseData,
      partyDetail,
      message: "Case details retrieved successfully",
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Couldn't receive the case details",
    })
  }
}; 