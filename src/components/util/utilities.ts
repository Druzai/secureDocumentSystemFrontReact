import Constants from "./constants";
import baseApiURL = Constants.baseApiURL;

export async function checkIfLoggedIn() {
    const accessToken = localStorage.getItem("accessToken");
    if (accessToken != null) {
        const headers = new Headers();
        headers.append("Content-Type", "application/json");
        headers.append("Authorization", `Bearer ${accessToken}`);
        const response = await fetch(`${baseApiURL}/user/me`, {
            method: "GET",
            headers: headers
        });
        if (response.status === 401) {
            return false;
        }
        const json = await response.json();
        if (response.ok && json["result"] != null) {
            return true;
        }
    }
    return await refreshTokens();
}

export async function refreshTokens() {
    const refreshToken = localStorage.getItem("refreshToken");
    if (refreshToken == null) {
        return false;
    }
    const headers = new Headers();
    headers.append("Content-Type", "application/json");
    headers.append("Authorization", `Bearer ${refreshToken}`);
    const response = await fetch(`${baseApiURL}/auth/refresh`, {
        method: "GET",
        headers: headers
    });
    if (response.status === 401) {
        return false;
    }
    const json = await response.json();
    if (response.ok && json["result"] != null) {
        localStorage.setItem("accessToken", json["result"]["accessToken"]);
        localStorage.setItem("refreshToken", json["result"]["refreshToken"]);
        return true;
    }
    return false;
}

export function getAuthorizationBearer() {
    const accessToken = localStorage.getItem("accessToken");
    return `Bearer ${accessToken}`;
}

export async function queryGetKey() {
    const headers = new Headers();
    headers.append("Authorization", getAuthorizationBearer());
    const response = await fetch(`${baseApiURL}/aes/key`, {
        method: "GET",
        headers: headers
    });
    if (response.status === 401) {
        return false;
    }
    const json = await response.json();
    if (response.ok) {
        localStorage.setItem("userKey", json["result"]["key"]);
        return true;
    } else {
        console.error(json["error"]);
        return false;
    }
}

export function getUserKey() {
    return localStorage.getItem("userKey");
}