const firebase = require("firebase-admin")
const config = require("./firebaseConfig.json")

firebase.initializeApp({
    credential: firebase.credential.cert(config)
})

const db = firebase.firestore()

let user = db.collection("user")

module.exports = user 