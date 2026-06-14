require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

// Allow requests from the local frontend
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

app.post('/api/chat', async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    if (!GEMINI_API_KEY) {
      return res.status(500).json({ error: 'Gemini API key is not configured on the server' });
    }

    // Call Gemini API securely from the backend
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("Gemini API Error:", errText);
      return res.status(response.status).json({ error: 'Failed to communicate with Gemini API' });
    }

    const data = await response.json();
    let aiText = data.candidates[0].content.parts[0].text;
    
    // Clean up markdown wrapping if present
    aiText = aiText.replace(/```json/gi, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(aiText);

    res.json(parsed);

  } catch (error) {
    console.error("Backend Error:", error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Jersify Backend running securely on http://localhost:${PORT}`);
});
