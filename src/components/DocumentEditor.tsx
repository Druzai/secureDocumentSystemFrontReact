import React, {useEffect, useRef, useState} from "react";
import Constants from "./util/constants";
import baseApiURL = Constants.baseApiURL;
import {
    getAuthorizationBearer,
    getDocumentKey,
    getUserKey,
    queryGetDocumentKey
} from "./util/utilities";
import {TypedJSON} from "typedjson";
import {DocumentIdEditor, ParagraphInfo, WSContent, WSMessage} from "./data/ApiModels";
import {AES} from "./aes";
// @ts-ignore
import Stomp from 'stompjs';
import DynamicSelect from "./util/DynamicSelect";
import {useSelector} from "react-redux";

function format(command: string, value: string | undefined = undefined) {
    document.execCommand(command, false, value);
}

function formatArray(item: HTMLDivElement | ParagraphInfo | any) {
    if (item instanceof ParagraphInfo) {
        return [item.content, item.align];
    } else {
        let arr = [item.textContent];
        if (item.attributes.align != null)
            arr.push(item.attributes.align.value);
        else
            arr.push(null);
        return arr;
    }
}

const DocumentEditor = (props: { documentId: string; }) => {
    const [documentIdEditor, setDocumentIdEditor] = useState<DocumentIdEditor>();
    const [documentParagraphs, setDocumentParagraphs] = useState<Array<ParagraphInfo>>([]);
    const [roleId, setRoleId] = useState(-1);
    const [error, setError] = useState("");
    const [lastEdited, setLastEdited] = useState<string | null>(null);

    const editor = useRef<HTMLDivElement>(null);
    const saving = useRef<HTMLSpanElement>(null);
    const stompClient = useRef<Stomp>(null);
    const contentsCopy = useRef<Array<Array<string>>>([])

    // @ts-ignore
    const currentLogin = useSelector(state => state.currentLogin);

    let delay = (function () {
        let timer = 0;
        return function (callback: () => void, ms: number | undefined) {
            clearTimeout(timer);
            // @ts-ignore
            timer = setTimeout(callback, ms);
        };
    })();

    function setUpStompClient() {
        let socket = new WebSocket(Constants.webSocketURL);
        let stompCl = Stomp.over(socket);
        const editorHtml = editor.current;
        stompCl.connect({}, function (frame: string) {
            console.log('Connected: ' + frame);
            stompCl.subscribe(Constants.webSocketTopicListen, function (message: { body: string; }) {
                if (!/\/document\/\d+/.test(document.location.pathname)){
                    editorHtml?.removeEventListener('input', eventListener);
                    stompCl.disconnect();
                    console.log("Disconnect client");
                    return;
                }

                let response = JSON.parse(message.body)
                console.log(response);
                const cipher = new AES(getDocumentKey() ?? "");
                const decodedFromUser = cipher.decrypt(response.fromUser);

                if (response.documentId === parseInt(props.documentId) && decodedFromUser !== currentLogin.user.username) {
                    // Decrypt message
                    response = {
                        documentId: response.documentId,
                        fromUser: decodedFromUser,
                        command: cipher.decrypt(response.command),
                        content: response.content.map((c: { number: any; data: string; align: string; }) => {
                            return {
                                number: c.number,
                                data: cipher.decrypt(c.data),
                                align: cipher.decrypt(c.align)
                            }
                        })
                    }
                    // @ts-ignore
                    let arrayDivs: Array<any> = Array.from(editor.current.children);
                    for (let i = 0; i < arrayDivs.length; i++) {
                        if (arrayDivs[i].style.textAlign !== '') {
                            arrayDivs[i].align = arrayDivs[i].style.textAlign;
                            arrayDivs[i].style.removeProperty("text-align");
                        }
                    }
                    let arrayPars: Array<ParagraphInfo> = arrayDivs.map((d, i) => {
                        return new ParagraphInfo(i, d.textContent, d.align);
                    });

                    if (response.command === 'create') {
                        for (let contentElement of response.content) {
                            arrayPars.push(new ParagraphInfo(arrayPars.length, contentElement.data, contentElement.align))
                        }
                    }
                    if (response.command === 'delete') {
                        const arrNumbers = response.content.map((c: { number: any; }) => c.number);
                        arrayPars = arrayPars.filter(p => arrNumbers.findIndex((item: number) => item === p.number) === -1);
                        arrayPars.map((p, i) => new ParagraphInfo(i, p.content, p.align));
                    }
                    if (response.command === 'edit') {
                        for (let contentElement of response.content) {
                            arrayPars[contentElement.number] = new ParagraphInfo(contentElement.number, contentElement.data, contentElement.align);
                        }
                    }
                    setLastEdited(response.fromUser);
                    setDocumentParagraphs(arrayPars);
                    // @ts-ignore
                    contentsCopy.current = Array.from(editor.current.children).map(formatArray);
                }
            });
        });
        stompClient.current = stompCl;
        return stompClient.current;
    }

    const eventListener = (e: any) => {
        // @ts-ignore
        let dos: Array<any> = Array.from(e.target.children);
        // @ts-ignore
        saving.current.style.display = "block";
        delay(function () {
            const cipher = new AES(getDocumentKey() ?? "");
            // @ts-ignore
            if (dos.length === 0 && !e.target.innerHTML.startsWith("<div>")) {
                let innerDiv = document.createElement("div");
                // @ts-ignore
                innerDiv.innerHTML = e.target.innerHTML;
                // @ts-ignore
                editor.current.innerText = "";
                // @ts-ignore
                editor.current.appendChild(innerDiv);
                dos = [innerDiv];
            }
            for (let i = 0; i < dos.length; i++) {
                if (dos[i].style.textAlign !== '') {
                    dos[i].align = dos[i].style.textAlign;
                    dos[i].style.removeProperty("text-align");
                }
            }
            let toSend: Array<WSContent> = [];
            let limit = contentsCopy.current.length;
            let align = null;
            if (contentsCopy.current.length < dos.length) {
                for (let i = contentsCopy.current.length; i < dos.length; i++) {
                    align = null;
                    if (dos[i].attributes.align != null)
                        align = dos[i].attributes.align.value;
                    toSend.push(new WSContent(i, dos[i].textContent, align));
                }
                sendStompMessage(
                    new WSMessage(parseInt(props.documentId), currentLogin.user.username, "create", toSend),
                    cipher
                )
            } else if (contentsCopy.current.length > dos.length) {
                for (let i = dos.length; i < contentsCopy.current.length; i++) {
                    toSend.push(new WSContent(i, null, null));
                }
                sendStompMessage(
                    new WSMessage(parseInt(props.documentId), currentLogin.user.username, "delete", toSend),
                    cipher
                )
                limit = dos.length;
            }
            toSend = [];

            for (let i = 0; i < limit; i++) {
                if (contentsCopy.current[i][0] !== dos[i].textContent ||
                    (dos[i].attributes.align != null && contentsCopy.current[i][1] !== dos[i].attributes.align.value) ||
                    (dos[i].attributes.align == null && contentsCopy.current[i][1] !== dos[i].attributes.align)) {
                    align = null;
                    if (dos[i].attributes.align != null)
                        align = dos[i].attributes.align.value;
                    toSend.push(new WSContent(i, dos[i].textContent, align));
                }
            }
            sendStompMessage(
                new WSMessage(parseInt(props.documentId), currentLogin.user.username, "edit", toSend),
                cipher
            )
            setLastEdited(currentLogin.user.username);
            contentsCopy.current = Array.from(dos).map(formatArray);
            // @ts-ignore
            saving.current.style.display = "none";
        }, 1000);
    };

    function setUpDivListener() {
        editor.current?.addEventListener('input', eventListener);
    }

    function sendStompMessage(wsMessage: WSMessage, cipher: AES) {
        if (wsMessage.content == null || wsMessage.content?.length === 0)
            return;

        // Encrypt
        const newWsMessage = new WSMessage(
            wsMessage.documentId,
            cipher.encrypt(wsMessage.fromUser),
            cipher.encrypt(wsMessage.command),
            wsMessage.content
                ?.map(c => new WSContent(
                    c.number,
                    cipher.encrypt(c.data ?? ""),
                    cipher.encrypt(c.align ?? "")
                )) ?? null
        )

        stompClient.current.send(Constants.webSocketMessageSend, {}, new TypedJSON(WSMessage).stringify(newWsMessage));
    }

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
            // Decrypt
            const cipher = new AES(getUserKey() || "");
            if (object != null && object.document != null)
                object.document.lastEditBy = cipher.decrypt(object?.document?.lastEditBy ?? "");
            object?.documentParagraphs?.map(p => {
                p.content = cipher.decrypt(p.content);
                p.align = cipher.decrypt(p.align);
                return p;
            });
            // @ts-ignore
            setDocumentIdEditor(object);
            setDocumentParagraphs(object?.documentParagraphs ?? []);
            setLastEdited(object?.document?.lastEditBy ?? null);
            setRoleId(object?.editor ?? false ? 1 : 2);
            contentsCopy.current = object?.documentParagraphs?.map(formatArray) ?? [];
        } else {
            console.error(json["error"]);
            setError(json["error"]);
        }
    }

    function changeRightLevel(level: number) {
        if (level === 1) {
            document?.getElementById("editor")?.setAttribute("contenteditable", "true")
        } else {
            document?.getElementById("editor")?.setAttribute("contenteditable", "false")
        }
        setRoleId(level)
    }

    const getDocument = async () => {
        await queryGetDocument(props.documentId);
    }

    useEffect(() => {
        getDocument();
        queryGetDocumentKey(props.documentId);
        setUpStompClient();
        setUpDivListener();
    }, []);

    return (
        <div>
            {
                documentIdEditor === undefined
                    ? <></>
                    : (
                        <h3 className="text-center mt-5">Добро пожаловать в документ
                            "{documentIdEditor.document?.name}"!</h3>
                    )
            }
            <div className="mt-5 ms-auto pb-1 text-center fixed-top bg-light" id="instruments">
                <span>Выравнивание: </span>
                <a href={"javascript:void(0)"} onClick={e => format('justifyLeft')} style={{color: "white"}}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor"
                         className="bi bi-text-left"
                         viewBox="0 0 16 16">
                        <path fillRule="evenodd"
                              d="M2 12.5a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5zm0-3a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11a.5.5 0 0 1-.5-.5zm0-3a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5zm0-3a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11a.5.5 0 0 1-.5-.5z"/>
                    </svg>
                </a>

                <a href={"javascript:void(0)"} onClick={e => format('justifyCenter')} style={{color: "white"}}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor"
                         className="bi bi-text-center"
                         viewBox="0 0 16 16">
                        <path fillRule="evenodd"
                              d="M4 12.5a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5zm-2-3a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11a.5.5 0 0 1-.5-.5zm2-3a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5zm-2-3a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11a.5.5 0 0 1-.5-.5z"/>
                    </svg>
                </a>

                <a href={"javascript:void(0)"} onClick={e => format('justifyRight')} style={{color: "white"}}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor"
                         className="bi bi-text-right"
                         viewBox="0 0 16 16">
                        <path fillRule="evenodd"
                              d="M6 12.5a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5zm-4-3a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11a.5.5 0 0 1-.5-.5zm4-3a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5zm-4-3a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11a.5.5 0 0 1-.5-.5z"/>
                    </svg>
                </a>

                <a href={"javascript:void(0)"} onClick={e => format('justifyFull')} style={{color: "white"}}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor"
                         className="bi bi-justify"
                         viewBox="0 0 16 16">
                        <path fillRule="evenodd"
                              d="M2 12.5a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11a.5.5 0 0 1-.5-.5zm0-3a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11a.5.5 0 0 1-.5-.5zm0-3a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11a.5.5 0 0 1-.5-.5zm0-3a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11a.5.5 0 0 1-.5-.5z"/>
                    </svg>
                </a>

                <label style={{padding: "5px"}}>Роль: <DynamicSelect
                    name={"rightLevel"}
                    value={roleId}
                    arrayOfData={[{id: 1, name: "Редактор"}, {id: 2, name: "Читатель"}]}
                    onSelectChange={(value: string) => changeRightLevel(parseInt(value))}
                    disabled={!documentIdEditor?.editor}
                />
                </label>
                <span id="lastEdited"
                      style={{padding: "5px"}}>{(!lastEdited ? "" : `Последнее изменение от ${lastEdited}`)}</span>
                <span id="saving" style={{display: "none"}} ref={saving}><b>Сохраняем документ....</b></span>
            </div>
            <div style={{paddingTop: "20px"}}></div>
            <div className="center mt-5 shadow-lg rounded" contentEditable={documentIdEditor?.editor ?? false}
                 id="editor" ref={editor} style={{backgroundColor: "white", minHeight: "20px", color: "black"}}>
                {
                    documentParagraphs.length !== 0
                        ? documentParagraphs.map(p => {
                            // @ts-ignore
                            return <div style={{textAlign: p.align || "left"}}>
                                {(p.content.length !== 0 ? p.content : <br/>)}
                            </div>
                        })
                        : <div style={{textAlign: "left"}}><br/></div>
                }
            </div>
            <div style={{paddingTop: "20px"}}></div>
            {
                error.length > 0
                    ? <h4>{error}</h4>
                    : <></>
            }
        </div>
    )
};

export default DocumentEditor;