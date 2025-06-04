const axios = require("axios");

async function isUsernameAllowedByOrv(username) {
  try {
    const response = await axios.get(`${process.env.ORV_API_LINK}/some-route`, {
      params: { username },
    });

    if (response.status === 200 && Array.isArray(response.data.allowedUsers)) {
      return response.data.allowedUsers.includes(username);
    }

    return false; // valid response but user not in list
  } catch (err) {
    if (!err.response) {
      return true; // fallback: 400 is considered acceptable
    }

    console.warn("ORV API check failed:", err.message);
    throw new Error("ORV check failure");
  }
}

module.exports = { isUsernameAllowedByOrv };
