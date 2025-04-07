import { useEffect } from "react";

const TvDisplay = ({setLoadingState}) => {

  useEffect(() => {
    setLoadingState(false);
  }, [])

  // Modified renderCard to accept Tailwind text color class
  const renderCard = (title, sequence, textColorClass) => {
    return (
      // Use theme colors, standard border, padding, rounding, shadow
      <div className="flex flex-col justify-between p-4 rounded-lg h-full bg-white border border-gray-200 shadow-md text-center">
        {/* Adjusted font sizes */}
        <p className='text-xl font-semibold text-gray-700'>{title}</p>
        <p className={`m-0 text-8xl ${textColorClass} font-bold leading-none my-2`}>{sequence}</p>
        <p className='text-lg font-medium text-gray-600'>Now Serving</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {/* Define a 4-column, 3-row grid with gaps */}
      <div className="grid grid-cols-4 grid-rows-3 gap-6 h-[calc(100vh-3rem)]">

        {/* Card 1: Radiology */}
        <div className="col-span-1 row-span-1">
          {renderCard("Radiology / X-Ray", "SP01", "text-orange-600")}
        </div>

        {/* Image: Spanning multiple cells */}
        <div className="col-span-3 row-span-2">
          <img className="rounded-lg object-cover w-full h-full shadow-md" src="/asianorthopedics.jpg" alt="Clinic Advertisement"/>
        </div>

        {/* Card 2: Clinic RM1 */}
        <div className="col-span-1 row-span-1">
          {renderCard("Clinic RM1", "R05", "text-primary")}
        </div>

        {/* Card 3: Clinic RM2 */}
        <div className="col-span-1 row-span-1">
          {renderCard("Clinic RM2", "R06", "text-primary")}
        </div>

        {/* Card 4: Clinic RM3 */}
        <div className="col-span-1 row-span-1">
          {renderCard("Clinic RM3", "SP01", "text-orange-600")}
        </div>

        {/* Card 5: Cashier 01 */}
        <div className="col-span-1 row-span-1">
          {renderCard("Cashier 01", "R01", "text-primary")}
        </div>

        {/* Card 6: Cashier 02 */}
        <div className="col-span-1 row-span-1">
          {renderCard("Cashier 02", "P01", "text-red-600")}
        </div>

      </div>


    </div>
  );
}

export default TvDisplay;