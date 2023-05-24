import React, {useEffect, useState} from "react";
import Constants from "./util/constants";
import baseApiURL = Constants.baseApiURL;
import {getAuthorizationBearer} from "./util/utilities";
import {TypedJSON} from "typedjson";
import {MyUserInfo} from "./data/ApiModels";

const MyUser = () => {
    const [myUserInfo, setMyUserInfo] = useState<MyUserInfo>();
    const [error, setError] = useState("");

    async function queryGetUser() {
        const headers = new Headers();
        headers.append("Authorization", getAuthorizationBearer());
        const response = await fetch(`${baseApiURL}/user/me`, {
            method: "GET",
            headers: headers
        });
        if (response.status === 401) {
            return null;
        }
        const json = await response.json();
        if (response.ok) {
            const object = new TypedJSON(MyUserInfo).parse(json["result"]);
            // @ts-ignore
            setMyUserInfo(object);
        } else {
            console.error(json["error"]);
            setError(json["error"]);
        }
    }

    const getUser = async () => {
        await queryGetUser();
    }

    useEffect(() => {
        getUser();
    }, []);

    return (
        <div>
            {
                myUserInfo == null
                    ? <></>
                    : (
                        <div>
                            <h3>Добро пожаловать на страницу "{myUserInfo.username}"!</h3>
                            <p>Ваши роли: {myUserInfo.myRoles?.map(r => r.userName).join(", ") ?? "нет ролей"}.</p>
                        </div>
                    )
            }
            {
                error.length > 0
                    ? <h4>{error}</h4>
                    : <></>
            }
        </div>
    )
};

export default MyUser;