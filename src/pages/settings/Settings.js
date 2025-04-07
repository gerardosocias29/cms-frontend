import React, { useState, useEffect, useRef } from 'react'; // Added useRef

import { useAxios } from '../../contexts/AxiosContext'; // Import useAxios
import { Toast } from 'primereact/toast'; // Import Toast
// Ensure PrimeReact Button is not imported

const Settings = () => {
  const axiosInstance = useAxios(); // Get axios instance
  const [devices, setDevices] = useState([]);
  const [defaultPrinter, setDefaultPrinter] = useState(null); // Default printer data from backend { vendor_id, product_id, name, ... }
  const [error, setError] = useState(null);
  const [info, setInfo] = useState(null);
  const toast = useRef(null); // Ref for Toast component

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
      setError(`Error requesting device: ${err.message}. Ensure you are using HTTPS.`);
      setInfo(null);
    }
  };

  // Function to set default printer via API
  const handleSetDefaultPrinter = async (device) => {
    setError(null);
    setInfo(`Setting ${device.productName} as default...`);
    const printerData = {
        vendorId: device.vendorId,
        productId: device.productId,
        name: device.productName || 'Unknown Printer',
        serialNumber: device.serialNumber // Optional, but good to store
    };

    try {
        // *** Backend API Call ***
        // Replace '/api/settings/default-printer' with your actual endpoint
        await axiosInstance.post('/settings/default-printer', printerData);
        // *** FIX: Refetch default printer from backend instead of setting local state directly ***
        await fetchDefaultPrinter(); // This ensures state has correct snake_case keys
        setInfo(`${printerData.name} set as default printer.`);
    } catch (err) {
        console.error("Error setting default printer:", err);
        setError(`Failed to set default printer: ${err.response?.data?.message || err.message}`);
        setInfo(null);
    }
  };

  // Function to fetch default printer from backend
  const fetchDefaultPrinter = async () => {
    console.log("Fetching default printer...");
    try {
        const response = await axiosInstance.get('/settings/default-printer');
        console.log("Backend response for default printer:", response.data);
        // *** FIX: Check for snake_case vendor_id from backend ***
        if (response.data && response.data.vendor_id != null) {
            setDefaultPrinter(response.data);
            setInfo(`Default printer data loaded from backend: ${response.data.name}`);
        } else {
            console.log("No default printer set in backend or invalid data.");
            setDefaultPrinter(null); // No default set
            setInfo("No default printer configured in the backend.");
        }
    } catch (err) {
        // Don't show error if it's just 404 (no default set)
        if (err.response?.status !== 404) {
            console.error("Error fetching default printer:", err);
            setError(`Failed to load default printer: ${err.response?.data?.message || err.message}`);
        }
         setDefaultPrinter(null);
    }
  };

  // --- Add handleTestPrint function ---
  const handleTestPrint = async (device) => {
    setError(null); // Clear previous errors
    setInfo(null); // Clear previous info
    toast.current?.show({ severity: 'info', summary: 'Printing Test', detail: `Sending test to ${device.productName}...`, life: 3000 });

    try {
      await device.open();
      if (device.configuration === null) {
        await device.selectConfiguration(1);
      }

      // IMPORTANT: Adjust interfaceNumber if needed
      const interfaceNumber = 0;
      await device.claimInterface(interfaceNumber);

      const endpointOut = device.configuration.interfaces[interfaceNumber].alternate.endpoints.find(
        ep => ep.direction === 'out'
      );
      if (!endpointOut) throw new Error('Could not find OUT endpoint.');
      const endpointNumber = endpointOut.endpointNumber;

      // Simple ESC/POS Test Print Commands
      const encoder = new TextEncoder();
      const initPrinter = new Uint8Array([0x1B, 0x40]); // ESC @ - Initialize printer
      const printText = encoder.encode("Settings Test Print\nSuccessful!\n\n\n");
      const cutPaper = new Uint8Array([0x1D, 0x56, 0x42, 0x00]); // GS V B 0 - Full cut

      const dataToSend = new Uint8Array([...initPrinter, ...printText, ...cutPaper]);

      await device.transferOut(endpointNumber, dataToSend);
      toast.current?.show({ severity: 'success', summary: 'Test Print Sent', detail: `Test sent to ${device.productName}.`, life: 3000 });

      await device.releaseInterface(interfaceNumber);
      await device.close();

    } catch (error) {
        console.error('WebUSB Test Print error:', error);
        let userErrorMessage = `Test print failed: ${error.message}`;
        if (error.message && error.message.includes('protected class')) {
            userErrorMessage = 'Test print failed: The OS is blocking direct access. Use Zadig to replace the driver with WinUSB.';
        }
        toast.current?.show({ severity: 'error', summary: 'Test Print Failed', detail: userErrorMessage, life: 6000 });
        setError(userErrorMessage); // Show error below list as well
         // Attempt to close device if open on error
         if (device && device.opened) {
             try { await device.close(); } catch (e) { /* ignore */ }
         }
    }
  };
  // --- End handleTestPrint ---

  // Load devices previously granted permission (optional, requires HTTPS)
  // Load granted devices and fetch default printer on mount
  useEffect(() => {
    const initializeSettings = async () => {
        console.log("Initializing settings...");
        if (navigator.usb) {
            try {
                console.log("Getting WebUSB devices...");
                const grantedDevices = await navigator.usb.getDevices();
                console.log("WebUSB devices found:", grantedDevices); // Log found devices
                setDevices(grantedDevices);
                if (grantedDevices.length > 0) {
                    setInfo(`${grantedDevices.length} previously permitted device(s) found.`);
                } else {
                    setInfo("No previously permitted devices found. Use 'Add Printer' to grant access.");
                }
                 // Fetch default printer setting AFTER getting devices
                await fetchDefaultPrinter();
            } catch (err) {
                console.error("Error getting WebUSB devices:", err); // Log error
                setError("Could not load previously permitted devices.");
            }

        } else {
            setError("WebUSB API not supported by this browser (requires HTTPS). Cannot list or add USB printers.");
        }
    };
    initializeSettings();
  }, []); // Run only on mount
  // Removed the merging useEffect hook


  return (
    <> {/* Add Fragment for Toast */}
    <Toast ref={toast} />
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

      {/* Simplified Title */}
      <h2 className="text-xl font-semibold text-gray-700 mb-3">Detected Printers</h2>
      {/* Simplified Empty State Check */}
      {devices.length === 0 ? (
          <p className="text-gray-500">No printers detected. Use 'Add Printer' to grant access.</p>
      ) : (
          <ul className="space-y-3">
              {/* Iterate only over DETECTED devices */}
              {devices.map((device, index) => {
                  // Check if this detected device is the default one
                  const isDefaultForThisDevice = defaultPrinter &&
                      Number(defaultPrinter.vendor_id) === Number(device.vendorId) &&
                      Number(defaultPrinter.product_id) === Number(device.productId);
                  // console.log(`Rendering Detected Device ${device.productName} (VID: ${device.vendorId}, PID: ${device.productId}) -> isDefault: ${isDefaultForThisDevice}`); // Keep log for debugging if needed

                  return (
                      // Apply simpler styling, highlight default
                      <li key={device.serialNumber || `${device.vendorId}-${device.productId}-detected-${index}`} className={`p-4 rounded border flex justify-between items-center ${isDefaultForThisDevice ? 'bg-green-50 border-green-300' : 'bg-gray-50 border-gray-200'}`}>
                          <div>
                              <span className="font-medium text-gray-800">{device.productName || 'Unknown Product'}</span>
                              <span className="text-sm text-gray-500 ml-2"> (VID: {device.vendorId}, PID: {device.productId})</span>
                              {device.serialNumber && <span className="block text-xs text-gray-400">Serial: {device.serialNumber}</span>}
                              {/* Optional: Simple text indicator for default */}
                              {isDefaultForThisDevice && (
                                  <span className="block text-xs font-semibold text-green-700 mt-1">Default Printer</span>
                              )}
                          </div>
                          {/* Action Buttons Container */}
                          <div className="flex gap-2">
                              {/* Test Print Button */}
                              <button
                                  onClick={() => handleTestPrint(device)}
                                  title="Send a test print to this detected printer"
                                  className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-1 px-3 rounded text-sm transition duration-150 ease-in-out"
                              >
                                  Test Print
                              </button>
                              {/* Set Default Button */}
                              <button
                                  onClick={() => handleSetDefaultPrinter(device)}
                                  disabled={isDefaultForThisDevice}
                                  title={isDefaultForThisDevice ? "This is the default printer" : "Set this printer as default"}
                                  className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-1 px-3 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed transition duration-150 ease-in-out"
                              >
                                  {isDefaultForThisDevice ? 'Is Default' : 'Set Default'}
                              </button>
                          </div>
                      </li>
                  );
              })}
              {/* REMOVED the section that displayed non-connected default printer */}
          </ul>
      )}
    </div>
   </> // Close Fragment
  );
};

export default Settings;