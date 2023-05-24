import React, {useState} from "react";
import Constants from "./util/constants";
import baseApiURL = Constants.baseApiURL;
import {getAuthorizationBearer} from "./util/utilities";


async function queryPostCreateDocument(name: string) {
    const headers = new Headers();
    headers.append("Content-Type", "application/json");
    headers.append("Authorization", getAuthorizationBearer());
    const response = await fetch(`${baseApiURL}/document/new`, {
        method: "POST",
        headers: headers,
        body: JSON.stringify({
            name
        })
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


const NewDocument = () => {
    const [name, setName] = useState("");
    const [tooltip, setTooltip] = useState("");

    const handleSubmit = async (e: { preventDefault: () => void; }) => {
        e.preventDefault()
        if (name.trim().length === 0) {
            setTooltip("Имя документа не может быть пустым!");
            return;
        }

        const result = await queryPostCreateDocument(name);
        if (result == null) {
            setTooltip("Документ успешно создан!");
        } else {
            setTooltip(result);
        }
    };

    return (
        <div>
            <h3 className="text-center mt-5">Создание нового документа</h3>
            <form className="d-flex mt-5" onSubmit={handleSubmit}>
                <label>Название: </label>
                <input
                    type="text"
                    name="Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
                <br/>
                <button className="btn btn-success">Создать</button>
            </form>
            <p>{tooltip}</p>
        </div>
    )
};

export default NewDocument;