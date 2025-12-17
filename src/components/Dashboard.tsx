import { useState } from 'react';
import { ShoppingCart, MessageSquare, Settings, LogOut, BarChart3, Sun, Moon } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import Overview from './Overview';
import AbandonedCarts from './AbandonedCarts';
import ReviewAnalyzer from './ReviewAnalyzer';
import StoreSettings from './StoreSettings';

type Tab = 'overview' | 'carts' | 'reviews' | 'settings';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const { signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const tabs = [
    { id: 'overview' as Tab, label: 'Overview', icon: BarChart3 },
    { id: 'carts' as Tab, label: 'Abandoned Carts', icon: ShoppingCart },
    { id: 'reviews' as Tab, label: 'Reviews', icon: MessageSquare },
    { id: 'settings' as Tab, label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-200">
      <nav className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="bg-emerald-600 p-2 rounded-lg">
                <ShoppingCart className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-slate-900 dark:text-white">Conversion Toolkit</span>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={toggleTheme}
                className="p-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
              </button>
              <button
                onClick={() => signOut()}
                className="flex items-center gap-2 px-4 py-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <div className="border-b border-slate-200 dark:border-slate-700">
            <nav className="flex gap-8">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 py-4 border-b-2 font-medium transition-colors ${activeTab === tab.id
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

        <div>
          {activeTab === 'overview' && <Overview />}
          {activeTab === 'carts' && <AbandonedCarts />}
          {activeTab === 'reviews' && <ReviewAnalyzer />}
          {activeTab === 'settings' && <StoreSettings />}
        </div>
      </div>
    </div>
  );
}
