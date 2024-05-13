const express = require("express")
const router = express.Router()
 
const {
    createParty,
    deleteParty
} = require("../controllers/Party");

const  {auth, isAdmin,isAdminLoggedIn} = require("../middlewares/auth");

router.post("/newParty",auth,isAdmin,createParty);
router.post("/deleteParty",auth,isAdmin,deleteParty);

module.exports = router;