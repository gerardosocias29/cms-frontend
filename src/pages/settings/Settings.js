import React, { useState, useEffect, useRef } from 'react';
import { useAxios } from '../../contexts/AxiosContext';
import { Toast } from 'primereact/toast';
import { Dropdown } from 'primereact/dropdown';
import { FaImage } from 'react-icons/fa';
import { InputSwitch } from 'primereact/inputswitch';

const Settings = () => {
  const axiosInstance = useAxios();
  const [tab, setTab] = useState('printer'); // NEW: tab state

  // --- Printer state (existing) ---
  const [devices, setDevices] = useState([]);
  const [defaultPrinter, setDefaultPrinter] = useState(null);
  const [error, setError] = useState(null);
  const [info, setInfo] = useState(null);
  const toast = useRef(null);

  // --- Video state (NEW) ---
  const [videoUrl, setVideoUrl] = useState('');
  const [fileVideoUrl, setFileVideoUrl] = useState('');
  const [videoLoading, setVideoLoading] = useState(false);
  const [bVideoLoading, setBvideoLoading] = useState(false);

  const [topVideoType, setTopVideoType] = useState('url');
  const [topFileUrl, setTopFileUrl] = useState('');
  const [bottomVideoType, setBottomVideoType] = useState('url');
  const [bottomVideoUrl, setBottomVideoUrl] = useState('');

  const [showBottomVideo, setShowBottomVideo] = useState(false);

  const handleTopVideoFile = (e) => {
  const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setTopFileUrl(url);
    }
  };

  const handleBottomVideoFile = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setBottomVideoUrl(url);
    }
  };

  // --- Video: Fetch current URL when tab is opened ---
  useEffect(() => {
    if (tab === 'video') {
      setVideoLoading(true);
      setBvideoLoading(true);
      axiosInstance.get('/settings/video-url')
        .then(res => {
          const videoData = res.data;
          if (videoData && videoData.length > 0) {
            // find position of top and bottom videos
            const topVideo = videoData.find(v => v.position === 'top');
            const bottomVideo = videoData.find(v => v.position === 'bottom');
            setVideoUrl(topVideo ? topVideo.url : '');
            setBottomVideoUrl(bottomVideo ? bottomVideo.url : '');

            if(bottomVideo) {
              setShowBottomVideo((bottomVideo.show == 1) ? true : false);
            }
            

            setTopVideoType(topVideo ? topVideo.type : 'url');
            setBottomVideoType(bottomVideo ? bottomVideo.type : 'url');

            setTopFileUrl(topVideo && topVideo.type === 'file' ? topVideo.url : '');
            setFileVideoUrl(bottomVideo && bottomVideo.type === 'file' ? bottomVideo.url : '');
          }

        })
        .catch(() => setVideoUrl(''))
        .finally(() => { setVideoLoading(false); setBvideoLoading(false); } );
    }
  }, [tab]);

  // --- Video: Save handler ---
  const handleVideoSave = async (e) => {
    e.preventDefault();
    setVideoLoading(true);
    try {
      const response = await axiosInstance.post('/settings/video-file', { url: videoUrl });
      toast.current?.show({ severity: 'success', summary: 'Saved', detail: 'Video URL updated.', life: 2000 });
      setVideoUrl(response.data.url);
    } catch (err) {
      toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Failed to update video URL.', life: 3000 });
    }
    setVideoLoading(false);
  };

  const handleVideoFileSave = async (e, position, videoType ) => {
    e.preventDefault();
    setBvideoLoading(position === 'bottom' ? true : false);
    setVideoLoading(position === 'top' ? true : false);

    let payload;
    let formData = new FormData();
   
    if(position === 'top') {
      payload = { url: videoUrl, type: videoType, position: 'top', show: showBottomVideo };
      
      if( videoType === 'file') {
        const fileInput = checkFileInput('topVideoFileInput');
        if (!fileInput) {
          setVideoLoading(false);
          return;
        }
        formData.append('video', fileInput.files[0] || null);
        formData.append('type', videoType);
        formData.append('position', 'top');
        formData.append('show', showBottomVideo);
      }
    } else {
      payload = { url: bottomVideoUrl, type: videoType, position: 'bottom', show: showBottomVideo };
      if( videoType === 'file') {
        const fileInput = checkFileInput('bottomVideoFileInput');
        if (!fileInput) {
          setBvideoLoading(false);
          return;
        }
        formData.append('video', fileInput.files[0] || null);
        formData.append('type', videoType);
        formData.append('position', 'bottom');
        formData.append('show', showBottomVideo);
      }
    }

    try {
      let response
      if (videoType === 'url') {
        response = axiosInstance.post('/settings/video-file', payload);
      } else {
        response = axiosInstance.post('/settings/video-file', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
      }
      toast.current?.show({ severity: 'success', summary: 'Saved', detail: 'Video file uploaded successfully.', life: 2000 });
      if(response.data && response.data.type === 'top') {
        setVideoUrl(response.data.url);
      }
      if(response.data && response.data.type === 'bottom') {
        setFileVideoUrl(response.data.url);
      }

    } catch (err) {
      console.error('Error uploading video file:', err);
      // toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Failed to upload video file.', life: 3000 });
    }
    setBvideoLoading(false);
    setVideoLoading(false);
  };

  const checkFileInput = (id) => {
    const fileInput = document.querySelector(`input#${id}`);
    // if (!fileInput || !fileInput.files[0]) {
    //   toast.current?.show({ severity: 'warn', summary: 'No File', detail: 'Please select a video file to upload.', life: 2000 });
    //   return false;
    // }
    return fileInput;
  }

  // Function to request printer access
  const handleRequestDevice = async () => {
    setError(null);
    setInfo('Requesting device...');
    try {
      const device = await navigator.usb.requestDevice({ filters: [] });
      setInfo(`Device selected: ${device.manufacturerName} ${device.productName}`);
      if (!devices.some(d => d.serialNumber === device.serialNumber && device.serialNumber)) {
        setDevices(prevDevices => [...prevDevices, device]);
      } else if (!devices.some(d => d.productId === device.productId && d.vendorId === device.vendorId)) {
        setDevices(prevDevices => [...prevDevices, device]);
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
      serialNumber: device.serialNumber
    };

    try {
      await axiosInstance.post('/settings/default-printer', printerData);
      await fetchDefaultPrinter();
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
      if (response.data && response.data.vendor_id != null) {
        setDefaultPrinter(response.data);
        setInfo(`Default printer data loaded from backend: ${response.data.name}`);
      } else {
        console.log("No default printer set in backend or invalid data.");
        setDefaultPrinter(null);
        setInfo("No default printer configured in the backend.");
      }
    } catch (err) {
      if (err.response?.status !== 404) {
        console.error("Error fetching default printer:", err);
        setError(`Failed to load default printer: ${err.response?.data?.message || err.message}`);
      }
      setDefaultPrinter(null);
    }
  };

  // Function to test print
  const handleTestPrint = async (device) => {
    setError(null);
    setInfo(null);
    toast.current?.show({ severity: 'info', summary: 'Printing Test', detail: `Sending test to ${device.productName}...`, life: 3000 });

    try {
      await device.open();
      if (device.configuration === null) {
        await device.selectConfiguration(1);
      }

      const interfaceNumber = 0;
      await device.claimInterface(interfaceNumber);

      const endpointOut = device.configuration.interfaces[interfaceNumber].alternate.endpoints.find(
        ep => ep.direction === 'out'
      );
      if (!endpointOut) throw new Error('Could not find OUT endpoint.');
      const endpointNumber = endpointOut.endpointNumber;

      const encoder = new TextEncoder();
      const initPrinter = new Uint8Array([0x1B, 0x40]);
      const printText = encoder.encode("Settings Test Print\nSuccessful!\n\n\n");
      const cutPaper = new Uint8Array([0x1D, 0x56, 0x42, 0x00]);

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
      setError(userErrorMessage);
      if (device && device.opened) {
        try { await device.close(); } catch (e) { }
      }
    }
  };

  useEffect(() => {
    const initializeSettings = async () => {
      console.log("Initializing settings...");
      if (navigator.usb) {
        try {
          console.log("Getting WebUSB devices...");
          const grantedDevices = await navigator.usb.getDevices();
          console.log("WebUSB devices found:", grantedDevices);
          setDevices(grantedDevices);
          if (grantedDevices.length > 0) {
            setInfo(`${grantedDevices.length} previously permitted device(s) found.`);
          } else {
            setInfo("No previously permitted devices found. Use 'Add Printer' to grant access.");
          }
          await fetchDefaultPrinter();
        } catch (err) {
          console.error("Error getting WebUSB devices:", err);
          setError("Could not load previously permitted devices.");
        }
      } else {
        setError("WebUSB API not supported by this browser (requires HTTPS). Cannot list or add USB printers.");
      }
    };
    initializeSettings();
  }, []);

  return (
    <>
      <Toast ref={toast} />
      <div className="p-6 w-full">
        {/* Tabs */}
        <div className="flex border-b mb-6">
          <button
            className={`px-4 py-2 ${tab === 'printer' ? 'border-b-2 border-primary font-bold' : 'text-gray-500'}`}
            onClick={() => setTab('printer')}
          >
            Printer
          </button>
          <button
            className={`px-4 py-2 ml-4 ${tab === 'video' ? 'border-b-2 border-primary font-bold' : 'text-gray-500'}`}
            onClick={() => setTab('video')}
          >
            Video
          </button>
        </div>

        {/* Printer Tab */}
        {tab === 'printer' && (
          <div>
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

            <h2 className="text-xl font-semibold text-gray-700 mb-3">Detected Printers</h2>
            {devices.length === 0 ? (
              <p className="text-gray-500">No printers detected. Use 'Add Printer' to grant access.</p>
            ) : (
              <ul className="space-y-3">
                {devices.map((device, index) => {
                  const isDefaultForThisDevice = defaultPrinter &&
                    Number(defaultPrinter.vendor_id) === Number(device.vendorId) &&
                    Number(defaultPrinter.product_id) === Number(device.productId);

                  return (
                    <li key={device.serialNumber || `${device.vendorId}-${device.productId}-detected-${index}`} className={`p-4 rounded border flex justify-between items-center ${isDefaultForThisDevice ? 'bg-green-50 border-green-300' : 'bg-gray-50 border-gray-200'}`}>
                      <div>
                        <span className="font-medium text-gray-800">{device.productName || 'Unknown Product'}</span>
                        <span className="text-sm text-gray-500 ml-2"> (VID: {device.vendorId}, PID: {device.productId})</span>
                        {device.serialNumber && <span className="block text-xs text-gray-400">Serial: {device.serialNumber}</span>}
                        {isDefaultForThisDevice && (
                          <span className="block text-xs font-semibold text-green-700 mt-1">Default Printer</span>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleTestPrint(device)}
                          title="Send a test print to this detected printer"
                          className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-1 px-3 rounded text-sm transition duration-150 ease-in-out"
                        >
                          Test Print
                        </button>
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
              </ul>
            )}
          </div>
        )}

        {/* Video Tab */}
        {tab === 'video' && (
          <>
            <h1 className="text-2xl font-semibold text-gray-800 mb-6">Video Settings</h1>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

              {/* Top Video Section */}
              <form onSubmit={(e) => handleVideoFileSave(e, 'top', topVideoType)} className="space-y-4">
                <label className="block font-medium">Top Video Type</label>
                <div className='border rounded-lg overflow-hidden'>
                  <Dropdown
                    value={topVideoType}
                    options={[
                      { label: 'URL', value: 'url' },
                      { label: 'File', value: 'file' },
                    ]}
                    onChange={(e) => setTopVideoType(e.value)}
                    placeholder="Select type"
                    className="w-full"
                  />
                </div>

                {topVideoType === 'url' ? (
                  <div className="space-y-2">
                    <label className="block font-medium">Top Video URL</label>
                    <input
                      type="url"
                      className="w-full border rounded px-3 py-2"
                      value={videoUrl}
                      onChange={e => setVideoUrl(e.target.value)}
                      // required
                      disabled={videoLoading}
                      placeholder="https://example.com/video.mp4"
                    />
                  </div>
                ) : (
                  <div className="space-y-2">
                    <label className="block font-medium">Upload Top Video</label>
                    <div onClick={() => {
                      document.querySelector('input#topVideoFileInput').click();
                    }} className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center bg-gray-50 hover:bg-gray-100 transition cursor-pointer flex flex-col items-center justify-center">
                      <input
                        id='topVideoFileInput'
                        type="file"
                        accept="video/*"
                        className="mx-auto block hidden"
                        onChange={handleTopVideoFile}
                        disabled={videoLoading}
                      />
                      <FaImage className="text-4xl text-gray-400 mb-2" />
                      <p className="text-xs text-gray-500 mt-2">Drag and drop or click to upload</p>
                    </div>
                    {topFileUrl && (
                      <p className="text-sm">
                        Current file: <a href={topFileUrl} target="_blank" rel="noreferrer" className="text-blue-600 underline">View Video</a>
                      </p>
                    )}
                  </div>
                )}

                <button
                  type="submit"
                  className="bg-primary text-white px-4 py-2 rounded"
                  disabled={videoLoading}
                >
                  {videoLoading ? "Saving..." : "Save"}
                </button>
              </form>

              {/* Bottom Video Section */}
              <form onSubmit={(e) => handleVideoFileSave(e, 'bottom', bottomVideoType)} className="space-y-4">
                <div className='flex items-center justify-between'>
                  <label className="block font-medium">Bottom Video Type</label>
                  <InputSwitch checked={showBottomVideo} onChange={(e) => setShowBottomVideo(e.value)} />
                </div>
                <div className='border rounded-lg overflow-hidden'>
                  <Dropdown
                    value={bottomVideoType}
                    options={[
                      { label: 'URL', value: 'url' },
                      { label: 'File', value: 'file' },
                    ]}
                    onChange={(e) => setBottomVideoType(e.value)}
                    placeholder="Select type"
                    className="w-full"
                    size={"small"}
                  />
                </div>

                {bottomVideoType === 'url' ? (
                  <div className="space-y-2">
                    <label className="block font-medium">Bottom Video URL</label>
                    <input
                      type="url"
                      className="w-full border rounded px-3 py-2"
                      value={bottomVideoUrl}
                      onChange={e => setBottomVideoUrl(e.target.value)}
                      // required
                      disabled={bVideoLoading}
                      placeholder="https://example.com/video.mp4"
                    />
                  </div>
                ) : (
                  <div className="space-y-2">
                    <label className="block font-medium">Upload Bottom Video</label>
                    <div onClick={() => {
                      document.querySelector('input#bottomVideoFileInput').click();
                    }}  className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center bg-gray-50 hover:bg-gray-100 transition cursor-pointer flex flex-col items-center justify-center">
                      <input
                        id='bottomVideoFileInput'
                        type="file"
                        accept="video/*"
                        onChange={handleBottomVideoFile}
                        disabled={bVideoLoading}
                        className="mx-auto block hidden"
                      />
                      <FaImage className="text-4xl text-gray-400 mb-2" />
                      <p className="text-sm text-gray-500 mt-2">Drag & drop or click to upload</p>
                    </div>
                    {fileVideoUrl && (
                      <p className="text-sm">Current file: <a href={process.env.REACT_APP_API + fileVideoUrl} target="_blank" rel="noreferrer" className="text-blue-600 underline">View video</a></p>
                    )}
                  </div>
                )}

                <button
                  type="submit"
                  className="bg-primary text-white px-4 py-2 rounded"
                  disabled={bVideoLoading}
                >
                  {bVideoLoading ? "Saving..." : "Save"}
                </button>
              </form>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default Settings;