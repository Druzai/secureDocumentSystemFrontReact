import React, {useState} from "react";
import {NavLink, useNavigate} from "react-router-dom";
import Constants from "./util/constants";
import baseApiURL = Constants.baseApiURL;
import {queryGetKey} from "./util/utilities";
import classes from "./all.module.css";
import {useDispatch} from "react-redux";
import allActions from "../actions";


async function queryPostSignIn(username: string, password: string) {
    const headers = new Headers();
    headers.append("Content-Type", "application/json");
    const response = await fetch(`${baseApiURL}/auth/signin`, {
        method: "POST",
        headers: headers,
        body: JSON.stringify({
            username,
            password
        })
    });
    if (response.status === 401) {
        return null;
    }
    const json = await response.json();
    if (response.ok) {
        localStorage.setItem("accessToken", json["result"]["accessToken"]);
        localStorage.setItem("refreshToken", json["result"]["refreshToken"]);
        return json["result"]["username"];
    } else {
        console.error(json["error"]);
        return null;
    }
}


const Login = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [tooltip, setTooltip] = useState("");
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const handleSubmit = async (e: { preventDefault: () => void; }) => {
        e.preventDefault()
        const name = await queryPostSignIn(username, password);
        if (name != null){
            dispatch(allActions.loginActions.setUser({username: name}));
            await queryGetKey();
            navigate("/");
        } else {
            dispatch(allActions.loginActions.logOut());
            // setUsername("");
            // setPassword("");
            setTooltip("Неравильные логин/пароль!")
        }
    };

    return (
        <div>
            <h3 className="text-center mt-5">Войти в систему</h3>
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
                <button className="btn btn-success">Отправить</button>
            </form>
            <p>{tooltip}</p>
            <NavLink className={`nav-link ${classes.par} ${classes.links}`} to="/registration">
                Перейти к регистрации
            </NavLink>
        </div>
    )
};

export default Login;