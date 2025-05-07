import { useEffect, useState } from "react";
import ReactPlayer from "react-player";
import { useAxios } from "../../contexts/AxiosContext";
import leadingZero from "../../utils/leadingZero";
import echo from "../../services/echo";

const ServicePoint = ({ department, number, type = "regular" }) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden w-full max-h-[180px]">
      <div className="bg-primary text-lg text-white p-3 text-center font-semibold">
        {department}
      </div>
      <div className="p-4 text-center">
        <div className={`text-7xl font-bold mb-2 ${
          type === 'P' ? 'text-red-600' :
          type === 'SC' ? 'text-orange-500' :
          'text-primary' // Use primary theme color
        }`}>
          {number}
        </div>
        <div className="text-gray-500 text-sm">Now Serving</div>
      </div>
    </div>
  );
};

const TvDisplayV2 = ({setLoadingState}) => {
  const axiosInstance = useAxios();

  const [departments, setDepartments] = useState();
  const fetchDepartments = async () => {
    try {
      const response = await axiosInstance.get('/departments?has_patient=true');
      setDepartments(response.data);
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };
 
  const [date, setDate] = useState(new Date().toLocaleString("en-US", {
    month: "long", day: "numeric", year: "numeric",
    hour: "numeric", minute: "2-digit", second: "2-digit", hour12: true
  }));

  const [activeClick, setActiveClick] = useState(false);
  const voices = speechSynthesis.getVoices();
  const bell = new Audio('/assets/mp3/bell.mp3');

  const callOutInQueue = (e) => {
    console.log("Call out in queue:", e);
    setActiveClick(true);

    if(activeClick) return;
    // Play the bell sound
    bell.play();
    setTimeout(() => {
      const utterance = new SpeechSynthesisUtterance(`${e.priority}${leadingZero(e.number)}, on ${e.department_name}`);
      utterance.volume = 1; // 🔊 Volume: 0.0 (mute) to 1.0 (max)
      utterance.rate = 1;   // 🚀 Speed: 0.1 (slow) to 10 (fast), default is 1
      utterance.pitch = 1;  // 🎼 Pitch: 0 (low) to 2 (high)

      utterance.voice = voices.find(v => v.name.includes("Male") || v.name.includes("John"));
      speechSynthesis.speak(utterance);
    }, 1000);
    
    setTimeout(() => {
      setActiveClick(false);
    }, 5000);
  }
  
  useEffect(() => {
    fetchDepartments();
    setLoadingState(false);

    // Set initial date
    setDate(new Date().toLocaleString("en-US", {
      month: "long", day: "numeric", year: "numeric",
      hour: "numeric", minute: "2-digit", second: "2-digit", hour12: true
    }));
    
    // Set up interval to update time every second
    const timer = setInterval(() => {
      setDate(new Date().toLocaleString("en-US", {
        month: "long", day: "numeric", year: "numeric",
        hour: "numeric", minute: "2-digit", second: "2-digit", hour12: true
      }));
    }, 1000);

    console.log("Echo connected:", echo.connector.socket);
    console.log("Subscribed Channels:", echo.connector.channels);

    const channel = echo.channel("cms_patient_queue_display");
  
    channel.listen(".PatientQueueDisplay", (e) => {
      console.log("📩 Received (PatientQueueDisplay):", e);
      fetchDepartments();
    });

    const callOutChannel = echo.channel("cms_call_out_queue");

    callOutChannel.listen(".CallOutQueue", (e) => {
      console.log("📩 Received (CallOutQueue):", e);
      callOutInQueue(e);
    });
  
    return () => {
      echo.leaveChannel("cms_patient_queue_display");
      clearInterval(timer);
    };

  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {/* Logo and Header */}
      {/* Simplified Header */}
      <div className="w-full flex justify-between items-stretch gap-6 mb-6">
        {/* Logo/Image Area */}
        <div className="w-2/3 bg-cover bg-center rounded-lg shadow-md min-h-[120px]"
          style={{ backgroundImage: 'url(/asianorthopedics_small.jpg)' }} // Keep inline style for background image
        >
          {/* Content inside image div removed for cleaner look */}
        </div>
        {/* Text Info Area */}
        <div className="w-1/3 flex items-center" onClick={callOutInQueue}>
          {/* Use solid background for better contrast */}
          <div className="w-full bg-white p-4 rounded-lg shadow-md min-h-[120px] flex flex-col justify-center">
            <h1 className="text-2xl font-semibold text-gray-800">Asian Orthopedics</h1>
            <small className="text-gray-600">Spine and Joints Center</small>
            {/* Slightly smaller date/time */}
            <p className="text-xl text-gray-500 mt-2">
              { date || "-"}
            </p>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="w-full mx-auto">
        {/* Service Points Column 1 */}
        <div className="w-full grid grid-cols-4 gap-6">
        {
          departments?.map((station, index) => (
            <ServicePoint
              key={index}
              department={station.name}
              number={(station?.patient?.priority || "") + leadingZero(station?.patient?.priority_number || 0)}
              type={station?.patient?.priority}
            />
          ))
        }
        </div>
        {/* Video Player Area */}
        {/* <div className="hidden w-full max-h-[380px] rounded-lg shadow-md overflow-hidden">
          <ReactPlayer
            playing
            width="100%"
            height="100%"
            loop={true}
            controls={false}
            style={{ aspectRatio: "16/9" }}
            url={"https://www.youtube.com/watch?v=fqMEkSE9CRQ"}
          />
        </div> */}
        
        {/* <div className="hidden col-span-2">
          <div className="w-full grid grid-cols-4 gap-6">
            {
              servicePoints.slice(4).map((point, index) => (
                <ServicePoint
                  key={index}
                  department={point.department}
                  number={point.number}
                  type={point.type}
                  url={point?.url}
                />
              ))
            }
          </div>
        </div> */}
      </div>
    </div>
  );
}

export default TvDisplayV2;