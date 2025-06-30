const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Added debugging for API key troubleshooting
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
        
        // Debug logging - Basic request info
        console.log('=== POEM GENERATION REQUEST ===');
        console.log('Request body:', { theme, meter, style, verses, provider });
        console.log('Environment check:');
        console.log('- ANTHROPIC_API_KEY exists:', !!process.env.ANTHROPIC_API_KEY);
        console.log('- OPENAI_API_KEY exists:', !!process.env.OPENAI_API_KEY);
        
        if (process.env.ANTHROPIC_API_KEY) {
            console.log('- Anthropic key (first 10 chars):', process.env.ANTHROPIC_API_KEY.substring(0, 10) + '...');
        }
        if (process.env.OPENAI_API_KEY) {
            console.log('- OpenAI key (first 10 chars):', process.env.OPENAI_API_KEY.substring(0, 10) + '...');
        }
        
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

        // Debug logging
        console.log('🎭 Poetry generation request:', { theme, provider, verses });
        console.log('🔑 API Keys status:', {
            anthropic: process.env.ANTHROPIC_API_KEY ? `${process.env.ANTHROPIC_API_KEY.substring(0, 10)}...` : 'NOT SET',
            openai: process.env.OPENAI_API_KEY ? `${process.env.OPENAI_API_KEY.substring(0, 10)}...` : 'NOT SET'
        });

        let poem;
        
        if (provider === 'anthropic' && process.env.ANTHROPIC_API_KEY) {
            console.log('📞 Calling Anthropic API...');
            poem = await callAnthropicAPI(prompt, process.env.ANTHROPIC_API_KEY);
        } else if (provider === 'openai' && process.env.OPENAI_API_KEY) {
            console.log('📞 Calling OpenAI API...');
            poem = await callOpenAIAPI(prompt, process.env.OPENAI_API_KEY);
        } else {
            // Fallback to available provider
            if (process.env.ANTHROPIC_API_KEY) {
                console.log('📞 Fallback: Using Anthropic API...');
                poem = await callAnthropicAPI(prompt, process.env.ANTHROPIC_API_KEY);
            } else if (process.env.OPENAI_API_KEY) {
                console.log('📞 Fallback: Using OpenAI API...');
                poem = await callOpenAIAPI(prompt, process.env.OPENAI_API_KEY);
            } else {
                console.log('❌ No API keys configured!');
                return res.status(500).json({ error: 'No API keys configured' });
            }
        }

        console.log('✅ Poem generated successfully');
        res.json({ poem, provider: provider || 'fallback' });

    } catch (error) {
        console.error('❌ Error generating poem:', error);
        console.error('Error details:', {
            message: error.message,
            status: error.status,
            provider: req.body.provider
        });
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
    console.log('🤖 Anthropic API Call Details:');
    console.log('- API Key length:', apiKey.length);
    console.log('- API Key prefix:', apiKey.substring(0, 15) + '...');
    console.log('- Prompt length:', prompt.length);
    console.log('- Model: claude-3-5-sonnet-20241022');
    
    try {
        const requestBody = {
            model: 'claude-3-5-sonnet-20241022',
            max_tokens: 1000,
            temperature: 0.8,
            messages: [
                {
                    role: 'user',
                    content: prompt
                }
            ]
        };
        
        console.log('- Request body size:', JSON.stringify(requestBody).length);
        
        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiKey,
                'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify(requestBody)
        });

        console.log('📡 Anthropic Response:');
        console.log('- Status:', response.status);
        console.log('- Status Text:', response.statusText);
        console.log('- Headers:', Object.fromEntries(response.headers.entries()));

        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ Anthropic API Error Response:', errorText);
            
            let errorDetails;
            try {
                errorDetails = JSON.parse(errorText);
                console.error('❌ Parsed error details:', errorDetails);
            } catch (parseError) {
                console.error('❌ Could not parse error response as JSON');
            }
            
            throw new Error(`Anthropic API Error: ${response.status} ${response.statusText} - ${errorText}`);
        }

        const data = await response.json();
        console.log('✅ Anthropic Success Response Structure:');
        console.log('- Has content array:', !!data.content);
        console.log('- Content array length:', data.content ? data.content.length : 'N/A');
        console.log('- First content type:', data.content && data.content[0] ? data.content[0].type : 'N/A');
        console.log('- Text length:', data.content && data.content[0] && data.content[0].text ? data.content[0].text.length : 'N/A');
        
        return data.content[0].text.trim();
        
    } catch (error) {
        console.error('💥 Anthropic API Call Exception:', error.message);
        console.error('💥 Full error object:', error);
        throw error;
    }
}

async function callOpenAIAPI(prompt, apiKey) {
    console.log('🤖 OpenAI API Call Details:');
    console.log('- API Key length:', apiKey.length);
    console.log('- API Key prefix:', apiKey.substring(0, 10) + '...');
    console.log('- Prompt length:', prompt.length);
    console.log('- Model: gpt-4o');
    
    try {
        const requestBody = {
            model: 'gpt-4o',
            max_tokens: 1000,
            temperature: 0.8,
            messages: [
                {
                    role: 'user',
                    content: prompt
                }
            ]
        };
        
        console.log('- Request body size:', JSON.stringify(requestBody).length);
        
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify(requestBody)
        });

        console.log('📡 OpenAI Response:');
        console.log('- Status:', response.status);
        console.log('- Status Text:', response.statusText);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ OpenAI API Error Response:', errorText);
            
            let errorDetails;
            try {
                errorDetails = JSON.parse(errorText);
                console.error('❌ Parsed error details:', errorDetails);
            } catch (parseError) {
                console.error('❌ Could not parse error response as JSON');
            }
            
            throw new Error(`OpenAI API Error: ${response.status} ${response.statusText} - ${errorText}`);
        }

        const data = await response.json();
        console.log('✅ OpenAI Success Response Structure:');
        console.log('- Has choices array:', !!data.choices);
        console.log('- Choices array length:', data.choices ? data.choices.length : 'N/A');
        console.log('- First choice has message:', data.choices && data.choices[0] ? !!data.choices[0].message : 'N/A');
        console.log('- Content length:', data.choices && data.choices[0] && data.choices[0].message ? data.choices[0].message.content.length : 'N/A');
        
        return data.choices[0].message.content.trim();
        
    } catch (error) {
        console.error('💥 OpenAI API Call Exception:', error.message);
        console.error('💥 Full error object:', error);
        throw error;
    }
}

app.listen(PORT, () => {
    console.log(`🎭 Arabic Poetry Generator server running on port ${PORT}`);
    console.log(`🌐 Open http://localhost:${PORT} in your browser`);
    
    // Environment variables check at startup
    console.log('\n🔧 Environment Variables Status:');
    console.log('- NODE_ENV:', process.env.NODE_ENV || 'development');
    console.log('- ANTHROPIC_API_KEY:', process.env.ANTHROPIC_API_KEY ? 
        `✅ Set (${process.env.ANTHROPIC_API_KEY.length} chars, starts with: ${process.env.ANTHROPIC_API_KEY.substring(0, 15)}...)` : 
        '❌ Not set');
    console.log('- OPENAI_API_KEY:', process.env.OPENAI_API_KEY ? 
        `✅ Set (${process.env.OPENAI_API_KEY.length} chars, starts with: ${process.env.OPENAI_API_KEY.substring(0, 10)}...)` : 
        '❌ Not set');
    console.log('');
    
    // Enhanced debugging - updated deployment trigger
});
