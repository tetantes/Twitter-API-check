import express from "express";
import fetch from "node-fetch";

const app = express();
const PORT = process.env.PORT || 3000;

const CEO_ACCOUNT = "LordZurel";
const COFOUNDER_ACCOUNT = "SteveAshers";

// helper to get user id
async function getUserId(username) {
  const res = await fetch(`https://api.twitter.com/2/users/by/username/${username}`, {
    headers: { Authorization: `Bearer ${process.env.TWITTER_BEARER_TOKEN}` }
  });
  const data = await res.json();
  return data.data?.id;
}

app.get("/twitterCheck", async (req, res) => {
  const { username } = req.query;
  if (!username) {
    return res.status(400).json({ success: false, error: "Username required" });
  }

  try {
    const userId = await getUserId(username);
    if (!userId) return res.status(400).json({ success: false, error: "Invalid username" });

    const ceoId = await getUserId(CEO_ACCOUNT);
    const cooId = await getUserId(COFOUNDER_ACCOUNT);

    const checkFollow = async (targetId) => {
      const resp = await fetch(`https://api.twitter.com/2/users/${userId}/following/${targetId}`, {
        headers: { Authorization: `Bearer ${process.env.TWITTER_BEARER_TOKEN}` }
      });
      return resp.status === 200;
    };

    const followsCEO = await checkFollow(ceoId);
    const followsCOO = await checkFollow(cooId);

    return res.json({
      success: true,
      username,
      followsCEO,
      followsCOO,
      verified: followsCEO && followsCOO
    });

  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
