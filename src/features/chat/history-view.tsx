import { ChevronLeft, MessageSquare, Settings } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { ChatService } from "./chat-service";
import { Button } from "../../components/ui/button";

interface HistoryViewProps {
  onBack: () => void;
  onSessionSelect?: (sessionId: string) => void;
  onSessionSettingsClick?: (sessionId: string) => void;
}

export function HistoryView({ onBack, onSessionSelect, onSessionSettingsClick }: HistoryViewProps) {
  const { data: sessions = [], isLoading } = useQuery({
    queryKey: ['sessions'],
    queryFn: () => ChatService.listSessions(),
  });

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onBack}>
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <h3 className="font-semibold text-slate-900">Chat history</h3>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {isLoading ? (
          <div className="flex items-center justify-center h-20 text-slate-400 text-sm">
            Loading sessions...
          </div>
        ) : sessions.length === 0 ? (
          <div className="p-8 text-center text-slate-400 italic text-sm">
            No recent sessions found.
          </div>
        ) : (
          sessions.map((session) => (
            <div 
              key={session.session_id}
              className="w-full flex items-center gap-1 group"
            >
              <button
                onClick={() => onSessionSelect?.(session.session_id)}
                className="flex-1 p-3 text-left rounded-lg hover:bg-slate-50 transition-all duration-200 border border-transparent hover:border-slate-100"
              >
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                    <MessageSquare className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-sm font-medium text-slate-700 truncate">
                      {session.title || `Session ${session.session_id.slice(0, 8)}`}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-1">
                      {new Date(session.last_updated_at).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              </button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-slate-300 hover:text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => onSessionSettingsClick?.(session.session_id)}
                title="Session Settings"
              >
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
