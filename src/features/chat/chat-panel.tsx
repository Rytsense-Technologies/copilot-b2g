import * as React from "react";
import { SendHorizontal, Bot, Mic } from "lucide-react";
import { Button } from "../../components/ui/button";
import { cn } from "../../lib/utils";
import { ChatService, type Message } from "./chat-service";
import { WelcomeView } from "./welcome-view";

export function ChatPanel({ 
  initMessage, 
  sessionId,
  setSessionId,
  initialMessages = []
}: { 
  initMessage?: string | null,
  sessionId?: string | null,
  setSessionId: (id: string | null) => void,
  initialMessages?: Message[]
}) {
  const [inputValue, setInputValue] = React.useState("");
  const [messages, setMessages] = React.useState<Message[]>(initialMessages);
  const [isProcessing, setIsProcessing] = React.useState(false);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  // Update messages when initialMessages or sessionId change (e.g. session switching)
  React.useEffect(() => {
    setMessages(initialMessages);
  }, [initialMessages, sessionId]);

  // Scroll to bottom effect
  React.useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isProcessing]);

  const handleSend = async (e?: React.FormEvent | string) => {
    const text = typeof e === 'string' ? e : inputValue;
    if (typeof e !== 'string') e?.preventDefault();
    if (!text.trim() || isProcessing) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: text,
      sender: 'user',
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    if (typeof e !== 'string') setInputValue("");
    
    setIsProcessing(true);
    try {
      let activeSessionId = sessionId;
      
      // Bootstrap session if missing
      if (!activeSessionId) {
        console.log('No active sessionId. Bootstrapping new session...');
        const newSession = await ChatService.createSession();
        activeSessionId = newSession.session_id;
        console.log('New session bootstrapped:', activeSessionId);
        setSessionId(activeSessionId);
      }

      console.log('Triggering Copilot API with sessionId:', activeSessionId);
      const botMessage = await ChatService.askCopilot(text, activeSessionId);
      console.log('Bot message received in panel:', botMessage);
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error('Error in chat flow:', error);
      setMessages((prev) => [...prev, {
        id: (Date.now() + 1).toString(),
        text: "Sorry, I can't talk right now. Please try again later.",
        sender: 'bot',
        timestamp: Date.now(),
      }]);
    } finally {
      setIsProcessing(false);
    }
  };

  const isLoading = false;

  if (messages.length === 0 && !isLoading) {
    return (
      <div className="flex flex-col h-full bg-slate-50/50">
        <div className="flex-1 overflow-y-auto">
          <WelcomeView 
            message={initMessage} 
            onSelectSuggestion={handleSend} 
          />
        </div>
        <InputArea 
          inputValue={inputValue} 
          setInputValue={setInputValue} 
          onSend={handleSend}
          isPending={false}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-background relative">
      <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-32">
        {isLoading && <div className="text-center text-sm text-muted-foreground animate-pulse">Consulting Coach...</div>}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={cn(
              "flex w-full animate-in fade-in slide-in-from-bottom-2 duration-300",
              msg.sender === "user" ? "justify-end" : "justify-start"
            )}
          >
            <div
              className={cn(
                "flex max-w-[85%] items-start gap-2 rounded-2xl p-4 text-sm leading-relaxed shadow-sm",
                msg.sender === "user"
                  ? "bg-blue-600 text-white rounded-tr-none font-medium"
                  : "bg-white border text-gray-700 rounded-tl-none"
              )}
            >
              {msg.sender === "bot" && <Bot className="h-4 w-4 mt-0.5 shrink-0 text-blue-500" />}
              <p>{msg.text}</p>
            </div>
          </div>
        ))}
        {isProcessing && (
          <div className="flex justify-start">
            <div className="bg-white text-slate-500 rounded-2xl rounded-tl-none border border-slate-100 p-4 shadow-sm animate-pulse">
              <div className="flex space-x-1 items-center h-4">
                <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <InputArea 
        inputValue={inputValue} 
        setInputValue={setInputValue} 
        onSend={handleSend}
        isPending={isProcessing}
      />
    </div>
  );
}

function InputArea({ inputValue, setInputValue, onSend, isPending }: any) {
  return (
    <div className="absolute bottom-0 left-0 right-0 p-4 pt-1 bg-gradient-to-t from-background via-background to-transparent border-t">
      <div className="relative max-w-2xl mx-auto">
        <form 
          onSubmit={(e) => { e.preventDefault(); onSend(); }}
          className="flex items-center bg-slate-100 rounded-2xl border border-transparent focus-within:border-blue-300 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-100 transition-all duration-200 pr-2 pl-4"
        >
          <input
            placeholder="Ask me anything"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            disabled={isPending}
            className="flex-1 py-4 bg-transparent border-none outline-none focus:ring-0 text-sm autofill:bg-transparent"
          />
          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="text-gray-400 hover:text-blue-500 hover:bg-transparent"
              disabled={isPending}
            >
              <Mic className="h-5 w-5" />
            </Button>
            <Button
              type="submit"
              variant="ghost"
              size="icon"
              className={cn(
                "transition-all duration-200",
                inputValue.trim() ? "text-blue-600 scale-110" : "text-gray-300"
              )}
              disabled={isPending || !inputValue.trim()}
            >
              <SendHorizontal className="h-5 w-5" />
            </Button>
          </div>
        </form>
        

        <div className="mt-3 px-2 flex items-start gap-2 text-[10px] leading-tight text-gray-500">
          <p>
            Copilot is powered by AI, so check for mistakes and don't share sensitive info. Your data will be used in accordance with Privacy Notice.
          </p>
        </div>
      </div>
    </div>
  );
}

