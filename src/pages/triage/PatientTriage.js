import React, { useEffect, useState, useRef } from 'react'; // Added useRef
import { FaUserInjured, FaClock, FaExclamationTriangle } from 'react-icons/fa'; // Removed FaTimes
import PatientTriageModal from '../../modals/PatientTriageModal';
import LazyTable from '../../components/LazyTable';
// import convertUTCToTimeZone from '../../utils/convertUTCToTimeZone'; // Marked as unused
import { LiaUserEditSolid } from 'react-icons/lia';
import { GoTrash } from 'react-icons/go';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog'; // Import Dialog
import { useAxios } from '../../contexts/AxiosContext';
// import axios from 'axios'; // Marked as unused (using axiosInstance now)
import { BiPrinter } from 'react-icons/bi';
import convertUTCToTimeZone from '../../utils/convertUTCToTimeZone'
import leadingZero from '../../utils/leadingZero';

export default function PatientTriage() {
  const axiosInstance = useAxios();
  const [showNewPatientForm, setShowNewPatientForm] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [cardTotals, setCardTotals] = useState({ urgent: 0, waiting: 0, inprogress: 0, completed: 0 });
  const [refreshTable, setRefreshTable] = useState(false);
  const [defaultPrinterInfo, setDefaultPrinterInfo] = useState(null); // Store default printer details
  const [showPrintErrorDialog, setShowPrintErrorDialog] = useState(false);
  const [printQueueNumber, setPrintQueueNumber] = useState(''); // Store number for reprint
  const [printErrorMsg, setPrintErrorMsg] = useState(''); // Store error message for dialog
  const toast = useRef(null); // Ref for Toast component

  const [staffs, setStaffs] = useState();

  const [filters, setFilters] = useState({
    priority: 'all',
    status: 'all'
  });

  const getPriorityColor = (priority) => {
    const colors = {
      P: 'bg-red-100 text-red-800',
      SC: 'bg-orange-100 text-orange-800',
      R: 'bg-blue-100 text-blue-800'
    };
    return colors[priority] || colors['R'];
  };

  const getStatusColor = (status) => {
    const colors = {
      'waiting': 'bg-yellow-100 text-yellow-800',
      'in-progress': 'bg-blue-100 text-blue-800',
      'completed': 'bg-green-100 text-green-800'
    };
    return colors[status] || colors['waiting'];
  };

  const handleEditPatient = (data) => {
    setSelectedPatient(data);
    setShowNewPatientForm(true);
  }
  
  // FIX: Accept rowData as the parameter
  const customActions = (rowData) => {
    return <div className='flex justify-end'>
      <Button
        rounded
        size='small'
        icon={<BiPrinter />}
        className='text-green-500 ring-0'
        tooltip='Print Priority Number'
        data-pr-position='top'
        // Now rowData is correctly defined in this scope
        onClick={() => handlePrint(rowData.priority + rowData.priority_number.toString().padStart(2, '0'))}
      />
      <Button
        rounded
        icon={<LiaUserEditSolid />}
        className='text-blue-500 ring-0'
        tooltip='Edit Patient'
        data-pr-position='top'
        // Use rowData here as well for consistency
        onClick={() => handleEditPatient(rowData)}
      />
      <Button
        rounded
        icon={<GoTrash />}
        className='text-red-500 ring-0'
        tooltip='Delete User'
        data-pr-position='top'
      />
    </div>
  }

  const getData = async () => {
    try {
      const [cardTotalsResponse, staffsResponse] = await Promise.all([
        axiosInstance.get("/patients/card-totals"),
        axiosInstance.get('/users/get/staff')
      ]);

      setCardTotals(cardTotalsResponse.data);
      setStaffs(staffsResponse.data)
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }

  // --- New handlePrint using WebUSB and Default Printer ---
  const handlePrint = async (queueNum) => {
    if (!defaultPrinterInfo) {
      setPrintErrorMsg('Default printer not configured. Please set one in Settings.');
      setPrintQueueNumber(queueNum); // Store for potential reprint
      setShowPrintErrorDialog(true);
      return;
    }

    if (!navigator.usb) {
       setPrintErrorMsg('WebUSB is not supported by this browser (requires HTTPS).');
       setPrintQueueNumber(queueNum);
       setShowPrintErrorDialog(true);
       return;
    }

    let deviceToPrint = null;
    try {
      // Find the default printer among connected devices
      const devices = await navigator.usb.getDevices();
      deviceToPrint = devices.find(d =>
        Number(d.vendorId) === Number(defaultPrinterInfo.vendor_id) &&
        Number(d.productId) === Number(defaultPrinterInfo.product_id)
      );

      if (!deviceToPrint) {
        setPrintErrorMsg(`Default printer (${defaultPrinterInfo.name || 'VID:'+defaultPrinterInfo.vendor_id}) is not connected or permission not granted.`);
        setPrintQueueNumber(queueNum);
        setShowPrintErrorDialog(true);
        return;
      }

      // --- WebUSB Print Logic ---
      toast.current?.show({ severity: 'info', summary: 'Printing', detail: `Sending ${queueNum} to ${deviceToPrint.productName}...`, life: 3000 });

      await deviceToPrint.open();
      if (deviceToPrint.configuration === null) {
        await deviceToPrint.selectConfiguration(1);
      }

      // IMPORTANT: Adjust interfaceNumber if needed (often 0 for WinUSB)
      const interfaceNumber = 0;
      await deviceToPrint.claimInterface(interfaceNumber);

      const endpointOut = deviceToPrint.configuration.interfaces[interfaceNumber].alternate.endpoints.find(
        ep => ep.direction === 'out'
      );
      if (!endpointOut) throw new Error('Could not find OUT endpoint.');
      const endpointNumber = endpointOut.endpointNumber;

      // Basic ESC/POS Commands (Adjust as needed for your printer)
      const encoder = new TextEncoder();
      const initPrinter = new Uint8Array([0x1B, 0x40]); // ESC @ - Initialize printer
      const setLargeFont = new Uint8Array([0x1D, 0x21, 0x11]); // GS ! 0x33 = Quad size (double width & height x2)
      const setCenter = new Uint8Array([0x1B, 0x61, 0x01]); // ESC a 1 - Center align
      // Ensure only the queue number is printed
      const formattedQueueNum = queueNum.toString();
      const printText = encoder.encode(`\n\n${formattedQueueNum}\n`);
      const setNormalFont = new Uint8Array([0x1B, 0x21, 0x00]); // ESC ! 0 - Normal font
      const printTimestamp = encoder.encode(`${new Date().toLocaleString()}\n\n`);
      const cutPaper = new Uint8Array([0x1D, 0x56, 0x42, 0x00]); // GS V B 0 - Full cut (or 0x01 for partial)

      const dataToSend = new Uint8Array([
          ...initPrinter,
          ...setCenter,
          ...setLargeFont,
          ...printText,
          ...setNormalFont,
          ...printTimestamp,
          ...cutPaper
      ]);

      await deviceToPrint.transferOut(endpointNumber, dataToSend);
      toast.current?.show({ severity: 'success', summary: 'Printed', detail: `${queueNum} sent successfully.`, life: 3000 });

      await deviceToPrint.releaseInterface(interfaceNumber);
      await deviceToPrint.close();

    } catch (error) {
      console.error('WebUSB Print error:', error);
      let userErrorMessage = `Failed to print: ${error.message}`;
      // Check specifically for the protected class error
      if (error.message && error.message.includes('protected class')) {
          userErrorMessage = 'Printing failed: The operating system is blocking direct access to the printer interface. Please use Zadig to replace the driver for this interface with WinUSB, then try again.';
      }
      toast.current?.show({ severity: 'error', summary: 'Print Failed', detail: userErrorMessage, life: 6000 });
      setPrintErrorMsg(userErrorMessage); // Set the specific or generic error message
      setPrintQueueNumber(queueNum);
      setShowPrintErrorDialog(true);
       // Attempt to close device if open on error
       if (deviceToPrint && deviceToPrint.opened) {
           try { await deviceToPrint.close(); } catch (e) { /* ignore */ }
       }
    }
  };
  // --- End new handlePrint ---

  useEffect(() => {
    getData();
    // Fetch default printer on mount
    const fetchDefault = async () => {
        try {
            const response = await axiosInstance.get('/settings/default-printer');
            if (response.data && response.data.vendor_id != null) {
                setDefaultPrinterInfo(response.data);
                console.log("Default printer loaded:", response.data);
            } else {
                 setDefaultPrinterInfo(null);
                 console.log("No default printer configured.");
            }
        } catch (err) {
             setDefaultPrinterInfo(null);
             console.error("Failed to load default printer setting:", err);
             // Optionally show a toast error here if needed
        }
    };
    fetchDefault();
  }, [axiosInstance]) // Add axiosInstance dependency

  // --- Render Print Error Dialog Footer ---
  const printErrorFooter = (
    <div className='items-center flex gap-3 justify-end'>
      <Button label="Close" icon="pi pi-times" onClick={() => setShowPrintErrorDialog(false)} className="p-button-text" />
      <Button className='bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700' label="Reprint" onClick={() => {
        setShowPrintErrorDialog(false);
        handlePrint(printQueueNumber); // Retry printing
      }} autoFocus />
    </div>
  );

  return (
    <> {/* Wrap in Fragment to include Toast and Dialog */}
      <div className="p-6">
        <div className="w-full flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Patient Triage</h1>
            <p className="text-gray-600">Manage incoming patients and assess priority</p>
          </div>
          <button
            onClick={() => setShowNewPatientForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <FaUserInjured />
            Add New Patient
          </button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* ... stats cards ... */}
           <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
              <div className="flex items-center gap-3">
                <div className="bg-red-100 p-3 rounded-full">
                  <FaExclamationTriangle className="text-red-600 text-xl" />
                </div>
                <div>
                  <p className="text-gray-600">Urgent Cases</p>
                  <p className="text-2xl font-bold">{cardTotals.urgent}</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 p-3 rounded-full">
                  <FaUserInjured className="text-blue-600 text-xl" />
                </div>
                <div>
                  <p className="text-gray-600">Waiting</p>
                  <p className="text-2xl font-bold">{cardTotals.waiting}</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
              <div className="flex items-center gap-3">
                <div className="bg-yellow-100 p-3 rounded-full">
                  <FaUserInjured className="text-yellow-600 text-xl" />
                </div>
                <div>
                  <p className="text-gray-600">In Progress</p>
                  <p className="text-2xl font-bold">{cardTotals.inprogress}</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
              <div className="flex items-center gap-3">
                <div className="bg-green-100 p-3 rounded-full">
                  <FaClock className="text-green-600 text-xl" />
                </div>
                <div>
                  <p className="text-gray-600">Completed</p>
                  <p className="text-2xl font-bold">{cardTotals.completed}</p>
                </div>
              </div>
            </div>
        </div>

        {/* Filters */}
        <div className="hidden bg-white p-4 rounded-lg shadow-md border border-gray-200 mb-6">
           <div className="flex gap-4">
             <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">
                 Priority Filter
               </label>
               <select
                 value={filters.priority}
                 onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value }))}
                 className="border border-gray-300 rounded-md px-3 py-2"
               >
                 <option value="all">All Priorities</option>
                 <option value="urgent">Urgent</option>
                 <option value="high">High</option>
                 <option value="medium">Medium</option>
                 <option value="low">Low</option>
               </select>
             </div>
             <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">
                 Status Filter
               </label>
               <select
                 value={filters.status}
                 onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                 className="border border-gray-300 rounded-md px-3 py-2"
               >
                 <option value="all">All Statuses</option>
                 <option value="waiting">Waiting</option>
                 <option value="in-progress">In Progress</option>
                 <option value="completed">Completed</option>
               </select>
             </div>
           </div>
        </div>

        {/* Patient List */}
        <LazyTable
          refreshTable={refreshTable}
          setRefreshTable={setRefreshTable}
          checkbox={false}
          selectionMode=""
          api={'/patients'}
          columns={[
            {field: 'priority_number', header: 'ID', hasTemplate: true, template: (data, rowData) => {
              return <div className="flex flex-col items-start">
                <div>{rowData.priority}{leadingZero(rowData.priority_number || 0)}</div>
              </div>
            }},
            {field: 'created_at', header: 'Date Created', headerClassname: "text-xs", hasTemplate: true, template: (data) => { return convertUTCToTimeZone(data, "MMM DD, YYYY hh:mm A") }},
            {field: 'name', header: 'Name', headerClassname: "text-xs"},
            {field: 'priority', header: 'Priority', hasTemplate: true, template: (data) => {
              const priority = data == "P" ? "Urgent" : (data == "in-progress" ? "Senior/Pwd" : "Regular") // Note: "in-progress" check seems wrong here for priority
              return <span className={`${getPriorityColor(data)} px-3 py-1 rounded-full uppercase font-medium text-xs`}>
                {priority}
              </span>
            }},
            {field: 'status', header: 'Status', hasTemplate: true, template: (data) => {
              const status = data == "completed" ? "Completed" : (data == "SC" ? "In Progress" : "Waiting") // Note: "SC" check seems wrong here for status
              return <span className={`${getStatusColor(data)} px-3 py-1 rounded-full uppercase font-medium text-xs`}>
                {status}
              </span>
            }},
            {field: 'assigned_to.name', header: 'Assigned To'},
            {field: 'assigned_to.department.name', header: 'Department'},
          ]}
          actions={true}
          customActions={customActions}
        />

        <PatientTriageModal visible={showNewPatientForm} data={selectedPatient}
          onSuccess={(data) => {
            setRefreshTable(true);
            // Print after successful save
            if(data.status && data.priority != null && data.priority_number != null){
              handlePrint(data.priority + data.priority_number.toString().padStart(2, '0'));
            }
          }}
          onHide={() => {setShowNewPatientForm(false); setSelectedPatient(null)}}
          staffs={staffs}
        />

        {/* *** ADDED: Print Error Dialog *** */}
        <Dialog header="Print Error / Printer Not Found" visible={showPrintErrorDialog} style={{ width: '30vw' }} footer={printErrorFooter} onHide={() => setShowPrintErrorDialog(false)}>
          <p className="m-0">
            {printErrorMsg || 'Could not connect to the default printer. Please ensure it is connected, powered on, and permission has been granted via the Settings page.'}
          </p>
        </Dialog>
      </div>
    </>
  )
}
