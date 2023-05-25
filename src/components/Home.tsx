import React, {Fragment, useState} from "react";
import classes from "./all.module.css";
import {AES} from "./aes";
import Constants from "./util/constants";
import baseApiURL = Constants.baseApiURL;
import {getAuthorizationBearer, getUserKey} from "./util/utilities";

async function queryPostText(text: string, toEncode: boolean = false) {
    const headers = new Headers();
    headers.append("Content-Type", "application/json");
    headers.append("Authorization", getAuthorizationBearer());
    return fetch(`${baseApiURL}/aes/text`, {
        method: "POST",
        headers: headers,
        body: JSON.stringify({
            'text': text,
            'toEncode': toEncode
        })
    })
        .then(response => response.json())
        .then(json => json["result"]["text"]);
}

function Home() {
    const [message, setMessage] = useState('');

    const onSubmitForm = async (e: { preventDefault: () => void; }) => {
        e.preventDefault();
        try {
            const aes = new AES(getUserKey() || "");
            const encryptedMsg = aes.encrypt(message);
            const text = await queryPostText(encryptedMsg, false);
            console.log(text);
            alert(text);
        } catch (err) {
            if (err instanceof Error) {
                console.error(err.message);
            }
        }
    };

    const onSubmitFormDec = async (e: { preventDefault: () => void; }) => {
        e.preventDefault();
        try {
            const aes = new AES(getUserKey() || "");
            const encryptedMsg = await queryPostText(message, true);
            const msg = aes.decrypt(encryptedMsg);
            console.log(msg);
            alert(msg);
        } catch (err) {
            if (err instanceof Error) {
                console.error(err.message);
            }
        }
    };

    return (
        <Fragment>
            <h3 className="text-center mt-5">Отправить зашифрованное сообщение</h3>
            <form className="d-flex mt-5" onSubmit={onSubmitForm}>
                <label htmlFor={"scenario"}>Сообщение</label>
                <br/>
                <input
                    type="text"
                    className={`form-control ${classes.inp}`}
                    name="message"
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                />
                <br/>
                <button className="btn btn-success">Отправить</button>
            </form>
            <form className="d-flex mt-5" onSubmit={onSubmitFormDec}>
                <button className="btn btn-success">Отправить на шифровку</button>
            </form>
        </Fragment>
    );
}

export default Home;