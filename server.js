const express = require("express");
const escpos = require("escpos");
const cors = require("cors");
const fs = require("fs");
const https = require("https");

const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());

const options = {
  key: fs.readFileSync("/etc/letsencrypt/live/api.dumy.one/privkey.pem"),
  cert: fs.readFileSync("/etc/letsencrypt/live/api.dumy.one/fullchain.pem"),
};

const findPrinter = () => {
  try {
    const USB = require("escpos-usb");
    const usb = require("usb");

    const devices = usb.getDeviceList();

    for (const dev of devices) {
      try {
        const { idVendor, idProduct } = dev.deviceDescriptor;
        console.log(`Trying device: VID=${idVendor.toString(16)}, PID=${idProduct.toString(16)}`);

        const testDevice = new USB(idVendor, idProduct);
        const testPrinter = new escpos.Printer(testDevice);

        testDevice.open((err) => {
          if (!err) {
            console.log(`Using printer: VID=${idVendor.toString(16)}, PID=${idProduct.toString(16)}`);
            testPrinter.text("Test Print: Printer Ready").cut().close();
          }
        });

        return { device: testDevice, printer: testPrinter };
      } catch (innerErr) {
        console.warn(`Skipping device: ${innerErr.message}`);
      }
    }
  } catch (err) {
    console.warn("Printer initialization error:", err);
  }

  console.warn("No working printer found.");
  return { device: null, printer: null };
};

app.post("/print", (req, res) => {
  const { text } = req.body;

  if (!text) {
    return res.status(400).json({ error: "Text is required" });
  }

  const { device, printer } = findPrinter();

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

https.createServer(options, app).listen(port, () => {
  console.log(`HTTPS Print server running on https://app.dumy.one:${port}`);
});
