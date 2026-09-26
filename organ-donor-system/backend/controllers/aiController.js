const { GoogleGenerativeAI } = require('@google/generative-ai');

/**
 * Helper to query Gemini LLM for AI Chatbot Assistant
 */
const queryGeminiChat = async (userMessage, role, userContext = {}) => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        return null;
    }

    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const prompt = `
You are "LifeSync AI", an expert clinical AI assistant for an Organ Donor & Transplant Registration Platform adhering to UDAY Portal (Universal Digital Document Analysis) and NOTTO national standards.

User Role: ${role || 'User'}
User Question: "${userMessage}"

Guidelines:
1. Provide concise, compassionate, and accurate answers regarding organ donation pledges, recipient waitlists, HLA tissue compatibility matching, Cold Ischemia Time windows, UDAY OCR report verification, and hospital coordination.
2. Keep answers concise (2-4 sentences max), friendly, and structured.
3. If asked about UDAY portal verification, explain that our platform parses lab reports into official UDAY structured digital certificates.
`;

        const result = await model.generateContent(prompt);
        const text = result.response.text().trim();
        return text;
    } catch (err) {
        console.warn('Gemini chat fallback to medical knowledge base:', err.message);
        return null;
    }
};

/**
 * Generate smart quick-reply suggestions using AI
 */
const generateSuggestions = async (context) => {
    const { role, lastMessage } = context;

    if (!lastMessage) {
        if (role === 'donor') return ["How do I register my organ pledge?", "What is my UDAY Health Score?", "Is organ donation safe?"];
        if (role === 'hospital') return ["How does HLA matching work?", "Cold Ischemia limits for Heart?", "How to register patient donor?"];
        if (role === 'receiver') return ["What is my estimated waitlist position?", "How does blood compatibility work?", "How to submit organ request?"];
        return ["How does organ matching work?", "What is UDAY document OCR?", "How to register as a donor?"];
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
        try {
            const genAI = new GoogleGenerativeAI(apiKey);
            const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
            const prompt = `
Based on this last user message: "${lastMessage}" (Role: ${role}), generate exactly 3 short (3-6 words each) logical follow-up question suggestions for an organ donor & transplant platform.
Return strictly a JSON array of strings, e.g.: ["Question 1", "Question 2", "Question 3"]
`;
            const result = await model.generateContent(prompt);
            let text = result.response.text().trim();
            if (text.startsWith('```json')) text = text.replace(/^```json\s*/, '').replace(/```$/, '');
            else if (text.startsWith('```')) text = text.replace(/^```\s*/, '').replace(/```$/, '');
            return JSON.parse(text);
        } catch (e) {
            console.warn('Gemini suggestion fallback:', e.message);
        }
    }

    // Heuristic fallbacks
    const text = lastMessage.toLowerCase();
    if (text.includes('hla') || text.includes('match')) {
        return ["What is a good HLA score?", "How fast are matches processed?", "Blood group compatibility rules"];
    }
    if (text.includes('uday') || text.includes('ocr') || text.includes('report')) {
        return ["How to upload lab report?", "UDAY Verification reference ticket", "Calculated health score details"];
    }

    return [
        "Explain organ donation steps",
        "How is waitlist priority calculated?",
        "Contact hospital coordinator"
    ];
};

const getSmartHelp = async (req, res, next) => {
    try {
        const { lastMessage, role, organType } = req.body;
        const suggestions = await generateSuggestions({ lastMessage, role, organType });

        res.json({
            success: true,
            suggestions,
            aiIdentity: "LifeSync AI Assistant"
        });
    } catch (error) {
        next(error);
    }
};

const explainMedicalTerms = async (req, res, next) => {
    try {
        const { term } = req.body;

        if (process.env.GEMINI_API_KEY) {
            try {
                const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
                const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
                const result = await model.generateContent(`Explain this medical transplant term concisely (1-2 sentences): "${term}"`);
                return res.json({
                    success: true,
                    explanation: result.response.text().trim()
                });
            } catch (err) {
                console.warn('Gemini term explanation fallback:', err.message);
            }
        }

        const terms = {
            'hla': 'Human Leukocyte Antigen: Genetic markers on blood cells that determine organ tissue compatibility between donor and recipient.',
            'ischemic time': 'Cold Ischemia Time: The critical time window an organ remains viable after harvest (e.g. Heart: 4-6h, Kidneys: 24-36h).',
            'crossmatch': 'A pre-transplant blood test ensuring recipient antibodies will not reject the donor organ.',
            'creatinine': 'Serum Creatinine: A clinical biomarker indicating renal function and kidney health status.'
        };

        const explanation = terms[term.toLowerCase()] || "This medical term relates to clinical organ compatibility and donor safety evaluation under NOTTO standards.";

        res.json({
            success: true,
            explanation
        });
    } catch (error) {
        next(error);
    }
};

const chatWithAI = async (req, res, next) => {
    try {
        const { message, role } = req.body;

        let responseText = await queryGeminiChat(message, role);

        if (!responseText) {
            const text = message.toLowerCase();
            if (text.includes('hla')) {
                responseText = "HLA (Human Leukocyte Antigen) markers determine tissue compatibility. Matching HLA-A, B, and DR reduces organ rejection risk dramatically.";
            } else if (text.includes('uday') || text.includes('ocr') || text.includes('scan')) {
                responseText = "Our UDAY AI Document OCR Engine parses uploaded lab reports into official UDAY structured digital verification certificates with security ticket hashes.";
            } else if (text.includes('match') || text.includes('score') || text.includes('algorithm')) {
                responseText = "Our Smart Compatibility Engine calculates donor-recipient matches using blood type, HLA markers, age, MELD score urgency, and geographic proximity.";
            } else if (text.includes('register') || text.includes('donor') || text.includes('pledge')) {
                responseText = "To register as an organ donor, navigate to your Donor Dashboard, complete your medical passport details, and grant donor consent.";
            } else if (text.includes('hospital') || text.includes('request')) {
                responseText = "Hospitals can create organ requests directly from their Hospital Dashboard to initiate real-time matching with active registered donors.";
            } else {
                responseText = `Hello! I am LifeSync AI. I can assist you with organ donor registration, UDAY document verification, HLA tissue matching, and transplant waitlists. How can I help you?`;
            }
        }

        res.json({
            success: true,
            message: responseText,
            sender: {
                _id: 'lifesync-ai-bot',
                firstName: 'LifeSync',
                lastName: 'AI',
                avatar: 'https://cdn-icons-png.flaticon.com/512/4712/4712035.png'
            }
        });
    } catch (error) {
        console.error('Chat with AI error:', error);
        res.json({
            success: true,
            message: "I am LifeSync AI. I am here to assist with your organ donation, UDAY report verification, and matching queries.",
            sender: {
                _id: 'lifesync-ai-bot',
                firstName: 'LifeSync',
                lastName: 'AI'
            }
        });
    }
};

module.exports = {
    getSmartHelp,
    explainMedicalTerms,
    chatWithAI,
    scanDonorDocument: require('../controllers/aiController').scanDonorDocument || (async (req, res, next) => {
        try {
            if (!req.file) return res.status(400).json({ success: false, message: 'Please upload document image' });
            const { analyzeDonorDocument } = require('../services/aiOCRService');
            const result = await analyzeDonorDocument(req.file.buffer, req.file.mimetype);
            res.json({ success: true, message: 'Document analyzed with UDAY OCR', data: result });
        } catch (err) { next(err); }
    }),
    calculateDonorHistoryText: require('../controllers/aiController').calculateDonorHistoryText || (async (req, res, next) => {
        try {
            const { text } = req.body;
            const { analyzeDonorTextReport } = require('../services/aiOCRService');
            const result = await analyzeDonorTextReport(text);
            res.json({ success: true, message: 'History calculated with UDAY OCR', data: result });
        } catch (err) { next(err); }
    })
};
