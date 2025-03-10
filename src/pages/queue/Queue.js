import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";

const Queue = ({ profile }) => {
  const [currentPatient, setCurrentPatient] = useState(null);
  const [selectedStep, setSelectedStep] = useState(null);
  const [queueData, setQueueData] = useState({
    department_specialization: {
      department: {
        name: "Radiology",
      },
      name: "X-Ray",
    },
    patients: [
      { id: 1, priority: "P", priority_number: "01", status: "waiting" },
      { id: 2, priority: "SC", priority_number: "02", status: "waiting" },
      { id: 3, priority: "R", priority_number: "03", status: "waiting" },
    ],
  });

  const nextSteps = [
    { id: 1, name: "Billing", icon: "💳" },
    { id: 2, name: "Therapy Center", icon: "🏥" },
    { id: 3, name: "Clinic RM 1", icon: "🚪" },
    { id: 4, name: "Clinic RM 2", icon: "🚪" },
    { id: 5, name: "Clinic RM 3", icon: "🚪" },
  ];

  const startSession = (patient) => {
    if (window.confirm(`Start session for ${patient.priority}${patient.priority_number}?`)) {
      console.log(`Starting session for patient: ${patient.id}`);
      setCurrentPatient(patient);
      setQueueData((prev) => ({
        ...prev,
        patients: prev.patients.map((p) =>
          p.id === patient.id ? { ...p, status: "in-progress" } : p
        ),
      }));
    }
  };

  const endSession = () => {
    if (!currentPatient) return;
    console.log(`Ending session for patient: ${currentPatient.id}`);
    setQueueData((prev) => ({
      ...prev,
      patients: prev.patients.filter((p) => p.id !== currentPatient.id),
    }));
    setCurrentPatient(null);
    setSelectedStep(null);
  };

  const handleNextStepSelection = (step) => {
    setSelectedStep(step);
  };

  const handleNextStep = () => {
    if (!currentPatient || !selectedStep) return;
    if (window.confirm(`Transfer patient ${currentPatient.id} to ${selectedStep.name}?`)) {
      console.log(`Transferring patient ${currentPatient.id} to ${selectedStep.name}`);
      setQueueData((prev) => ({
        ...prev,
        patients: prev.patients.filter((p) => p.id !== currentPatient.id),
      }));
      setCurrentPatient(null);
      setSelectedStep(null);
    }
  };

  return (
    <div className="w-full">
      <div className="bg-white rounded-t-2xl">
        <div className="bg-blue-600 text-white p-4 rounded-t-2xl">
          <h1 className="text-lg font-bold text-center">
            {queueData?.department_specialization?.department?.name} - {queueData?.department_specialization?.name}
          </h1>
        </div>
      </div>

      <div className="bg-white shadow-lg rounded-b-2xl p-6">
        <div className="mb-4">
          <div className="flex flex-col lg:flex-row gap-5">
            <div className="text-center w-full lg:w-2/5">
              <h2 className="text-xl text-gray-600">Now Serving</h2>
              <div className="bg-green-500 text-white text-5xl font-bold py-6 px-12 rounded-xl inline-block">
                {currentPatient ? `${currentPatient.priority}${currentPatient.priority_number}` : "---"}
              </div>
            </div>

            <div className="w-full lg:w-3/5">
              <h2 className="text-xl font-semibold mb-4 text-gray-700">In Queue</h2>
              <div className="grid grid-cols-4 gap-3">
                {queueData?.patients.map((patient) => (
                  <button
                    key={patient.id}
                    onClick={() => patient.status === "waiting" && startSession(patient)}
                    className={`p-3 rounded-lg text-center font-semibold cursor-pointer transition-all
                      ${
                        patient.status === "in-progress"
                          ? "bg-green-100 border-2 border-green-500"
                          : patient.priority.toLowerCase() === "p"
                          ? "bg-red-100 hover:border-2 border-red-700"
                          : patient.priority.toLowerCase() === "sc"
                          ? "bg-yellow-100 hover:border-2 border-yellow-700"
                          : "bg-blue-100 hover:border-2 border-blue-700"
                      }
                    `}
                  >
                    {patient.priority}{patient.priority_number}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {currentPatient && (
          <div>
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-gray-700">Where to go next?</h2>
              <p className="text-gray-500">Select the patient's next destination</p>
            </div>
            <div className="grid grid-cols-4 gap-4">
              {nextSteps.map((step) => (
                <button
                  key={step.id}
                  onClick={() => handleNextStepSelection(step)}
                  className={`flex flex-col items-center p-3 bg-white border-2 border-gray-200 rounded-xl hover:bg-gray-50 hover:border-blue-300 transition-all
                    ${selectedStep?.id === step.id ? "border-blue-500 bg-blue-100" : ""}`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{step.icon}</span>
                    <span className="font-medium text-gray-700">{step.name}</span>
                  </div>
                </button>
              ))}
              <button 
                onClick={handleNextStep}
                disabled={!selectedStep}
                className="flex items-center justify-center gap-2 p-4 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors col-span-4 disabled:bg-gray-400"
              >
                <span className="font-medium">Next Step</span>
              </button>
              
              <button 
                onClick={endSession}
                className="flex items-center justify-center gap-2 p-4 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors col-span-4"
              >
                <span className="font-medium">End Session</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Queue;