const { auth } = require("firebase-admin");
const { google } = require("googleapis");

// Function to get a new access token using the provided refresh token
const getRefreshToken = async (refreshToken, clientId, clientSecret) => {
  // Initialize OAuth2 client with the provided credentials
  const oauth2Client = new google.auth.OAuth2(
    clientId,
    clientSecret,
    "https://developers.google.com/oauthplayground" // Redirect URI
  );

  // Set the refresh token
  oauth2Client.setCredentials({
    refresh_token: refreshToken,
  });

  console.log("Attempting to refresh token...");
  try {
    // Refresh the access token
    const { credentials } = await oauth2Client.refreshAccessToken();
    console.log("Access token refreshed successfully");
    return credentials; // Return the refreshed credentials
  } catch (error) {
    console.error("Error refreshing access token:", error);
    throw new Error("Unable to refresh access token: " + error.message);
  }
};

module.exports = { getRefreshToken };
