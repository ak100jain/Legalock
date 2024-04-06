const mongoose = require("mongoose");

const caseSchema = new mongoose.Schema({
	title: { 
        type: String ,
    },
	caseDescription: { 
        type: String,
     },
	 caseNo:{
		type : String,
		required : true,
	 },
	judge: {
		type: mongoose.Schema.Types.ObjectId,
		required: true,
		ref: "Profile",
	},
    Party:[
		{
			type: mongoose.Schema.Types.ObjectId,
			required: true,
			ref: "Party",
		}
	],
	status: {
        type: Boolean,
        default: true, 
    },
	terminate: {
		type: Boolean,
		default: false
	},
	createdAt: {
		type:Date,
		default:Date.now
	},
});


module.exports = mongoose.model("Case", caseSchema);