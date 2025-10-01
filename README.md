# AI Financial Advisor - Smart Expense Analyzer & Visualizer

[![Built with Lovable](https://img.shields.io/badge/Built%20with-Lovable-blue)](https://lovable.dev)
[![React](https://img.shields.io/badge/React-18.3-blue)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Backend-green)](https://supabase.com/)

A comprehensive AI-powered financial management platform that helps you track expenses, analyze spending patterns, manage investments, and make informed financial decisions with intelligent chatbot assistance.

![AI Financial Advisor Demo](https://lovable.dev/opengraph-image-p98pqg.png)

## 🚀 Live Demo

**URL**: https://lovable.dev/projects/7a3b636d-576d-47ca-b94e-a87ccc85c580

## ✨ Features

### 📊 Expense Tracking & Analytics
- **Manual Entry**: Add income and expenses with custom categories
- **CSV/Excel Import**: Upload bank statements and UPI transaction exports
- **Auto-Categorization**: Smart AI-powered transaction categorization
- **Visual Charts**: Interactive expense breakdown by category, time period
- **PDF Export**: Download detailed expense reports with charts

### 🤖 AI-Powered Chatbot
- **Natural Language Queries**: Ask questions about your finances
- **Context-Aware**: Analyzes your transaction history to provide personalized insights
- **Spending Insights**: "How much did I spend on food last month?"
- **Budget Recommendations**: Get AI-generated budget suggestions
- **Expense Predictions**: Forecast future expenses based on historical data

### 💰 Budget Management
- **Category Budgets**: Set monthly spending limits per category
- **Progress Tracking**: Real-time budget vs. actual spending
- **Alerts**: Notifications when approaching or exceeding budgets
- **Visual Goals**: Progress bars and indicators

### 📈 Investment Tracking
- **Portfolio Manager**: Track stocks, mutual funds, bonds, and FDs
- **Live Market Data**: Real-time price updates
- **Performance Analytics**: Track gains/losses and portfolio performance
- **Risk Assessment**: Based on user's risk profile

### 🎮 Gamification
- **Achievements**: Earn badges for financial milestones
- **Streaks**: Track consecutive days of expense logging
- **Leaderboards**: Compare progress (optional)

### 🔄 Recurring Transactions
- **Auto-Scheduling**: Set up recurring income/expenses
- **Smart Reminders**: Get notified for upcoming bills
- **Automatic Processing**: Transactions added automatically

### 🧾 Receipt Scanner (OCR)
- **Image Upload**: Scan physical receipts
- **Text Extraction**: AI-powered OCR to extract transaction details
- **Auto-Fill**: Populate transaction forms from scanned data

### 🌍 Multi-Language Support
- English
- Hindi (हिंदी)
- More languages coming soon

### 🎨 Theme Support
- Light mode
- Dark mode
- System preference (auto)

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern UI framework
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Beautiful, accessible component library
- **Recharts** - Data visualization
- **i18next** - Internationalization

### Backend
- **Supabase** - PostgreSQL database, authentication, edge functions
- **Row Level Security** - Secure data access
- **Edge Functions** - Serverless AI integration

### AI & Analysis
- **Hugging Face API** - Advanced language models
- **OpenAI API** - GPT models for financial insights
- **Tesseract.js** - OCR for receipt scanning

### File Processing
- **XLSX** - Excel file parsing
- **PapaParse** - CSV parsing
- **jsPDF** - PDF generation

## 📦 Installation

### Prerequisites
- Node.js 18+ and npm (or use [nvm](https://github.com/nvm-sh/nvm))
- Git
- A Supabase account (for backend)

### Local Development

1. **Clone the repository**
```bash
git clone <YOUR_GIT_URL>
cd <YOUR_PROJECT_NAME>
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
Create a `.env` file with your Supabase credentials (already configured if using Lovable)

4. **Start the development server**
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Build for Production

```bash
npm run build
```

Built files will be in the `dist/` directory.

## 🚀 Deployment

### Quick Deploy with Lovable
1. Open [Lovable Project](https://lovable.dev/projects/7a3b636d-576d-47ca-b94e-a87ccc85c580)
2. Click **Share → Publish**
3. Your app will be live instantly!

### Custom Domain
Navigate to **Project > Settings > Domains** and connect your domain.
[Read more](https://docs.lovable.dev/tips-tricks/custom-domain)

### Alternative Deployment Options
- **Vercel**: `vercel deploy`
- **Netlify**: Connect GitHub repo and deploy
- **Render**: Deploy as static site

## 🔐 Security Features

- **Row Level Security (RLS)**: All user data is protected at the database level
- **Secure Authentication**: Email/password authentication via Supabase
- **API Key Management**: Secure storage of external API keys
- **Data Encryption**: All sensitive data encrypted in transit and at rest

## 📖 Usage Guide

### Getting Started
1. **Sign Up**: Create an account on the landing page
2. **Add Transactions**: Manually add your first few transactions
3. **Import Statements**: Upload bank statements (CSV/Excel) for bulk import
4. **Set Budgets**: Define monthly spending limits for categories
5. **Chat with AI**: Ask questions about your spending patterns

### Importing Bank Statements
Supported formats:
- CSV files from banks (HDFC, SBI, ICICI, etc.)
- Excel files (.xlsx, .xls)
- UPI app exports (PhonePe, Google Pay, Paytm)

The system auto-detects columns for Date, Description, and Amount.

### Using AI Chatbot
Example queries:
- "How much did I spend on groceries last month?"
- "Compare my spending this month vs last month"
- "What's my biggest expense category?"
- "Help me create a budget for next month"
- "Am I overspending on food?"

## 🗺️ Roadmap

### Phase 1: Core Features ✅
- [x] Expense tracking
- [x] Manual transaction entry
- [x] CSV/Excel import
- [x] Auto-categorization
- [x] Visual charts
- [x] Budget goals
- [x] AI chatbot

### Phase 2: Advanced Features ✅
- [x] Investment tracking
- [x] Portfolio management
- [x] Receipt OCR
- [x] Gamification
- [x] Recurring transactions
- [x] PDF export

### Phase 3: Integrations (Coming Soon)
- [ ] Live bank API integration (Open Banking)
- [ ] Direct UPI sync
- [ ] Real-time stock prices
- [ ] Email/Slack notifications
- [ ] Google Calendar integration
- [ ] WhatsApp/Telegram bot

### Phase 4: Advanced AI (Planned)
- [ ] Predictive spending alerts
- [ ] Personalized investment recommendations
- [ ] Anomaly detection (unusual transactions)
- [ ] Tax optimization suggestions
- [ ] Financial goal planning

## 🤝 Contributing

This is a Lovable project. To contribute:
1. Make changes via [Lovable UI](https://lovable.dev/projects/7a3b636d-576d-47ca-b94e-a87ccc85c580)
2. Or clone the repo and push changes directly
3. All changes sync automatically

## 📄 License

This project is built with Lovable. See [Lovable Terms](https://lovable.dev/terms) for details.

## 🙏 Acknowledgments

- Built with [Lovable](https://lovable.dev)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Backend powered by [Supabase](https://supabase.com/)
- AI models from [Hugging Face](https://huggingface.co/) and [OpenAI](https://openai.com/)

## 📞 Support

For issues or questions:
- GitHub Issues: [Report a bug](https://github.com/your-repo/issues)
- Lovable Community: [Discord](https://discord.com/invite/lovable)
- Documentation: [Lovable Docs](https://docs.lovable.dev)

---

**Made with ❤️ using Lovable**
