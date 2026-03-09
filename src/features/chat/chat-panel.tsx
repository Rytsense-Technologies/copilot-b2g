import * as React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { SendHorizontal, Bot, Mic } from "lucide-react";
import { Button } from "../../components/ui/button";
import { cn } from "../../lib/utils";
import { ChatService, type Message } from "./chat-service";
import { WelcomeView } from "./welcome-view";

export function ChatPanel({ 
  initMessage, 
  sessionId,
  setSessionId,
  initialMessages = [],
  faqQuestions = []
}: { 
  initMessage?: string | null,
  sessionId?: string | null,
  setSessionId: (id: string | null) => void,
  initialMessages?: Message[],
  faqQuestions?: string[]
}) {
  const queryClient = useQueryClient();
  const [inputValue, setInputValue] = React.useState("");
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  // Fetch FAQ questions if not provided
  const { data: faqs = faqQuestions } = useQuery({
    queryKey: ['faqs'],
    queryFn: () => ChatService.getFaqQuestions(),
    enabled: faqQuestions.length === 0,
    initialData: faqQuestions
  });

  // Fetch chat history
  const { data: messages = [], isLoading: isHistoryLoading } = useQuery({
    queryKey: ['chat', sessionId],
    queryFn: () => sessionId ? ChatService.getChatHistory(sessionId) : Promise.resolve([]),
    enabled: !!sessionId,
    initialData: initialMessages
  });

  // Scroll to bottom effect
  React.useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const mutation = useMutation({
    mutationFn: async (text: string) => {
      let activeSessionId = sessionId;
      
      // Bootstrap session if missing
      if (!activeSessionId) {
        const newSession = await ChatService.createSession();
        activeSessionId = newSession.session_id;
        setSessionId(activeSessionId);
      }

      // 1. Add User Message to Cache
      const userMsg: Message = {
        id: Date.now().toString(),
        text,
        sender: 'user',
        timestamp: Date.now(),
      };
      
      queryClient.setQueryData(['chat', activeSessionId], (old: Message[] = []) => [...old, userMsg]);

      // 2. Add empty Bot Message for streaming
      const botMsgId = (Date.now() + 1).toString();
      const botMsg: Message = {
        id: botMsgId,
        text: "",
        sender: 'bot',
        timestamp: Date.now() + 1,
      };
      
      queryClient.setQueryData(['chat', activeSessionId], (old: Message[] = []) => [...old, botMsg]);

      // 3. Start Stream
      await ChatService.streamCopilot(
        text,
        activeSessionId,
        "1",
        (chunk) => {
          // Update the specific bot message in cache
          queryClient.setQueryData(['chat', activeSessionId], (old: Message[] = []) => {
            return old.map(msg => 
              msg.id === botMsgId 
                ? { ...msg, text: msg.text + chunk } 
                : msg
            );
          });
        },
        () => {
          console.log('Stream finished');
        },
        (error) => {
          console.error('Stream error:', error);
          queryClient.setQueryData(['chat', activeSessionId], (old: Message[] = []) => {
            return old.map(msg => 
              msg.id === botMsgId 
                ? { ...msg, text: msg.text + "\n\n(Error: Failed to get full response. Please try again.)" } 
                : msg
            );
          });
        }
      );
    }
  });

  const handleSend = async (e?: React.FormEvent | string) => {
    const text = typeof e === 'string' ? e : inputValue;
    if (typeof e !== 'string') e?.preventDefault();
    if (!text.trim() || mutation.isPending) return;

    if (typeof e !== 'string') setInputValue("");
    mutation.mutate(text);
  };

  const isProcessing = mutation.isPending;

  if (messages.length === 0 && !isHistoryLoading) {
    return (
      <div className="flex flex-col h-full bg-slate-50/50">
        <div className="flex-1 overflow-y-auto">
          <WelcomeView 
            message={initMessage} 
            onSelectSuggestion={handleSend} 
            suggestions={faqs}
          />
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

  return (
    <div className="flex flex-col h-full bg-background relative">
      <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-32">
        {isHistoryLoading && <div className="text-center text-sm text-muted-foreground animate-pulse">Loading history...</div>}

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
              <div className="whitespace-pre-wrap">{msg.text}</div>
            </div>
          </div>
        ))}
        {isProcessing && messages[messages.length - 1]?.text === "" && (
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

