export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // Gunakan 1 Key Resmi di Server Environment
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'Server Config Error: Missing API Key' });
  }

  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Missing prompt' });
  }

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
    });

    const data = await response.json();

    // Jika error dari Google (misal Limit Habis / 429), teruskan statusnya ke Frontend
    if (!response.ok) {
      console.error('Gemini API Error:', data);
      return res.status(response.status).json({ 
        error: data.error?.message || 'Upstream API Error' 
      });
    }

    // Parsing Response
    if (data.candidates && data.candidates[0].content) {
      let text = data.candidates[0].content.parts[0].text;
      text = text.replace(/```json/g, '').replace(/```/g, '').trim();
      return res.status(200).json(JSON.parse(text));
    } else {
      return res.status(500).json({ error: 'Invalid AI response format' });
    }

  } catch (error) {
    console.error('Internal Server Error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
