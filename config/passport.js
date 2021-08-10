const GoogleStrategy = require("passport-google-oauth20");
const mongoose = require("mongoose");
const User = require("../models/User");

module.exports = function (passport) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT,
        clientSecret: process.env.GOOGLE_SECRET,
        callbackURL: "http://localhost:3000/auth/google/callback",
      },
      async (accessToken, refreshToken, profile, done) => {
        console.log(profile);
        //Build the user data
        const userDetails = {
          googleId: profile.id,
          displayName: profile.displayName,
          firstName: profile.name.givenName,
          lastName: profile.name.familyName,
          profileImage: profile.photos[0].value,
        };
        try{
            //check if user exists
            let user = await User.findOne({ googleId: profile.id });
            if (user) {
                done(null, user);
            }else{
              //if not create that user
              done(null,user)
              user = await User.create(userDetails)
            }
        }catch(err){
            console.log(err)
        }
      }
    )
  )

  passport.serializeUser((user, done) => {
    done(null, user.id);
  })

  passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) => done(err, user));
  })
};
