import AuthForm from "../auth/AuthForm";
import { authenticate } from "../services/authService";
import { fetchUserData } from "../services/userService";
import { useNavigate } from "react-router-dom";

export default function RegisterPage({ onUserFetched }) {
    const navigate = useNavigate();
    const handleRegister = async (email, password) => {
        const { token } = await authenticate(email, password, true);
        const user = await fetchUserData(token);
        onUserFetched(user);
        navigate("/me");
    };

    return <AuthForm isRegister={true} onSubmit={handleRegister} />;
}
