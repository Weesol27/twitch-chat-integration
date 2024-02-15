export const CANONICAL_NAME = "twitch-chat-integration";
export const MODULE_NAME = "Twitch Chat Integration";
export const MODULE_PATH = `/modules/${CANONICAL_NAME}`;

const TwitchCommand = {
    PRIVATE_MESSAGE: 'PRIVMSG',
    PING: 'PING',
    SUCCESSFULLY_LOGGED_IN: '001',
    JOIN: 'JOIN',
    PART: 'PART',
    NOTICE: 'NOTICE',
    RECONNECT: 'RECONNECT',
};

const MessageStyle = {
    USERNAME_AS_ALIAS: 'USERNAME_AS_ALIAS',
    USERNAME_AS_FLAVOR: 'USERNAME_AS_FLAVOR',
};

const TwitchChatEvent = {
    SEND_MESSAGE: 'SEND_MESSAGE',
    MESSAGE_RECEIVED: 'MESSAGE_RECEIVED',
};

// If you need to export the objects, you can add:
export { TwitchCommand, MessageStyle, TwitchChatEvent };
