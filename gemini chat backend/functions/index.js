const functions = require("firebase-functions");
const cors = require("cors")({ origin: true });

exports.chat = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      const { prompt } = req.body;
      if (!prompt) {
        return res.status(400).json({ error: "Prompt is required" });
      }

      const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
      if (!GEMINI_API_KEY) {
        console.error("Gemini API key is missing");
        return res.status(500).json({ error: "API key is not configured" });
      }

      const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" + GEMINI_API_KEY, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      });

      if (!response.ok) {
        const errText = await response.text();
        console.error("Gemini API Error:", errText);
        return res.status(response.status).json({ error: "Failed to communicate with Gemini API" });
      }

      const data = await response.json();
      let aiText = data.candidates[0].content.parts[0].text;
      
      aiText = aiText.replace(/```json/gi, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(aiText);

      res.status(200).json(parsed);
    } catch (error) {
      console.error("Backend Error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
});
