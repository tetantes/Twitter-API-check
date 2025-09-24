// api/twitterCheck.js
import fetch from "node-fetch";

export default async function handler(req, res) {
  const { username } = req.query; 
  const CEO_ACCOUNT = "LordZurel";
  const COFOUNDER_ACCOUNT = "SteveAshers";

  try {
    // Step 1: Get user ID from username
    const userRes = await fetch(`https://api.twitter.com/2/users/by/username/${username}`, {
      headers: { Authorization: `Bearer ${process.env.TWITTER_BEARER_TOKEN}` }
    });
    const userData = await userRes.json();

    if (!userData.data) {
      return res.status(400).json({ success: false, error: "Invalid username" });
    }

    const userId = userData.data.id;

    // Step 2: Get IDs of CEO and Co-founder
    const ceoRes = await fetch(`https://api.twitter.com/2/users/by/username/${CEO_ACCOUNT}`, {
      headers: { Authorization: `Bearer ${process.env.TWITTER_BEARER_TOKEN}` }
    });
    const ceoId = (await ceoRes.json()).data.id;

    const cooRes = await fetch(`https://api.twitter.com/2/users/by/username/${COFOUNDER_ACCOUNT}`, {
      headers: { Authorization: `Bearer ${process.env.TWITTER_BEARER_TOKEN}` }
    });
    const cooId = (await cooRes.json()).data.id;

    // Step 3: Directly check if user follows CEO
    const followCEO = await fetch(`https://api.twitter.com/2/users/${userId}/following/${ceoId}`, {
      headers: { Authorization: `Bearer ${process.env.TWITTER_BEARER_TOKEN}` }
    });
    const followsCEO = followCEO.status === 200;

    // Step 4: Directly check if user follows Co-founder
    const followCOO = await fetch(`https://api.twitter.com/2/users/${userId}/following/${cooId}`, {
      headers: { Authorization: `Bearer ${process.env.TWITTER_BEARER_TOKEN}` }
    });
    const followsCOO = followCOO.status === 200;

    return res.status(200).json({
      success: true,
      username,
      followsCEO,
      followsCOO,
      verified: followsCEO && followsCOO
    });

  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}
