import AuthForm from "../auth/AuthForm";
import { authenticate } from "../services/authService";
import { fetchUserData } from "../services/userService";
import { useNavigate } from "react-router-dom";

export default function LoginPage({ onUserFetched }) {
    const navigate = useNavigate();

    const handleLogin = async (email, password) => {
        const { token } = await authenticate(email, password, false);
        const user = await fetchUserData(token);
        onUserFetched(user);
        navigate("/me");
    };

    return <AuthForm isRegister={false} onSubmit={handleLogin} />;
}
