import { useEffect, useState, useCallback } from "react";
import { Calendar } from "primereact/calendar";
import { useAxios } from "../../contexts/AxiosContext";
import { useToast } from "../../contexts/ToastContext";
import leadingZero from "../../utils/leadingZero";
import { Dropdown } from "primereact/dropdown";
import convertUTCToTimeZone from "../../utils/convertUTCToTimeZone";
import { CalendarIcon, HistoryIcon } from "lucide-react";

const QueueHistory = ({ profile }) => {
  const showToast = useToast();
  const axiosInstance = useAxios();
  const [selectedDate, setSelectedDate] = useState(new Date());
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
  }, [axiosInstance]);

  const fetchHistoricalPatients = useCallback(async (department_id = null, date = null) => {
    setIsLoading(true);
    setError(null);
    try {
      let params = new URLSearchParams();
      
      if (department_id) {
        params.append('department_id', department_id);
      }
      
      if (date) {
        // Format date as YYYY-MM-DD for the API
        const formattedDate = date.toISOString().split('T')[0];
        params.append('date', formattedDate);
      }

      const queryString = params.toString();
      const url = `/patients/queue/history${queryString ? `?${queryString}` : ''}`;
      
      const response = await axiosInstance.get(url);
      setQueueData((prev) => ({
        ...prev,
        patients: response.data,
      }));
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
  }, [axiosInstance, showToast]);

  // Initialize component
  useEffect(() => {
    if (profile) {
      fetchDepartments();
      setUserDepartments(profile?.all_departments);
      setSelectedDepartment(profile?.all_departments[0]?.id);

      // Fetch initial data for today
      fetchHistoricalPatients(
        profile?.all_departments[0]?.id || profile?.department_id,
        selectedDate
      );
    }
  }, [profile, fetchDepartments, fetchHistoricalPatients, selectedDate]);

  // Handle date change
  const handleDateChange = (e) => {
    const newDate = e.value;
    setSelectedDate(newDate);
    if (newDate && selectedDepartment) {
      fetchHistoricalPatients(selectedDepartment, newDate);
    }
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
                  className="bg-transparent border-0 text-white"
                  inputClassName="bg-transparent border-0 text-white placeholder-white/70 text-sm"
                  showIcon={false}
                  dateFormat="mm/dd/yy"
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
      <div className="bg-white shadow-lg rounded-b-2xl p-6">
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
            {/* Date and Summary Info */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    Queue Data for {convertUTCToTimeZone(selectedDate.toISOString(), "MMM DD, YYYY")}
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
