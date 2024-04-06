const mongoose = require("mongoose");
const fs = require('fs');
const path = require("path");
const fileUpload = require('express-fileupload');
const LegalDoc = require("../models/LegalDoc");
const User = require("../models/user");
const Party = require("../models/Party");

//controller for uploading file
exports.uploadRecord = async (req, res) => {   
    try {
        const { partyID } = req.body;
        // console.log(req.body);
        if (!req.files || Object.keys(req.files).length === 0) {
            return res.status(400).send('No files were uploaded.');
        }
        // console.log(req.files);
        let uploadedFile = req.files.record; // Get the uploaded file
        //console.log(uploadedFile);

        //find if party exit or not
        const partyDetail = await Party.findById(partyID);
        //console.log(partyDetail);
        if (!partyDetail) {
            return res.status(404).json({
                success: false,
                message: "party not exist",
            })
        }
        // Extracting file name and extension
        let fileName = uploadedFile.name; // Original file name
        let fileExt = path.extname(fileName); // Extract file extension
        let fileBaseName = path.basename(fileName, fileExt); // Extract file name without extension

        // Constructing new file name
        let newFileName = fileBaseName + Date.now() + fileExt; // New file name with timestamp

        // Moving the file to the desired location with the new name
        uploadedFile.mv(path.join(__dirname, '../Records', newFileName), async (err) => {
            if (err) {
                return res.status(500).send(err);
            }

            try {
                // Get user profile
                const userDetail = await User.findOne({ email: req.user.email });
                if (!userDetail) {
                    return res.status(404).json({
                        success: false,
                        message: 'User not found',
                    });
                }

                // Create legal document entry in database
                const profile = userDetail.profile;
                const docDetail = await LegalDoc.create({
                    fileName: fileName,
                    fileType: fileExt,
                    url: path.join('../Records', newFileName),
                    uploadedBY: profile,
                });
                //console.log(docDetail);
                //push the new legal doc in party
                await Party.findByIdAndUpdate(partyID, { $push: { documents: docDetail._id } });
                res.status(200).json({
                    success: true,
                    message: 'File uploaded successfully',
                });
            } catch (error) {
                console.error(error);
                res.status(400).json({
                    success: false,
                    message: 'Error creating legal document entry',
                });
            }
        });
    } catch (error) {
        console.error(error);
        res.status(400).json({
            success: false,
            message: 'Error uploading record',
        });
    }
};

//controller for deleting the file or document
exports.deleteRecord = async (req, res) => {
    try {
        // Extract document and party IDs from request body
        const { docID, partyID } = req.body;

        // Check if required fields are provided
        if (!docID || !partyID) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        }

        // Convert document ID to ObjectId
        const docObjectId = new mongoose.Types.ObjectId(docID);

        // Find the document details
        const docDetail = await LegalDoc.findById(docObjectId);

        // Check if document exists
        if (!docDetail) {
            return res.status(404).json({ success: false, message: 'Document not found' });
        }

        // Get the file path from the document details
        const filePath = docDetail.url;
        //console.log(filePath);

        // Remove the document ID from the party's documents array
        await Party.findByIdAndUpdate(partyID, { $pull: { documents: docObjectId } });

        // Delete the document from the database
        await LegalDoc.findByIdAndDelete(docObjectId);

        // Delete the file from the server storage
        fs.unlink(filePath.slice(1), (err) => {
            if (err) {
                console.error(err); // Log the error
                // Return error response if file deletion fails
                return res.status(500).json({
                    success: false,
                    message: "Document couldn't be deleted from server storage",
                });
            }
            //console.log('File deleted successfully');
        });
        // Return success response after file deletion   
        return res.status(200).json({
            success: true,
            message: "Document and associated file deleted successfully",
        });

    } catch (error) {
        console.error(error);
        // Return error response if document deletion fails
        return res.status(500).json({
            success: false,
            message: "Document deletion failed. Please try again.",
        });
    }
};
