import { useEffect, useState } from "react";
import ReactPlayer from "react-player";
import { useAxios } from "../../contexts/AxiosContext";
import leadingZero from "../../utils/leadingZero";
import echo from "../../services/echo";
import { FaVideo, FaVideoSlash } from "react-icons/fa";

const ServicePoint = ({ department, number, type = "regular" }) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden w-full max-h-[180px]">
      <div className="bg-primary text-lg text-white px-3 py-1 text-center font-semibold">
        {department}
      </div>
      <div className="p-2 text-center">
        <div className={`text-8xl font-bold ${
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

  const [url, setUrl] = useState();
  const fetchVideoUrl = async () => {
    try {
      const response = await axiosInstance.get('/settings/video-url');
      if (response.data && response.data.url) {
        setUrl(response.data.url);
      }
    } catch (error) {
      console.error('Error fetching video URL:', error);
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
    if(!e.department_name || !e.number || !e.priority){
      return;
    }

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

      // on done speaking
      utterance.onend = () => {
        setActiveClick(false);
        bell.pause();
        bell.currentTime = 0;
        speechSynthesis.cancel();
      };
    }, 1000);
  }
  
  useEffect(() => {
    fetchDepartments();
    fetchVideoUrl();
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
      callOutInQueue(e.data);
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
        <div className="w-2/3 bg-cover bg-center rounded-lg shadow-md min-h-[140px]"
          style={{ backgroundImage: 'url(/asianorthopedics_small.jpg)' }} // Keep inline style for background image
        >
          {/* Content inside image div removed for cleaner look */}
        </div>
        {/* Text Info Area */}
        <div className="w-1/3 flex items-center">
          {/* Use solid background for better contrast */}
          <div className="w-full bg-white p-4 rounded-lg shadow-md min-h-[140px] flex flex-col justify-center">
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
      <div className="w-full mx-auto flex gap-3">
        {/* make this div independent height with other div */}
        <div className="w-2/5 bg-white rounded-lg shadow-md p-3 h-1/2"> 
          {/* Ads Video */}
          <div className="bg-white rounded-lg border overflow-hidden w-full max-h-[380px] flex items-center justify-center col-span-1">
            { url && (
                <ReactPlayer
                  playing
                  width="100%"
                  height="100%"
                  loop={true}
                  controls={false}
                  style={{ aspectRatio: "16/9" }}
                  url={url}
                />
              ) 
            }
            {!url && (
              <div className="text-gray-500 text-center min-h-[380px] flex flex-col items-center justify-center bg-gray-100 w-full">
                <FaVideoSlash className="text-6xl mb-2" />
                <strong className="text-sm">No Video Available</strong>
              </div>
            )}
          </div>
        </div>
        {/* Service Points + Ads Video */}
        <div className="w-3/5 grid grid-cols-4 gap-3">
          {/* Departments */}
          {departments?.map((station, index) => (
            <ServicePoint
              key={index}
              department={station.name}
              number={(station?.patient?.priority || "") + leadingZero(station?.patient?.priority_number || 0)}
              type={station?.patient?.priority}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default TvDisplayV2;