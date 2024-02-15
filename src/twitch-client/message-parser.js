import { TwitchCommand } from "../constants";
import { debug } from "../debug";

// Removed TypeScript type annotations and interfaces

export function parseMessage(message) {
  let parsedMessage = {
    tags: null,
    source: null,
    command: null,
    parameters: null,
  };

  let idx = 0;

  let rawTagsComponent = null;
  let rawSourceComponent = null;
  let rawCommandComponent = null;
  let rawParametersComponent = null;

  if (message[idx] === "@") {
    let endIdx = message.indexOf(" ");
    rawTagsComponent = message.slice(1, endIdx);
    idx = endIdx + 1;
  }

  if (message[idx] === ":") {
    idx += 1;
    let endIdx = message.indexOf(" ", idx);
    rawSourceComponent = message.slice(idx, endIdx);
    idx = endIdx + 1;
  }

  let endIdx = message.indexOf(":", idx);
  if (endIdx == -1) {
    endIdx = message.length;
  }

  rawCommandComponent = message.slice(idx, endIdx).trim();

  if (endIdx != message.length) {
    idx = endIdx + 1;
    rawParametersComponent = message.slice(idx);
  }

  parsedMessage.command = parseCommand(rawCommandComponent);

  if (parsedMessage.command == null || !rawSourceComponent) {
    return null;
  } else {
    if (rawTagsComponent != null) {
      parsedMessage.tags = parseTags(rawTagsComponent);
    }

    parsedMessage.source = parseSource(rawSourceComponent);

    parsedMessage.parameters = rawParametersComponent;
    if (rawParametersComponent && rawParametersComponent[0] === "!") {
      parsedMessage.command = parseParameters(rawParametersComponent, parsedMessage.command);
    }
  }

  return parsedMessage;
}

function parseTags(tags) {
  const tagsToIgnore = {
    "client-nonce": null,
    flags: null,
  };

  let dictParsedTags = {};
  let parsedTags = tags.split(";");

  parsedTags.forEach((tag) => {
    let parsedTag = tag.split("=");
    let tagValue = parsedTag[1] === "" ? null : parsedTag[1];

    switch (parsedTag[0]) {
      case "badges":
      case "badge-info":
        if (tagValue) {
          let dict = {};
          let badges = tagValue.split(",");
          badges.forEach((pair) => {
            let badgeParts = pair.split("/");
            dict[badgeParts[0]] = badgeParts[1];
          });
          dictParsedTags[parsedTag[0]] = dict;
        } else {
          dictParsedTags[parsedTag[0]] = null;
        }
        break;
      case "emotes":
        if (tagValue) {
          let dictEmotes = {};
          let emotes = tagValue.split("/");
          emotes.forEach((emote) => {
            let emoteParts = emote.split(":");
            let textPositions = [];
            let positions = emoteParts[1].split(",");
            positions.forEach((position) => {
              let positionParts = position.split("-");
              textPositions.push({
                startPosition: positionParts[0],
                endPosition: positionParts[1],
              });
            });
            dictEmotes[emoteParts[0]] = textPositions;
          });
          dictParsedTags[parsedTag[0]] = dictEmotes;
        } else {
          dictParsedTags[parsedTag[0]] = null;
        }
        break;
      case "emote-sets":
        if (tagValue) {
          let emoteSetIds = tagValue.split(",");
          dictParsedTags[parsedTag[0]] = emoteSetIds;
        }
        break;
      default:
        if (!tagsToIgnore.hasOwnProperty(parsedTag[0])) {
          dictParsedTags[parsedTag[0]] = tagValue;
        }
    }
  });

  return dictParsedTags;
}

function parseCommand(rawCommandComponent) {
    let parsedCommand = null; // Removed type annotation
    const commandParts = rawCommandComponent.split(" ");
  
    switch (commandParts[0]) {
      case "JOIN":
      case "PART":
      case "NOTICE":
      case "CLEARCHAT":
      case "HOSTTARGET":
      case "PRIVMSG":
        parsedCommand = {
          command: commandParts[0],
          channel: commandParts[1],
        };
        break;
      case "PING":
        parsedCommand = {
          command: commandParts[0],
        };
        break;
      case "CAP":
        parsedCommand = {
          command: commandParts[0],
          isCapRequestEnabled: commandParts[2] === "ACK",
        };
        break;
      case "GLOBALUSERSTATE":
      case "USERSTATE":
      case "ROOMSTATE":
        parsedCommand = {
          command: commandParts[0],
          channel: commandParts[1],
        };
        break;
      case "RECONNECT":
        debug("The Twitch IRC server is about to terminate the connection for maintenance.");
        parsedCommand = {
          command: commandParts[0],
        };
        break;
      case "421":
        debug(`Unsupported IRC command: ${commandParts[2]}`);
        return null;
      case "001": // Logged in (successfully authenticated).
        parsedCommand = {
          command: commandParts[0],
          channel: commandParts[1],
        };
        break;
      // Ignoring all other numeric messages.
      case "002":
      case "003":
      case "004":
      case "353": // Tells you who else is in the chat room you're joining.
      case "366":
      case "372":
      case "375":
      case "376":
        debug(`numeric message: ${commandParts[0]}`);
        return null;
      case "":
        return null;
      default:
        debug("Unexpected command:", commandParts);
        return null;
    }
  
    return parsedCommand;
  }
  

function parseSource(rawSourceComponent) {
  if (rawSourceComponent == null) {
    return null;
  } else {
    let sourceParts = rawSourceComponent.split("!");
    return {
      nick: sourceParts.length == 2 ? sourceParts[0] : null,
      host: sourceParts.length == 2 ? sourceParts[1] : sourceParts[0],
    };
  }
}


function parseParameters(rawParametersComponent, command) {
    let idx = 0;
    let commandParts = rawParametersComponent.slice(idx + 1).trim();
    let paramsIdx = commandParts.indexOf(" ");
  
    if (paramsIdx == -1) {
      // no parameters
      command.botCommand = commandParts.slice(0);
    } else {
      command.botCommand = commandParts.slice(0, paramsIdx);
      command.botCommandParams = commandParts.slice(paramsIdx).trim();
      // Implement the TODO: remove extra spaces in parameters string
      // This can be achieved by splitting the string into an array of words
      // and then joining them back together with single spaces.
      if (command.botCommandParams) {
        command.botCommandParams = command.botCommandParams.split(/\s+/).join(' ');
      }
    }
  
    return command;
  }
  
  
