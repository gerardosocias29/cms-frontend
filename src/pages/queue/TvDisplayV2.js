import { useEffect, useState } from "react";
import ReactPlayer from "react-player";
import { useAxios } from "../../contexts/AxiosContext";
import leadingZero from "../../utils/leadingZero";
import echo from "../../services/echo";
import { FaVideo, FaVideoSlash } from "react-icons/fa";

const ServicePoint = ({ department, number, type = "regular" }) => {
  return (
    <div className="overflow-hidden w-full border rounded-lg shadow-lg bg-white relative">
      <div className="bg-[#65BDC2] text-xl text-white p-2 text-center font-semibold uppercase">
        {department}
      </div>
      <div className="p-4 flex h-[250px] items-center justify-center flex-col text-center">
        <div className={`text-8xl xl:text-10xl font-bold ${
          type === 'P' ? 'text-red-600' :
          type === 'SC' ? 'text-orange-500' :
          'text-primary' // Use primary theme color
        }`}>
          {number}
        </div>
        <div className="text-gray-600 uppercase tracking-wider text-xs xl:text-sm">Now Serving</div>
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
    // hour: "numeric", minute: "2-digit", second: "2-digit", hour12: true
  }));

  const [time, setTime] = useState({
    hour: new Date().getHours() % 12 || 12,
    minute: new Date().getMinutes(),
    second: new Date().getSeconds(),
    ampm: new Date().getHours() >= 12 ? 'PM' : 'AM'
  });

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

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).toUpperCase();
  };

  const breakpointColumnsObj = {
    default: 3,
    1100: 2,
    700: 2,
    500: 1
  };
  
  useEffect(() => {
    fetchDepartments();
    fetchVideoUrl();
    setLoadingState(false);

    // Set initial date
    setDate(new Date().toLocaleString("en-US", {
      month: "long", day: "numeric", year: "numeric",
      // hour: "numeric", minute: "2-digit", second: "2-digit", hour12: true
    }));

    // Set initial time
    const now = new Date();
    setTime({
      hour: now.getHours() % 12 || 12,
      minute: now.getMinutes(),
      second: now.getSeconds(),
      ampm: now.getHours() >= 12 ? 'PM' : 'AM'
    });
    
    // Set up interval to update time every second
    const timer = setInterval(() => {
      const now = new Date();
      setTime({
        hour: now.getHours() % 12 || 12,
        minute: now.getMinutes(),
        second: now.getSeconds(),
        ampm: now.getHours() >= 12 ? 'PM' : 'AM'
      });
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
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Logo and Header */}
      <header className="bg-white shadow-sm px-3 sm:px-6 py-2 sm:py-3 flex flex-col sm:flex-row justify-between items-center gap-2 sm:gap-0">
        <div className="flex items-center space-x-2 sm:space-x-3">
          <div className="text-center sm:text-left">
            <img src="/logo-png-sm.png" alt="CMS LOGO" className="h-8 sm:h-12 lg:h-16" />
          </div>
        </div>
        
        <div className="text-center sm:text-right">
          <div className="text-xs text-gray-600 font-medium">
            {formatDate(new Date())}
          </div>
          <div className="text-xl sm:text-2xl font-bold text-gray-800 font-mono">
            <span className="bg-gray-100 px-2 py-1 rounded mr-1">
              {time.hour.toString().padStart(2, '0')}
            </span>
            :
            <span className="bg-gray-100 px-2 py-1 rounded mx-1">
              {time.minute.toString().padStart(2, '0')}
            </span>
            :
            <span className="bg-gray-100 px-2 py-1 rounded mx-1">
              {time.second.toString().padStart(2, '0')}
            </span>
            <span className="text-sm ml-2 bg-gray-200 px-2 py-1 rounded">
              {time.ampm}
            </span>
          </div>
        </div>
      </header>

      {/* Main Content Grid */}
      <div className="flex-1 flex flex-col lg:flex-row gap-2 sm:gap-4 p-2 sm:p-4">
        {/* Ads Video */}
        <div className="w-full lg:w-1/2 flex items-center justify-center rounded-xl overflow-hidden relative h-1/2">
          { url && (
            <ReactPlayer
              playing={true}
              width="100%"
              height="100%"
              loop={true}
              controls={true}
              style={{ aspectRatio: "16/9" }}
              url={url}
            />
            ) 
          }
          { !url && (
            <div className="text-gray-500 text-center min-h-[380px] flex flex-col items-center justify-center bg-gray-100 w-full rounded-lg border">
              <FaVideoSlash className="text-6xl mb-2" />
              <strong className="text-sm">No Video Available</strong>
            </div>
          )}
        </div>
        
        
        <div className="w-full lg:w-1/2">
          <div className="
            grid xl:grid-cols-3 lg:grid-cols-2 md:grid-cols-3 gap-3
          ">
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
    </div>
  );
}

export default TvDisplayV2;