import React, {useEffect, useState} from "react";
import {NavLink} from "react-router-dom";
import Constants from "./util/constants";
import baseApiURL = Constants.baseApiURL;
import classes from "./all.module.css";


async function queryGetUserList() {
    const response = await fetch(`${baseApiURL}/user/all`);
    if (response.status === 401) {
        return null;
    }
    const json = await response.json();
    if (response.ok) {
        return json["result"]["users"];
    } else {
        console.error(json["error"]);
        return null;
    }
}


const Users = () => {
    const [users, setUsers] = useState([]);

    const getUsers = async () => {
        const users = await queryGetUserList();
        setUsers(users);
    }

    useEffect(() => {
        getUsers();
    }, []);

    return (
        <div>
            <h3 className="text-center mt-5">Все пользователи</h3>
            {
                users.length === 0
                    ? <h4>Нету пользователей!</h4>
                    : users.map(u => {
                        return <div className="mt-2 card bg-light justify-content-center align-items-center" style={{backgroundColor: "#295a4e", borderRadius: "10px"}}>
                            <h2>Ник: {u["username"]}</h2>
                            <NavLink className={`nav-link ${classes.par} ${classes.links}`} to={`/user/${u["id"]}`}>
                                Подробнее
                            </NavLink>
                        </div>
                    })
            }
        </div>
    )
};

export default Users;