import Echo from "laravel-echo";
import io from "socket.io-client";

window.io = io;

const echo = new Echo({
  broadcaster: "socket.io",
  host: "http://127.0.0.1:6001", // Adjust if needed
  transports: ["websocket"], // Force WebSockets
  auth: {
    headers: {
      "X-CSRF-TOKEN": document.head.querySelector('meta[name="csrf-token"]')?.content
    }
  }
});

echo.connector.socket.on("connect", () => {
  console.log("✅ Echo Connected:", echo.connector.socket.id);
});

echo.connector.socket.on("connect_error", (err) => {
  console.error("❌ Echo Connection Error:", err);
});

export default echo;