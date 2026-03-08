import { useState } from 'react';
import { MapPin, Navigation, Search, Loader2, Compass, ExternalLink } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';
import ReactMarkdown from 'react-markdown';

export default function Stores() {
  const [query, setQuery] = useState('plant nurseries and garden centers');
  const [cityState, setCityState] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resultText, setResultText] = useState('');
  const [places, setPlaces] = useState<any[]>([]);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim() || !cityState.trim()) return;
    
    setIsLoading(true);
    setResultText('');
    setPlaces([]);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const finalQuery = `${query} in ${cityState}`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: finalQuery,
        config: {
          tools: [{ googleMaps: {} }],
        }
      });

      setResultText(response.text || 'No results found.');

      const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
      if (chunks) {
        const extractedPlaces = chunks
          .filter((chunk: any) => chunk.maps)
          .map((chunk: any) => chunk.maps);
        
        // Deduplicate places by URI
        const uniquePlaces = Array.from(new Map(extractedPlaces.map(item => [item.uri, item])).values());
        setPlaces(uniquePlaces);
      }
    } catch (error) {
      console.error("Search error:", error);
      setResultText('An error occurred while searching for stores.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-stone-800">Nearby Stores</h1>
        <p className="text-stone-500 mt-1">Find the best plant nurseries and gardening supplies in your area.</p>
      </div>

      {/* Search Form */}
      <form onSubmit={handleSearch} className="flex flex-col gap-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
            <input 
              type="text" 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="What are you looking for?" 
              className="w-full pl-12 pr-4 py-4 bg-white border border-stone-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-sm text-lg"
            />
          </div>
          <div className="relative">
            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
            <input 
              type="text" 
              value={cityState}
              onChange={(e) => setCityState(e.target.value)}
              placeholder="City and State (e.g., Austin, TX)" 
              required
              className="w-full pl-12 pr-4 py-4 bg-white border border-stone-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-sm text-lg"
            />
          </div>
        </div>
        <button 
          type="submit"
          disabled={isLoading || !cityState.trim()}
          className="w-full md:w-auto md:self-end px-8 py-4 bg-emerald-600 text-white rounded-2xl font-bold hover:bg-emerald-700 transition-colors disabled:opacity-70 flex items-center justify-center"
        >
          {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Search Locations'}
        </button>
      </form>

      {/* Results Area */}
      {(resultText || isLoading) && (
        <div className="bg-white rounded-3xl p-6 md:p-8 border border-stone-100 shadow-sm space-y-8">
          {isLoading && !resultText ? (
            <div className="flex flex-col items-center justify-center py-12 text-stone-400">
              <Compass className="w-12 h-12 animate-pulse mb-4 text-emerald-500" />
              <p className="font-medium">Searching nearby areas...</p>
            </div>
          ) : (
            <>
              <div className="prose prose-stone max-w-none">
                <ReactMarkdown>{resultText}</ReactMarkdown>
              </div>

              {places.length > 0 && (
                <div className="mt-8 space-y-4">
                  <h3 className="text-lg font-bold text-stone-800 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-emerald-600" />
                    Locations Found
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {places.map((place, idx) => (
                      <a 
                        key={idx} 
                        href={place.uri} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="block bg-stone-50 rounded-2xl p-4 border border-stone-100 hover:border-emerald-300 hover:bg-emerald-50/50 transition-all group"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-bold text-stone-800 group-hover:text-emerald-700 transition-colors">
                            {place.title || 'Store Location'}
                          </h4>
                          <ExternalLink className="w-4 h-4 text-stone-400 group-hover:text-emerald-600" />
                        </div>
                        {place.placeAnswerSources?.reviewSnippets?.[0] && (
                          <div className="text-sm text-stone-600 italic border-l-2 border-stone-200 pl-3 my-2">
                            "{place.placeAnswerSources.reviewSnippets[0]}"
                          </div>
                        )}
                        <div className="flex items-center gap-2 mt-3 text-xs font-semibold text-emerald-600">
                          <Navigation className="w-3 h-3" />
                          View on Google Maps
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
