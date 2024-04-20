const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const User = require("../models/user");
const bcrypt = require("bcryptjs");

dotenv.config();

// This function is used as middleware to authenticate user requests
exports.auth = async (req, res, next) => {
	try {
		// Extracting JWT from request cookies, body or header
		const token =req.query.token ||
			req.cookies.token ||
			req.body.token ||
			req.header("Authorization").replace("Bearer ", "");
			// console.log(token);
			// console.log("welcome sir");
		// If JWT is missing, return 401 Unauthorized response
		if (!token) {
			return res.status(401).json({ success: false, message: `Token Missing` });
		}

		try {
			// Verifying the JWT using the secret key stored in environment variables
			const decode = await jwt.verify(token, process.env.JWT_SECRET);
			// Storing the decoded JWT payload in the request object for further use
			req.user = decode;
			// console.log(req.user);
		} catch (error) {
			// If JWT verification fails, return 401 Unauthorized response
			console.error(error);
			return res
				.status(401)
				.json({ success: false, message: "token is invalid",token });
		}

		// If JWT is valid, move on to the next middleware or request handler
		next();
	} catch (error) {
		// If there is an error during the authentication process, return 401 Unauthorized response
		return res.status(401).json({
			success: false,
			message: `Something Went Wrong While Validating the Token`,
		});
	}
};

//middleware for client
exports.isClient = async (req, res, next) => {
	try {
		const userDetails = await User.findOne({ email: req.user.email });
		if (userDetails.role !== "Client") {
			return res.status(401).json({
				success: false,
				message: "This is a Protected Route for Clients",
			});
		}
		next();
	} catch (error) {
		return res
			.status(500)
			.json({ success: false, message: `User Role Can't be Verified` });
	}
};

//middlware for admin
exports.isAdmin = async (req, res, next) => {
	try {
		const userDetails = await User.findOne({ email: req.user.email });
		// console.log("we reached in admin middleware");
		if (userDetails.role !== "Admin") {
			console.log('we are in admin error');
			return res.status(401).json({
				success: false,
				message: "This is a Protected Route for Admin",
			});
		}
		next();
	} catch (error) {
		return res
			.status(500)
			.json({ success: false, message: `User Role Can't be Verified` });
	}
};

//middleware for judge
exports.isJudge = async (req, res, next) => {
	try {
		const userDetails = await User.findOne({ email: req.user.email });
		if (userDetails.role !== "Judge") {
			return res.status(401).json({
				success: false,
				message: "This is a Protected Route for Judge",
			});
		}
		next();
	} catch (error) {
		return res
			.status(500)
			.json({ success: false, message: `User Role Can't be Verified` });
	}
};

//middleware for lawyer
exports.isLawyer = async (req, res, next) => {
	try {
		const userDetails = await User.findOne({ email: req.user.email });
		//console.log(userDetails);

		//console.log(userDetails.accountType);

		if (userDetails.role !== "Lawyer") {
			return res.status(401).json({
				success: false,
				message: "This is a Protected Route for Lawyer",
			});
		}
		next();
	} catch (error) {
		return res
			.status(500)
			.json({ success: false, message: `User Role Can't be Verified` });
	}
};

