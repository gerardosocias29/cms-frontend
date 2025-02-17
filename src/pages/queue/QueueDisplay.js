import React from 'react';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { Panel } from 'primereact/panel';

const QueueDisplay = () => {
  // Sample queue data - in practice this would come from props or an API
  const queueData = {
    nowServing: "S01",
    queueList: [
      { id: "P05", order: 1 },
      { id: "R03", order: 2 },
      { id: "SP05", order: null },
      { id: "SP03", order: null },
      { id: "R05", order: null },
      { id: "R08", order: null },
      { id: "R10", order: null },
      { id: "R12", order: null },
    ]
  };

  const displayData = {
    locations: [
      { id: "radiology", label: "Radiology / X-Ray", number: "SP01" },
      { id: "clinic1", label: "Clinic RM1", number: "R05" },
      { id: "clinic2", label: "Clinic RM2", number: "R06" },
      { id: "clinic3", label: "Clinic RM3", number: "SP01" },
      { id: "cashier1", label: "Cashier 01", number: "R01" },
      { id: "cashier2", label: "Cashier 02", number: "P01" },
    ]
  };

  const getColorClass = (id) => {
    if (id.startsWith('P')) return 'text-red-600';
    if (id.startsWith('SP')) return 'text-[#D87403]';
    return 'text-blue-600';
  };

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