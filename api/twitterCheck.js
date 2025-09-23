// api/twitterCheck.js
import fetch from "node-fetch";

export default async function handler(req, res) {
  const { username } = req.query; // username passed from Telegram bot
  const CEO_ACCOUNT = "LordZurel";
  const COFOUNDER_ACCOUNT = "SteveAshers";

  try {
    // Get user ID by username
    const userRes = await fetch(`https://api.twitter.com/2/users/by/username/${username}`, {
      headers: { "Authorization": `Bearer ${process.env.TWITTER_BEARER_TOKEN}` }
    });
    const userData = await userRes.json();

    if (!userData.data) {
      return res.status(400).json({ success: false, error: "Invalid username" });
    }

    const userId = userData.data.id;

    // Check if they follow CEO and Co-Founder
    const followRes = await fetch(`https://api.twitter.com/2/users/${userId}/following`, {
      headers: { "Authorization": `Bearer ${process.env.TWITTER_BEARER_TOKEN}` }
    });
    const followData = await followRes.json();

    const followsCEO = followData.data?.some(acc => acc.username === CEO_ACCOUNT) || false;
    const followsCOO = followData.data?.some(acc => acc.username === COFOUNDER_ACCOUNT) || false;

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
