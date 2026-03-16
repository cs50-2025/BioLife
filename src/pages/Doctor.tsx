import { useState, useRef, useEffect } from 'react';
import { Send, Image as ImageIcon, Bot, User, Loader2 } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';
import ReactMarkdown from 'react-markdown';
import { clsx } from 'clsx';
import { useLanguage } from '../context/LanguageContext';

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  image?: string;
};

export default function Doctor() {
  const { t } = useLanguage();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: t("Hi there! I'm your AI Plant Doctor. How can I help you and your plants today? You can ask me questions or upload a photo of a sick plant.")
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() && !selectedImage) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      image: selectedImage || undefined,
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setSelectedImage(null);
    setIsLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      
      const contents: any = { parts: [] };
      
      if (userMessage.image) {
        const base64Data = userMessage.image.split(',')[1];
        const mimeType = userMessage.image.split(';')[0].split(':')[1];
        contents.parts.push({
          inlineData: {
            data: base64Data,
            mimeType: mimeType,
          }
        });
      }
      
      if (userMessage.content) {
        contents.parts.push({ text: userMessage.content });
      }

      // If no text but image is provided, add a default prompt
      if (!userMessage.content && userMessage.image) {
         contents.parts.push({ text: t("What's wrong with this plant and how can I fix it?") });
      }

      const response = await ai.models.generateContent({
        model: userMessage.image ? 'gemini-2.5-flash' : 'gemini-3-flash-preview',
        contents: contents,
        config: {
          systemInstruction: "You are an expert botanist and plant care assistant named BioLife Doctor. Provide helpful, concise, and accurate advice for plant care, diagnosing diseases, and general gardening. Format your responses with markdown for readability.",
        }
      });

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.text || t("I'm sorry, I couldn't process that request."),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error generating response:', error);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: t("I'm having trouble connecting right now. Please try again later.")
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-stone-50 md:max-w-4xl md:mx-auto md:border-x md:border-stone-200">
      {/* Header */}
      <div className="bg-white border-b border-stone-200 p-4 flex items-center gap-3 sticky top-0 z-10 shadow-sm">
        <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
          <Bot className="w-6 h-6" />
        </div>
        <div>
          <h1 className="font-bold text-stone-800">{t('AI Plant Doctor')}</h1>
          <p className="text-xs text-emerald-600 font-medium flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            {t('Online')}
          </p>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={clsx(
              "flex gap-3 max-w-[85%]",
              msg.role === 'user' ? "ml-auto flex-row-reverse" : ""
            )}
          >
            <div className={clsx(
              "w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1",
              msg.role === 'user' ? "bg-stone-200 text-stone-600" : "bg-emerald-100 text-emerald-600"
            )}>
              {msg.role === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
            </div>
            
            <div className={clsx(
              "rounded-2xl p-4 shadow-sm",
              msg.role === 'user' 
                ? "bg-emerald-600 text-white rounded-tr-sm border border-transparent dark:border-white" 
                : "bg-white border border-stone-100 text-stone-800 rounded-tl-sm dark:border-white"
            )}>
              {msg.image && (
                <img src={msg.image} alt="Uploaded plant" className="max-w-full h-auto rounded-xl mb-3 border border-black/10" />
              )}
              <div className={clsx(
                "prose prose-sm max-w-none",
                msg.role === 'user' ? "prose-invert" : "prose-stone"
              )}>
                <ReactMarkdown>{msg.content}</ReactMarkdown>
              </div>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex gap-3 max-w-[85%]">
            <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 mt-1">
              <Bot className="w-5 h-5" />
            </div>
            <div className="bg-white border border-stone-100 rounded-2xl rounded-tl-sm p-4 shadow-sm flex items-center gap-2">
              <Loader2 className="w-5 h-5 text-emerald-500 animate-spin" />
              <span className="text-sm text-stone-500 font-medium">{t('Analyzing...')}</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-white border-t border-stone-200 p-4 pb-24 md:pb-4 sticky bottom-0">
        {selectedImage && (
          <div className="mb-3 relative inline-block">
            <img src={selectedImage} alt="Preview" className="h-20 w-20 object-cover rounded-xl border border-stone-200 shadow-sm" />
            <button 
              onClick={() => setSelectedImage(null)}
              className="absolute -top-2 -right-2 w-6 h-6 bg-stone-800 text-white rounded-full flex items-center justify-center hover:bg-stone-700 shadow-sm"
            >
              &times;
            </button>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="flex gap-2 items-end">
          <div className="flex-1 bg-stone-100 rounded-2xl border border-stone-200 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all flex items-end p-1 shadow-inner">
            <button 
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-3 text-stone-400 hover:text-emerald-600 transition-colors shrink-0"
            >
              <ImageIcon className="w-6 h-6" />
            </button>
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              ref={fileInputRef}
              onChange={handleImageUpload}
            />
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t("Ask about your plants...")}
              className="flex-1 bg-transparent border-none focus:ring-0 resize-none py-3 px-2 max-h-32 min-h-[44px] text-stone-800"
              rows={1}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
            />
          </div>
          <button 
            type="submit"
            disabled={!input.trim() && !selectedImage || isLoading}
            className="w-14 h-14 rounded-2xl bg-emerald-600 text-white flex items-center justify-center hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm shrink-0"
          >
            <Send className="w-6 h-6 ml-1" />
          </button>
        </form>
      </div>
    </div>
  );
}
