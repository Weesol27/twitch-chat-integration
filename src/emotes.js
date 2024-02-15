import { TwitchChat } from "./chat";
import { debug } from "./debug";
import { getUserData } from "./twitch-client/user";

export class TwitchEmotes {
  constructor(oauthToken, clientId, username, twitchChat) {
    this.oauthToken = oauthToken;
    this.clientId = clientId;
    this.username = username;
    this.emotes = {};

    twitchChat.addPreprocessor(this.preprocessChatMessage.bind(this));
  }

  async getGlobalEmotes() {
    debug("Getting global emotes");
    const response = await fetch("https://api.twitch.tv/helix/chat/emotes/global", {
      method: "GET",
      headers: {
        Authorization: "Bearer " + this.oauthToken.replace("oauth:", ""),
        "Client-Id": this.clientId,
        "Content-Type": "application/json",
      },
    });
    return response.json();
  }

  async getChannelEmotes() {
    debug("Getting channel emotes");
    const user = await getUserData(this.oauthToken, this.clientId, this.username);
    const response = await fetch(`https://api.twitch.tv/helix/chat/emotes/global?broadcaster_id=${user.id}`, {
      method: "GET",
      headers: {
        Authorization: "Bearer " + this.oauthToken.replace("oauth:", ""),
        "Client-Id": this.clientId,
        "Content-Type": "application/json",
      },
    });
    return response.json();
  }

  async load() {
    const globalEmotes = await this.getGlobalEmotes();
    for (const emote of globalEmotes.data) {
      this.emotes[emote.name] = emote.images.url_1x;
    }
    const channelEmotes = await this.getChannelEmotes();
    for (const emote of channelEmotes.data) {
      this.emotes[emote.name] = emote.images.url_1x;
    }
  }

  preprocessChatMessage(message) {
    debug("Preprocessing chat message", message.split(" "), this.emotes);
    message.split(" ").forEach((word) => {
      if (this.emotes.hasOwnProperty(word)) {
        message = message.replace(word, `<img src="${this.emotes[word]}" class="twitch-chat-emote" />`);
      }
    });
    return message;
  }
}

// Export the class if needed
// export { TwitchEmotes };
