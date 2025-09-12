import React, { useState } from "react";

const ChatbotIA = () => {
  const [messages, setMessages] = useState([
    { from: "bot", text: "Bonjour! Comment puis-je vous aider ?" },
  ]);
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (input.trim()) {
      setMessages([...messages, { from: "user", text: input }, { from: "bot", text: "Je prends note, notre support vous contactera." }]);
      setInput("");
    }
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Chatbot IA</h2>
      <div className="border p-4 rounded h-64 overflow-y-auto bg-gray-50 dark:bg-gray-800">
        {messages.map((msg, i) => (
          <div key={i} className={`mb-2 ${msg.from === "user" ? "text-right" : ""}`}>
            <span className={`inline-block px-3 py-2 rounded ${msg.from === "user" ? "bg-green-500 text-white" : "bg-gray-200 dark:bg-gray-600 text-black dark:text-white"}`}>
              {msg.text}
            </span>
          </div>
        ))}
      </div>
      <div className="flex mt-3">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 border p-2 rounded"
          placeholder="Écrivez votre message..."
        />
        <button onClick={handleSend} className="bg-green-500 text-white px-4 py-2 ml-2 rounded hover:bg-green-600">Envoyer</button>
      </div>
    </div>
  );
};

export default ChatbotIA;
