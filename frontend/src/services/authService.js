import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../auth/firebase.js";

export async function authenticate(email, password, isRegister = false) {
    const result = isRegister
        ? await createUserWithEmailAndPassword(auth, email, password)
        : await signInWithEmailAndPassword(auth, email, password);

    const token = await result.user.getIdToken();
    // Geçici olarak ekledik. SONRA SİL
    console.log("Token:", token);
    return { token, user: result.user };
}
