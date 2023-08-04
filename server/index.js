const express = require('express')
const app = express()
const port = 3000
const passport = require("./auth/passport")
const { bucket, user } = require("./auth/firebase")

//helper functions
const uniqid = require('uniqid');
const { uploadImage, getCurrentTimeAndDate, uploadImageDataInFirebase, deletePost } = require("./helperFunction")

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

//function for authorization
const isLoggedIn = (req, res, next) => {
    if (req.path === "/auth/google" || req.path === "/auth/google/callback") {
        next();
    } else if (req.user) {
        next();
    } else {
        res.sendStatus(401)
    }
}
app.use(isLoggedIn)

app.get('/', (req, res) => {
    console.log(req.user);
    if (req.user) {
        res.status(200).json({
            error: false,
            message: "authorized",
            user: req.user
        });
    } else {
        res.status(401).json({
            error: true,
            message: "unauthorized"
        });
    }
})

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


//post handeling
app.post("/addPost", async (req, res) => {
    bucket.upload(req.data.img)
})

//adding the post with image.
app.get("/addpost", async (req, res) => {
    const { name, id } = req.user
    const uniqueId = uniqid(`${name}-`)
    const URL = await uploadImage("./img/one.png", uniqueId)
    const addpost = {
        id: uniqueId,
        title: "hello worls and every one",
        image: URL,
        dateAndTime: getCurrentTimeAndDate(),

    }
    const response = await uploadImageDataInFirebase(addpost, id)
    res.send(response)
})

//delete the post
app.get("/deletePost", async (req, res) => {
    const { id } = req.user
    const response = await deletePost(id, "Solution Empire-aydypb44clkv28wpz")
    res.send(response)

})

//geting the all the post to show on the home page
app.get("/getPosts", async (req, res) => {
    try {
        const userData = await user.get();
        const promises = userData.docs.map(async (doc) => {
            const postData = await user.doc(doc.id).collection("posts").get();
            const postDataResult = postData.docs.map((postdoc) => {
                return { id: postdoc.id, ...postdoc.data() };
            });
            return postDataResult;
        });

        const posts = await Promise.all(promises);

        res.status(200).json(posts);
    } catch (error) {
        console.error("Error getting posts:", error);
        res.status(500).json({ error: "Failed to get posts." });
    }
});

//route to get the only specifc user posts
app.get("/singleUserPost", async (req, res) => {
    try {
        const response = await user.doc(req.user.id).collection("posts").get();
        const data = response.docs.map((doc) => {
            return { id: doc.id, ...doc.data() };
        });
        res.status(200).json(data);
    } catch (error) {
        console.error("Can't find the post, try again.");
        res.status(500).json({ error: "Failed to get the post, try again." });
    }
});



app.listen(port, () => console.log(` app listening on port ${process.env.PORT || port}!`))