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
        const { theme, verses, provider } = req.body;
        
        // Debug logging - Basic request info
        console.log('=== POEM GENERATION REQUEST ===');
        console.log('Request body:', { theme, verses, provider });
        console.log('Environment check:');
        console.log('- ANTHROPIC_API_KEY exists:', !!process.env.ANTHROPIC_API_KEY);
        console.log('- OPENAI_API_KEY exists:', !!process.env.OPENAI_API_KEY);
        
        if (process.env.ANTHROPIC_API_KEY) {
            console.log('- Anthropic key (first 10 chars):', process.env.ANTHROPIC_API_KEY.substring(0, 10) + '...');
        }
        if (process.env.OPENAI_API_KEY) {
            console.log('- OpenAI key (first 10 chars):', process.env.OPENAI_API_KEY.substring(0, 10) + '...');
        }
        
        if (!theme || !verses) {
            return res.status(400).json({ error: 'Missing required parameters' });
        }

        // Enhanced prompt with few-shot examples and chain of thought
        const poetryExamples = {
            'الطويل': {
                pattern: 'فَعُولُن مَفَاعِيلُن فَعُولُن مَفَاعِلُن',
                example: 'لَعَمْرُكَ مَا الأَيَّامُ إِلَّا مَعَارَةٌ\nفَمَا اسْتَطَلَتْ أَيَّامَهَا رُبَّ طُولِ'
            },
            'الكامل': {
                pattern: 'مُتَفَاعِلُن مُتَفَاعِلُن مُتَفَاعِلُن',
                example: 'بَدَا قَمَرٌ فِي لَيْلَةٍ ظَلْمَاءَ\nيُضِيءُ دُرُوبَ السَّائِرِينَ إِضَاءَةْ'
            },
            'البسيط': {
                pattern: 'مُسْتَفْعِلُن فَاعِلُن مُسْتَفْعِلُن فَعِلُن',
                example: 'إِذَا غَامَرْتَ فِي شَرَفٍ مَرُومِ\nفَلَا تَقْنَعْ بِمَا دُونَ النُّجُومِ'
            }
        };

        const systemRole = 'أنت شاعر عربي فصيح وخبير في العروض والقوافي، تُنشئ قصائد ملتزمة تماماً بالوزن والقافية وبالتشكيل.';
        
        const userPrompt = `اكتب قصيدة عربية جميلة عن موضوع "${theme}"

أمثلة على البحور الشعرية:

🔹 البحر الطويل:
التفعيلة: ${poetryExamples['الطويل'].pattern}
مثال: ${poetryExamples['الطويل'].example}

🔹 البحر الكامل:
التفعيلة: ${poetryExamples['الكامل'].pattern}
مثال: ${poetryExamples['الكامل'].example}

🔹 البحر البسيط:
التفعيلة: ${poetryExamples['البسيط'].pattern}
مثال: ${poetryExamples['البسيط'].example}

المطلوب (Chain of Thought):

1️⃣ **التحليل**: فكر في الموضوع "${theme}" وحدد المشاعر والصور المناسبة.

2️⃣ **اختيار البحر**: اختر بحراً واحداً من [الطويل، الكامل، البسيط] يناسب طبيعة الموضوع.

3️⃣ **التخطيط**: خطط لـ ${verses} أبيات مترابطة المعنى مع قافية موحدة.

4️⃣ **الكتابة**: اكتب كل بيت ملتزماً بـ:
   • التفعيلة المختارة بدقة
   • القافية الموحدة
   • التشكيل الكامل
   • المعنى الواضح والجميل

5️⃣ **المراجعة**: تأكد من صحة الوزن والقافية في كل بيت.

اكتب القصيدة مباشرة بدون مقدمات، مع جعل كل بيت في سطر منفصل.`;

        // For Anthropic (combine system role with user prompt)
        const anthropicPrompt = `${systemRole}

${userPrompt}`;

        // For OpenAI (separate system and user roles)
        const openaiSystemRole = systemRole;
        const openaiUserPrompt = userPrompt;

        // Debug logging
        console.log('🎭 Poetry generation request:', { theme, provider, verses });
        console.log('🔑 API Keys status:', {
            anthropic: process.env.ANTHROPIC_API_KEY ? `${process.env.ANTHROPIC_API_KEY.substring(0, 10)}...` : 'NOT SET',
            openai: process.env.OPENAI_API_KEY ? `${process.env.OPENAI_API_KEY.substring(0, 10)}...` : 'NOT SET'
        });

        let poem;
        
        if (provider === 'anthropic' && process.env.ANTHROPIC_API_KEY) {
            console.log('📞 Calling Anthropic API...');
            poem = await callAnthropicAPI(anthropicPrompt, process.env.ANTHROPIC_API_KEY);
        } else if (provider === 'openai' && process.env.OPENAI_API_KEY) {
            console.log('📞 Calling OpenAI API...');
            poem = await callOpenAIAPI(openaiSystemRole, openaiUserPrompt, process.env.OPENAI_API_KEY);
        } else {
            // Fallback to available provider
            if (process.env.ANTHROPIC_API_KEY) {
                console.log('📞 Fallback: Using Anthropic API...');
                poem = await callAnthropicAPI(anthropicPrompt, process.env.ANTHROPIC_API_KEY);
            } else if (process.env.OPENAI_API_KEY) {
                console.log('📞 Fallback: Using OpenAI API...');
                poem = await callOpenAIAPI(openaiSystemRole, openaiUserPrompt, process.env.OPENAI_API_KEY);
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
    console.log('- Model: claude-sonnet-4-20250514');
    
    try {
        const requestBody = {
            model: 'claude-sonnet-4-20250514',
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

async function callOpenAIAPI(systemRole, userPrompt, apiKey) {
    console.log('🤖 OpenAI API Call Details:');
    console.log('- API Key length:', apiKey.length);
    console.log('- API Key prefix:', apiKey.substring(0, 10) + '...');
    console.log('- System role length:', systemRole.length);
    console.log('- User prompt length:', userPrompt.length);
    console.log('- Model: gpt-4o');
    
    try {
        const requestBody = {
            model: 'gpt-4o',
            max_tokens: 1000,
            temperature: 0.8,
            messages: [
                {
                    role: 'system',
                    content: systemRole
                },
                {
                    role: 'user',
                    content: userPrompt
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
