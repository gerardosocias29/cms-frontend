import { useEffect, useState, useCallback } from "react";
import { Calendar } from "primereact/calendar";
import { useAxios } from "../../contexts/AxiosContext";
import { useToast } from "../../contexts/ToastContext";
import leadingZero from "../../utils/leadingZero";
import { Dropdown } from "primereact/dropdown";
import convertUTCToTimeZone from "../../utils/convertUTCToTimeZone";
import { CalendarIcon, HistoryIcon } from "lucide-react";

// Utility to export CSV
function exportQueueHistoryCSV(queueData, userDepartments, selectedDepartment, selectedDate) {
  if (!queueData?.patients?.length) return;

  // Helper to get department name by id
  const getDeptName = (id) => {
    const dept = userDepartments.find((d) => d.id === id);
    return dept ? dept.name : `Dept #${id}`;
  };

  // CSV header: Queue #, Name, Priority, Timestamp, Department
  const header = [
    'Queue #',
    'Name',
    'Priority',
    'Timestamp',
    'Department',
    'Status',
  ];

  // Format each patient row: one row per department history entry, columns: Queue #, Name, Priority, Timestamp, Department
  const rows = [];
  queueData.patients.forEach((patient) => {
    const queueNum = `${patient.priority}${leadingZero(patient.priority_number)}`;
    const name = patient.name || '';
    const priority = patient.priority === 'P' ? 'Urgent' : patient.priority === 'SC' ? 'Senior/PWD' : 'Regular';
    if (patient.status != "waiting" && patient.prev_department_ids && patient.prev_department_ids.length > 0) {
      patient.prev_department_ids.forEach((entry) => {
        const ts = convertUTCToTimeZone(entry.timestamp, "YYYY-MM-DD HH:mm");
        const deptName = getDeptName(entry.department_id);
        rows.push([
          queueNum,
          name,
          priority,
          ts,
          deptName,
          patient.status || '',
        ]);
      });
    } else {
      // If no department history, still output a row with empty timestamp/department
      rows.push([
        queueNum,
        name,
        priority,
        convertUTCToTimeZone(patient.created_at, "YYYY-MM-DD HH:mm"),
        patient.starting_department.name || '',
        patient.status || '',
      ]);
    }
  });

  // Convert to CSV string
  const csvContent = [
    header.join(','),
    ...rows.map(row => row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(','))
  ].join('\n');

  // Download
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const deptName = userDepartments.find(d => d.id === selectedDepartment)?.name?.replace(/\s+/g, '_') || 'department';
  
  // get selected date[0] and date[1] in MM_DD_YYYY format
  const dateStr = selectedDate && selectedDate[0] && selectedDate[1]
    ? `${convertUTCToTimeZone(selectedDate[0].toISOString(), "MM_DD_YYYY")}_to_${convertUTCToTimeZone(selectedDate[1].toISOString(), "MM_DD_YYYY")}`
    : 'date';
  
  a.download = `Queue_History_${deptName}_${dateStr}.csv`;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 100);
}

const QueueHistory = ({ profile }) => {
  const showToast = useToast();
  const axiosInstance = useAxios();
  const [selectedDate, setSelectedDate] = useState([new Date(), new Date()]);
  const [queueData, setQueueData] = useState({
    department: profile?.department,
    patients: [],
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const [userDepartments, setUserDepartments] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState();

  const fetchDepartments = useCallback(async () => {
    try {
      const response = await axiosInstance.get('/departments');
      // We don't need to store departments separately since we use userDepartments from profile
      console.log('Departments fetched:', response.data);
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  }, []);

  const fetchHistoricalPatients = useCallback(async (department_id = null, date = null) => {
    setIsLoading(true);
    setError(null);
    try {
      let params = new URLSearchParams();
      
      if (department_id) {
        params.append('department_id', department_id);
      }

      if(date[0] != null && date[1] != null){
        const formattedDate = date[0].toISOString().split('T')[0];
        params.append('date', formattedDate+" 00:00:00");
        
        const formattedDateEnd = date[1].toISOString().split('T')[0];
        params.append('date_end', formattedDateEnd+" 23:59:59");

        const queryString = params.toString();
        const url = `/patients/queue/history${queryString ? `?${queryString}` : ''}`;
        
        const response = await axiosInstance.get(url);
        setQueueData((prev) => ({
          ...prev,
          patients: response.data,
        }));
      } else {
        return;
      }
      
    } catch (err) {
      console.error("Error fetching historical patients:", err);
      setError("Failed to load historical queue data. Please try again later.");
      showToast({
        severity: "error",
        summary: "Error",
        detail: "Failed to load historical queue data.",
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initialize component
  useEffect(() => {
    fetchDepartments();
  }, []);

  useEffect(() => {
    if (profile) {
      setUserDepartments(profile?.all_departments);
      setSelectedDepartment(profile?.all_departments[0]?.id);

      // Fetch initial data for today
      fetchHistoricalPatients(
        profile?.all_departments[0]?.id || profile?.department_id,
        selectedDate
      );
    }
  }, [profile, selectedDate]);

  // Handle date change
  const handleDateChange = (e) => {
    console.log(e);
    const newDate = e.value;
    setSelectedDate(newDate);
    // if (newDate && selectedDepartment) {
    //   fetchHistoricalPatients(selectedDepartment, newDate);
    // }
  };

  // Handle department change
  const handleDepartmentChange = (e) => {
    const departmentId = e.value;
    setSelectedDepartment(departmentId);
    setQueueData({
      department: profile?.department,
      patients: [],
    });
    if (departmentId && selectedDate) {
      fetchHistoricalPatients(departmentId, selectedDate);
    }
  };

  // Helper function to get patient button class (read-only styling)
  const getPatientButtonClass = (patient) => {
    let baseClass = "p-3 rounded-lg text-center font-semibold transition-all cursor-default";
    if (patient.status === "completed") {
      return `${baseClass} bg-green-100 border-2 border-green-500`;
    }
    if (patient.status === "in-progress") {
      return `${baseClass} bg-blue-100 border-2 border-blue-500`;
    }
    switch (patient.priority?.toLowerCase()) {
      case "p":
        return `${baseClass} bg-red-100 border-2 border-red-300`;
      case "sc":
        return `${baseClass} bg-yellow-100 border-2 border-yellow-300`;
      default:
        return `${baseClass} bg-gray-100 border-2 border-gray-300`;
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'waiting': { color: 'bg-yellow-100 text-yellow-800', label: 'Waiting' },
      'in-progress': { color: 'bg-blue-100 text-blue-800', label: 'In Progress' },
      'completed': { color: 'bg-green-100 text-green-800', label: 'Completed' },
      'cancelled': { color: 'bg-red-100 text-red-800', label: 'Cancelled' }
    };
    
    const config = statusConfig[status] || { color: 'bg-gray-100 text-gray-800', label: status };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="bg-white rounded-t-2xl">
        <div className="bg-purple-600 text-white p-4 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <HistoryIcon size={24} />
              <h1 className="text-xl font-semibold">Queue History</h1>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Date Picker */}
              <div className="flex items-center gap-2 bg-white/10 rounded-lg px-3 py-2">
                <CalendarIcon size={16} />
                <Calendar
                  value={selectedDate}
                  onChange={handleDateChange}
                  maxDate={new Date()}
                  placeholder="Select Date"
                  className="bg-transparent border-0 text-white ring-0"
                  inputClassName="bg-transparent border-0 text-white placeholder-white/70 text-sm ring-0"
                  showIcon={false}
                  dateFormat="mm/dd/yy"
                  selectionMode="range" 
                  readOnlyInput hideOnRangeSelection
                  
                />
              </div>
              {/* Department Dropdown */}
              <Dropdown 
                className="w-64"
                placeholder="Select Department"
                options={userDepartments}
                optionLabel="name"
                optionValue="id"
                value={selectedDepartment}
                onChange={handleDepartmentChange}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="bg-white shadow-lg rounded-b-2xl p-4">
        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            <p className="text-gray-500 mt-2">Loading historical data...</p>
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="text-center py-8">
            <p className="text-red-500">{error}</p>
          </div>
        )}

        {/* Content Area */}
        {!isLoading && (
          <>
            <div className="flex justify-end mb-2">
              {/* Export CSV Button */}
              <button
                className={`ml-2 px-4 py-2 ${!queueData.patients.length ? 'bg-gray-600 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'} text-white rounded-lg text-sm font-semibold shadow`}
                onClick={() => exportQueueHistoryCSV(queueData, userDepartments, selectedDepartment, selectedDate)}
                disabled={!queueData.patients.length}
                title="Export current queue history as CSV"
              >
                Export CSV
              </button>
            </div>
            {/* Date and Summary Info */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    Queue Data for {convertUTCToTimeZone(selectedDate[0].toISOString(), "MMM DD, YYYY")} {selectedDate[1] && "to " + convertUTCToTimeZone(selectedDate[1].toISOString(), "MMM DD, YYYY")} 
                  </h3>
                  <p className="text-gray-600">
                    Department: {userDepartments.find(d => d.id === selectedDepartment)?.name || 'All Departments'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-purple-600">{queueData.patients.length}</p>
                  <p className="text-sm text-gray-600">Total Patients</p>
                </div>
              </div>
            </div>

            {/* Historical Queue Display */}
            {queueData.patients.length > 0 ? (
              <div className="space-y-6">
                {/* Queue Grid */}
                <div>
                  <h2 className="text-xl font-semibold mb-4 text-gray-700">Historical Queue</h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                    {queueData.patients.map((patient) => (
                      <div
                        key={patient.id}
                        className={getPatientButtonClass(patient)}
                      >
                        <div className="text-lg font-bold">
                          {patient.priority}{leadingZero(patient.priority_number)}
                        </div>
                        <div className="mt-1">
                          {getStatusBadge(patient.status)}
                        </div>
                        {patient.created_at && (
                          <div className="text-xs text-gray-500 mt-1">
                            {convertUTCToTimeZone(patient.created_at, "hh:mm A")}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Patient Details Table */}
                <div>
                  <h3 className="text-lg font-semibold mb-3 text-gray-700">Patient Details</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Queue #</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Completed</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {queueData.patients.map((patient) => (
                          <tr key={patient.id} className="hover:bg-gray-50">
                            <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {patient.priority}{leadingZero(patient.priority_number)}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                              {patient.name || 'N/A'}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                patient.priority === 'P' ? 'bg-red-100 text-red-800' :
                                patient.priority === 'SC' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-blue-100 text-blue-800'
                              }`}>
                                {patient.priority === 'P' ? 'Urgent' : 
                                 patient.priority === 'SC' ? 'Senior/PWD' : 'Regular'}
                              </span>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                              {getStatusBadge(patient.status)}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                              {patient.created_at ? convertUTCToTimeZone(patient.created_at, "hh:mm A") : 'N/A'}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                              {patient.completed_at ? convertUTCToTimeZone(patient.completed_at, "hh:mm A") : 'N/A'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ) : (
              !error && (
                <div className="text-center py-12">
                  <HistoryIcon size={48} className="mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500 text-lg">No queue data found for the selected date.</p>
                  <p className="text-gray-400 text-sm mt-2">Try selecting a different date or department.</p>
                </div>
              )
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default QueueHistory;
