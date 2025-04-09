import { useState, useEffect, useRef } from "react";
import { Settings2, SendHorizontal, X } from "lucide-react";

export default function AIChat() {
  const [messages, setMessages] = useState([
    { sender: "ai", content: "Hello! I'm your AI assistant. How can I help you today?" }
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [provider, setProvider] = useState("openai");
  const [model, setModel] = useState("gpt-4");
  const [temperature, setTemperature] = useState(0.7);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const modelsByProvider = {
    openai: [
      { value: "gpt-4", label: "GPT-4" },
      { value: "gpt-3.5-turbo", label: "GPT-3.5 Turbo" }
    ],
    anthropic: [
      { value: "claude-3-opus-20240229", label: "Claude 3 Opus" },
      { value: "claude-3-sonnet-20240229", label: "Claude 3 Sonnet" },
      { value: "claude-3-haiku-20240307", label: "Claude 3 Haiku" }
    ],
    gemini: [
      { value: "gemini-pro", label: "Gemini Pro" },
      { value: "gemini-ultra", label: "Gemini Ultra" }
    ],
    mistral: [
      { value: "mistral-large", label: "Mistral Large" },
      { value: "mistral-medium", label: "Mistral Medium" },
      { value: "mistral-small", label: "Mistral Small" }
    ]
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    setModel(modelsByProvider[provider][0].value);
  }, [provider]);

  const callAI = async (message) => {
    setIsTyping(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      let response;
      switch(provider) {
        case "openai":
          response = "This is a simulated GPT-4 response.";
          break;
        case "anthropic":
          response = "This is a simulated Claude response.";
          break;
        case "gemini":
          response = "This is a simulated Gemini response.";
          break;
        case "mistral":
          response = "This is a simulated Mistral response.";
          break;
        default:
          response = "Response from AI";
      }
      return response;
    } finally {
      setIsTyping(false);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;
    setMessages(prev => [...prev, { sender: "user", content: inputMessage }]);
    setInputMessage("");
    try {
      const aiResponse = await callAI(inputMessage);
      setMessages(prev => [...prev, { sender: "ai", content: aiResponse }]);
    } catch (error) {
      setMessages(prev => [...prev, { sender: "ai", content: `Error: ${error.message}` }]);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-b from-gray-100 to-gray-200">
      <header className="bg-indigo-600 text-white px-6 py-4 flex justify-between items-center shadow-md">
        <h1 className="text-2xl font-bold">Universal AI Chat</h1>
        <button onClick={() => setSettingsOpen(true)}>
          <Settings2 className="w-6 h-6" />
        </button>
      </header>

      <div className="flex-1 overflow-hidden flex flex-col">
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((message, index) => (
            <div key={index} className={`w-fit max-w-[70%] px-4 py-3 rounded-2xl shadow-sm text-sm whitespace-pre-wrap ${
              message.sender === "user" ? "ml-auto bg-blue-100 text-gray-800" : "bg-white text-gray-700"
            }`}>
              {message.content}
            </div>
          ))}

          {isTyping && (
            <div className="bg-white px-4 py-3 rounded-2xl shadow-sm inline-block">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-100" />
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-200" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 bg-white border-t flex gap-2">
          <textarea
            ref={inputRef}
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message here..."
            className="flex-1 p-3 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-indigo-400 text-sm"
            rows={1}
          />
          <button
            onClick={handleSendMessage}
            className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-lg transition shadow-md"
          >
            <SendHorizontal className="w-5 h-5" />
          </button>
        </div>
      </div>

      {settingsOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex justify-end">
          <div className="bg-white w-96 h-full p-6 overflow-y-auto shadow-lg">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Settings</h2>
              <button onClick={() => setSettingsOpen(false)}>
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block mb-1 font-medium">AI Provider</label>
                <select
                  value={provider}
                  onChange={(e) => setProvider(e.target.value)}
                  className="w-full p-2 border rounded"
                >
                  <option value="openai">OpenAI (GPT)</option>
                  <option value="anthropic">Anthropic (Claude)</option>
                  <option value="gemini">Google (Gemini)</option>
                  <option value="mistral">Mistral AI</option>
                </select>
              </div>

              <div>
                <label className="block mb-1 font-medium">API Key</label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="w-full p-2 border rounded"
                  placeholder="Enter your API key"
                />
              </div>

              <div>
                <label className="block mb-1 font-medium">Model</label>
                <select
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="w-full p-2 border rounded"
                >
                  {modelsByProvider[provider].map((modelOption) => (
                    <option key={modelOption.value} value={modelOption.value}>
                      {modelOption.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block mb-1 font-medium">
                  Temperature: {temperature}
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={temperature}
                  onChange={(e) => setTemperature(parseFloat(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
