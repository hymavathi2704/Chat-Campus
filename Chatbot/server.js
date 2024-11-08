require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000; // Allow port to be configurable

// Middleware to enable CORS
app.use(cors());

// Middleware to parse JSON requests
app.use(express.json());

// Serve static files from the 'public' directory
app.use(express.static('public'));

// Endpoint to handle generating content
app.post('/api/generate-content', async (req, res) => {
  const { userMessage } = req.body;

  if (!process.env.GEMINI_API_KEY) {
    return res.status(500).json({ error: 'API key is not set' });
  }

  try {
    // Dynamically import node-fetch
    const fetch = (await import('node-fetch')).default;

    // Send request to Gemini API using the API key from the environment variables
    const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${process.env.GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          role: 'user',
          parts: [{ text: userMessage }]
        }]
      }),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error.message);

    // Respond with the data from Gemini API
    res.status(200).json(data);
  } catch (error) {
    // Log the error for debugging purposes
    console.error(error);
    // Handle errors and respond with a generic error message
    res.status(500).json({ error: 'An error occurred while generating content' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});