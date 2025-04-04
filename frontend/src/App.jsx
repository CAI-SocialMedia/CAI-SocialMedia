import { useState } from "react";
import AuthForm from "./auth/AuthForm";
import UserInfo from "./auth/UserInfo.jsx";

function App() {
    const [userData, setUserData] = useState(null);

    return (
        <div>
            {!userData ? <AuthForm onUserFetched={setUserData} /> : <UserInfo user={userData} />}
        </div>
    );
}

export default App;
