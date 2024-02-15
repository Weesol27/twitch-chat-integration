import { CANONICAL_NAME, MODULE_NAME } from "./constants";

export const debug = (...args) => {
    if (game.settings.get(CANONICAL_NAME, 'debug')) {
        console.log(`${MODULE_NAME} | `, ...args);
    }
}

export const isEnableConnectionNotices = () => {
    return game.settings.get(CANONICAL_NAME, 'connectionNotices');
}

export const registerDebugSettings = () => {
    game.settings.register(CANONICAL_NAME, 'debug', {
        name: game.i18n.localize(`TWITCHCHAT.DebugMode`),
        hint: game.i18n.localize(`TWITCHCHAT.DebugModeHint`),
        scope: 'world',
        config: true,
        type: Boolean,
        default: false,
    });
    game.settings.register(CANONICAL_NAME, 'connectionNotices', {
        name: game.i18n.localize(`TWITCHCHAT.ConnectionNotices`),
        hint: game.i18n.localize(`TWITCHCHAT.ConnectionNoticesHint`),
        scope: 'world',
        config: true,
        type: Boolean,
        default: true,
        requiresReload: true,
    });
}
