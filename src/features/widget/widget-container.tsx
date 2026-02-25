import * as React from "react";
import { useLocation } from "react-router-dom";
import { MessageCircle } from "lucide-react";
import { Button } from "../../components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import { Sidebar } from "./sidebar";
import { ChatPanel } from "../chat/chat-panel";
import { SettingsView } from "../chat/settings-view";
import { ChatService, type Message } from "../chat/chat-service";

import { HistoryView } from "../chat/history-view";

export function WidgetContainer() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [currentView, setCurrentView] = React.useState<'chat' | 'settings' | 'history'>('chat');
  const [sessionId, setSessionId] = React.useState<string | null>(null);
  const queryClient = useQueryClient();
  const location = useLocation();

  console.log("DEBUG_URL: WidgetContainer rendered. window.location.href:", window.location.href);

  React.useEffect(() => {
    console.log("DEBUG_URL: Location changed (useEffect). URL:", window.location.href);
    console.log("DEBUG_URL: Location object from useLocation:", location);
  }, [location]);

  const [initMessage, setInitMessage] = React.useState<string | null>(null);
  const [historyMessages, setHistoryMessages] = React.useState<Message[]>([]);

  const toggleSidebar = async () => {
    setIsOpen((prev) => {
      const next = !prev;
      if (next && !initMessage) {
        ChatService.initSession().then((res) => {
          setInitMessage(res.message);
          console.log('Session Init response:', res);
          if (res.session_id) {
            console.log('Setting sessionId from init:', res.session_id);
            setSessionId(res.session_id);
          } else {
            console.warn('No session_id returned from initSession');
          }
        });
      }
      return next;
    });
  };
  const closeSidebar = () => {
    setIsOpen(false);
    setCurrentView('chat');
  };

  const handleNewChat = async () => {
    try {
      // Trigger session creation API
      const res = await ChatService.createSession();
      setSessionId(res.session_id);
      setHistoryMessages([]); // Clear history for new chat
      
      // Clear local messages in client
      queryClient.setQueryData(['messages'], []);
      queryClient.invalidateQueries({ queryKey: ['messages'] });
      setCurrentView('chat');
    } catch (error) {
      console.error('Failed to start new chat session:', error);
    }
  };

  const handleSettingsClick = () => {
    setCurrentView('settings');
  };

  const handleChatHistoryClick = () => {
    setCurrentView('history');
  };

  const handleBackToSettings = () => {
    setCurrentView('settings');
  };

  const handleBackToChat = () => {
    setCurrentView('chat');
  };

  const handleSessionSelect = async (sessionId: string) => {
    setSessionId(sessionId);
    setCurrentView('chat');
    
    try {
      // Fetch and set history
      const history = await ChatService.getChatHistory(sessionId);
      setHistoryMessages(history);
      queryClient.setQueryData(['messages'], history); 
    } catch (error) {
      console.error('Failed to load session history:', error);
      setHistoryMessages([]);
    }
  };

  const handleSessionSettingsClick = async (sessionId: string) => {
    console.log('Session settings clicked for:', sessionId);
    await ChatService.listSessions();
  };

  const renderContent = () => {
    switch (currentView) {
      case 'settings':
        return (
          <SettingsView 
            onChatHistoryClick={handleChatHistoryClick} 
            onBack={handleBackToChat}
          />
        );
      case 'history':
        return (
          <HistoryView 
            onBack={handleBackToSettings} 
            onSessionSelect={handleSessionSelect}
            onSessionSettingsClick={handleSessionSettingsClick}
          />
        );
      case 'chat':
      default:
        return (
          <ChatPanel 
            key={sessionId}
            initMessage={initMessage} 
            sessionId={sessionId} 
            setSessionId={setSessionId}
            initialMessages={historyMessages}
          />
        );
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      <Button
        onClick={toggleSidebar}
        size="lg"
        variant="outline"
        className="h-14 w-14 rounded-full shadow-lg p-0 flex items-center justify-center bg-white border-blue-200 hover:bg-blue-50 transition-all duration-300 group"
      >
        <MessageCircle className="h-6 w-6 text-blue-600 transition-transform group-hover:scale-110" />
      </Button>

      <Sidebar 
        isOpen={isOpen} 
        onClose={closeSidebar} 
        onNewChat={handleNewChat}
        onSettingsClick={handleSettingsClick}
      >
        {renderContent()}
      </Sidebar>
    </div>
  );
}

export default WidgetContainer;
