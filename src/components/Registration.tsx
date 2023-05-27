import React, {useState} from "react";
import Constants from "./util/constants";
import baseApiURL = Constants.baseApiURL;
import {NavLink, useNavigate} from "react-router-dom";
import classes from "./all.module.css";


async function queryPostRegistration(username: string, password: string) {
    const headers = new Headers();
    headers.append("Content-Type", "application/json");
    const response = await fetch(`${baseApiURL}/auth/register`, {
        method: "POST",
        headers: headers,
        body: JSON.stringify({
            username,
            password
        })
    });
    if (response.status === 401) {
        return false;
    }
    const json = await response.json();
    if (response.ok && json["result"] != null) {
        return true;
    } else {
        console.error(json["error"]);
        return false;
    }
}


const Registration = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [passwordConfirm, setPasswordConfirm] = useState("");
    const [tooltip, setTooltip] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (e: { preventDefault: () => void; }) => {
        e.preventDefault()
        if (password !== passwordConfirm) {
            setTooltip("Пароли не совпадают!")
            return;
        }
        const auth = await queryPostRegistration(username, password);
        if (auth) {
            navigate("/login");
        } else {
            setTooltip("Ошибка! Попробуйте ещё раз!")
        }
    };

    return (
        <div>
            <h3 className="text-center mt-5">Зарегистрироваться в системе</h3>
            <form className="d-flex mt-5" onSubmit={handleSubmit}>
                <label style={{paddingRight: "5px"}}>Логин</label>
                <input
                    type="text"
                    name="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />
                <br/>
                <label style={{paddingRight: "5px"}}>Пароль</label>
                <input
                    type="password"
                    name="Password"
                    onChange={(e) => setPassword(e.target.value)}
                />
                <br/>
                <label style={{paddingRight: "5px"}}>Подтверждение пароля</label>
                <input
                    type="password"
                    name="PasswordConfirm"
                    onChange={(e) => setPasswordConfirm(e.target.value)}
                />
                <br/>
                <button className="btn btn-success">Отправить</button>
            </form>
            <p>{tooltip}</p>
            <NavLink className={`nav-link ${classes.par} ${classes.links}`} to="/login">
                Перейти к авторизации
            </NavLink>
        </div>
    )
};

export default Registration;