import { useEffect, useState, useRef } from "react";
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

  const [videoUrl, setVideoUrl] = useState('');
  const [fileVideoUrl, setFileVideoUrl] = useState('');
  const [showBottomVideo, setShowBottomVideo] = useState(true);
  const [url, setUrl] = useState();
  const fetchVideoUrl = async () => {
    try {
      const response = await axiosInstance.get('/settings/video-url');
      const videoData = response.data;
      if (videoData && videoData.length > 0) {
        const topVideo = videoData.find(v => v.position === 'top');
        const bottomVideo = videoData.find(v => v.position === 'bottom');
        setVideoUrl(topVideo ? topVideo.url : '');
        setFileVideoUrl(bottomVideo ? bottomVideo.url : '');
        if(bottomVideo) {
          setShowBottomVideo((bottomVideo.show === 1) ? true : false);
        }
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
  const bellRef = useRef(null);

  useEffect(() => {
    bellRef.current = new Audio('/assets/mp3/bell.mp3');
  }, []);

  const callOutInQueue = (e) => {
    if(!e.department_name || !(e.number || e.display_number) || !e.priority){
      return;
    }

    console.log("Call out in queue:", e);
    setActiveClick(true);

    if(activeClick) return;
    // Play the bell sound
    if (bellRef.current) bellRef.current.play();
    setTimeout(() => {
      const spokenNumber = e.display_number || (e.priority + '-' + String(e.number || 0).padStart(2, '0'));
      const utterance = new SpeechSynthesisUtterance(`${spokenNumber}, on ${e.department_name}`);
      utterance.volume = 1; // 🔊 Volume: 0.0 (mute) to 1.0 (max)
      utterance.rate = 1;   // 🚀 Speed: 0.1 (slow) to 10 (fast), default is 1
      utterance.pitch = 1;  // 🎼 Pitch: 0 (low) to 2 (high)

      utterance.voice = voices.find(v => v.name.includes("Male") || v.name.includes("John"));
      speechSynthesis.speak(utterance);

      // on done speaking
      utterance.onend = () => {
        setActiveClick(false);
        if (bellRef.current) {
          bellRef.current.pause();
          bellRef.current.currentTime = 0;
        }
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
    <div className="min-h-screen bg-gray-100 flex flex-col relative overflow-hidden">
      {/* Logo and Header */}
      <header className="absolute z-[99] w-full bg-white shadow-sm px-3 sm:px-6 py-2 sm:py-3 flex flex-col sm:flex-row justify-between items-center gap-2 sm:gap-0">
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
      <div className="flex flex-col lg:flex-row gap-2 sm:gap-4 h-screen pt-[6.5rem] px-4 pb-4 overflow-auto">
        <div className="w-full lg:w-2/5 space-y-2">
          <div className="w-full h-1/2 rounded-lg overflow-hidden bg-black">
            { videoUrl && (
              <ReactPlayer
                playing={true}
                width="100%"
                height="100%"
                loop={true}
                controls={true}
                style={{ aspectRatio: "16/9" }}
                url={videoUrl}
              />
              ) 
            }
            { !videoUrl && (
              <div className="text-gray-500 text-center min-h-[380px] flex flex-col items-center justify-center bg-gray-100 w-full rounded-lg border">
                <FaVideoSlash className="text-6xl mb-2" />
                <strong className="text-sm">No Video Available</strong>
              </div>
            )}
          </div>
          {
            (showBottomVideo) && (
              <div className="w-full h-1/2 rounded-lg overflow-hidden bg-black">
                { fileVideoUrl && (
                  <ReactPlayer
                    playing={true}
                    width="100%"
                    height="100%"
                    loop={true}
                    controls={true}
                    style={{ aspectRatio: "16/9" }}
                    url={`${process.env.REACT_APP_API + fileVideoUrl}`}
                    muted={true}
                  />
                  ) 
                }
                { !fileVideoUrl && (
                  <div className="text-gray-500 text-center min-h-[380px] flex flex-col items-center justify-center bg-gray-100 w-full rounded-lg border">
                    <FaVideoSlash className="text-6xl mb-2" />
                    <strong className="text-sm">No Video Available</strong>
                  </div>
                )}
              </div>
            )
          }
          
        </div>
        <div className="w-full lg:w-3/5 ">
          <div className="
            grid xl:grid-cols-3 lg:grid-cols-2 md:grid-cols-3 gap-3
          ">
            {departments?.map((station, index) => {
              const patient = station?.patient || {};
              const deptName = station?.name || '';
              
              const computeInitials = (name, max = 3) => {
                if (!name) return '';
                const clean = name.replace(/[^A-Za-z]/g,'').toUpperCase();
                return clean.slice(0, max);
              };

              const formatDisplayNumber = (initials, priority, priorityNum) => {
                const first3 = computeInitials(initials, 3);
                const padded = String(priorityNum || 0).padStart(2, '0');
                return `${first3}-${priority || 'R'}${padded}`;
              };

              const hasPatient = patient.id;
              const displayNumber = hasPatient
                ? (patient.display_number || formatDisplayNumber(deptName, patient.priority, patient.priority_number))
                : '---';

              return (
                <ServicePoint
                  key={index}
                  department={station.name}
                  number={displayNumber}
                  type={patient.priority}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default TvDisplayV2;