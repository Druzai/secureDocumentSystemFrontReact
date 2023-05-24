import React, {useEffect, useState} from "react";
import {NavLink} from "react-router-dom";
import classes from "./all.module.css";
import Constants from "./util/constants";
import {TypedJSON} from "typedjson";
import {DocumentInfo} from "./data/ApiModels";
import baseApiURL = Constants.baseApiURL;
import {getAuthorizationBearer} from "./util/utilities";


async function queryGetDocumentList() {
    const headers = new Headers();
    headers.append("Authorization", getAuthorizationBearer());
    const response = await fetch(`${baseApiURL}/document/allByUser`, {
        method: "GET",
        headers: headers
    });
    if (response.status === 401) {
        return null;
    }
    const json = await response.json();
    if (response.ok) {
        let object = json["result"]["documents"].map((d: object) => new TypedJSON(DocumentInfo).parse(d))
        return object;
    } else {
        console.error(json["error"]);
        return null;
    }
}


const Documents = () => {
    const [documents, setDocuments] = useState<Array<DocumentInfo>>([]);

    const getDocuments = async () => {
        const documents = await queryGetDocumentList();
        setDocuments(documents);
    }

    useEffect(() => {
        getDocuments();
    }, []);

    return (
        <div>
            <h3 className="text-center mt-5">Все документы</h3>
            {
                documents.length === 0
                    ? <h4>Нету документов!</h4>
                    : documents.map(d => {
                        return <div className="mt-2 card bg-light justify-content-center align-items-center">
                            <h2>Название: {d.name}</h2>
                            <h3>Автор: {d.owner?.username ?? "unknown"}</h3>
                            <NavLink className={`nav-link ${classes.par} ${classes.links}`} to={`/document/${d.id}`}>
                                Подробнее
                            </NavLink>
                        </div>
                    })
            }
        </div>
    )
};

export default Documents;