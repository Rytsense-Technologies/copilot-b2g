import { ChevronRight, ChevronLeft } from "lucide-react";

interface SettingsViewProps {
  onChatHistoryClick?: () => void;
  onBack?: () => void;
}

export function SettingsView({ onChatHistoryClick, onBack }: SettingsViewProps) {
  return (
    <div className="flex flex-col h-full bg-white">
      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {/* General Section */}
        <div className="border-b">
          <div className="flex items-center gap-2 px-6 py-4">
            <button 
              onClick={onBack}
              className="p-1 -ml-1 hover:bg-slate-100 rounded-full transition-colors"
              title="Back"
            >
              <ChevronLeft className="h-5 w-5 text-slate-600" />
            </button>
            <h3 className="text-base font-semibold text-slate-900">General</h3>
          </div>
          
          {/* Chat history */}
          <button 
            className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors border-t"
            onClick={onChatHistoryClick}
          >
            <span className="text-base text-slate-900">Chat history</span>
            <ChevronRight className="h-5 w-5 text-slate-400" />
          </button>
        </div>

        {/* Personalization Section */}
        <div className="px-6 py-6 border-b">
          <h3 className="text-base font-semibold text-slate-900 mb-3">Personalization</h3>
          <p className="text-sm text-slate-600 leading-relaxed mb-6">
            Coach personalizes your experience based on what you've shared to give more relevant support and guidance. Your data is never used to train AI models and you're always in control — you can manage or turn off personalization settings anytime.
          </p>

          {/* Profile data */}
          <button className="w-full py-4 flex items-center justify-between hover:bg-slate-50 transition-colors border-t">
            <span className="text-base text-slate-900">Profile data</span>
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-600">On</span>
              <ChevronRight className="h-5 w-5 text-slate-400" />
            </div>
          </button>

          {/* Memory */}
          <button className="w-full py-4 flex items-center justify-between hover:bg-slate-50 transition-colors border-t">
            <span className="text-base text-slate-900">Memory</span>
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-600">On</span>
              <ChevronRight className="h-5 w-5 text-slate-400" />
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
