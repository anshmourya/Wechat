require('dotenv').config()
const passport = require('passport')
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const user = require("./firebase")
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLENT_KEY,
    clientSecret: process.env.GOOGLE_SECRET_KEY,
    callbackURL: "/auth/google/callback"
}, async (accessToken, refreshToken, profile, cb) => {
    const newUser = {
        id: profile.id,
        name: profile.displayName,
        email: profile.emails[0].value,
        image: profile._json.picture
    }
    const userRef = user.doc(profile.id)
    try {
        const response = await userRef.get()
        if (response.data()) {
            cb(null, newUser)
        } else {
            const response = await user.doc(profile.id).set(newUser)
            console.log(response);
            cb(null, newUser)
        }
    } catch (error) {
        console.error(error);
        cb(error, null)
    }

}))

passport.serializeUser((user, cb) => {
    console.log("serializeUser", user.id);
    cb(null, user.id);
});

passport.deserializeUser(async (id, cb) => {
    console.log("deserializeUser", id);
    try {
        const userRef = user.doc(id);
        const response = await userRef.get();
        if (response.exists) {
            const userData = response.data();
            cb(null, userData);
        } else {
            cb(new Error("User not found"), null);
        }
    } catch (error) {
        console.error(error);
        cb(error, null);
    }
});

module.exports = passport;