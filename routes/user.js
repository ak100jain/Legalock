const express = require("express")
const router = express.Router()

const {
    newAccount,
    deleteAccount,
    updatePassword
} = require("../controllers/Account");

const  {auth,
isAdmin} = require("../middlewares/auth");

const {login} = require("../controllers/Auth");

router.post("/login",login);
router.post("/newaccount",auth,isAdmin,newAccount);
router.delete("/deleteAccount",auth,isAdmin,deleteAccount);
router.put("/updatePassword",auth, isAdmin,updatePassword);

module.exports = router;