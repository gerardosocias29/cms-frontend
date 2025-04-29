import { useEffect, useState } from "react";
import echo from "../../services/echo";

const Dashboard = ({axiosInstance}) => {

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {

    console.log("Echo connected:", echo.connector.socket);
    console.log("Subscribed Channels:", echo.connector.channels);

    const channel = echo.channel("cms_chat");
  
    channel.listen(".MessageSent", (e) => {
      console.log("📩 Received (Short Name):", e);
      setMessages((prev) => [...prev, e.message]);
    });
  
    return () => {
      echo.leaveChannel("cms_chat");
    };
  }, []);

  const sendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim()) return;

    try {
      await axiosInstance.post('/messages', { message: newMessage });
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    // Using container class for consistent padding/centering defined in tailwind.config.js
    <div className="p-6">
      <h1 className="text-2xl font-semibold text-gray-800 mb-4">Dashboard Chat</h1>
      <div className="chat-container flex flex-col h-[calc(100vh-200px)] border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        {/* Message Display Area */}
        <div className="messages flex-grow overflow-y-auto p-4 space-y-4 bg-gray-50">
          {messages.length === 0 && (
            <p className="text-center text-gray-500">No messages yet.</p>
          )}
          {messages.map((msg, index) => (
            // Basic message styling - could be enhanced further (e.g., different style for own messages)
            <div key={index} className="message p-3 rounded-lg bg-white shadow-sm max-w-md">
              {/* Assuming msg object has user and text properties */}
              <strong className="text-sm font-medium text-primary">{msg.user || 'User'}:</strong>
              <p className="text-gray-700 text-sm mt-1">{msg.text || msg}</p> {/* Handle if msg is just text */}
            </div>
          ))}
        </div>

        {/* Input Area */}
        <form onSubmit={sendMessage} className="flex items-center p-4 border-t border-gray-200 bg-white">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-grow rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary sm:text-sm sm:leading-6 mr-3"
            aria-label="Chat message input"
          />
          <button
            type="submit"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-primary-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-50"
            disabled={!newMessage.trim()}
          >
            Send
          </button>
        </form>
      </div>
    </div>
  )
}

export default Dashboard;