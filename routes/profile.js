const express = require("express")
const router = express.Router()

const {
    newAccount,
    deleteAccount
} = require("../controllers/Account");

const  {auth} = require("../middlewares/auth");
const { getProfile } = require("../controllers/Profile");

router.post("/profile",auth,getProfile);

module.exports = router;