const { bucket, user } = require("./auth/firebase");

//get curent time and date
const getCurrentTimeAndDate = () => {
    const currentDateAndTime = new Date()
    const time = currentDateAndTime.getHours() + ":" + currentDateAndTime.getMinutes() + ":" + currentDateAndTime.getSeconds();
    const date = currentDateAndTime.getDate() + "-" + (currentDateAndTime.getMonth() + 1) + "-" + currentDateAndTime.getFullYear();
    return date + " " + time;
}

//function to upload the image image im the firebase and get the url 

const uploadImage = async (imgDestination, postFileName) => {
    const destination = postFileName + ".jpeg"
    console.log(destination);
    await bucket.upload(imgDestination, {
        destination: destination,
        contentType: "image/jpeg"
    });

    // Get the file object
    const [fileObject] = await bucket.file(destination).get();

    // Generate a signed URL for the file with a validity of 10 years (315360000 seconds)
    const signedUrl = await fileObject.getSignedUrl({
        action: 'read',
        expires: Date.now() + 315360000000,
    });

    return signedUrl[0]

}

//delete post from the database
const deletePost = async (userId, postId) => {
    console.log(userId, postId);
    try {
        const deleteResponse = await user.doc(userId).collection("posts").doc(postId).delete()
        const deleteImage = await bucket.file(`${postId}.jpeg`).delete()
        if (deleteResponse && deleteImage) {
            return {
                message: "Successfully deleted the post",
                postID: postId,
                userID: userId
            }
        }

    } catch (error) {
        console.error(error)
    }

}


//function to upload the image and related data to the firebase 
const uploadImageDataInFirebase = async (postData, id) => {
    const response = await user.doc(id).collection("posts").doc(postData.id.toString()).set(postData)
    return response;
}


module.exports = { uploadImage, uploadImageDataInFirebase, getCurrentTimeAndDate, deletePost }