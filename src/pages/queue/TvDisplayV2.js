import { useEffect } from "react";
import ReactPlayer from "react-player";

const ServicePoint = ({ department, number, type = "regular", url = null }) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden w-full max-h-[180px]">
      <div className="bg-primary text-lg text-white p-3 text-center font-semibold">
        {department}
      </div>
      <div className="p-4 text-center">
        <div className={`text-7xl font-bold mb-2 ${
          type === 'priority' ? 'text-red-600' :
          type === 'special' ? 'text-orange-500' :
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
  

  const servicePoints = [
    { department: "Radiology / X-Ray", number: "SP01", type: "special" },
    { department: "Clinic RM1", number: "R05", type: "regular" },
    { department: "Clinic RM2", number: "R06", type: "regular" },
    { department: "Clinic RM3", number: "SP01", type: "special" },
    { department: "Cashier 01", number: "R01", type: "regular" },
    { department: "Cashier 02", number: "P01", type: "priority" },
    { department: "Therapy Center", number: "P11", type: "priority" },
  ];

  useEffect(() => {
    setLoadingState(false);
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
        <div className="w-1/3 flex items-center">
          {/* Use solid background for better contrast */}
          <div className="w-full bg-white p-4 rounded-lg shadow-md min-h-[120px] flex flex-col justify-center">
            <h1 className="text-2xl font-semibold text-gray-800">Asian Orthopedics</h1>
            <p className="text-lg text-gray-600">Spine and Joints Center</p>
            {/* Slightly smaller date/time */}
            <p className="text-xs text-gray-500 mt-2">
              { new Date().toLocaleString("en-US", {
                  month: "long", day: "numeric", year: "numeric",
                  hour: "numeric", minute: "2-digit", hour12: true
                })
              }
            </p>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="w-full mx-auto gap-6 grid grid-cols-2">
        {/* Service Points Column 1 */}
        <div className="w-full grid grid-cols-2 gap-6">
        {
          servicePoints.slice(0, 4).map((point, index) => (
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
        {/* Video Player Area */}
        <div className="w-full max-h-[380px] rounded-lg shadow-md overflow-hidden"> {/* Added rounding and shadow */}
          <ReactPlayer
            playing
            width="100%"
            height="100%" // Ensure height fills container
            loop={true}
            controls={false}
            style={{ aspectRatio: "16/9" }} // Keep aspect ratio
            url={"https://www.youtube.com/watch?v=fqMEkSE9CRQ"}
          />
        </div>
        
        <div className="col-span-2">
          {/* Service Points Row 2 */}
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
        </div>
      </div>
    </div>
  );
}

export default TvDisplayV2;