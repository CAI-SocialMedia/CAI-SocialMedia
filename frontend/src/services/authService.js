import { signInWithEmailAndPassword, createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "../auth/firebase.js";

export async function authenticate(email, password, isRegister = false) {
    try {
        const userCredential = isRegister
            ? await createUserWithEmailAndPassword(auth, email, password)
            : await signInWithEmailAndPassword(auth, email, password);

        const token = await userCredential.user.getIdToken();
        // Geçici olarak ekledik. SONRA SİL
        console.log("Token:", token);
        return { token, user: userCredential.user };
    } catch (error) {
        console.error("Authentication error:", error);
        throw error;
    }
}

export async function authenticateWithGoogle() {
    try {
        const provider = new GoogleAuthProvider();
        const userCredential = await signInWithPopup(auth, provider);
        const token = await userCredential.user.getIdToken();
        return { token, user: userCredential.user };
    } catch (error) {
        console.error("Google authentication error:", error);
        throw error;
    }
}
