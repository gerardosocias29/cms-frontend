import { useEffect, useState } from "react";
// import echo from "../../services/echo";

const Dashboard = ({axiosInstance}) => {

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {

    // console.log("Echo connected:", echo.connector.socket);
    // console.log("Subscribed Channels:", echo.connector.channels);

    // const channel = echo.channel("cms_chat");
  
    // channel.listen(".MessageSent", (e) => {
    //   console.log("📩 Received (Short Name):", e);
    //   setMessages((prev) => [...prev, e.message]);
    // });
  
    // return () => {
    //   echo.leaveChannel("cms_chat");
    // };
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
    <div className="p-6 mx-auto bg-white">
      <div className="chat-container flex flex-col">
        <div className="messages">
          {messages.map((msg, index) => (
            <div key={index} className="message">
              <strong>{msg.user}:</strong> {msg.text}
            </div>
          ))}
        </div>
        <form onSubmit={sendMessage}>
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
          />
          <button type="submit">Send</button>
        </form>
      </div>
    </div>
  )
}

export default Dashboard;