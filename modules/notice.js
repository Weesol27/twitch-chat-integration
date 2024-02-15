class TwitchNotice {
    constructor(twitchClient) {
        this.twitchClient = twitchClient;
        this.twitchClient.on(TwitchCommand.NOTICE, this.onNotice.bind(this));
        this.twitchClient.on(TwitchCommand.SUCCESSFULLY_LOGGED_IN, this.onLoginSuccessful.bind(this));
        this.twitchClient.on(TwitchCommand.JOIN, this.onJoin.bind(this));
        this.twitchClient.on(TwitchCommand.PART, this.onPart.bind(this));
        this.twitchClient.on(TwitchConnectionEvent.ERROR, this.onError.bind(this));
        this.twitchClient.on(TwitchConnectionEvent.CLOSE, this.onClose.bind(this));
        this.twitchClient.on(TwitchConnectionEvent.CONNECT, this.onConnect.bind(this));
        this.twitchClient.on(TwitchConnectionEvent.CONNECTING, this.onConnecting.bind(this));
    }

    onConnecting() {
        ui.notifications.info(`${MODULE_NAME}: Connecting to Twitch IRC.`);
    }

    onConnect() {
        ui.notifications.info(`${MODULE_NAME}: Connected to Twitch IRC.`);
    }

    onError() {
        ui.notifications.error(`${MODULE_NAME}: Error connecting to Twitch IRC.`);
    }

    onClose() {
        ui.notifications.warn(`${MODULE_NAME}: Connection to Twitch IRC closed.`);
    }

    onLoginSuccessful() {
        ui.notifications.info(`${MODULE_NAME}: Successfully logged in.`);
    }

    onJoin() {
        ui.notifications.info(`${MODULE_NAME}: Joined channel.`);
    }

    onPart() {
        ui.notifications.info(`${MODULE_NAME}: The channel must have banned (/ban) the bot.`);
    }

    onNotice(message) {
        if (!message) {
            throw new Error('Message is undefined');
        }
        if (message.parameters === 'Login authentication failed') {
            this.onLoginAuthFailed();
        } else if(message.parameters === 'You don’t have permission to perform that action') {
            this.onNoPermission();
        } else {
            this.onUnknownNotice(message);
        }
    }

    onUnknownNotice(message) {
        ui.notifications.error(`${MODULE_NAME}: ${message.parameters}`);
    }

    onNoPermission() {
        ui.notifications.error(`${MODULE_NAME}: You don't have permission to perform that action. Check if the access token is still valid.`);
    }

    onLoginAuthFailed() {
        ui.notifications.error(`${MODULE_NAME}: Login authentication failed. Please check your credentials.`);
    }
}
