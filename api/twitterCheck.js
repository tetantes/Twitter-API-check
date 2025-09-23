// api/twitterCheck.js
import fetch from "node-fetch";

export default async function handler(req, res) {
  const { username } = req.query; // username from Telegram bot
  const CEO_ACCOUNT = "LordZurel";
  const COFOUNDER_ACCOUNT = "SteveAshers";

  try {
    // Step 1: Get user ID
    const userRes = await fetch(`https://api.twitter.com/2/users/by/username/${username}`, {
      headers: { Authorization: `Bearer ${process.env.TWITTER_BEARER_TOKEN}` }
    });
    const userData = await userRes.json();

    if (!userData.data) {
      return res.status(400).json({ success: false, error: "Invalid username" });
    }

    const userId = userData.data.id;

    // Step 2: Check following (with pagination)
    let followsCEO = false;
    let followsCOO = false;
    let nextToken = null;

    do {
      const url = new URL(`https://api.twitter.com/2/users/${userId}/following`);
      url.searchParams.set("max_results", "1000");
      if (nextToken) url.searchParams.set("pagination_token", nextToken);

      const followRes = await fetch(url, {
        headers: { Authorization: `Bearer ${process.env.TWITTER_BEARER_TOKEN}` }
      });
      const followData = await followRes.json();

      if (followData.data) {
        followsCEO ||= followData.data.some(acc => acc.username === CEO_ACCOUNT);
        followsCOO ||= followData.data.some(acc => acc.username === COFOUNDER_ACCOUNT);
      }

      nextToken = followData.meta?.next_token || null;
    } while ((!followsCEO || !followsCOO) && nextToken);

    // Step 3: Response
    res.status(200).json({
      success: true,
      username,
      followsCEO,
      followsCOO,
      verified: followsCEO && followsCOO
    });

  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}
