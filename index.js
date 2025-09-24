import express from "express";
import fetch from "node-fetch";

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/twitterCheck", async (req, res) => {
  const { username } = req.query;
  const CEO_ACCOUNT = "LordZurel";
  const COFOUNDER_ACCOUNT = "SteveAshers";

  try {
    // 1️⃣ Get user ID by username
    const userRes = await fetch(`https://api.twitter.com/2/users/by/username/${username}`, {
      headers: { "Authorization": `Bearer ${process.env.TWITTER_BEARER_TOKEN}` }
    });
    const userData = await userRes.json();

    if (!userData.data) {
      return res.status(400).json({ success: false, error: "Invalid username" });
    }

    const userId = userData.data.id;

    // 2️⃣ Get accounts the user follows
    const followRes = await fetch(`https://api.twitter.com/2/users/${userId}/following?max_results=1000`, {
      headers: { "Authorization": `Bearer ${process.env.TWITTER_BEARER_TOKEN}` }
    });
    const followData = await followRes.json();

    // ✅ Case-insensitive match
    const followsCEO = followData.data?.some(
      acc => acc.username.toLowerCase() === CEO_ACCOUNT.toLowerCase()
    ) || false;

    const followsCOO = followData.data?.some(
      acc => acc.username.toLowerCase() === COFOUNDER_ACCOUNT.toLowerCase()
    ) || false;

    res.json({
      success: true,
      username,
      followsCEO,
      followsCOO,
      verified: followsCEO && followsCOO
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
