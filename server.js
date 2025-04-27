import express from 'express';
import fetch from 'node-fetch'; // node-fetch v2/v3 might require different import syntax
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv'; // Import dotenv

// Load environment variables from .env file
dotenv.config(); 

// --- Configuration ---
const PORT = process.env.PORT || 3001;
// IMPORTANT: Store your API key securely. Environment variables are recommended.
// Avoid hardcoding it directly in the code if possible for production apps.
// const DEEPSEEK_API_KEY = 'sk-add35bac795a45528576d6ae8ee2b5dc'; // Your key here - REMOVED HARDCODED KEY
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY; // Read from environment variable
const DEEPSEEK_API_URL = 'https://api.deepseek.com/chat/completions';
const YODA_SYSTEM_PROMPT = 'You are Master Yoda from Star Wars. Respond to the user in Yoda\'s characteristic speech pattern (object-subject-verb, short sentences, wise and philosophical tone). Keep your answers relatively short.';

// Helper for ES Modules __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- Initialize Express ---
const app = express();
app.use(express.json()); // Middleware to parse JSON request bodies

// Middleware to log all incoming requests
app.use((req, res, next) => {
    console.log(`Incoming request: ${req.method} ${req.url}`);
    next(); // Pass control to the next handler
});

// --- Serve Static Files --- 
// Serve files from the 'assets' directory at the '/assets' route
app.use('/assets', express.static(path.join(__dirname, 'assets')));

// --- Serve Static Files (index.html) ---
// Serve index.html when accessing the root URL
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// --- API Endpoint ---
app.post('/ask-yoda', async (req, res) => {
    const userMessage = req.body.message;

    if (!userMessage) {
        return res.status(400).json({ error: 'Message is required in the request body.' });
    }

    if (!DEEPSEEK_API_KEY) {
        console.error("DeepSeek API key is missing!");
        return res.status(500).json({ error: 'Server configuration error: API key missing.' });
    }

    console.log(`Received message for Yoda: "${userMessage}"`);

    try {
        console.log("Calling DeepSeek API...");
        const apiResponse = await fetch(DEEPSEEK_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
            },
            body: JSON.stringify({
                model: 'deepseek-chat', // Use the appropriate model
                messages: [
                    { role: 'system', content: YODA_SYSTEM_PROMPT },
                    { role: 'user', content: userMessage }
                ],
                max_tokens: 150,
                temperature: 0.7
            })
        });

        const responseData = await apiResponse.json();
        console.log("Received DeepSeek Status:", apiResponse.status);
        // console.log("Received DeepSeek Data:", JSON.stringify(responseData, null, 2)); // Uncomment for detailed debugging

        if (!apiResponse.ok) {
            console.error("DeepSeek API Error:", responseData);
            // Pass the error message from DeepSeek if available
            const errorMessage = responseData?.error?.message || `API request failed with status ${apiResponse.status}`;
            return res.status(apiResponse.status).json({ error: errorMessage });
        }

        // Extract Yoda's response
        const yodaResponse = responseData?.choices?.[0]?.message?.content?.trim();

        if (yodaResponse) {
            console.log("Sending back Yoda's response:", yodaResponse);
            res.json({ yodaResponse: yodaResponse });
        } else {
            console.error("Could not extract Yoda's response from API data:", responseData);
            res.status(500).json({ error: "Failed to parse response from DeepSeek API." });
        }

    } catch (error) {
        console.error("Error calling DeepSeek API or processing response:", error);
        res.status(500).json({ error: 'Internal server error while contacting the Force.' });
    }
});

// --- Start Server ---
app.listen(PORT, () => {
    console.log(`Yoda backend server listening on http://localhost:${PORT}`);
}); 