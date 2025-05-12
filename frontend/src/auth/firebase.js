import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyAHMbljcCsZPKNQBFhVTEeIn_Vvci8Eyd4",
    authDomain: "cai-socialmedia.firebaseapp.com",
    projectId: "cai-socialmedia",
    databaseURL: "https://cai-socialmedia-default-rtdb.europe-west1.firebasedatabase.app",
    storageBucket: "cai-socialmedia.firebasestorage.app",
    messagingSenderId: "237279331001",
    appId: "1:237279331001:web:34421de9402083f8ce1168",
    measurementId: "G-BFWWG8ZYKK"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Google Auth Provider'ı yapılandır
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
    prompt: 'select_account'
});

export { auth, googleProvider };
