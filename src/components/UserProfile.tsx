import React, {useEffect, useState} from "react";
import Constants from "./util/constants";
import baseApiURL = Constants.baseApiURL;
import {getAuthorizationBearer} from "./util/utilities";
import {TypedJSON} from "typedjson";
import DynamicSelect from "./util/DynamicSelect";
import {UserInfo} from "./data/ApiModels";

const UserProfile = (props: { userId: string; }) => {
    const [userInfo, setUserInfo] = useState<UserInfo>();
    const [error, setError] = useState("");
    const [documentId, setDocumentId] = useState(0);
    const [tooltip, setTooltip] = useState("");
    const [roleId, setRoleId] = useState(0);

    async function queryPostUserRight(documentId: number, roleId: number, userId: number) {
        const headers = new Headers();
        headers.append("Content-Type", "application/json");
        headers.append("Authorization", getAuthorizationBearer());
        const response = await fetch(`${baseApiURL}/user/changeRights`, {
            method: "POST",
            headers: headers,
            body: JSON.stringify({
                documentId,
                roleId,
                userId
            })
        });
        if (response.status === 401) {
            return null;
        }
        const json = await response.json();
        if (response.ok && json["result"]) {
            setTooltip("Роль успешно изменена!")
        } else {
            console.error(json["error"]);
            setError(json["error"]);
        }
    }

    async function queryGetUser(userId: string) {
        const headers = new Headers();
        headers.append("Authorization", getAuthorizationBearer());
        const response = await fetch(`${baseApiURL}/user/${userId}`, {
            method: "GET",
            headers: headers
        });
        if (response.status === 401) {
            return null;
        }
        const json = await response.json();
        if (response.ok) {
            const object = new TypedJSON(UserInfo).parse(json["result"]);
            // @ts-ignore
            setUserInfo(object);
            setRoleId(object?.allRoles?.at(0)?.id || 0)
            setDocumentId(object?.documents?.at(0)?.id || 0)
        } else {
            console.error(json["error"]);
            setError(json["error"]);
        }
    }

    const getUser = async () => {
        await queryGetUser(props.userId);
    }

    useEffect(() => {
        getUser();
    }, []);

    const handleSubmit = async (e: { preventDefault: () => void; }) => {
        e.preventDefault()
        await queryPostUserRight(parseInt(String(documentId)), parseInt(String(roleId)), parseInt(props.userId));
    };

    return (
        <div>
            {
                userInfo === undefined
                    ? <></>
                    : (
                        userInfo.me
                            ? <h3 className="text-center mt-5">Добро пожаловать на вашу страницу</h3>
                            : <h3>Добро пожаловать на страницу "{userInfo.username}"</h3>

                    )
            }
            {
                userInfo !== undefined && userInfo.documents !== null && userInfo.documents.length !== 0 && !userInfo.me
                    ? <form className="d-flex mt-5" onSubmit={handleSubmit}>
                        <label>Документ: <DynamicSelect
                                name={"documentSelect"}
                                value={documentId}
                                arrayOfData={userInfo.documents}
                                onSelectChange={(value: number) => setDocumentId(value)}
                                disabled={false}
                            />
                        </label>
                        <br/>
                        <label>Роль: <DynamicSelect
                                name={"roleSelect"}
                                value={roleId}
                                arrayOfData={userInfo.allRoles?.map(r => {
                                    return {
                                        id: r.id,
                                        name: r.userName
                                   };
                                })}
                                onSelectChange={(value: number) => setRoleId(value)}
                                disabled={false}
                            />
                        </label>
                        <br/>
                        <button className="btn btn-success">Добавить/изменить роль у данного пользователя для документа
                        </button>
                    </form>
                    : <></>
            }
            <p>{tooltip}</p>
            {
                error.length > 0
                    ? <h4>{error}</h4>
                    : <></>
            }
        </div>
    )
};

export default UserProfile;