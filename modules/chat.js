import { TwitchChat } from "./chat";
import { debug } from "./debug";
import { getUserData } from "./twitch-client/user";

class TwitchChat {
  constructor(twitchClient, settings, socket) {
    this.twitchClient = twitchClient;
    this.settings = settings;
    this.socket = socket;
    this.preprocessors = [];

    this.twitchClient.on(TwitchCommand.PRIVATE_MESSAGE, this.onMessage.bind(this));
    this.socket.register(TwitchChatEvent.MESSAGE_RECEIVED, this.sendChatMessage.bind(this));
    this.socket.register(TwitchChatEvent.SEND_MESSAGE, (payload) => {
      debug("Socket message received", payload);
      this.sendMessage(payload.chatlog, payload.messageText, payload.chatdata);
    });
  }

  onMessage(message) {
    if (!message) {
      throw new Error("Message is undefined");
    }

    if (this.isUserBlacklisted(message.source ? message.source.nick : "")) {
      debug("Ignoring blacklisted user", message.source ? message.source.nick : "");
      return;
    }
    this.socket.executeAsGM(TwitchChatEvent.MESSAGE_RECEIVED, message);
  }

  sendChatMessage(message) {
    debug("Chat message received", message);

    const speakAsUserId = game.settings.get(CANONICAL_NAME, "SpeakAs");
    const selectedUser = game.users.get(speakAsUserId);

    const data = {
      content: this.preprocess(message.parameters),
      user: speakAsUserId,
      speaker: {
        alias: selectedUser ? selectedUser.name : MODULE_NAME,
      },
      flags: {
        [CANONICAL_NAME]: {
          speaker: message.source ? message.source.nick : "",
        },
      },
    };

    if (this.settings.messageStyle === MessageStyle.USERNAME_AS_FLAVOR) {
      data.flavor = message.source ? message.source.nick : "";
    }

    ChatMessage.create(data);
  }

  isUserBlacklisted(username) {
    const blacklistStr = game.settings.get(CANONICAL_NAME, "blacklist");
    const blacklist = blacklistStr.split(',').map(user => user.trim().toLowerCase());
    return blacklist.includes(username.toLowerCase());
  }

  preprocess(message) {
    for (const preprocessor of this.preprocessors) {
      message = preprocessor(message);
    }
    return message;
  }

  addPreprocessor(preprocessor) {
    this.preprocessors.push(preprocessor);
  }

  async sendMessage(chatlog, messageText, chatdata) {
    this.twitchClient.sendPrivateMessage(messageText);
  }
}

class TwitchChatSettings {
  constructor() {
    game.settings.register(CANONICAL_NAME, "messageStyle", {
      name: game.i18n.localize("TWITCHCHAT.MessageStyle"),
      hint: game.i18n.localize("TWITCHCHAT.MessageStyleHint"),
      scope: "world",
      config: true,
      type: String,
      default: MessageStyle.USERNAME_AS_ALIAS,
      choices: {
        [MessageStyle.USERNAME_AS_ALIAS]: game.i18n.localize("TWITCHCHAT.MessageStyleUsernameAsAlias"),
        [MessageStyle.USERNAME_AS_FLAVOR]: game.i18n.localize("TWITCHCHAT.MessageStyleUsernameAsFlavor"),
      },
    });

    if (game.modules.get("color-picker")?.active) {
      ColorPicker.register(CANONICAL_NAME, "messageBorderColor", {
        name: game.i18n.localize("TWITCHCHAT.MessageBorderColor"),
        hint: game.i18n.localize("TWITCHCHAT.MessageBorderColorHint"),
        scope: "world",
        config: true,
        default: "#6441a5",
      }, {
        format: 'hexa'
      });
    } else {
      game.settings.register(CANONICAL_NAME, "messageBorderColor", {
        name: game.i18n.localize("TWITCHCHAT.MessageBorderColor"),
        hint: game.i18n.localize("TWITCHCHAT.MessageBorderColorHint"),
        scope: "world",
        config: true,
        type: String,
        default: "#6441a5",
      });
    }
  }

  get messageStyle() {
    return game.settings.get(CANONICAL_NAME, "messageStyle");
  }

  get messageBorderColor() {
    return game.settings.get(CANONICAL_NAME, "messageBorderColor");
  }
}
