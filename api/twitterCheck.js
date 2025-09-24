// api/twitterCheck.js
import fetch from "node-fetch";

export default async function handler(req, res) {
  const { username } = req.query; // username passed from Telegram bot
  const CEO_ACCOUNT = "LordZurel";
  const COFOUNDER_ACCOUNT = "SteveAshers";

  try {
    // Step 1: Get user ID of the participant
    const userRes = await fetch(
      `https://api.twitter.com/2/users/by/username/${username}`,
      {
        headers: { Authorization: `Bearer ${process.env.TWITTER_BEARER_TOKEN}` },
      }
    );
    const userData = await userRes.json();
    if (!userData.data) {
      return res.status(400).json({ success: false, error: "Invalid username" });
    }
    const userId = userData.data.id;

    // Step 2: Get CEO and Co-Founder IDs
    async function getUserId(handle) {
      const resUser = await fetch(
        `https://api.twitter.com/2/users/by/username/${handle}`,
        {
          headers: {
            Authorization: `Bearer ${process.env.TWITTER_BEARER_TOKEN}`,
          },
        }
      );
      const data = await resUser.json();
      return data.data?.id;
    }

    const ceoId = await getUserId(CEO_ACCOUNT);
    const cooId = await getUserId(COFOUNDER_ACCOUNT);

    // Step 3: Check following relationship
    async function checkFollow(sourceId, targetId) {
      const resFollow = await fetch(
        `https://api.twitter.com/2/users/${sourceId}/following/${targetId}`,
        {
          headers: {
            Authorization: `Bearer ${process.env.TWITTER_BEARER_TOKEN}`,
          },
        }
      );
      return resFollow.status === 200;
    }

    const followsCEO = await checkFollow(userId, ceoId);
    const followsCOO = await checkFollow(userId, cooId);

    res.status(200).json({
      success: true,
      username,
      followsCEO,
      followsCOO,
      verified: followsCEO && followsCOO,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}
