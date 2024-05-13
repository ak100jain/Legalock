const mongoose = require("mongoose");

const tokenSchema = new mongoose.Schema(
	{
        token: {
          type: String,
          required: true,
          unique: true
        },
        expirationTime: {
          type: Date,
          index: { expires: '24h' } // TTL index for automatic deletion
        }
      },
);


module.exports = mongoose.model("InvalidTokens", tokenSchema);