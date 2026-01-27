export default async function handler(req, res) {
  // Hanya izinkan method POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // Ambil API KEY dari Environment Variable server Vercel
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'Server configuration error: Missing API Key' });
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

    // Parsing sederhana untuk mengambil teks JSON bersih
    if (data.candidates && data.candidates[0].content) {
      let text = data.candidates[0].content.parts[0].text;
      // Bersihkan markdown block jika ada
      text = text.replace(/```json/g, '').replace(/```/g, '').trim();
      
      // Kirim balik sebagai JSON object
      return res.status(200).json(JSON.parse(text));
    } else {
      return res.status(500).json({ error: 'Invalid response from AI provider' });
    }

  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
