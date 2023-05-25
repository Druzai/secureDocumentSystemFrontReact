namespace Constants {
    const baseDomainName = "localhost";
    const basePort = "8080";

    export const baseURL: string = `http://${baseDomainName}:${basePort}`;
    export const baseApiURL: string = `${baseURL}/api`;

    export const webSocketTopicListen = "/topic/messages";
    export const webSocketMessageSend = "/app/send";
    export const webSocketURL = `ws://${baseDomainName}:${basePort}/message-ws/websocket`;
}

export default Constants;
