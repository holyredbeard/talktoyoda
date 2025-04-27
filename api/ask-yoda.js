// api/ask-yoda.js
// Removed fetch and all API logic for extreme simplification test

export default async function handler(req, res) {
    console.log("API Function /api/ask-yoda invoked (Simplified Test)."); // Log entry

    if (req.method !== 'POST') {
        console.log("Method not POST, sending 405.");
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    // Directly return a success message without any external calls or complex logic
    try {
        console.log("Sending hardcoded success response.");
        res.status(200).json({ yodaResponse: "Simplified test successful. Force is strong here." });
    } catch(error) {
        // This catch block should ideally not be reached in this simplified version
        console.error("ERROR in extremely simplified handler:", error);
        res.status(500).json({ error: 'Error in simplified handler.'});
    }
} 