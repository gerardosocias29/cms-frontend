const express = require("express");
const escpos = require("escpos");
const cors = require("cors");

const app = express();
const port = 5000;

app.use(
  cors({
    origin: ["https://app.dumy.one", "http://localhost:3000"], // Add allowed domains
    methods: "GET,POST",
    allowedHeaders: "Content-Type",
  })
);
app.use(express.json());

let device = null;
let printer = null;

try {
  const USB = require("escpos-usb");
  device = new USB(); // Try to initialize USB printer
  printer = new escpos.Printer(device);
} catch (err) {
  console.warn("Printer not found, running in mock mode.");
}

app.post("/print", (req, res) => {
  const { text } = req.body;

  if (!text) {
    return res.status(400).json({ error: "Text is required" });
  }

  if (device) {
    device.open((err) => {
      if (err) {
        console.error("Printer connection error:", err);
        return res.status(500).json({ error: "Printer error" });
      }

      printer.align("ct").text(text).newLine().cut().close(() => {
        console.log("Printed:", text);
      });

      res.json({ message: "Printing started" });
    });
  } else {
    console.log("[MOCK PRINT]:", text);
    res.json({ message: "Printer not found, mock print completed." });
  }
});

app.listen(port, () => {
  console.log(`Print server running on http://localhost:${port}`);
});
