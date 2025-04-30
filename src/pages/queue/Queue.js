import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useAxios } from "../../contexts/AxiosContext"; // Import the useAxios hook
import echo from "../../services/echo";
import { useToast } from "../../contexts/ToastContext";
import leadingZero from "../../utils/leadingZero";
// Assuming you have a toast context or similar for user feedback
// import { useToast } from "../../contexts/ToastContext";

const Queue = ({ profile }) => {
  const showToast = useToast();
  const axiosInstance = useAxios(); // Get the configured axios instance
  // const { showToast } = useToast(); // Example: Get toast function
  const [currentPatient, setCurrentPatient] = useState(null);
  const [selectedStep, setSelectedStep] = useState(null);
  const [queueData, setQueueData] = useState({
    department: profile?.department,
    patients: [],
  });
  const [isLoading, setIsLoading] = useState(true); // Add loading state
  const [error, setError] = useState(null); // Add error state
  const [isActionLoading, setIsActionLoading] = useState(false); // Loading state for actions

  const [departments, setDepartments] = useState();
  const fetchDepartments = async () => {
    try {
      const response = await axiosInstance.get('/departments');
      setDepartments(response.data);
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  const fetchPatients = async () => {
    // setIsLoading(true);
    setError(null);
    try {
      // Use the axiosInstance from the context
      // The base URL should be configured in AxiosContext
      const response = await axiosInstance.get("/patients/queue");
      setQueueData((prev) => ({
        ...prev,
        patients: response.data,
      }));

      const firstInProgressPatient = response.data.find(patient => patient.status === 'in-progress');
      if(firstInProgressPatient){
        setCurrentPatient(firstInProgressPatient); // Use updated patient data from response
        setQueueData((prev) => ({
          ...prev,
          patients: prev.patients?.map((p) =>
            p.id === firstInProgressPatient.id ? firstInProgressPatient : p // Use the updated patient data from response here too
          ),
        }));
      }
     
    } catch (err) {
      console.error("Error fetching patients:", err);
      setError("Failed to load queue data. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch initial queue data
  useEffect(() => {
    fetchPatients();
    fetchDepartments();
    // TODO: Implement real-time updates (Polling or WebSockets)

    if(profile?.department_id != null) {

      console.log("cms_department_", profile?.department_id);

      console.log("Echo connected:", echo.connector.socket);
      console.log("Subscribed Channels:", echo.connector.channels);

      const channel = echo.channel("cms_department_" + profile?.department_id);
    
      channel.listen(".PatientQueueUpdated", (e) => {
        console.log("📩 Received (PatientQueueUpdated):", e);
        fetchPatients();
      });
    
      return () => {
        echo.leaveChannel("cms_department_" + profile?.department_id);
      };
    }
  }, []);

  // Update header when profile changes
  useEffect(() => {
    if (profile?.department_specialization) {
        setQueueData(prev => ({
            ...prev,
            department_specialization: {
              department: { name: profile.department_specialization.department.name },
              name: profile.department_specialization.name
            }
        }));
    }
  }, [profile]);

  // Add useEffect to log currentPatient whenever it changes
  useEffect(() => {
    console.log("Current patient state AFTER update:", currentPatient);
  }, [currentPatient]);

  const startSession = async (patient) => {
    console.log("START SESSION:::::")
    if (isActionLoading) return; // Prevent double clicks
    if (window.confirm(`Start session for ${patient.priority}${patient.priority_number}?`)) {
      setIsActionLoading(true);
      console.log(`Attempting to start session for patient: ${patient.id}`);
      try {
        // API Call to backend
        const response = await axiosInstance.post(`/queue/start/${patient.id}`);
        console.log("API Response Data:", response.data); // Log the full response data
        console.log("Patient data from API:", response.data.patient); // Log the patient object specifically

        // Log state *before* setting
        console.log("Current patient state BEFORE update:", currentPatient);

        showToast({
          severity: "success",
          summary: "Session Started",
          detail: `Successfully started session for ${patient.priority}${patient.priority_number}.`,
        });

        setCurrentPatient(response.data.patient); // Use updated patient data from response

        // Note: Logging currentPatient immediately after setCurrentPatient might show the old value
        // due to the asynchronous nature of state updates. Use useEffect above to see the updated value.

        // Update local state for immediate feedback
        setQueueData((prev) => ({
          ...prev,
          patients: prev.patients.map((p) =>
            p.id === patient.id ? response.data.patient : p // Use the updated patient data from response here too
          ),
        }));
        // showToast("Session started successfully!", "success"); // Example toast
      } catch (err) {
         console.error("Failed to start session:", err);
         setError(`Failed to start session for ${patient.priority}${patient.priority_number}. ${err.response?.data?.message || ''}`);
         // showToast(`Error starting session: ${err.response?.data?.message || 'Server error'}`, "error");
      } finally {
        setIsActionLoading(false);
      }
    }
  };

  const endSession = async () => {
    if (!currentPatient || isActionLoading) return;
    if (window.confirm(`End session for ${currentPatient.priority}${currentPatient.priority_number}?`)) {
      setIsActionLoading(true);
      console.log(`Attempting to end session for patient: ${currentPatient.id}`);
      try {
        // API Call to backend
        await axiosInstance.post(`/queue/end/${currentPatient.id}`);
        console.log("End session successful");

        const endedPatientId = currentPatient.id; // Store ID before clearing
        setCurrentPatient(null);
        setSelectedStep(null);
        // Remove patient from local state *after* successful API call
        setQueueData((prev) => ({
          ...prev,
          patients: prev.patients.filter((p) => p.id !== endedPatientId),
        }));

        showToast({
          severity: "success",
          summary: "Session Ended",
          detail: `Successfully ended session for ${currentPatient.priority}${currentPatient.priority_number}.`,
        });
        // showToast("Session ended successfully!", "success");
      } catch (err) {
        console.error("Failed to end session:", err);
        setError(`Failed to end session. ${err.response?.data?.message || ''}`);
        // showToast(`Error ending session: ${err.response?.data?.message || 'Server error'}`, "error");
      } finally {
        setIsActionLoading(false);
      }
    }
  };

  const handleNextStepSelection = (step) => {
    setSelectedStep(step);
  };

  const handleNextStep = async () => {
    if (!currentPatient || !selectedStep || isActionLoading) return;
    if (window.confirm(`Transfer patient ${currentPatient.priority}${currentPatient.priority_number} to ${selectedStep.name}?`)) {
      setIsActionLoading(true);
      console.log(`Attempting to transfer patient ${currentPatient.id} to ${selectedStep.name}`);
      try {
        // API Call to backend
        await axiosInstance.post(`/queue/next/${currentPatient.id}`, { next_step_id: selectedStep.id });
        console.log("Next step successful");

        const transferredPatientId = currentPatient.id; // Store ID
        setCurrentPatient(null);
        setSelectedStep(null);
         // Remove patient from local state *after* successful API call
        setQueueData((prev) => ({
          ...prev,
          patients: prev.patients.filter((p) => p.id !== transferredPatientId),
        }));

        showToast({
          severity: "success",
          summary: "Patient Transferred",
          detail: `Successfully transferred patient to ${selectedStep.name}`,
        });
        // showToast("Patient transferred successfully!", "success");
      } catch (err) {
         console.error("Failed to transfer patient:", err);
         setError(`Failed to transfer patient. ${err.response?.data?.message || ''}`);
         // showToast(`Error transferring patient: ${err.response?.data?.message || 'Server error'}`, "error");
      } finally {
        setIsActionLoading(false);
      }
    }
  };

  // --- Helper Functions ---

  const getPatientButtonClass = (patient) => {
    let baseClass = "p-3 rounded-lg text-center font-semibold transition-all"; // Removed cursor-pointer initially
    if (patient.status === "in-progress") {
      return `${baseClass} bg-green-100 border-2 border-green-500 cursor-not-allowed`;
    }
    // Add cursor-pointer only if waiting
    baseClass += " cursor-pointer";
    switch (patient.priority?.toLowerCase()) {
      case "p":
        return `${baseClass} bg-red-100 hover:border-2 border-red-700`;
      case "sc":
        return `${baseClass} bg-yellow-100 hover:border-2 border-yellow-700`;
      default:
        return `${baseClass} bg-blue-100 hover:border-2 border-blue-700`;
    }
  };

  const getNextStepButtonClass = (step) => {
    let baseClass = "flex flex-col justify-center items-center p-2 border-2 rounded-xl hover:bg-gray-50 hover:border-blue-300 transition-all";
    if (selectedStep?.id === step.id) {
      return `${baseClass} border-blue-500 bg-blue-100`;
    } else {
      return `${baseClass} border-gray-200 bg-white`;
    }
  }

  // --- Render ---

  return (
    <div className="w-full">
      {/* Header */}
      <div className="bg-white rounded-t-2xl">
        <div className="bg-blue-600 text-white p-4 rounded-t-2xl">
          <h1 className="text-lg font-bold text-center">
            {profile?.department?.name}
          </h1>
        </div>
      </div>

      {/* Body */}
      <div className="bg-white shadow-lg rounded-b-2xl p-6">
        {/* Loading State */}
        {isLoading && <p className="text-center text-gray-500 py-4">Loading queue...</p>}

        {/* Error State */}
        {error && !isLoading && <p className="text-center text-red-500 py-4">{error}</p>}

        {/* Content Area */}
        {!isLoading && ( // Render content even if there was an initial load error, but allow actions
          <>
            <div className="mb-4">
              <div className="flex flex-col lg:flex-row gap-5">
                {/* Now Serving Section */}
                <div className="text-center w-full lg:w-2/5">
                  <h2 className="text-xl text-gray-600 mb-2">Now Serving</h2>
                  <div className="bg-green-500 text-white text-5xl font-bold py-6 px-12 rounded-xl inline-block min-h-[100px] flex items-center justify-center">
                    {currentPatient ? `${currentPatient.priority}${leadingZero(currentPatient.priority_number)}` : "---"}
                  </div>
                </div>

                {/* In Queue Section */}
                <div className="w-full lg:w-3/5">
                  <h2 className="text-xl font-semibold mb-4 text-gray-700">In Queue</h2>
                  {queueData.patients.length > 0 ? (
                    <div className="grid grid-cols-4 gap-3">
                      {queueData.patients.map((patient) => (
                        <button
                          key={patient.id}
                          onClick={() => {
                            startSession(patient)
                          }}
                          className={getPatientButtonClass(patient)}
                          disabled={isActionLoading}
                        >
                          {patient.priority}{leadingZero(patient.priority_number)}
                        </button>
                      ))}
                    </div>
                  ) : (
                     // Show message only if there wasn't a load error
                    !error && <p className="text-gray-500 text-center py-4">No patients in the queue.</p>
                  )}
                </div>
              </div>
            </div>

            {/* Next Step Section */}
            {currentPatient && (
              <div className="mt-6 border-t pt-6">
                <div className="flex flex-col md:flex-row gap-2">
                  <div className="w-full md:w-1/2 p-4 border border-gray-200 rounded-lg bg-gray-50">
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">Patient Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="font-medium text-gray-600">Name:</p>
                        <p className="text-gray-800">{currentPatient.name || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="font-medium text-gray-600">Symptoms:</p>
                        <p className="text-gray-800">{currentPatient.symptoms || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="font-medium text-gray-600">Blood Pressure:</p>
                        <p className="text-gray-800">{currentPatient.bloodpressure || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="font-medium text-gray-600">Heart Rate:</p>
                        <p className="text-gray-800">{currentPatient.heartrate ? `${currentPatient.heartrate} BPM` : 'N/A'}</p>
                      </div>
                      <div>
                        <p className="font-medium text-gray-600">Temperature:</p>
                        <p className="text-gray-800">{currentPatient.temperature ? `${currentPatient.temperature} °C` : 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                  <div>
                    <div className="">
                      <h2 className="text-xl font-semibold text-gray-700">Where to go next?</h2>
                      <p className="text-gray-500">Select the patient's next destination</p>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {departments?.map((step) => (
                        <button
                          key={step.id}
                          onClick={() => handleNextStepSelection(step)}
                          className={getNextStepButtonClass(step)}
                          disabled={isActionLoading} // Disable while action is loading
                        >
                          <div className="flex items-center justify-center gap-2">
                            <span className="font-medium text-xs text-gray-700">{step.name}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Next Step Button */}
                  <button
                    onClick={handleNextStep}
                    disabled={!selectedStep || isActionLoading} // Disable if no step selected or loading
                    className="flex items-center justify-center gap-2 p-4 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    <ArrowRight size={20} />
                    <span className="font-medium">Next Step</span>
                  </button>

                  {/* End Session Button */}
                  <button
                    onClick={endSession}
                    disabled={isActionLoading} // Disable while action is loading
                    className="flex items-center justify-center gap-2 p-4 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors disabled:bg-red-300 disabled:cursor-not-allowed"
                  >
                    <span className="font-medium">End Session</span>
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Queue;