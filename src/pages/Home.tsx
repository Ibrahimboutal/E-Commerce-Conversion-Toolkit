import { Link } from 'react-router-dom';
import { ArrowRight, BarChart2, Shield, Zap } from 'lucide-react';

export default function Home() {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
            <nav className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 backdrop-blur-sm sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="bg-emerald-600 p-2 rounded-lg">
                            <BarChart2 className="w-6 h-6 text-white" />
                        </div>
                        <span className="font-bold text-xl text-slate-900 dark:text-white">ConversionToolkit</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <Link to="/login" className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-medium">
                            Log in
                        </Link>
                        <Link to="/dashboard" className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                            Get Started
                        </Link>
                    </div>
                </div>
            </nav>

            <main>
                {/* Hero Section */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
                    <div className="text-center max-w-3xl mx-auto">
                        <h1 className="text-4xl sm:text-6xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-8">
                            Recover Lost Revenue with <span className="text-emerald-600">Smart Automation</span>
                        </h1>
                        <p className="text-xl text-slate-600 dark:text-slate-400 mb-10 leading-relaxed">
                            The all-in-one toolkit for e-commerce stores. Recover abandoned carts, analyze customer sentiment, and predict revenue with AI-powered insights.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link to="/dashboard" className="w-full sm:w-auto px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-500/30">
                                Start Recovering Revenue <ArrowRight className="w-5 h-5" />
                            </Link>
                            <a href="#features" className="w-full sm:w-auto px-8 py-4 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 rounded-xl font-bold text-lg transition-all">
                                View Features
                            </a>
                        </div>
                    </div>
                </div>

                {/* Features Grid */}
                <div id="features" className="bg-white dark:bg-slate-800 py-20">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Everything you need to grow</h2>
                            <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                                Powerful tools designed to increase your conversion rate and automate your workflow.
                            </p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-8">
                            <div className="p-8 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700 hover:border-emerald-200 dark:hover:border-emerald-900 transition-colors">
                                <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center mb-6">
                                    <Zap className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">AI Copywriter</h3>
                                <p className="text-slate-600 dark:text-slate-400">
                                    Generate high-converting email subject lines and marketing copy instantly using advanced AI models.
                                </p>
                            </div>

                            <div className="p-8 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700 hover:border-blue-200 dark:hover:border-blue-900 transition-colors">
                                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center mb-6">
                                    <BarChart2 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Revenue Forecasting</h3>
                                <p className="text-slate-600 dark:text-slate-400">
                                    Predict future earnings with data-driven accuracy. Our linear regression models learn from your history.
                                </p>
                            </div>

                            <div className="p-8 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700 hover:border-purple-200 dark:hover:border-purple-900 transition-colors">
                                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center mb-6">
                                    <Shield className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Secure Payments</h3>
                                <p className="text-slate-600 dark:text-slate-400">
                                    Enterprise-grade security with Stripe integration. Manage subscriptions and billing effortlessly.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <footer className="bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-slate-500 dark:text-slate-400">
                    <p>&copy; {new Date().getFullYear()} E-Commerce Conversion Toolkit. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
}
