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
    
    if (!userRes.ok) {
      return res.status(400).json({ success: false, error: "Invalid username or API error" });
    }
    
    const userData = await userRes.json();

    if (!userData.data) {
      return res.status(400).json({ success: false, error: "Invalid username" });
    }

    const userId = userData.data.id;

    // Step 2: Get IDs of CEO and Co-founder
    const ceoRes = await fetch(`https://api.twitter.com/2/users/by/username/${CEO_ACCOUNT}`, {
      headers: { Authorization: `Bearer ${process.env.TWITTER_BEARER_TOKEN}` }
    });
    
    if (!ceoRes.ok) {
      return res.status(500).json({ success: false, error: "Error fetching CEO account" });
    }
    
    const ceoData = await ceoRes.json();
    const ceoId = ceoData.data.id;

    const cooRes = await fetch(`https://api.twitter.com/2/users/by/username/${COFOUNDER_ACCOUNT}`, {
      headers: { Authorization: `Bearer ${process.env.TWITTER_BEARER_TOKEN}` }
    });
    
    if (!cooRes.ok) {
      return res.status(500).json({ success: false, error: "Error fetching Co-founder account" });
    }
    
    const cooData = await cooRes.json();
    const cooId = cooData.data.id;

    // Step 3: Check if user follows CEO
    const followCEO = await fetch(`https://api.twitter.com/2/users/${userId}/following?target_user_id=${ceoId}`, {
      headers: { Authorization: `Bearer ${process.env.TWITTER_BEARER_TOKEN}` }
    });
    
    const followsCEO = followCEO.status === 200;

    // Step 4: Check if user follows Co-founder
    const followCOO = await fetch(`https://api.twitter.com/2/users/${userId}/following?target_user_id=${cooId}`, {
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
