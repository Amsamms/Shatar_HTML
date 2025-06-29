# 🎭 Arabic Poetry Generator

A beautiful web application that generates Arabic poetry using AI (Claude 3.5 Sonnet and GPT-4), featuring traditional Arabic poetic meters and styles.

## ✨ Features

- **AI-Powered Poetry Generation**: Uses Claude 3.5 Sonnet and GPT-4o models
- **Traditional Arabic Meters**: Supports 8 classical poetry meters (بحور الشعر)
- **Multiple Styles**: Classical (كلاسيكي) and Modern (حديث) poetry styles
- **Secure API Handling**: Backend server protects API keys
- **Beautiful UI**: RTL Arabic interface with modern design
- **Export Options**: Copy and download generated poems

## 🚀 Live Demo

[Add your deployed URL here]

## 🛠️ Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- API keys from:
  - [Anthropic](https://console.anthropic.com/) (for Claude)
  - [OpenAI](https://platform.openai.com/) (for GPT-4)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/arabic-poetry-generator.git
   cd arabic-poetry-generator
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup environment variables**
   ```bash
   # Copy the example file
   copy .env.example .env
   
   # Edit .env and add your API keys
   ANTHROPIC_API_KEY=your_anthropic_api_key_here
   OPENAI_API_KEY=your_openai_api_key_here
   PORT=3000
   ```

4. **Start the server**
   ```bash
   # Development mode (with auto-restart)
   npm run dev
   
   # Production mode
   npm start
   ```

5. **Open your browser**
   ```
   http://localhost:3000
   ```

## 🌐 Deployment

### Deploy to Heroku

1. **Create a Heroku app**
   ```bash
   heroku create your-app-name
   ```

2. **Set environment variables**
   ```bash
   heroku config:set ANTHROPIC_API_KEY=your_key_here
   heroku config:set OPENAI_API_KEY=your_key_here
   ```

3. **Deploy**
   ```bash
   git push heroku main
   ```

### Deploy to Railway

1. **Connect your GitHub repo to Railway**
2. **Add environment variables in Railway dashboard**
3. **Deploy automatically**

### Deploy to Vercel

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Deploy**
   ```bash
   vercel
   ```

3. **Add environment variables in Vercel dashboard**

## 📁 Project Structure

```
arabic-poetry-generator/
├── server.js              # Express backend server
├── index.html             # Frontend application
├── package.json           # Node.js dependencies
├── .env.example          # Environment variables template
├── .gitignore            # Git ignore rules
└── README.md             # This file
```

## 🎨 Supported Poetry Meters

- البسيط (Al-Basit)
- الطويل (At-Tawil)
- الوافر (Al-Wafir)
- الكامل (Al-Kamil)
- الهزج (Al-Hazaj)
- الرجز (Ar-Rajaz)
- المتقارب (Al-Mutaqarib)
- الرمل (Ar-Ramal)

## 🔒 Security Features

- API keys stored securely on the server
- No client-side API key exposure
- CORS protection
- Input validation and sanitization

## 🛡️ Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `ANTHROPIC_API_KEY` | Optional* | Your Anthropic (Claude) API key |
| `OPENAI_API_KEY` | Optional* | Your OpenAI (GPT) API key |
| `PORT` | No | Server port (default: 3000) |

*At least one API key is required

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Anthropic](https://www.anthropic.com/) for Claude API
- [OpenAI](https://openai.com/) for GPT API
- Arabic poetry meters and traditions
- Google Fonts for Arabic typography

## 📞 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/yourusername/arabic-poetry-generator/issues) page
2. Create a new issue if needed
3. Contact: [your-email@example.com]

---

**Made with ❤️ for Arabic poetry lovers**
