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
    // Log entry into the endpoint immediately
    console.log("Entered /ask-yoda endpoint (Simplified)."); 
    
    // --- TEMPORARILY SIMPLIFIED FOR DEBUGGING ---
    try {
        // Just send a simple response back immediately
        console.log("Sending simplified test response...");
        res.json({ yodaResponse: "Test successful, server received POST. Hmm." });
        return; // Exit early
    } catch (error) {
        console.error("ERROR in simplified /ask-yoda:", error);
        res.status(500).json({ error: 'Simplified handler error.' });
        return;
    }
    // --- END OF TEMPORARY SIMPLIFICATION ---
/* 
    // Original code commented out below:
    const userMessage = req.body.message;
    console.log("Parsed userMessage:", userMessage);

    if (!userMessage) {
        console.log("User message missing, sending 400."); 
        return res.status(400).json({ error: 'Message is required in the request body.' });
    }

    if (!DEEPSEEK_API_KEY) {
        console.error("DeepSeek API key is missing! Check Render Environment variables."); 
        return res.status(500).json({ error: 'Server configuration error: API key missing.' });
    }

    console.log(`Processing message for Yoda: \"${userMessage}\""); 

    try {
        console.log("Calling DeepSeek API...");
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
        console.log("Received DeepSeek Status:", apiResponse.status);
        // console.log("Received DeepSeek Data:", JSON.stringify(responseData, null, 2));

        if (!apiResponse.ok) {
            console.error("DeepSeek API Error:", responseData);
            const errorMessage = responseData?.error?.message || `API request failed with status ${apiResponse.status}`;
            return res.status(apiResponse.status).json({ error: errorMessage });
        }

        const yodaResponse = responseData?.choices?.[0]?.message?.content?.trim();

        if (yodaResponse) {
            console.log("Sending back Yoda's response:", yodaResponse);
            res.json({ yodaResponse: yodaResponse });
        } else {
            console.error("Could not extract Yoda's response from API data:", responseData);
            res.status(500).json({ error: "Failed to parse response from DeepSeek API." });
        }

    } catch (error) {
        console.error("ERROR caught in /ask-yoda endpoint:", error); 
        res.status(500).json({ error: 'Internal server error while contacting the Force.' });
    }
*/
});

// --- Start Server ---
app.listen(PORT, () => {
    console.log(`Yoda backend server listening on http://localhost:${PORT}`);
}); 