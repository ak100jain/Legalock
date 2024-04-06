const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
	{
		firstName: {
			type: String,
			required: true,
			trim: true,
		},
		lastName: {
			type: String,
			trim: true,
		},
		email: {
			type: String,
			required: true,
			trim: true,
		},
		password: {
			type: String,
			required: true,
		},
		role: {
			type: String,
			enum: ["Admin", "Judge", "Lawyer","Client"],
			required: true,
		},
		profile : {
			type: mongoose.Schema.Types.ObjectId,
			required: true,
			ref: "Profile",
		},
        contact : {
            type : String,
        },
		token: {
			type: String,
		},
		cases: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: "Case",
			},
		],
        aadharNo: {
            type : String,
            required: true,
        },
	},
	{ timestamps: true }
);

module.exports = mongoose.model("User", userSchema);