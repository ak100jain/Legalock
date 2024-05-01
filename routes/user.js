const express = require("express")
const router = express.Router()

const { 
    newAccount,
    deleteAccount,
    updatePassword,
    
} = require("../controllers/Account");

const  {auth,
isAdmin,isClient,isAdminLoggedIn} = require("../middlewares/auth");

const {login,logout} = require("../controllers/Auth");

router.post("/login",login);
router.post("/newaccount",isAdminLoggedIn,auth,isAdmin,newAccount);
router.post("/deleteAccount",isAdminLoggedIn,auth,isAdmin,deleteAccount);
router.put("/updatePassword",auth, isAdmin,updatePassword);
router.post("/logout",auth,logout);

module.exports = router;