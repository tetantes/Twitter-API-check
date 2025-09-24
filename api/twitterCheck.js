// api/twitterCheck.js
import fetch from "node-fetch";

export default async function handler(req, res) {
  const { username } = req.query;
  const CEO = "LordZurel";
  const CO = "SteveAshers";

  if (!username) {
    return res.status(400).json({ success: false, error: "Missing username" });
  }

  // Remove @ if user included it
  const cleanName = username.startsWith("@") ? username.slice(1) : username;

  try {
    // 1. Lookup user
    const userResp = await fetch(
      `https://api.twitter.com/2/users/by/username/${cleanName}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.TWITTER_BEARER_TOKEN}`,
        },
      }
    );
    const userJson = await userResp.json();

    if (!userJson.data) {
      // Could be an error or account blocked / invalid
      return res.status(400).json({ success: false, error: "Invalid username" });
    }

    const userId = userJson.data.id;

    // 2. Try checking following list with pagination
    let followsCEO = false;
    let followsCO = false;
    let nextToken = null;

    do {
      let url = `https://api.twitter.com/2/users/${userId}/following?max_results=1000`;
      if (nextToken) {
        url += `&pagination_token=${nextToken}`;
      }

      const fResp = await fetch(url, {
        headers: {
          Authorization: `Bearer ${process.env.TWITTER_BEARER_TOKEN}`,
        },
      });
      const fJson = await fResp.json();

      if (fJson.data) {
        for (const acc of fJson.data) {
          if (acc.username.toLowerCase() === CEO.toLowerCase()) {
            followsCEO = true;
          }
          if (acc.username.toLowerCase() === CO.toLowerCase()) {
            followsCO = true;
          }
        }
      }

      nextToken = fJson.meta?.next_token;

      // stop early if both found
      if (followsCEO && followsCO) break;

    } while (nextToken);

    const verified = followsCEO && followsCO;

    return res.status(200).json({
      success: true,
      username: cleanName,
      followsCEO,
      followsCO,
      verified,
    });

  } catch (err) {
    console.error("Error in twitterCheck:", err);
    return res
      .status(500)
      .json({ success: false, error: "Server error: " + err.message });
  }
}
