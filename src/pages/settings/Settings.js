import React, { useState, useEffect } from 'react';

const Settings = () => {
  const [devices, setDevices] = useState([]);
  const [error, setError] = useState(null);
  const [info, setInfo] = useState(null);

  // Function to request printer access
  const handleRequestDevice = async () => {
    setError(null);
    setInfo('Requesting device...');
    try {
      // Placeholder filters - REPLACE with your printer's VID/PID if known
      const device = await navigator.usb.requestDevice({ filters: [
        // Example: { vendorId: 0x1234, productId: 0x5678 },
      ] });
      setInfo(`Device selected: ${device.manufacturerName} ${device.productName}`);
      // Store device info (consider using localStorage for persistence)
      // For simplicity, just adding to state for now. Avoid duplicates.
      if (!devices.some(d => d.serialNumber === device.serialNumber && device.serialNumber)) {
         setDevices(prevDevices => [...prevDevices, device]);
      } else if (!devices.some(d => d.productId === device.productId && d.vendorId === device.vendorId)) {
         setDevices(prevDevices => [...prevDevices, device]); // Fallback if no serial
      } else {
         setInfo('Device already added.');
      }

    } catch (err) {
      console.error("Error requesting device:", err);
      setError(`Error requesting device: ${err.message}`);
      setInfo(null);
    }
  };

  // Function to perform a test print
  const handleTestPrint = async (device) => {
    setError(null);
    setInfo(`Attempting test print on ${device.productName}...`);

    try {
      await device.open();
      setInfo('Device opened...');

      // Select configuration (usually 1)
      if (device.configuration === null) {
        await device.selectConfiguration(1);
        setInfo('Configuration selected...');
      }

      // Claim interface (find the correct interface number for WinUSB)
      // This might require experimentation or documentation (e.g., interface 0)
      const interfaceNumber = 0; // <<<--- MAY NEED ADJUSTMENT
      await device.claimInterface(interfaceNumber);
      setInfo(`Interface ${interfaceNumber} claimed...`);

      // Find the OUT endpoint
      const endpointOut = device.configuration.interfaces[interfaceNumber].alternate.endpoints.find(
        ep => ep.direction === 'out'
      );
      if (!endpointOut) {
        throw new Error('Could not find OUT endpoint.');
      }
      const endpointNumber = endpointOut.endpointNumber;
      setInfo(`OUT Endpoint ${endpointNumber} found... Sending data...`);

      // --- Prepare ESC/POS Commands ---
      const encoder = new TextEncoder();
      const initPrinter = new Uint8Array([0x1B, 0x40]); // ESC @ - Initialize printer
      const printText = encoder.encode("Test Print\nSuccessful!\n\n\n");
      const cutPaper = new Uint8Array([0x1D, 0x56, 0x42, 0x00]); // GS V B 0 - Full cut

      // Combine commands
      const dataToSend = new Uint8Array([...initPrinter, ...printText, ...cutPaper]);
      // --- End ESC/POS ---

      await device.transferOut(endpointNumber, dataToSend);
      setInfo(`Test print command sent to ${device.productName}.`);

      // Release interface and close device
      await device.releaseInterface(interfaceNumber);
      setInfo('Interface released...');
      await device.close();
      setInfo(`Test print complete for ${device.productName}. Device closed.`);

    } catch (err) {
      console.error("Error during test print:", err);
      setError(`Test print failed: ${err.message}`);
      setInfo(null);
      // Attempt to close device even on error
      try {
        if (device.opened) {
           // Check if interface was claimed before trying to release
           // This part is tricky as we don't know the exact state on error
           // await device.releaseInterface(interfaceNumber); // Might fail if not claimed
           await device.close();
        }
      } catch (closeErr) {
        console.error("Error closing device after failed print:", closeErr);
      }
    }
  };

  // Load devices previously granted permission (optional, requires HTTPS)
  useEffect(() => {
    const loadGrantedDevices = async () => {
      try {
        const grantedDevices = await navigator.usb.getDevices();
        setDevices(grantedDevices);
        if (grantedDevices.length > 0) {
            setInfo(`${grantedDevices.length} previously permitted device(s) found.`);
        }
      } catch (err) {
          console.warn("Could not get previously granted devices:", err);
      }
    };
    if (navigator.usb) {
        loadGrantedDevices();
    } else {
        setError("WebUSB API not supported by this browser.");
    }
  }, []);


  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold text-gray-800 mb-4">Printer Settings</h1>

      {!navigator.usb && (
         <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <strong className="font-bold">Error:</strong>
            <span className="block sm:inline"> WebUSB API is not supported or not available (requires HTTPS).</span>
         </div>
      )}

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <strong className="font-bold">Error:</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      )}
      {info && (
        <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded relative mb-4" role="alert">
          <span className="block sm:inline">{info}</span>
        </div>
      )}

      <div className="mb-6">
        <button
          onClick={handleRequestDevice}
          disabled={!navigator.usb}
          className="bg-primary hover:bg-primary-dark text-white font-bold py-2 px-4 rounded disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Add Printer (Request USB Access)
        </button>
        <p className="text-xs text-gray-500 mt-1">You may need to select the specific printer from a browser prompt.</p>
      </div>

      <h2 className="text-xl font-semibold text-gray-700 mb-3">Connected Printers</h2>
      {devices.length === 0 ? (
        <p className="text-gray-500">No printers added or detected.</p>
      ) : (
        <ul className="space-y-3">
          {devices.map((device, index) => (
            <li key={device.serialNumber || `${device.vendorId}-${device.productId}-${index}`} className="bg-gray-50 p-4 rounded border border-gray-200 flex justify-between items-center">
              <div>
                <span className="font-medium text-gray-800">{device.productName || 'Unknown Product'}</span>
                <span className="text-sm text-gray-500 ml-2"> (Vendor: {device.vendorId}, Product: {device.productId})</span>
                {device.serialNumber && <span className="block text-xs text-gray-400">Serial: {device.serialNumber}</span>}
              </div>
              <button
                onClick={() => handleTestPrint(device)}
                className="bg-green-500 hover:bg-green-600 text-white font-bold py-1 px-3 rounded text-sm"
              >
                Test Print
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Settings;