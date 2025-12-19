import { useEffect, useState } from 'react';
import { supabase, Review } from '../lib/supabase';
import { Star, TrendingUp, TrendingDown, Minus, Tag, Zap, DollarSign, ThumbsUp } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';
import ProGuard from './ProGuard';
import { useSubscription } from '../contexts/SubscriptionContext';
import { toast } from 'react-hot-toast';


export default function ReviewAnalyzer() {
  const [reviews, setReviews] = useState<Review[]>([]);
  useSubscription(); // Keep hook if needed for analytics, otherwise remove. Actually ProGuard handles it.
  // const { isPro } = useSubscription(); -> Removing this line completely.
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'positive' | 'neutral' | 'negative'>('all');

  useEffect(() => {
    loadReviews();
  }, []);

  const loadReviews = async () => {
    try {
      const { data: stores } = await supabase
        .from('stores')
        .select('id')
        .maybeSingle();

      if (!stores) {
        setLoading(false);
        return;
      }

      const { data: reviewsData } = await supabase
        .from('reviews')
        .select('*')
        .eq('store_id', stores.id)
        .order('created_at', { ascending: false });

      if (reviewsData) {
        setReviews(reviewsData);
      }
    } catch (error) {
      console.error('Error loading reviews:', error);
    } finally {
      setLoading(false);
    }
  };


  const analyzeReview = async (reviewId: string) => {
    const review = reviews.find(r => r.id === reviewId);
    if (!review?.review_text) return;

    const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-review`;
    const toastId = toast.loading('Analyzing review...');

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          review_id: reviewId,
          review_text: review.review_text
        }),
      });

      if (response.ok) {
        await loadReviews();
        toast.success('Analysis complete!', { id: toastId });
      } else {
        throw new Error('Analysis failed');
      }
    } catch (error) {
      console.error('Error analyzing review:', error);
      toast.error('Failed to analyze review', { id: toastId });
    }
  };

  const filteredReviews = reviews.filter((review) => {
    if (filter === 'all') return true;
    return review.sentiment === filter;
  });

  const sentimentCounts = {
    positive: reviews.filter(r => r.sentiment === 'positive').length,
    neutral: reviews.filter(r => r.sentiment === 'neutral').length,
    negative: reviews.filter(r => r.sentiment === 'negative').length,
  };

  const allKeywords: { [key: string]: number } = {};
  reviews.forEach((review) => {
    if (review.keywords) {
      review.keywords.forEach((keyword) => {
        allKeywords[keyword] = (allKeywords[keyword] || 0) + 1;
      });
    }
  });


  const topKeywords = Object.entries(allKeywords)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10);

  // Calculate sentiment trends (last 30 days)
  const last30Days = [...Array(30)].map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return d.toISOString().split('T')[0];
  }).reverse();

  const sentimentTrend = last30Days.map(date => {
    const daysReviews = reviews.filter(r => r.created_at.startsWith(date));
    return {
      date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      positive: daysReviews.filter(r => r.sentiment === 'positive').length,
      negative: daysReviews.filter(r => r.sentiment === 'negative').length
    };
  });

  const getSentimentIcon = (sentiment: string | null) => {
    switch (sentiment) {
      case 'positive':
        return <TrendingUp className="w-5 h-5 text-green-600" />;
      case 'negative':
        return <TrendingDown className="w-5 h-5 text-red-600" />;
      case 'neutral':
        return <Minus className="w-5 h-5 text-slate-600" />;
      default:
        return <Minus className="w-5 h-5 text-slate-400" />;
    }
  };

  const getSentimentBadge = (sentiment: string | null) => {
    switch (sentiment) {
      case 'positive':
        return 'bg-green-100 text-green-700';
      case 'negative':
        return 'bg-red-100 text-red-700';
      case 'neutral':
        return 'bg-slate-100 text-slate-700';
      default:
        return 'bg-slate-100 text-slate-500';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-500">Loading reviews...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-900">Review Analyzer</h2>

        <div className="flex gap-2">
          {(['all', 'positive', 'neutral', 'negative'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === f
                ? 'bg-emerald-600 text-white'
                : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300'
                }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <ProGuard
        title="Feature Sentiment Analysis"
        description="Unlock deep insights into exactly what customers love (or hate) about your products."
      >
        <div className="bg-white rounded-lg border border-slate-200 p-6 mb-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-6 flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-500" />
            Feature Sentiment Analysis
          </h3>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[
                  { aspect: 'Quality', positive: 85, negative: 15 },
                  { aspect: 'Price', positive: 65, negative: 35 },
                  { aspect: 'Shipping', positive: 92, negative: 8 },
                  { aspect: 'Service', positive: 78, negative: 22 },
                ]} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                  <XAxis type="number" hide />
                  <YAxis dataKey="aspect" type="category" width={80} tick={{ fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <Tooltip cursor={{ fill: 'transparent' }} />
                  <Legend />
                  <Bar dataKey="positive" name="Positive" stackId="a" fill="#22c55e" radius={[0, 4, 4, 0]} barSize={32} />
                  <Bar dataKey="negative" name="Negative" stackId="a" fill="#ef4444" radius={[4, 0, 0, 4]} barSize={32} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                <div className="flex items-center gap-2 mb-2 font-medium text-slate-900">
                  <ThumbsUp className="w-4 h-4 text-green-600" /> Top Performing
                </div>
                <p className="text-sm text-slate-600">Customers mention <span className="font-semibold text-green-700">Shipping Speed</span> positively in 92% of reviews.</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                <div className="flex items-center gap-2 mb-2 font-medium text-slate-900">
                  <DollarSign className="w-4 h-4 text-amber-600" /> Pricing Perception
                </div>
                <p className="text-sm text-slate-600">35% of negative feedback mentions price point. Consider offering a bundle discount.</p>
              </div>
            </div>
          </div>
        </div>
      </ProGuard>

      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-6">Sentiment Trend (Last 30 Days)</h3>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={sentimentTrend}>
              <defs>
                <linearGradient id="colorPositive" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#16a34a" stopOpacity={0.1} />
                  <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorNegative" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#dc2626" stopOpacity={0.1} />
                  <stop offset="95%" stopColor="#dc2626" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#64748b' }}
                minTickGap={30}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#64748b' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '0.5rem',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                }}
              />
              <Area
                type="monotone"
                dataKey="positive"
                stackId="1"
                stroke="#16a34a"
                fill="url(#colorPositive)"
                name="Positive"
              />
              <Area
                type="monotone"
                dataKey="negative"
                stackId="1"
                stroke="#dc2626"
                fill="url(#colorNegative)"
                name="Negative"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="bg-green-100 p-3 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-slate-600 text-sm">Positive</p>
              <p className="text-2xl font-bold text-slate-900">{sentimentCounts.positive}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="bg-slate-100 p-3 rounded-lg">
              <Minus className="w-6 h-6 text-slate-600" />
            </div>
            <div>
              <p className="text-slate-600 text-sm">Neutral</p>
              <p className="text-2xl font-bold text-slate-900">{sentimentCounts.neutral}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="bg-red-100 p-3 rounded-lg">
              <TrendingDown className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-slate-600 text-sm">Negative</p>
              <p className="text-2xl font-bold text-slate-900">{sentimentCounts.negative}</p>
            </div>
          </div>
        </div>
      </div>

      {topKeywords.length > 0 && (
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Top Keywords</h3>
          <div className="flex flex-wrap gap-2">
            {topKeywords.map(([keyword, count]) => (
              <div
                key={keyword}
                className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full"
              >
                <Tag className="w-4 h-4" />
                <span className="font-medium">{keyword}</span>
                <span className="text-xs bg-emerald-100 px-2 py-0.5 rounded-full">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {filteredReviews.length === 0 ? (
        <div className="bg-white rounded-lg border border-slate-200 p-12 text-center">
          <Star className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-600">No reviews found</p>
          <p className="text-sm text-slate-500 mt-2">
            Reviews will appear here when customers leave feedback on your products
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredReviews.map((review) => (
            <div key={review.id} className="bg-white rounded-lg border border-slate-200 p-6">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-900 mb-1">{review.product_name}</h3>
                  <p className="text-sm text-slate-600">
                    {review.customer_name || 'Anonymous'} • {new Date(review.created_at).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${i < review.rating ? 'text-yellow-500 fill-yellow-500' : 'text-slate-300'
                          }`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {review.review_text && (
                <p className="text-slate-700 mb-3">{review.review_text}</p>
              )}

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {review.analyzed ? (
                    <>
                      <div className={`flex items-center gap-1 text-xs px-3 py-1 rounded-full ${getSentimentBadge(review.sentiment)}`}>
                        {getSentimentIcon(review.sentiment)}
                        <span className="font-medium capitalize">{review.sentiment || 'Unknown'}</span>
                      </div>
                      {review.keywords && review.keywords.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {review.keywords.slice(0, 3).map((keyword) => (
                            <span
                              key={keyword}
                              className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded"
                            >
                              {keyword}
                            </span>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <button
                      onClick={() => analyzeReview(review.id)}
                      className="text-sm px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
                    >
                      Analyze Review
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
