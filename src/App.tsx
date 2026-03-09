import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/react-query";
import { BrowserRouter } from "react-router-dom";
import WidgetContainer from "./features/widget/widget-container";

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold text-gray-900">Host Application</h1>
            <p className="text-lg text-gray-600">
              This simulates a host application where the Chat Copilot widget will be embedded.
            </p>
            <p className="text-sm text-gray-500">
              Click the message icon in the bottom right corner to open the chat.
            </p>
          </div>
          <WidgetContainer />
        </div>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
