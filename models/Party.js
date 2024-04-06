const mongoose = require("mongoose");


const PartySchema = new mongoose.Schema({
    lawyer: [
        {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: "Profile",
        }
    ],
    client: [
        {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: "Profile",
        }
    ],
	documents: [
		{
			type: mongoose.Schema.Types.ObjectId,
			required: true,
			ref: "LegalDoc",
		},
	],
});


module.exports = mongoose.model("Party", PartySchema);