import { TwitchCommand } from "../constants";
import { debug } from "../debug";
import { parseMessage } from "./message-parser";

// Converted TwitchConnectionEvent enum to a simple object for JavaScript
const TwitchConnectionEvent = {
    ERROR: "ERROR",
    CONNECT: "CONNECT",
    CONNECTING: "CONNECTING",
    CLOSE: "CLOSE",
};

export class TwitchClient {
    constructor(channel, account, oauth) {
        this.channel = channel;
        this.account = account;
        this.oauth = oauth;
        this.client = null;
        this.events = {
            [TwitchCommand.PRIVATE_MESSAGE]: [],
            [TwitchCommand.PING]: [],
            [TwitchCommand.SUCCESSFULLY_LOGGED_IN]: [],
            [TwitchCommand.JOIN]: [],
            [TwitchCommand.PART]: [],
            [TwitchCommand.NOTICE]: [],
            [TwitchCommand.RECONNECT]: [],
            [TwitchConnectionEvent.ERROR]: [],
            [TwitchConnectionEvent.CONNECT]: [],
            [TwitchConnectionEvent.CLOSE]: [],
            [TwitchConnectionEvent.CONNECTING]: [],
        };
    }

    get ircURL() {
        if (location.protocol !== "https:") {
            return `ws://irc-ws.chat.twitch.tv:80`;
        }
        return `wss://irc-ws.chat.twitch.tv:443`;
    }

    connect() {
        debug("Connecting to Twitch IRC");
        this.emit(TwitchConnectionEvent.CONNECTING);
        this.client = new WebSocket(this.ircURL);
        this.client.addEventListener("open", () => this.onConnect());
        this.client.addEventListener("close", () => this.onClose());
        this.client.addEventListener("error", (error) => this.onError(error));
        this.client.addEventListener("message", (event) => this.onMessage(event));
    }

    on(command, callback) {
        this.events[command].push(callback);
    }

    emit(command, message) {
        this.events[command].forEach((callback) => callback(message));
    }

    onError(error) {
        debug("Connection Error: ", error.toString());
        this.emit(TwitchConnectionEvent.ERROR, error);
    }

    onClose() {
        debug("Connection closed");
        this.client = null;
        this.emit(TwitchConnectionEvent.CLOSE);
        setTimeout(() => {
            this.connect();
        }, 1000);
    }

    onConnect() {
        if (!this.client) {
            return;
        }
        debug("Connected to Twitch IRC");
        this.emit(TwitchConnectionEvent.CONNECT);
        this.client.send(`PASS ${this.oauth.trim()}`);
        this.client.send(`NICK ${this.account.toLowerCase().trim()}`);
    }

    onMessage(event) {
        const ircMessage = event.data;
        debug("Received message from Twitch IRC", ircMessage);
        const messages = ircMessage.split("\r\n").map(parseMessage).filter(Boolean);
        debug("Parsed messages", messages);
        for (const message of messages) {
            if (message.command && message.command.command === TwitchCommand.PING) {
                this.onPing(message);
            } else if (message.command && message.command.command === TwitchCommand.PRIVATE_MESSAGE) {
                this.onPrivateMessage(message);
            } else if (message.command && message.command.command === TwitchCommand.SUCCESSFULLY_LOGGED_IN) {
                this.onSuccessfullyLoggedIn(message);
            } else if (message.command && message.command.command === TwitchCommand.JOIN) {
                this.onJoin(message);
            } else if (message.command && message.command.command === TwitchCommand.PART) {
                this.onPart(message);
            } else if (message.command && message.command.command === TwitchCommand.NOTICE) {
                this.onNotice(message);
            } else if (message.command && message.command.command === TwitchCommand.RECONNECT) {
                this.onReconnect(message);
            } else {
                debug("Unknown message", message);
            }
        }
    }

    onPrivateMessage(message) {
        debug("Received private message from Twitch IRC", message);
        this.emit(TwitchCommand.PRIVATE_MESSAGE, message);
    }

    onNotice(message) {
        debug("Received notice from Twitch IRC", message);
        this.emit(TwitchCommand.NOTICE, message);
        this.client?.send(`PART #${this.channel}`);
    }

    onPart(message) {
        this.emit(TwitchCommand.PART, message);
        debug("The channel must have banned (/ban) the bot.");
        this.client?.close();
    }

    onSuccessfullyLoggedIn(message) {
        if (!this.client) {
            return;
        }
        debug("Successfully logged in to Twitch IRC");
        this.emit(TwitchCommand.SUCCESSFULLY_LOGGED_IN, message);
        this.join();
    }
    onJoin(message) {
        if (!this.client) {
            return;
        }
        debug("Joined channel");
        this.emit(TwitchCommand.JOIN, message);
        // this.sendPrivateMessage("Hello, world!");
    }

    onPing(message) {
        debug("Received PING from Twitch IRC", message);
        if (!this.client) {
            return;
        }
        debug("Sending PONG to Twitch IRC");
        this.emit(TwitchCommand.PING, message);
        this.client.send(`PONG ${message.parameters}`);
    }

    onReconnect(message) {
        debug("Received RECONNECT from Twitch IRC", message);
        if (!this.client) {
            return;
        }
        debug("Reconnecting to Twitch IRC");
        this.emit(TwitchCommand.RECONNECT, message);
        this.client.close();
        this.connect();
    }

    join() {
        if (!this.client) {
            throw new Error("Client is not connected");
        }
        const normalizedChannel = "#" + this.channel.toLocaleLowerCase().trim();
        debug(`Joining channel ${normalizedChannel} on Twitch IRC`);
        this.client.send(`JOIN ${normalizedChannel}`);
    }

    sendPrivateMessage(message) {
        if (!this.client) {
            throw new Error("Client is not connected");
        }
        debug("Sending private message to Twitch IRC", message);
        this.client.send(`PRIVMSG #${this.channel} :${message}`);
    }
}


// Export the class if needed
// export { TwitchClient };
