const mongoose = require("mongoose");


const docSchema = new mongoose.Schema({
    fileName: {
        type: String,
        required: true,
    },
    fileType: {
        type: String,
        required: true,
    },
    url: {
        type: String,
        required: true,
    },
    uploadedBY: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "Profile",
    },
    uploadedAt: {
        type: Date,
        default: Date.now
    },
	lawyerNote: {
        type: String,
    },
    judgeComment: {
        type: String,
    }
});


module.exports = mongoose.model("LegalDoc", docSchema);