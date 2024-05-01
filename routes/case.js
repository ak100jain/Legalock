const express = require("express")
const router = express.Router()

const {
    newCase, deleteCase,getCases, CaseDetail, judgeCaseDetail,
    judgeParty
} = require("../controllers/Case");

const  {auth, isAdmin,isAdminLoggedIn, isJudge} = require("../middlewares/auth");

router.post("/newCase",auth,isAdmin,isAdminLoggedIn,newCase);
router.delete("/deleteCase",auth,isAdmin,isAdminLoggedIn,deleteCase);

router.post("/getCases",auth,getCases);
router.post("/judgeCaseDetail",auth,isJudge,judgeCaseDetail);
router.post("/caseDetail",auth,CaseDetail);
router.post("/partyDetail",auth,isJudge,judgeParty);

module.exports = router;