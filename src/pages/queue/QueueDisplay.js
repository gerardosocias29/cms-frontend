import React from 'react';

const QueueDisplay = () => {

  return (
    <div className="flex flex-col bg-[#9ADAF1] min-h-screen">
      <div className='p-4 flex items-center justify-center border-b border-black'>
        <p className='text-3xl font-bold'>Radiology / X-Ray</p>
      </div>
      <div className='flex flex-1'>
        <div className='w-1/2 flex flex-col border-r border-black'>
          <div className='border-b border-black flex justify-center items-center p-5'>
            <div className='min-w-[400px] rounded-lg bg-[#2FB107] text-white p-3 flex justify-center flex-col items-center'>
              <p className='text-xl font-bold'>Now Serving</p>
              <p className='text-[100px] font-bold'>S01</p>
            </div>
          </div>
          <div className='flex flex-col'>
            <div className='text-center p-3'>
              <p className='font-bold text-3xl'>In Queue</p>
            </div>
            <table className='bordered-table'>
              <tbody>
                <tr>
                  <td className='p-4'>
                    <span className='relative text-center'>
                      <p className='text-[#D80303] font-bold text-5xl'>P05</p>
                      <span className='absolute bottom-0 right-0 font-bold'>1</span>
                    </span>
                  </td>
                  <td className='p-4'>
                    <span className='relative text-center'>
                      <p className='text-[#030DD8] font-bold text-5xl'>R03</p>
                      <span className='absolute bottom-0 right-0 font-bold'>2</span>
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className='p-4'>
                    <span className='relative text-center'>
                      <p className='text-[#D87403] font-bold text-5xl'>SP05</p>
                    </span>
                  </td>
                  <td className='p-4'>
                    <span className='relative text-center'>
                      <p className='text-[#D87403] font-bold text-5xl'>SP03</p>
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className='p-4'>
                    <span className='relative text-center'>
                      <p className='text-[#030DD8] font-bold text-5xl'>R05</p>
                    </span>
                  </td>
                  <td className='p-4'>
                    <span className='relative text-center'>
                      <p className='text-[#030DD8] font-bold text-5xl'>R08</p>
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className='p-4'>
                    <span className='relative text-center'>
                      <p className='text-[#030DD8] font-bold text-5xl'>R10</p>
                    </span>
                  </td>
                  <td className='p-4'>
                    <span className='relative text-center'>
                      <p className='text-[#030DD8] font-bold text-5xl'>R12</p>
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div className='w-1/2 flex flex-col p-5 gap-5'>
          <div className='text-center p-5'>
            <p className='font-bold text-3xl'>Next Step</p>
          </div>
          <div className='grid grid-cols-2 gap-5'>
            <div className='hover:bg-[#030DD8] hover:text-white cursor-pointer select-none rounded-xl min-h-[100px] border-[5px] border-[#030DD8] bg-white flex items-center justify-center'>
              <span className='font-bold text-3xl'>Billing</span>
            </div>
            <div className='hover:bg-[#030DD8] hover:text-white cursor-pointer select-none rounded-xl min-h-[100px] border-[5px] border-[#030DD8] bg-white flex items-center justify-center'>
              <span className='font-bold text-3xl'>Previous Step</span>
            </div>
            <div className='hover:bg-[#030DD8] hover:text-white cursor-pointer select-none rounded-xl min-h-[100px] border-[5px] border-[#030DD8] bg-white flex items-center justify-center'>
              <span className='font-bold text-3xl'>Therapy Center</span>
            </div>
            <div className='hover:bg-[#030DD8] hover:text-white cursor-pointer select-none rounded-xl min-h-[100px] border-[5px] border-[#030DD8] bg-white flex items-center justify-center'>
              <span className='font-bold text-3xl'>Clinic RM 1</span>
            </div>
            <div className='hover:bg-[#030DD8] hover:text-white cursor-pointer select-none rounded-xl min-h-[100px] border-[5px] border-[#030DD8] bg-white flex items-center justify-center'>
              <span className='font-bold text-3xl'>Clinic RM 2</span>
            </div>
            <div className='hover:bg-[#030DD8] hover:text-white cursor-pointer select-none rounded-xl min-h-[100px] border-[5px] border-[#030DD8] bg-white flex items-center justify-center'>
              <span className='font-bold text-3xl'>Clinic RM 3</span>
            </div>
          </div>
          <div className='flex justify-center p-5'>
            <span className='bg-[#D80303] text-white cursor-pointer select-none text-center font-bold text-3xl p-4 rounded-xl min-w-[200px]'>
              End
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QueueDisplay;