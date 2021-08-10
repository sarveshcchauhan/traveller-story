const express = require("express")
const passport = require('passport')
const router = express.Router()


//@des  auth using google
//@route Get /
router.get("/google", passport.authenticate("google", { scope: ["profile"] }));

//@des  google auth callback
//@route Get /aut/google/callback
router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/" }),
  (req, res) =>  res.redirect("/dashboard") 
);

//@des  google auth callback
//@route Get /aut/google/callback
router.get('/logout', (req,res) => {
    req.logout()
    res.redirect("/")
})

module.exports = router;
