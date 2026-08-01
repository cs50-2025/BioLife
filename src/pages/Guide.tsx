import { useState } from 'react';
import { BookOpen, Sparkles, ArrowLeft, Loader2, Search, PlayCircle, Droplets, Sun, Bug, Leaf } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';
import ReactMarkdown from 'react-markdown';
import { useLanguage } from '../context/LanguageContext';

export default function Guide() {
  const [query, setQuery] = useState('');
  const [activeLesson, setActiveLesson] = useState<{title: string, content: string} | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useLanguage();

  const topics = [
    { title: t('Watering 101'), desc: t('Learn the soak and dry method'), icon: Droplets, color: 'text-blue-500 bg-blue-50' },
    { title: t('Lighting Basics'), desc: t('Direct vs indirect light explained'), icon: Sun, color: 'text-amber-500 bg-amber-50' },
    { title: t('Pest Control'), desc: t('Identify and treat common bugs'), icon: Bug, color: 'text-red-500 bg-red-50' },
    { title: t('Soil & Repotting'), desc: t('Choosing the right mix'), icon: Leaf, color: 'text-emerald-500 bg-emerald-50' },
  ];

  const generateLesson = async (topic: string) => {
    setIsLoading(true);
    setActiveLesson({ title: topic, content: '' });
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const prompt = `Create a short, engaging, and educational lesson about "${topic}" for houseplant owners. Format with Markdown. Do not include a main title (h1) as it is already provided in the UI. Include:
      1. A brief introduction
      2. 3-4 Key Concepts (use bullet points)
      3. A "Common Mistake" section
      4. A quick "Pop Quiz" question at the end (with the answer hidden in a spoiler tag or just at the bottom).`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });

      setActiveLesson({ title: topic, content: response.text || t('Failed to generate lesson.') });
    } catch (error) {
      console.error(error);
      setActiveLesson({ title: topic, content: t('An error occurred while generating the lesson. Please try again.') });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      generateLesson(query);
    }
  };

  if (activeLesson) {
    return (
      <div className="p-4 md:p-8 max-w-3xl mx-auto space-y-6">
        <button 
          onClick={() => setActiveLesson(null)}
          className="flex items-center gap-2 text-stone-500 hover:text-stone-800 transition-colors font-medium"
        >
          <ArrowLeft className="w-4 h-4" /> {t('Back to Lessons')}
        </button>
        
        <div className="bg-white rounded-3xl p-6 md:p-10 border border-stone-100 shadow-sm min-h-[50vh]">
          <div className="flex items-center gap-3 mb-8 pb-6 border-b border-stone-100">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-stone-800">{activeLesson.title}</h1>
              <p className="text-emerald-600 font-medium text-sm">{t('AI-Generated Lesson')}</p>
            </div>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 text-stone-400 space-y-4">
              <Loader2 className="w-10 h-10 animate-spin text-emerald-500" />
              <p className="font-medium animate-pulse">{t('Generating your personalized lesson...')}</p>
            </div>
          ) : (
            <div className="markdown-body">
              <ReactMarkdown>{activeLesson.content}</ReactMarkdown>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-stone-800">{t('AI Care Lessons')}</h1>
        <p className="text-stone-500 mt-1">{t('Generate personalized, interactive lessons on any plant care topic.')}</p>
      </div>

      {/* Custom Lesson Generator */}
      <div className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-3xl p-6 md:p-8 text-white shadow-lg shadow-emerald-600/20 relative overflow-hidden">
        <div className="relative z-10 max-w-xl">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-emerald-200" />
            <span className="font-bold text-emerald-100 tracking-wider uppercase text-sm">{t('Custom Lesson')}</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold mb-4">{t('What do you want to learn today?')}</h2>
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-700" />
              <input 
                type="text" 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t('e.g., How to propagate a Monstera...')}
                className="w-full pl-12 pr-4 py-4 bg-white rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-300 transition-all text-stone-800 font-medium"
              />
            </div>
            <button 
              type="submit"
              disabled={!query.trim() || isLoading}
              className="px-6 py-4 bg-stone-900 text-white rounded-2xl font-bold hover:bg-stone-800 transition-colors disabled:opacity-70 flex items-center gap-2"
            >
              {t('Generate')}
            </button>
          </form>
        </div>
        <BookOpen className="absolute -right-8 -bottom-8 w-64 h-64 text-white opacity-10" />
      </div>

      {/* Popular Topics */}
      <div>
        <h2 className="text-xl font-bold text-stone-800 mb-4">{t('Popular Topics')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {topics.map((topic, idx) => (
            <button 
              key={idx}
              onClick={() => generateLesson(topic.title)}
              className="bg-white rounded-2xl p-4 border border-stone-100 shadow-sm hover:shadow-md hover:border-emerald-200 transition-all group text-left flex items-center gap-4"
            >
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${topic.color}`}>
                <topic.icon className="w-7 h-7" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-stone-800 text-lg group-hover:text-emerald-700 transition-colors">{topic.title}</h3>
                <p className="text-sm text-stone-500">{topic.desc}</p>
              </div>
              <PlayCircle className="w-6 h-6 text-stone-300 group-hover:text-emerald-500 transition-colors" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
