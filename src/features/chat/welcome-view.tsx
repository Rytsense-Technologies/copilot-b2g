
interface WelcomeViewProps {
  onSelectSuggestion: (text: string) => void;
  userName?: string;
  message?: string | null;
}

export function WelcomeView({ onSelectSuggestion, userName = "Vishwa", message }: WelcomeViewProps) {
  const suggestions = [
    "Help me get started",
    "Why should I take this course?",
    "Is this course for me?",
  ];

  return (
    <div className="flex flex-col items-center justify-start p-8 min-h-full space-y-10 animate-in fade-in duration-700 bg-white">
      <div className="relative h-24 w-24">
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
          <defs>
            <linearGradient id="headGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" style={{ stopColor: '#00D2FF', stopOpacity: 1 }} />
              <stop offset="100%" style={{ stopColor: '#3A7BD5', stopOpacity: 1 }} />
            </linearGradient>
          </defs>
          <circle cx="50" cy="50" r="45" fill="url(#headGradient)" />
          
          <circle cx="35" cy="45" r="14" fill="white" />
          <circle cx="65" cy="45" r="14" fill="white" />
          
          <circle cx="35" cy="45" r="5" fill="#1A365D" />
          <circle cx="65" cy="45" r="5" fill="#1A365D" />
          
          <path d="M21 45 C21 37, 49 37, 49 45 M51 45 C51 37, 79 37, 79 45" fill="none" stroke="#1A365D" strokeWidth="3" />
          <line x1="49" y1="45" x2="51" y2="45" stroke="#1A365D" strokeWidth="3" />
          
          <path d="M40 65 Q50 75 60 65" fill="none" stroke="#1A365D" strokeWidth="3" strokeLinecap="round" />
        </svg>
      </div>

      <div className="text-left w-full space-y-1 px-2">
        <h1 className="text-3xl font-bold text-[#4481EB] tracking-tight">
          Hi, {userName}!
        </h1>
        <p className="text-3xl font-bold text-slate-900 tracking-tight leading-tight">
          {message || "How can I help?"}
        </p>
      </div>

      <div className="flex flex-col w-full space-y-4">
        {suggestions.map((text) => (
          <button
            key={text}
            onClick={() => onSelectSuggestion(text)}
            className="w-fit py-3.5 px-6 text-left text-[15px] font-bold text-[#2A5BD7] bg-white border-2 border-[#D1E0FF] rounded-xl hover:bg-[#F0F5FF] hover:border-[#4481EB] transition-all duration-200 shadow-sm"
          >
            {text}
          </button>
        ))}
      </div>
    </div>
  );
}
