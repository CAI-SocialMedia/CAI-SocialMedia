import { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import UserInfo from "./pages/UserInfo.jsx";

function App() {
    const [userData, setUserData] = useState(null);

    if (userData) {
        return <UserInfo user={userData} />;
    }

    return (
        <Router>
            <Routes>
                <Route path="/login" element={<LoginPage onUserFetched={setUserData} />} />
                <Route path="/register" element={<RegisterPage onUserFetched={setUserData} />} />
                <Route path="/me" element={userData ? <UserInfo user={userData} /> : <Navigate to="/login" />} />
                <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
        </Router>
    );
}

export default App;
