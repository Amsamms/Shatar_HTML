const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Serve the HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// API endpoint for generating poetry
app.post('/api/generate-poem', async (req, res) => {
    try {
        const { theme, meter, style, verses, provider } = req.body;
        
        if (!theme || !meter || !style || !verses) {
            return res.status(400).json({ error: 'Missing required parameters' });
        }

        const styleInstruction = style === "modern" ? "بأسلوب شعري حديث ومعاصر" : "بأسلوب شعري كلاسيكي فصيح";
        
        const meters = {
            "البسيط": "مُسْتَفْعِلُنْ فَاعِلُنْ مُسْتَفْعِلُنْ فَعِلُنْ",
            "الطويل": "فَعُولُنْ مَفَاعِيلُنْ فَعُولُنْ مَفَاعِلُنْ",
            "الوافر": "مُفَاعَلَتُنْ مُفَاعَلَتُنْ فَعُولُنْ",
            "الكامل": "مُتَفَاعِلُنْ مُتَفَاعِلُنْ مُتَفَاعِلُنْ",
            "الهزج": "مَفَاعِيلُنْ مَفَاعِيلُنْ",
            "الرجز": "مُسْتَفْعِلُنْ مُسْتَفْعِلُنْ مُسْتَفْعِلُنْ",
            "المتقارب": "فَعُولُنْ فَعُولُنْ فَعُولُنْ فَعُولُنْ",
            "الرمل": "فَاعِلاتُنْ فَاعِلاتُنْ فَاعِلاتُنْ"
        };

        const prompt = `اكتب قصيدة عربية جميلة ${styleInstruction}

الموضوع: ${theme}
البحر الشعري: ${meter}
التفعيلة: ${meters[meter]}
عدد الأبيات: ${verses}

شروط مهمة:
- التزم بالوزن الشعري بدقة تامة
- استخدم قافية موحدة
- اجعل المعنى واضحاً وجميلاً
- تجنب التعقيد اللغوي المفرط
- اكتب القصيدة مباشرة بدون مقدمات أو تعليقات

القصيدة:`;

        let poem;
        
        if (provider === 'anthropic' && process.env.ANTHROPIC_API_KEY) {
            poem = await callAnthropicAPI(prompt, process.env.ANTHROPIC_API_KEY);
        } else if (provider === 'openai' && process.env.OPENAI_API_KEY) {
            poem = await callOpenAIAPI(prompt, process.env.OPENAI_API_KEY);
        } else {
            // Fallback to available provider
            if (process.env.ANTHROPIC_API_KEY) {
                poem = await callAnthropicAPI(prompt, process.env.ANTHROPIC_API_KEY);
            } else if (process.env.OPENAI_API_KEY) {
                poem = await callOpenAIAPI(prompt, process.env.OPENAI_API_KEY);
            } else {
                return res.status(500).json({ error: 'No API keys configured' });
            }
        }

        res.json({ poem, provider: provider || 'fallback' });

    } catch (error) {
        console.error('Error generating poem:', error);
        res.status(500).json({ error: error.message });
    }
});

// Check available providers
app.get('/api/providers', (req, res) => {
    const providers = {
        anthropic: !!process.env.ANTHROPIC_API_KEY,
        openai: !!process.env.OPENAI_API_KEY
    };
    res.json(providers);
});

async function callAnthropicAPI(prompt, apiKey) {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
            model: 'claude-3-5-sonnet-20241022',
            max_tokens: 1000,
            temperature: 0.8,
            messages: [
                {
                    role: 'user',
                    content: prompt
                }
            ]
        })
    });

    if (!response.ok) {
        throw new Error(`Anthropic API Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.content[0].text.trim();
}

async function callOpenAIAPI(prompt, apiKey) {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model: 'gpt-4o',
            max_tokens: 1000,
            temperature: 0.8,
            messages: [
                {
                    role: 'user',
                    content: prompt
                }
            ]
        })
    });

    if (!response.ok) {
        throw new Error(`OpenAI API Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content.trim();
}

app.listen(PORT, () => {
    console.log(`🎭 Arabic Poetry Generator server running on port ${PORT}`);
    console.log(`🌐 Open http://localhost:${PORT} in your browser`);
});
