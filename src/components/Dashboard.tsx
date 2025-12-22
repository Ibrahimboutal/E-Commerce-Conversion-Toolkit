import { useState } from 'react';
import { ShoppingCart, MessageSquare, Settings, LogOut, BarChart3, Sun, Moon, Users, Sparkles, Wand2, Split, Menu, Mail } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useSubscription } from '../contexts/SubscriptionContext';
import { useTheme } from '../contexts/ThemeContext';
import Overview from './Overview';
import AbandonedCarts from './AbandonedCarts';
import ReviewAnalyzer from './ReviewAnalyzer';
import StoreSettings from './StoreSettings';
import Customers from './Customers';
import AICopywriter from './AICopywriter';
import ABTestManager from './ABTestManager';
import EmailLogs from './EmailLogs';
import WidgetBuilder from './WidgetBuilder';
import EmailBuilder from './EmailBuilder';
import { Layout } from 'lucide-react';
import MobileNav from './ui/MobileNav';

type Tab = 'overview' | 'carts' | 'reviews' | 'settings' | 'customers' | 'ai-tools' | 'ab-test' | 'email-logs' | 'widgets' | 'email-designer';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { isPro, openCheckout } = useSubscription();

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab);
    setIsMobileMenuOpen(false); // Close mobile menu when tab changes
  };

  const tabs = [
    { id: 'overview' as Tab, label: 'Overview', icon: BarChart3 },
    { id: 'carts' as Tab, label: 'Abandoned Carts', icon: ShoppingCart },
    { id: 'customers' as Tab, label: 'Customers', icon: Users },
    { id: 'email-logs' as Tab, label: 'Email Logs', icon: Mail },
    { id: 'ai-tools' as Tab, label: 'AI Copywriter', icon: Wand2 },
    { id: 'ab-test' as Tab, label: 'A/B Simulator', icon: Split },
    { id: 'email-designer' as Tab, label: 'Email Designer', icon: Mail },
    { id: 'reviews' as Tab, label: 'Reviews', icon: MessageSquare },
    { id: 'widgets' as Tab, label: 'On-Site Tools', icon: Layout },
    { id: 'settings' as Tab, label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-200">
      <nav className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              {/* Mobile menu button */}
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="lg:hidden p-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                aria-label="Open menu"
              >
                <Menu className="w-6 h-6" />
              </button>

              <div className="bg-emerald-600 p-2 rounded-lg">
                <ShoppingCart className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-slate-900 dark:text-white hidden sm:inline">Conversion Toolkit</span>
            </div>

            <div className="flex items-center gap-2 sm:gap-4">
              {!isPro && (
                <button
                  onClick={openCheckout}
                  className="hidden sm:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-full font-medium shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-all hover:scale-105"
                >
                  <Sparkles className="w-4 h-4" />
                  Upgrade to Pro
                </button>
              )}
              <button
                onClick={toggleTheme}
                className="p-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
              </button>
              <button
                onClick={() => signOut()}
                className="hidden sm:flex items-center gap-2 px-4 py-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Desktop tabs */}
        <div className="mb-6 hidden lg:block">
          <div className="border-b border-slate-200 dark:border-slate-700">
            <nav className="flex gap-8 overflow-x-auto">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => handleTabChange(tab.id)}
                    className={`flex items-center gap-2 py-4 border-b-2 font-medium transition-colors whitespace-nowrap ${activeTab === tab.id
                      ? 'border-emerald-600 text-emerald-600'
                      : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                      }`}
                  >
                    <Icon className="w-5 h-5" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Mobile navigation drawer */}
        <MobileNav isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)}>
          <nav className="space-y-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${activeTab === tab.id
                    ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                    }`}
                >
                  <Icon className="w-5 h-5" />
                  {tab.label}
                  {activeTab === tab.id && (
                    <div className="ml-auto w-2 h-2 bg-emerald-600 dark:bg-emerald-400 rounded-full" />
                  )}
                </button>
              );
            })}

            <div className="pt-4 mt-4 border-t border-slate-200 dark:border-slate-700">
              {!isPro && (
                <button
                  onClick={openCheckout}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg font-medium shadow-lg"
                >
                  <Sparkles className="w-4 h-4" />
                  Upgrade to Pro
                </button>
              )}

              <button
                onClick={() => { signOut(); setIsMobileMenuOpen(false); }}
                className="w-full flex items-center gap-3 px-4 py-3 mt-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg font-medium transition-colors"
              >
                <LogOut className="w-5 h-5" />
                Sign Out
              </button>
            </div>
          </nav>
        </MobileNav>

        <div>
          {activeTab === 'overview' && <Overview />}
          {activeTab === 'carts' && <AbandonedCarts />}
          {activeTab === 'customers' && <Customers />}
          {activeTab === 'email-logs' && <EmailLogs />}
          {activeTab === 'ai-tools' && <AICopywriter />}
          {activeTab === 'ab-test' && <ABTestManager />}
          {activeTab === 'reviews' && <ReviewAnalyzer />}
          {activeTab === 'widgets' && <WidgetBuilder />}
          {activeTab === 'email-designer' && <EmailBuilder />}
          {activeTab === 'settings' && <StoreSettings />}
        </div>
      </div>
    </div>
  );
}
