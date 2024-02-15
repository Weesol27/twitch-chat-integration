import "./styles.css";
import { debug, isEnableConnectionNotices, registerDebugSettings } from "./debug";
import { TwitchClient } from "./twitch-client/client";
import { TwitchNotice } from "./notice";
import { TwitchClientSettings } from "./twitch-client/settings";
import { TwitchChat, TwitchChatSettings } from "./chat";
import { TwitchEmotes } from "./emotes";
import { CANONICAL_NAME, MessageStyle, TwitchChatEvent } from "./constants";
import { getUserData } from "./twitch-client/user";

const TWITCH_CHAT_OAUTH_CLIENT_ID = "q6batx0epp608isickayubi39itsckt";

let clientSettings, client, twitchNoticeNotification, twitchChat, twitchEmojis, twitchChatSettings, socket;

Hooks.on("init", function () {
    clientSettings = new TwitchClientSettings();
    twitchChatSettings = new TwitchChatSettings();
    registerDebugSettings();
});

Hooks.once("socketlib.ready", () => {
    socket = socketlib.registerModule(CANONICAL_NAME);
});

Hooks.once("ready", async function () {
    if (!game.user?.isGM) {
        debug("Not a GM, skipping");
        return;
    }

    const users = game.users.filter(user => user.isGM && user.active);
    if (users.length > 1 && users[0]?.id !== game.user?.id) {
        debug("Another GM is active, skipping");
        return;
    }

    client = new TwitchClient(
        clientSettings.channel,
        clientSettings.username,
        clientSettings.oauthToken
    );

    if (isEnableConnectionNotices()) {
        twitchNoticeNotification = new TwitchNotice(client);
    }

    twitchChat = new TwitchChat(client, twitchChatSettings, socket);

    if (clientSettings.showTwitchEmotes) {
        twitchEmojis = new TwitchEmotes(
            clientSettings.oauthToken,
            TWITCH_CHAT_OAUTH_CLIENT_ID,
            clientSettings.username,
            twitchChat
        );
        await twitchEmojis.load();
    }

    client.connect();
});

Hooks.once("chatCommandsReady", function (commands) {
    commands.register({
        name: "/t",
        module: "twitch-chat",
        aliases: ["/t", "%"],
        description: game.i18n.localize("TWITCHCHAT.ChatCommandSendMsgToTwitch"),
        icon: "<i class='fas fa-messages'></i>",
        requiredRole: "NONE",
        callback: (chatlog, messageText, chatdata) => {
            socket.executeAsGM(TwitchChatEvent.SEND_MESSAGE, {
                chatlog,
                messageText,
                chatdata,
            });
            return { content: messageText };
        },
        closeOnComplete: true
    });
});

Hooks.on("renderChatMessage", async (chatMessage, html, data) => {
    if (CANONICAL_NAME in chatMessage.flags) {
        const speaker = chatMessage.flags[CANONICAL_NAME]?.speaker;
        const user = await getUserData(
            clientSettings.oauthToken,
            TWITCH_CHAT_OAUTH_CLIENT_ID,
            speaker
        );
        $(html)
            .addClass("twitch-chat-message")
            .css("border-color", twitchChatSettings.messageBorderColor);
        $(html)
            .find(".chat-portrait-message-portrait-generic")
            .attr("src", user.profile_image_url)
            .css("border-color", twitchChatSettings.messageBorderColor);
        if (twitchChatSettings.messageStyle === MessageStyle.USERNAME_AS_FLAVOR) {
            $(html)
                .find(".flavor-text.chat-portrait-text-size-name-generic")
                .text(user.display_name);
        } else {
            $(html)
                .find("h4.chat-portrait-text-size-name-generic")
                .text(user.display_name);
        }
    }
});
