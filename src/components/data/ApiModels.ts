import {jsonArrayMember, jsonMember, jsonObject} from "typedjson";

@jsonObject
export class Role {
    @jsonMember(Number)
    id: number = -1;

    @jsonMember(String)
    name: string = "";

    @jsonMember(String)
    userName: string = "";
}

@jsonObject
export class User {
    @jsonMember(Number)
    id: number = -1;

    @jsonMember(String)
    username: string = "";
}

@jsonObject
export class Document {
    @jsonMember(Number)
    id: number = -1;

    @jsonMember(String)
    name: string = "";

    @jsonMember(String)
    lastEditBy: string | null = null;

    @jsonMember(User)
    owner: User | null = null;
}

@jsonObject
export class UserInfo {
    @jsonMember(Boolean)
    me: boolean = false;

    @jsonArrayMember(Role)
    allRoles: Array<Role> | null = null;

    @jsonArrayMember(Document)
    documents: Array<Document> | null = null;

    @jsonMember(String)
    username: string = "";
}

@jsonObject
export class MyUserInfo {

    @jsonArrayMember(Role)
    myRoles: Array<Role> | null = null;

    @jsonArrayMember(Role)
    allRoles: Array<Role> | null = null;

    @jsonMember(String)
    username: string = "";
}

@jsonObject
export class DocumentInfo {
    @jsonMember(Number)
    id: number = -1;

    @jsonMember(String)
    name: string = "";

    @jsonMember(String)
    lastEditBy: string | null = null;

    @jsonMember(User)
    owner: User | null = null;
}

@jsonObject
export class DocumentInfoShort {
    @jsonMember(Number)
    id: number = -1;

    @jsonMember(String)
    name: string = "";
}

@jsonObject
export class DocumentPassword {
    @jsonMember(Number)
    documentId: number = -1;

    @jsonMember(String)
    password: string = "";

    @jsonMember(Number)
    roleId: number | null = -1;
}

@jsonObject
export class ParagraphInfo {
    constructor(number: number, content: string, align: string) {
        this.number = number;
        this.content = content;
        this.align = align;
    }

    @jsonMember(Number)
    number: number = -1;

    @jsonMember(String)
    content: string = "";

    @jsonMember(String)
    align: string = "";
}

@jsonObject
export class DocumentIdEditor {
    @jsonMember(Boolean)
    editor: boolean = false;

    @jsonMember(Boolean)
    owner: boolean = false;

    @jsonMember(DocumentInfo)
    document: DocumentInfo | null = null;

    @jsonArrayMember(ParagraphInfo)
    documentParagraphs: Array<ParagraphInfo> | null = null;
}

@jsonObject
export class WSContent {
    constructor(number: number, data: string | null, align: string | null) {
        this.number = number;
        this.data = data;
        this.align = align;
    }

    @jsonMember(Number)
    number: number = -1;

    @jsonMember(String)
    data: string | null = "";

    @jsonMember(String)
    align: string | null = null;
}

@jsonObject
export class WSMessage {
    constructor(documentId: number, fromUser: string, command: string, content: Array<WSContent> | null) {
        this.documentId = documentId;
        this.fromUser = fromUser;
        this.command = command;
        this.content = content;
    }

    @jsonMember(Number)
    documentId: number = -1;

    @jsonMember(String)
    fromUser: string = "";

    @jsonMember(String)
    command: string = "";

    @jsonArrayMember(WSContent)
    content: Array<WSContent> | null = null;
}