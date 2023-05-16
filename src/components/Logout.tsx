import React from "react";
import {useNavigate} from "react-router-dom";

const Logout = () => {
    const navigate = useNavigate();

    const handleSubmit = async (e: { preventDefault: () => void; }) => {
        e.preventDefault()
        localStorage.clear();
        navigate("/login");
    };

    return (
        <div>
            <h3 className="text-center mt-5">Выйти из системы</h3>
            <button className="btn btn-success" onClick={handleSubmit}>Выйти</button>
        </div>
    )
};

export default Logout;