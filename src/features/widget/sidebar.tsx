import { X, SquarePlus, Settings } from "lucide-react";
import { cn } from "../../lib/utils";
import { Button } from "../../components/ui/button";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onNewChat?: () => void;
  onSettingsClick?: () => void;
  children: React.ReactNode;
}

export function Sidebar({ 
  isOpen, 
  onClose, 
  onNewChat, 
  onSettingsClick, 
  children
}: SidebarProps) {
  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/50 transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />

      {/* Sidebar Panel */}
      <div
        className={cn(
          "fixed right-0 top-0 z-50 h-full w-full sm:w-[400px] bg-background shadow-2xl transition-transform duration-300 ease-in-out transform flex flex-col overflow-hidden",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="flex items-center justify-between p-4 px-6 border-b bg-white shrink-0">
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">copilot</h2>
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-9 w-9 text-slate-500 hover:bg-slate-100"
              onClick={onNewChat}
              title="New Chat"
            >
              <SquarePlus className="h-5 w-5" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-9 w-9 text-slate-500 hover:bg-slate-100"
              onClick={onSettingsClick}
              title="Settings"
            >
              <Settings className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-500 hover:bg-slate-100" onClick={onClose}>
              <X className="h-6 w-6" />
            </Button>
          </div>
        </div>
        <div className="flex-1 overflow-hidden relative">
          {children}
        </div>
      </div>
    </>
  );
}
