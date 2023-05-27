import React, {useEffect, useRef, useState} from "react";
import Constants from "./util/constants";
import baseApiURL = Constants.baseApiURL;
import {getAuthorizationBearer, getUserKey} from "./util/utilities";
import DynamicSelect from "./util/DynamicSelect";
import {TypedJSON} from "typedjson";
import {DocumentIdEditor, DocumentInfo, DocumentInfoShort, DocumentPassword, Role} from "./data/ApiModels";
import {AES} from "./aes";


const DocumentSetPasswordId = (props: { documentId: string; }) => {
    const [password, setPassword] = useState("");
    const [roleId, setRoleId] = useState(0);
    const [roles, setRoles] = useState<Array<Role>>([]);
    const [tooltip, setTooltip] = useState("");

    const owner = useRef<Boolean>(null);
    const h3Welcome = useRef<HTMLHeadingElement>(null);
    // const documentName = useState<String>("");

    async function queryGetDocument(documentId: string) {
        const headers = new Headers();
        headers.append("Authorization", getAuthorizationBearer());
        const response = await fetch(`${baseApiURL}/document/${documentId}`, {
            method: "GET",
            headers: headers
        });
        if (response.status === 401) {
            return null;
        }
        const json = await response.json();
        if (response.ok) {
            let object = new TypedJSON(DocumentIdEditor).parse(json["result"]);
            // @ts-ignore
            owner.current = object?.owner ?? false;
            // @ts-ignore
            h3Welcome.current.textContent = `Создание пароля для документа "${object?.document?.name ?? "undefined"}"!`;
        } else {
            console.error(json["error"]);
        }
    }

    async function queryGetAllRoles() {
        const headers = new Headers();
        headers.append("Authorization", getAuthorizationBearer());
        const response = await fetch(`${baseApiURL}/user/roleRights`, {
            method: "GET",
            headers: headers
        });
        if (response.status === 401) {
            return null;
        }
        const json = await response.json();
        if (response.ok) {
            const object: Array<Role> = json["result"]["allRoles"].map((r: any) => new TypedJSON(Role).parse(r));
            setRoles(object);
            setRoleId(object[0].id);
            return null;
        } else {
            console.error(json["error"]);
            return json["error"];
        }
    }

    async function queryPostCreateDocumentPassword(documentPassword: DocumentPassword) {
        const cipher = new AES(getUserKey() ?? "");
        documentPassword.password = cipher.encrypt(documentPassword.password);
        const headers = new Headers();
        headers.append("Content-Type", "application/json");
        headers.append("Authorization", getAuthorizationBearer());
        const response = await fetch(`${baseApiURL}/document/setPassword`, {
            method: "POST",
            headers: headers,
            body: new TypedJSON(DocumentPassword).stringify(documentPassword)
        });
        if (response.status === 401) {
            return null;
        }
        const json = await response.json();
        if (response.ok) {
            return null;
        } else {
            console.error(json["error"]);
            return json["error"];
        }
    }

    const handleSubmit = async (e: { preventDefault: () => void; }) => {
        e.preventDefault()
        if (password.trim().length === 0) {
            setTooltip("Пароль документа не может быть пустым!");
            return;
        }
        let docPass = new DocumentPassword();
        docPass.password = password.trim();
        docPass.documentId = parseInt(props.documentId);
        docPass.roleId = parseInt(String(roleId));

        const result = await queryPostCreateDocumentPassword(docPass);
        if (result == null) {
            setTooltip("Пароль успешно создан!");
        } else {
            setTooltip(result);
        }
    };

    useEffect(() => {
        queryGetDocument(props.documentId);
        queryGetAllRoles();
    }, []);

    return (
        <div>
            <h3 ref={h3Welcome} className="text-center mt-5">Создание пароля для документа!</h3>
            <form className="d-flex mt-5" onSubmit={handleSubmit}>
                <label>Роль: <DynamicSelect
                    name={"roleSelect"}
                    value={roleId}
                    arrayOfData={roles.map(r => {
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
                <label>Пароль: </label>
                <input
                    type="text"
                    name="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <br/>
                <button className="btn btn-success">Создать</button>
            </form>
            <p>{tooltip}</p>
        </div>
    )
};

export default DocumentSetPasswordId;