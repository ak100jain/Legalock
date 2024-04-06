const express = require("express")
const router = express.Router()

const {
    newAccount,
    deleteAccount
} = require("../controllers/Account");

const  {auth,
isAdmin} = require("../middlewares/auth");

const {login} = require("../controllers/Auth");

router.post("/login",login);
router.post("/newaccount",auth,isAdmin,newAccount);
router.delete("/deleteAccount",auth,isAdmin,deleteAccount);

module.exports = router;