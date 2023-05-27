import React, {useEffect, useState} from "react";
import Constants from "./util/constants";
import baseApiURL = Constants.baseApiURL;
import {getAuthorizationBearer, getUserKey} from "./util/utilities";
import DynamicSelect from "./util/DynamicSelect";
import {TypedJSON} from "typedjson";
import {DocumentInfoShort, DocumentPassword, Role} from "./data/ApiModels";
import {AES} from "./aes";


const PasswordDocument = () => {
    const [password, setPassword] = useState("");
    const [documentId, setDocumentId] = useState(0);
    const [documents, setDocuments] = useState<Array<DocumentInfoShort>>([]);
    const [tooltip, setTooltip] = useState("");

    async function queryGetAllDocuments() {
        const headers = new Headers();
        headers.append("Authorization", getAuthorizationBearer());
        const response = await fetch(`${baseApiURL}/document/all`, {
            method: "GET",
            headers: headers
        });
        if (response.status === 401) {
            return null;
        }
        const json = await response.json();
        if (response.ok) {
            const object: Array<DocumentInfoShort> = json["result"]["documents"].map((d: any) => new TypedJSON(DocumentInfoShort).parse(d));
            setDocuments(object);
            setDocumentId(object[0].id);
            return null;
        } else {
            console.error(json["error"]);
            return json["error"];
        }
    }

    async function queryPostCheckDocumentPassword(documentPassword: DocumentPassword) {
        const cipher = new AES(getUserKey() ?? "");
        documentPassword.password = cipher.encrypt(documentPassword.password);
        const headers = new Headers();
        headers.append("Content-Type", "application/json");
        headers.append("Authorization", getAuthorizationBearer());
        const response = await fetch(`${baseApiURL}/document/checkPassword`, {
            method: "POST",
            headers: headers,
            body: new TypedJSON(DocumentPassword).stringify(documentPassword)
        });
        if (response.status === 401) {
            return null;
        }
        const json = await response.json();
        if (response.ok) {
            const object = new TypedJSON(Role).parse(json["result"]["role"]);
            return object == null ? null : object;
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
        docPass.documentId = parseInt(String(documentId));
        docPass.roleId = null;

        const result = await queryPostCheckDocumentPassword(docPass);
        if (result instanceof Role) {
            setTooltip(`Доступ к документу "${documents.find(d => d.id === docPass.documentId)?.name ?? "undefined"}" получен с ролью "${result.userName}"!`);
            setPassword("");
        } else {
            if (result !== null)
                setTooltip(result);
        }
    };

    useEffect(() => {
        queryGetAllDocuments();
    }, []);

    return (
        <div>
            <h3 className="text-center mt-5">Получить доступ для документа по паролю</h3>
            <form className="d-flex mt-5" onSubmit={handleSubmit}>
                <label>Документ: <DynamicSelect
                    name={"documentSelect"}
                    value={documentId}
                    arrayOfData={documents}
                    onSelectChange={(value: number) => setDocumentId(value)}
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
                <button className="btn btn-success">Задать</button>
            </form>
            <p>{tooltip}</p>
        </div>
    )
};

export default PasswordDocument;