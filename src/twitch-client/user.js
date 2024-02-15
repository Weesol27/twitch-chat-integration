/**
 * Represents a Twitch user.
 * @typedef {Object} TwitchUser
 * @property {string} id - The user's ID.
 * @property {string} login - The user's login name.
 * @property {string} display_name - The user's display name.
 * @property {string} type - The user's type.
 * @property {string} broadcaster_type - The user's broadcaster type.
 * @property {string} description - The user's description.
 * @property {string} profile_image_url - URL of the profile image.
 * @property {string} offline_image_url - URL of the offline image.
 * @property {number} view_count - The view count.
 * @property {string} created_at - The creation date.
 */

const users = new Map();

/**
 * Fetches Twitch user data.
 * 
 * @param {string} oauthToken - OAuth token for Twitch API.
 * @param {string} clientId - Client ID for Twitch API.
 * @param {string} login - The login name of the user.
 * @returns {Promise<TwitchUser>} The Twitch user data.
 */
export const getUserData = async (oauthToken, clientId, login) => {
    login = login.toLowerCase();
    if (users.has(login)) {
        return await users.get(login);
    }
    users.set(login, new Promise(async (resolve) => {
        const url = `https://api.twitch.tv/helix/users?`;
        const params = new URLSearchParams();
        params.append("login", login);
        const response = await fetch(url + params.toString(), {
            headers: {
                Authorization: `Bearer ${oauthToken.replace("oauth:", "")}`,
                "Client-ID": clientId,
            },
        });

        const { data } = await response.json();
        if (Array.isArray(data)) {
            resolve(data[0]); // Assuming data[0] is the user data.
            return;
        }
        resolve(data); // Assuming data is the user data if not an array.
    }));
    return await users.get(login);
};
