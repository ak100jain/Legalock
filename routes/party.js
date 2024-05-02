const express = require("express")
const router = express.Router()
 
const {
    createParty,
    deleteParty
} = require("../controllers/Party");

const  {auth, isAdmin,isAdminLoggedIn} = require("../middlewares/auth");

router.post("/newParty",auth,isAdmin,isAdminLoggedIn,createParty);
router.delete("/deleteParty",auth,isAdmin,isAdminLoggedIn,deleteParty);

module.exports = router;