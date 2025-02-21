import { useEffect } from "react";

const TvDisplay = ({setLoadingState}) => {

  useEffect(() => {
    setLoadingState(false);
  }, [])

  const renderCard = (title, sequence, color) => {
    return <div className="p-5 rounded-xl h-full bg-white border-[5px] border-[#0737F8] p-5 text-center">
      <p className='text-3xl font-bold'>{title}</p>
      <p className={`m-0 text-[100px] text-[${color}] font-bold leading-none mt-5`}>{sequence}</p>
      <p className='text-xl font-bold'>Now Serving</p>
    </div>
  } 

  return (
    <div className="min-h-screen bg-[#9ADAF1] p-5">
      <table className="min-h-screen w-full table-fixed">
        <tr>
          <td className="">
            {renderCard("Radiology / X-Ray", "SP01", '#D87403')}
          </td>
          <td className="w-[75%]" rowspan="2" colspan="3" >
            <img className="rounded-xl object-cover" src="/asianorthopedics.jpg"/>
          </td>
        </tr>
        <tr>
          <td className="">
            {renderCard("Clinic RM1", "R05", '#030DD8')}
          </td>
        </tr>
        <tr>
          <td className="">
            {renderCard("Clinic RM2", "R06", '#030DD8')}
          </td>
          <td className="">
            {renderCard("Clinic RM3", "SP01", '#D87403')}
          </td>
          <td className="">
            {renderCard("Cashier 01", "R01", '#030DD8')}
          </td>
          <td className="">
            {renderCard("Cashier 02", "P01", '#D80303')}
          </td>
        </tr>
      </table>


    </div>
  );
}

export default TvDisplay;