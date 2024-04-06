const mongoose = require("mongoose");

const profileSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        trim: true,
    },
    lastName: {
        type: String,
        trim: true,
    },
    profession: {
        type: String,
        trim: true,
    },
	dateOfBirth: {
        type: Date,
	},
    education: {
        type: String,
        trim: true,
    },
    experience: {
        type: String,
        trim: true,
    },
    achievement: {
        type: String,
        trim: true,
    },
    image: {
        type: String,
    }

});


module.exports = mongoose.model("Profile", profileSchema);
