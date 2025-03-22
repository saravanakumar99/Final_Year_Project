// firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";
// Your Firebase configuration (Find this in Firebase Console -> Project Settings)
const firebaseConfig = {
    apiKey: "AIzaSyBG1wKbpC9zujEXfyfMKCkAUe4Ney1Jkyk",
    authDomain: "dev-together-91ead.firebaseapp.com",
    projectId: "dev-together-91ead",
    storageBucket: "dev-together-91ead.appspot.com",
    messagingSenderId: "133339109178",
    appId: "1:133339109178:web:1271789301fee9a7e66203",
    measurementId: "G-LH9PTX3X65"
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
const analytics = getAnalytics(app);
// Google Sign-In Function
const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, provider);
    console.log("User Info:", result.user);
    return result.user;
  } catch (error) {
    if (error.code === "auth/cancelled-popup-request" || error.code === "auth/popup-closed-by-user") {
      console.warn("Popup was closed before authentication could complete.");
    } else {
      console.error("Google Login Error:", error.message);
      toast.error(`Login failed: ${error.message}`);
    }
    return null;
  }
};


// Logout Function
const logOut = async () => {
  try {
    await signOut(auth);
    console.log("User signed out");
  } catch (error) {
    console.error(error.message);
  }
};

export { auth, signInWithGoogle, logOut };
