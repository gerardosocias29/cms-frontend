import { useEffect } from "react";
import ReactPlayer from "react-player";

const ServicePoint = ({ department, number, type = "regular", url = null }) => {
  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden w-full max-h-[180px]">
      <div className="bg-blue-600 text-white p-3 text-center font-bold">
        {department}
      </div>
      <div className="p-4 text-center">
        <div className={`text-7xl font-bold mb-2 ${
          type === 'priority' ? 'text-red-600' :
          type === 'special' ? 'text-orange-500' :
          'text-blue-600'
        }`}>
          {number}
        </div>
        <div className="text-gray-600 text-sm">Now Serving</div>
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
    <div className="min-h-screen bg-gray-900 p-8">
      {/* Logo and Header */}
      <div className="w-full flex justify-between gap-5 mb-8">
        <div className="w-2/3 bg-cover bg-center shadow-lg rounded-2xl min-h-[100px] p-6 flex items-center justify-between"
          style={{
            backgroundImage: 'url(/asianorthopedics_small.jpg)',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            backgroundBlendMode: '',
            backgroundRepeat: 'no-repeat'
          }}
        >
        </div>
        <div className="w-1/3 flex items-center justify-end">
          <div className="w-full text-white min-h-[100px] bg-white/20 p-4 rounded-xl">
            <h1 className="text-3xl font-bold">Asian Orthopedics</h1>
            <p className="text-xl opacity-75">Spine and Joints Center</p>
            <p className="text-sm">
              {
                new Date().toLocaleString("en-US", { 
                  month: "long", 
                  day: "numeric", 
                  year: "numeric", 
                  hour: "2-digit", 
                  minute: "2-digit", 
                  second: "2-digit", 
                  hour12: true 
                })
              }
            </p>
          </div>
        </div>
      </div>

      <div className="w-full mx-auto gap-6 grid grid-cols-2">
        <div className="w-full grid grid-cols-2 gap-5">
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
        <div className="w-full max-h-[380px]">
          <ReactPlayer
            playing
            width="100%"
            height={"100%"}
            loop={true}
            controls={false}
            style={{ aspectRatio: "16/9" }}
            url={"https://www.youtube.com/watch?v=fqMEkSE9CRQ"}
          />
        </div>
        
        <div className="col-span-2">
          <div className="w-full grid grid-cols-4 gap-5">
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