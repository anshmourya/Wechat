
const firebase = require("firebase-admin")
const config = {
    "type": "service_account",
    "project_id": process.env.PROJECT_ID,
    "private_key_id": process.env.FIREBASE_PRIVATE_KEY_ID,
    "private_key": process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    "client_email": process.env.FIREBASE_CLIENT_EMAIL,
    "client_id": process.env.FIREBASE_CLIENT_ID,
    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
    "token_uri": "https://oauth2.googleapis.com/token",
    "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
    "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-2chm2%40wechat-50daf.iam.gserviceaccount.com",
    "universe_domain": "googleapis.com"
}


firebase.initializeApp({
    credential: firebase.credential.cert(config),
    storageBucket: "gs://wechat-50daf.appspot.com"
})

const bucket = firebase.storage().bucket()

const db = firebase.firestore()

let user = db.collection("user")

module.exports = { user, bucket }

