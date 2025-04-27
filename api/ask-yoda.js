// api/ask-yoda.js
import fetch from 'node-fetch';

// Read Environment Variable provided by Vercel
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_API_URL = 'https://api.deepseek.com/chat/completions';
const YODA_SYSTEM_PROMPT = 'You are Master Yoda from Star Wars. Respond to the user in Yoda\'s characteristic speech pattern (object-subject-verb, short sentences, wise and philosophical tone). Keep your answers relatively short.';

export default async function handler(req, res) {
    // Ensure it's a POST request
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    // Vercel automatically parses JSON body for API routes
    const userMessage = req.body?.message;

    // Input validation
    if (!userMessage) {
        console.log("User message missing in Vercel function.");
        return res.status(400).json({ error: 'Message is required in the request body.' });
    }

    // API Key Check
    if (!DEEPSEEK_API_KEY) {
        console.error("DeepSeek API key missing in Vercel function! Check Environment Variables.");
        return res.status(500).json({ error: 'Server configuration error: API key missing.' });
    }

    console.log(`Vercel function received message: "${userMessage}"`);

    // Call DeepSeek API
    try {
        console.log("Vercel function calling DeepSeek API...");
        const apiResponse = await fetch(DEEPSEEK_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
            },
            body: JSON.stringify({
                model: 'deepseek-chat',
                messages: [
                    { role: 'system', content: YODA_SYSTEM_PROMPT },
                    { role: 'user', content: userMessage }
                ],
                max_tokens: 150,
                temperature: 0.7
            })
        });

        const responseData = await apiResponse.json();
        console.log("Vercel function received DeepSeek Status:", apiResponse.status);

        if (!apiResponse.ok) {
            console.error("Vercel function DeepSeek API Error:", responseData);
            const errorMessage = responseData?.error?.message || `API request failed with status ${apiResponse.status}`;
            // Send error status and message back to the frontend
            return res.status(apiResponse.status).json({ error: errorMessage });
        }

        const yodaResponse = responseData?.choices?.[0]?.message?.content?.trim();

        if (yodaResponse) {
            console.log("Vercel function sending back Yoda's response:", yodaResponse);
            // Send successful response back to the frontend
            res.status(200).json({ yodaResponse: yodaResponse });
        } else {
             console.error("Vercel function could not extract Yoda's response:", responseData);
            res.status(500).json({ error: "Failed to parse response from DeepSeek API." });
        }

    } catch (error) {
        console.error("ERROR caught in Vercel function /api/ask-yoda:", error);
        res.status(500).json({ error: 'Internal server error in Vercel function.' });
    }
} 