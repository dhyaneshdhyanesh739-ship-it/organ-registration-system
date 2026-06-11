/**
 * aiController.js
 * Handles AI-powered assistance for the chat system.
 */

// Mock AI Logic for demonstration (can be replaced with real Gemini/OpenAI API)
const generateSuggestions = (context) => {
    const { role, lastMessage, organType } = context;

    if (!lastMessage) return ["Hello!", "How can I help you today?", `I'm inquiring about the ${organType} match.`];

    const text = lastMessage.toLowerCase();

    if (role === 'hospital') {
        if (text.includes('ready') || text.includes('available')) {
            return ["We have scheduled the transport.", "The medical team is on standby.", "What is the expected arrival time?"];
        }
        if (text.includes('accept') || text.includes('confirm')) {
            return ["Thank you for the confirmation.", "We are starting the pre-op preparation.", "Please send the donor medical history."];
        }
    } else if (role === 'donor') {
        if (text.includes('hospital') || text.includes('where')) {
            return ["I am available to travel.", "Please let me know the location.", "What documents do I need to bring?"];
        }
    }

    return [
        "I understand. Let's coordinate the next steps.",
        "Could you provide more details?",
        "Thank you for the update."
    ];
};

const getSmartHelp = async (req, res, next) => {
    try {
        const { lastMessage, role, organType } = req.body;

        // Simulate AI processing delay
        await new Promise(resolve => setTimeout(resolve, 800));

        const suggestions = generateSuggestions({ lastMessage, role, organType });

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

        const terms = {
            'hla': 'Human Leukocyte Antigen: A group of proteins that help the immune system identify which cells belong in your body and which do not.',
            'ischemic time': 'The time between the chilling of an organ after its blood supply has been cut off and the time it is warmed by having its blood supply restored.',
            'crossmatch': 'A test to determine if a donor’s blood is compatible with the recipient’s blood.',
            'creatinine': 'A waste product in the blood that is filtered by the kidneys. High levels can indicate kidney issues.'
        };

        const explanation = terms[term.toLowerCase()] || "I don't have a detailed explanation for that medical term yet, but I can look it up for you.";

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

        // Simulate AI thinking delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        let response = "";
        const text = message.toLowerCase();

        // Medical Knowledge Base
        if (text.includes('hla')) {
            response = "HLA (Human Leukocyte Antigen) markers are proteins on your cells that help your immune system tell the difference between 'self' and 'foreign'. In organ donation, we look at HLA-A, B, C, DR, DQ, and DP to find the best match and reduce the risk of rejection.";
        } else if (text.includes('match') && text.includes('score')) {
            response = "Our Smart Matching Engine calculates compatibility based on HLA markers, blood type, age, organ size, and transport distance. A score above 75% is considered a strong match!";
        } else if (text.includes('transplant') || text.includes('process')) {
            response = "The process involves: 1. Registration & Screening, 2. Listing on the National Registry, 3. Matching (using our AI engine), 4. Pre-op evaluation, and 5. Surgery & Recovery.";
        } else if (text.includes('hello') || text.includes('hi')) {
            response = `Hello! I am LifeSync AI. I'm here to help you navigate the organ ${role === 'donor' ? 'donation' : 'request'} process. How can I assist you today?`;
        } else {
            response = "That's an interesting question. While I'm still learning, I can tell you that the LifeSync system prioritizing medical compatibility and urgency to save lives. Would you like me to explain a specific medical term or how matching works?";
        }

        res.json({
            success: true,
            message: response,
            sender: {
                _id: 'lifesync-ai-bot',
                firstName: 'LifeSync',
                lastName: 'AI',
                avatar: 'https://cdn-icons-png.flaticon.com/512/4712/4712035.png'
            }
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getSmartHelp,
    explainMedicalTerms,
    chatWithAI
};
