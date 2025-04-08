import { useState, useEffect, useRef } from "react";

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
  
  // Models by provider mapping
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

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Update models when provider changes
  useEffect(() => {
    setModel(modelsByProvider[provider][0].value);
  }, [provider]);

  // Mock AI API call
  const callAI = async (message) => {
    // In a real implementation, this would call the respective API
    setIsTyping(true);
    
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // This is where you would implement the actual API call based on provider
      let response;
      
      switch(provider) {
        case "openai":
          response = "This is a simulated response from GPT. In a real implementation, this would call the OpenAI API with your message.";
          break;
        case "anthropic":
          response = "This is a simulated response from Claude. In a real implementation, this would call the Anthropic API with your message.";
          break;
        case "gemini":
          response = "This is a simulated response from Gemini. In a real implementation, this would call the Google API with your message.";
          break;
        case "mistral":
          response = "This is a simulated response from Mistral AI. In a real implementation, this would call the Mistral API with your message.";
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
    
    // Add user message
    setMessages(prev => [...prev, { sender: "user", content: inputMessage }]);
    setInputMessage("");
    
    try {
      // Get AI response
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
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-gray-800 text-white p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">Universal AI Chat</h1>
        <button 
          onClick={() => setSettingsOpen(true)}
          className="text-2xl"
        >
          ⚙️
        </button>
      </header>
      
      {/* Chat Container */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message, index) => (
            <div 
              key={index} 
              className={`max-w-3/4 p-3 rounded-lg ${
                message.sender === "user" 
                  ? "bg-blue-100 ml-auto" 
                  : "bg-white"
              }`}
            >
              <div className="whitespace-pre-wrap">{message.content}</div>
            </div>
          ))}
          
          {isTyping && (
            <div className="bg-gray-100 p-3 rounded-lg inline-block">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
        
        {/* Input Area */}
        <div className="p-4 bg-white border-t">
          <div className="flex space-x-2">
            <textarea
              ref={inputRef}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message here..."
              className="flex-1 p-3 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={1}
            />
            <button
              onClick={handleSendMessage}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
            >
              Send
            </button>
          </div>
        </div>
      </div>
      
      {/* Settings Panel (Slide-in) */}
      {settingsOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-end z-50">
          <div className="bg-white w-80 h-full p-4 overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Settings</h2>
              <button 
                onClick={() => setSettingsOpen(false)}
                className="text-2xl"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-6">
              {/* AI Provider */}
              <div>
                <h3 className="font-medium mb-2">AI Provider</h3>
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
              
              {/* API Key */}
              <div>
                <h3 className="font-medium mb-2">API Key</h3>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Enter your API key"
                  className="w-full p-2 border rounded"
                />
              </div>
              
              {/* Model Selection */}
              <div>
                <h3 className="font-medium mb-2">Model</h3>
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
              
              {/* Temperature */}
              <div>
                <h3 className="font-medium mb-2">
                  Temperature: {temperature}
                </h3>
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