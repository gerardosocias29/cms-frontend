import React from 'react';

const QueueDisplay = () => {

  return (
    <div className="flex flex-col bg-gray-50 min-h-screen">
      <div className='p-4 flex items-center justify-center border-b border-gray-200 bg-white shadow-sm'>
        <p className='text-2xl font-semibold text-gray-800'>Radiology / X-Ray Queue</p>
      </div>
      <div className='flex flex-1'>
        {/* Use standard border and padding */}
        <div className='w-1/2 flex flex-col border-r border-gray-200'>
          {/* Use standard border, padding, and theme colors */}
          <div className='border-b border-gray-200 flex justify-center items-center p-6 bg-white'>
            {/* Use standard green, consistent padding/rounding */}
            <div className='min-w-[300px] rounded-lg bg-green-600 text-white p-4 flex justify-center flex-col items-center shadow'>
              <p className='text-lg font-semibold'>Now Serving</p>
              {/* Reduced font size for better balance */}
              <p className='text-7xl font-bold mt-1'>S01</p>
            </div>
          </div>
          <div className='flex flex-col'>
            {/* Standard padding and text style */}
            <div className='text-center p-4 mt-4'>
              <p className='font-semibold text-xl text-gray-700'>In Queue</p>
            </div>
            {/* Consider using a list or grid instead of table for semantics if appropriate */}
            {/* Applying basic table styling with Tailwind for now */}
            <table className='w-full text-center mt-2'>
              <tbody>
                <tr>
                  {/* Standard padding, theme colors, adjusted font size */}
                  <td className='p-3 border-b border-gray-200'>
                    <span className='relative inline-block'>
                      {/* Use standard red color */}
                      <p className='text-red-600 font-semibold text-4xl'>P05</p>
                      {/* Adjusted position/size for queue number */}
                      <span className='absolute -bottom-2 -right-2 text-xs font-bold bg-gray-200 rounded-full px-1.5 py-0.5'>1</span>
                    </span>
                  </td>
                  <td className='p-3 border-b border-gray-200'>
                    <span className='relative inline-block'>
                      {/* Use primary theme color */}
                      <p className='text-primary font-semibold text-4xl'>R03</p>
                      <span className='absolute -bottom-2 -right-2 text-xs font-bold bg-gray-200 rounded-full px-1.5 py-0.5'>2</span>
                    </span>
                  </td>
                </tr>
                <tr>
                  {/* Use standard orange color */}
                  <td className='p-3 border-b border-gray-200'>
                    <span className='relative inline-block'>
                      <p className='text-orange-600 font-semibold text-4xl'>SP05</p>
                    </span>
                  </td>
                  <td className='p-3 border-b border-gray-200'>
                    <span className='relative inline-block'>
                      <p className='text-orange-600 font-semibold text-4xl'>SP03</p>
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className='p-3 border-b border-gray-200'>
                    <span className='relative inline-block'>
                      <p className='text-primary font-semibold text-4xl'>R05</p>
                    </span>
                  </td>
                  <td className='p-3 border-b border-gray-200'>
                    <span className='relative inline-block'>
                      <p className='text-primary font-semibold text-4xl'>R08</p>
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className='p-3 border-b border-gray-200'>
                    <span className='relative inline-block'>
                      <p className='text-primary font-semibold text-4xl'>R10</p>
                    </span>
                  </td>
                  <td className='p-3 border-b border-gray-200'>
                    <span className='relative inline-block'>
                      <p className='text-primary font-semibold text-4xl'>R12</p>
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        {/* Standard padding and gap */}
        <div className='w-1/2 flex flex-col p-6 gap-4 bg-white'>
          <div className='text-center mb-4'>
            <p className='font-semibold text-xl text-gray-700'>Next Step</p>
          </div>
          <div className='grid grid-cols-2 gap-5'>
            {/* Consistent button styling using theme colors */}
            <button className='text-primary border-2 border-primary rounded-lg min-h-[80px] flex items-center justify-center text-lg font-semibold hover:bg-primary hover:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition duration-150 ease-in-out'>
              Billing
            </button>
            <button className='text-primary border-2 border-primary rounded-lg min-h-[80px] flex items-center justify-center text-lg font-semibold hover:bg-primary hover:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition duration-150 ease-in-out'>
              Previous Step
            </button>
            <button className='text-primary border-2 border-primary rounded-lg min-h-[80px] flex items-center justify-center text-lg font-semibold hover:bg-primary hover:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition duration-150 ease-in-out'>
              Therapy Center
            </button>
            <button className='text-primary border-2 border-primary rounded-lg min-h-[80px] flex items-center justify-center text-lg font-semibold hover:bg-primary hover:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition duration-150 ease-in-out'>
              Clinic RM 1
            </button>
            <button className='text-primary border-2 border-primary rounded-lg min-h-[80px] flex items-center justify-center text-lg font-semibold hover:bg-primary hover:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition duration-150 ease-in-out'>
              Clinic RM 2
            </button>
            <button className='text-primary border-2 border-primary rounded-lg min-h-[80px] flex items-center justify-center text-lg font-semibold hover:bg-primary hover:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition duration-150 ease-in-out'>
              Clinic RM 3
            </button>
          </div>
          {/* Consistent button styling for "End" action */}
          <div className='flex justify-center mt-6'>
            <button className='bg-red-600 text-white text-lg font-semibold px-8 py-3 rounded-lg min-w-[150px] hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition duration-150 ease-in-out'>
              End
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QueueDisplay;