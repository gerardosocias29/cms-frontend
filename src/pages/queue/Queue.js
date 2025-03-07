import { useEffect, useState } from "react";
import { FaLongArrowAltLeft, FaLongArrowAltRight } from "react-icons/fa";
import { useAxios } from "../../contexts/AxiosContext";

const Queue = ({profile}) => {
  const axiosInstance = useAxios();

  const currentNumber = "S01";
  const queueItems = [
    { number: "P05", type: "priority" },
    { number: "R03", type: "regular" },
    { number: "SP05", type: "special" },
    { number: "SP03", type: "special" },
    { number: "R05", type: "regular" },
    { number: "R08", type: "regular" },
    { number: "R10", type: "regular" },
    { number: "R12", type: "regular" },
  ];

  const nextSteps = [
    { name: "Billing", icon: "💳" },
    { name: "Therapy Center", icon: "🏥" },
    { name: "Clinic RM 1", icon: "🚪" },
    { name: "Clinic RM 2", icon: "🚪" },
    { name: "Clinic RM 3", icon: "🚪" },
  ];

  const [data, setData] = useState();
  useEffect(() => {
    const response = axiosInstance.get('/users/'+profile.id)
    console.log(response.data);
    setData(response.data);
  }, []);

  return (
    <div className="w-full">
      {/* Department Header */}
      <div className="bg-white rounded-t-2xl">
        <div className="bg-blue-600 text-white p-4 rounded-t-2xl">
          <h1 className="text-2xl font-bold text-center">Radiology / X-Ray</h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white shadow-lg rounded-b-2xl p-6">
        {/* Current Number Section */}
        <div className="mb-4">
          <div className="flex flex-col lg:flex-row gap-5">

            <div className="text-center w-full lg:w-2/5">
              <h2 className="text-xl text-gray-600">Now Serving</h2>
              <div className="bg-green-500 text-white text-5xl font-bold py-6 px-12 rounded-xl inline-block">
                {currentNumber}
              </div>
            </div>

            {/* Queue Section */}
            <div className="w-full lg:w-3/5">
              <h2 className="text-xl font-semibold mb-4 text-gray-700">In Queue</h2>
              <div className="grid grid-cols-4 gap-3">
                {queueItems.map((item, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg text-center font-semibold ${
                      item.type === 'priority' ? 'bg-red-100 text-red-700' :
                      item.type === 'special' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-blue-100 text-blue-700'
                    }`}
                  >
                    {item.number}
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

        

        {/* Next Steps Section */}
        <div>
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-gray-700">Where to go next?</h2>
            <p className="text-gray-500">Select the patient's next destination after X-Ray</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {nextSteps.map((step, index) => (
              <button
                key={index}
                className="flex flex-col items-center p-3 bg-white border-2 border-gray-200 rounded-xl hover:bg-gray-50 hover:border-blue-300 transition-all"
              >
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{step.icon}</span>
                  <span className="font-medium text-gray-700">{step.name}</span>
                </div>
                <span className="text-sm text-gray-500">{step.description}</span>
              </button>
            ))}
            <button className="flex items-center justify-center gap-2 p-4 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors col-span-2">
              <span className="font-medium">End Patient Session</span>
            </button>
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="mt-8 flex justify-between">
          <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
            <FaLongArrowAltLeft />
            Previous Step
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
            Next Step
            <FaLongArrowAltRight />
          </button>
        </div>
      </div>
    </div>
  )
}

export default Queue;