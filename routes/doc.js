const express = require("express")
const router = express.Router()

const {
    uploadRecord,
    deleteRecord
} = require("../controllers/Doc");

const  {auth, isLawyer} = require("../middlewares/auth");

router.post("/newRecord",auth,isLawyer,uploadRecord);
//router.delete("/deleteParty",auth,isAdmin,deleteParty);
router.delete("/deleteRecord",auth,isLawyer,deleteRecord);

module.exports = router;