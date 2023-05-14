import React, {Fragment, useEffect, useState} from "react";
import classes from "./all.module.css";
import {AES} from "./aes";

const baseURL = "http://localhost:8080/api"

async function queryGetKey() {
    return fetch(`${baseURL}/aes/key`, {
        method: "GET"
    }).then(data => data.text());
}

async function queryPostText(text: string, toEncode: boolean = false) {
    const headers = new Headers();
    headers.append("Content-Type", "application/json");
    return fetch(`${baseURL}/aes/text`, {
        method: "POST",
        headers: headers,
        body: JSON.stringify({
            'textMessage': text,
            'toEncode': toEncode
        })
    })
        .then(response => response.text())
}

function Home() {
    const [key, setKey] = useState('');
    const [message, setMessage] = useState('');

    const getKey = async () => {
        try {
            const key = await queryGetKey();
            console.log(key);
            setKey(key)
        } catch (err) {
            if (err instanceof Error) {
                console.error(err.message);
            }
        }
    }

    const onSubmitForm = async (e: { preventDefault: () => void; }) => {
        e.preventDefault();
        try {
            const aes = new AES(key);
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
            const aes = new AES(key);
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

    useEffect(() => {
        getKey();
    }, []);

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