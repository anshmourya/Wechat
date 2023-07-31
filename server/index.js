const express = require('express')
const app = express()
const port = 3000
const passport = require("./auth/passport")
//cors setup
const cors = require('cors')
app.use(cors())

///session and passport setup setup
app.use(express.json())

const cookieSession = require('cookie-session')

app.use(cookieSession({
    name: 'auth-data',
    keys: [process.env.COOKIE_PRIVATE_KEY],

    // Cookie Options
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
}))
app.use(passport.initialize());
app.use(passport.session());



app.get('/', (req, res) => res.send(req.user || "no user"))

//handeling authentication
app.get('/auth/google',
    passport.authenticate('google', { scope: ['profile', 'email'] }));


app.get('/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/login' }),
    function (req, res) {
        // Successful authentication, redirect home.
        res.redirect('/');
    });

app.get("/logout", (req, res) => {
    req.logOut()
    res.send("logOut")
})


app.listen(port, () => console.log(` app listening on port ${process.env.PORT || port}!`))