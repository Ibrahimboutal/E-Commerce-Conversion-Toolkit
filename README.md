# E-Commerce Conversion Toolkit 🛒

A powerful, AI-driven toolkit for e-commerce stores to recover lost revenue, analyze customer sentiment, and optimize conversion rates.

## ✨ Features

### Core Tools
- 🛒 **Abandoned Cart Recovery** - Track and recover abandoned shopping carts with automated email reminders
- 📊 **Revenue Forecasting** - AI-powered revenue predictions using linear regression models
- ⭐ **Review Analyzer** - Sentiment analysis and keyword extraction from customer reviews
- 👥 **Customer Management** - Track customer lifetime value and segmentation
- 🎨 **AI Copywriter** - Generate high-converting email subject lines and marketing copy
- 🔬 **A/B Test Simulator** - Simulate and analyze A/B test results

### Features
- 🎯 Real-time analytics dashboard
- 📧 Email campaign management
- 📈 Visual data charts and insights
- 🌓 Dark/Light theme support
- 🔒 Secure authentication with Supabase
- 💎 Free and Pro subscription tiers
- 📱 Responsive mobile design

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router v7
- **Backend**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Charts**: Recharts
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Notifications**: React Hot Toast

## 📋 Prerequisites

- Node.js 18+ and npm
- Supabase account ([supabase.com](https://supabase.com))
- Git

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd project
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Add your Supabase credentials to `.env`:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**How to get Supabase credentials:**
1. Go to [supabase.com](https://supabase.com) and create a project
2. Navigate to Settings > API
3. Copy the Project URL and anon/public key

### 4. Set Up the Database

#### Option A: Using Supabase Dashboard
1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Run the migration files from `supabase/migrations/` in order

#### Option B: Using Supabase CLI
```bash
# Install Supabase CLI
npm install -g supabase

# Link your project
supabase link --project-ref your-project-ref

# Push migrations
supabase db push
```

### 5. Run the Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## 📦 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript type checking

## 🏗️ Project Structure

```
project/
├── src/
│   ├── components/        # React components
│   │   ├── Dashboard.tsx
│   │   ├── AbandonedCarts.tsx
│   │   ├── AICopywriter.tsx
│   │   └── ...
│   ├── contexts/          # React Context providers
│   │   ├── AuthContext.tsx
│   │   ├── ThemeContext.tsx
│   │   └── SubscriptionContext.tsx
│   ├── lib/               # Utilities and configurations
│   │   └── supabase.ts
│   ├── pages/             # Page components
│   │   ├── Home.tsx
│   │   └── NotFound.tsx
│   ├── utils/             # Helper functions
│   ├── App.tsx            # Main app component
│   └── main.tsx           # Entry point
├── supabase/
│   ├── functions/         # Edge Functions
│   └── migrations/        # Database migrations
├── .env                   # Environment variables (not committed)
├── .env.example           # Environment template
└── package.json
```

## 🔐 Authentication

The app uses Supabase Authentication with email/password:

1. Sign up with email and password
2. A store profile is automatically created
3. Access the dashboard and tools

## 💎 Subscription Tiers

### Free Tier
- Basic abandoned cart tracking
- Customer management
- Review analyzer
- Store settings

### Pro Tier
- ✨ All Free features
- AI Copywriter
- Revenue Forecasting
- Advanced analytics
- Priority support

## 🗄️ Database Schema

### Tables
- `stores` - Store configurations and subscription info
- `abandoned_carts` - Abandoned cart records
- `cart_items` - Items in abandoned carts
- `reviews` - Customer reviews with sentiment analysis
- `customers` - Customer data and metrics

See `supabase/migrations/` for full schema definitions.

## 🚢 Deployment

### Deploying to Vercel

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Deploy:
```bash
npm run build
vercel --prod
```

3. Add environment variables in Vercel dashboard:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

### Deploying to Netlify

1. Build the project:
```bash
npm run build
```

2. Deploy the `dist` folder to Netlify

3. Add environment variables in Netlify dashboard

### Other Platforms
The app can be deployed to any static hosting platform (Cloudflare Pages, GitHub Pages, etc.)

## 🔧 Configuration

### Tailwind CSS
Configuration in `tailwind.config.js`. Customize colors, fonts, and spacing.

### TypeScript
Configuration in `tsconfig.json` and `tsconfig.app.json`.

### Vite
Configuration in `vite.config.ts`. Adjust build settings and plugins.

## 🐛 Troubleshooting

### "Missing Supabase environment variables"
- Ensure `.env` file exists with correct credentials
- Restart dev server after adding env vars

### Database Connection Issues
- Verify Supabase project is active
- Check API keys are correct
- Ensure Row Level Security policies are set up

### Build Errors
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Clear Vite cache: `rm -rf node_modules/.vite`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🔗 Resources

- [React Documentation](https://react.dev)
- [Vite Documentation](https://vitejs.dev)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)

## 📞 Support

For issues and questions:
- Open an issue on GitHub
- Check existing documentation
- Review Supabase logs for backend errors

---

Built with ❤️ using React, TypeScript, and Supabase
