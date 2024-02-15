import { CANONICAL_NAME } from "../constants";

class TwitchClientSettings {
    constructor() {
        game.settings.register(CANONICAL_NAME, "channel", {
            name: game.i18n.localize("TWITCHCHAT.TwitchChannel"),
            hint: game.i18n.localize("TWITCHCHAT.TwitchChannelHint"),
            scope: "world",
            requiresReload: true,
            config: true,
            type: String,
            default: "",
        });
        game.settings.register(CANONICAL_NAME, "username", {
            name: game.i18n.localize("TWITCHCHAT.TwitchUsername"),
            hint: game.i18n.localize("TWITCHCHAT.TwitchUsernameHint"),
            scope: "world",
            requiresReload: true,
            config: true,
            type: String,
            default: "",
        });
        game.settings.register(CANONICAL_NAME, "oauthToken", {
            name: game.i18n.localize("TWITCHCHAT.TwitchOAuthToken"),
            hint: game.i18n.localize("TWITCHCHAT.TwitchOAuthTokenHint"),
            scope: "world",
            requiresReload: true,
            config: true,
            type: String,
            default: "",
        });
        game.settings.register(CANONICAL_NAME, "showTwitchEmotes", {
            name: game.i18n.localize("TWITCHCHAT.ShowTwitchEmotes"),
            hint: game.i18n.localize("TWITCHCHAT.ShowTwitchEmotesHint"),
            scope: "world",
            requiresReload: true,
            config: true,
            type: Boolean,
            default: true,
        });
        game.settings.register(CANONICAL_NAME, "user-id", {
            name: game.i18n.localize("TWITCHCHAT.user-id"),
            hint: game.i18n.localize("TWITCHCHAT.user-id"),
            scope: "world",
            requiresReload: true,
            config: true,
            type: String,
            default: "",
        });
        game.settings.register(CANONICAL_NAME, "BlackList", {
            name: game.i18n.localize("TWITCHCHAT.BlackList"),
            hint: game.i18n.localize("TWITCHCHAT.BlackList"),
            scope: "world",
            requiresReload: true,
            config: true,
            type: String,
            default: "",
        });
    }

    get channel() {
        return game.settings.get(CANONICAL_NAME, "channel");
    }

    get username() {
        return game.settings.get(CANONICAL_NAME, "username");
    }

    get oauthToken() {
        return game.settings.get(CANONICAL_NAME, "oauthToken");
    }

    get showTwitchEmotes() {
        return game.settings.get(CANONICAL_NAME, "showTwitchEmotes");
    }

    get SpeakAs() {
        return game.settings.get(CANONICAL_NAME, "SpeakAs");
    }

    get BlackList() {
        return game.settings.get(CANONICAL_NAME, "BlackList");
    }
}

export { TwitchClientSettings };
