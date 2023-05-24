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
export class DocumentInfo {
    @jsonMember(Number)
    id: number = -1;

    @jsonMember(String)
    name: string = "";

    @jsonMember(String)
    lastEditBy: string = "";

    @jsonMember(User)
    owner: User | null = null;
}