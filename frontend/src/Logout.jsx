import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

function Logout({ setUser }) {
    const navigate = useNavigate();

    useEffect(() => {
        setUser(null);
        localStorage.removeItem("user");
        navigate("/login");
    }, [setUser, navigate]);

    return null;
}

export default Logout;
