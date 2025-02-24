import React from 'react';
import { FaUserMd, FaHospital, FaBed, FaUserInjured } from 'react-icons/fa';

export default function Departments() {
  const departments = [
    {
      id: 'RAD',
      name: 'Radiology',
      staffCount: 8,
      occupancy: 65,
      totalBeds: 12,
      waitingPatients: 4,
      status: 'busy'
    },
    {
      id: 'CARD',
      name: 'Cardiology',
      staffCount: 12,
      occupancy: 80,
      totalBeds: 15,
      waitingPatients: 6,
      status: 'full'
    },
    {
      id: 'ER',
      name: 'Emergency Room',
      staffCount: 20,
      occupancy: 45,
      totalBeds: 25,
      waitingPatients: 8,
      status: 'available'
    },
    {
      id: 'PED',
      name: 'Pediatrics',
      staffCount: 10,
      occupancy: 50,
      totalBeds: 18,
      waitingPatients: 3,
      status: 'available'
    }
  ];

  const getStatusColor = (status) => {
    const colors = {
      available: 'bg-green-100 text-green-800',
      busy: 'bg-yellow-100 text-yellow-800',
      full: 'bg-red-100 text-red-800'
    };
    return colors[status] || colors.available;
  };

  return (
    <div className="p-6 max-w-7xl mx-auto bg-white">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Departments</h1>
          <p className="text-gray-600">Overview of hospital departments and their current status</p>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2">
          <FaHospital />
          Add Department
        </button>
      </div>

      {/* Department Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {departments.map((dept) => (
          <div key={dept.id} className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">{dept.name}</h3>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(dept.status)}`}>
                  {dept.status.toUpperCase()}
                </span>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 flex items-center gap-2">
                    <FaUserMd className="text-gray-400" />
                    Staff
                  </span>
                  <span className="font-medium">{dept.staffCount}</span>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 flex items-center gap-2">
                    <FaBed className="text-gray-400" />
                    Beds
                  </span>
                  <span className="font-medium">{dept.occupancy}% ({dept.totalBeds})</span>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 flex items-center gap-2">
                    <FaUserInjured className="text-gray-400" />
                    Waiting
                  </span>
                  <span className="font-medium">{dept.waitingPatients}</span>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 px-4 py-3 flex justify-end space-x-3">
              <button className="text-sm text-blue-600 hover:text-blue-800">
                View Details
              </button>
              <button className="text-sm text-blue-600 hover:text-blue-800">
                Manage
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Department Stats */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">Department Statistics</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Average Occupancy</span>
                <span className="font-medium">60%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: '60%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Staff Utilization</span>
                <span className="font-medium">75%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-600 h-2 rounded-full" style={{ width: '75%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Patient Satisfaction</span>
                <span className="font-medium">85%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-yellow-600 h-2 rounded-full" style={{ width: '85%' }}></div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">Waiting Times</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Emergency Room</span>
              <span className="text-sm font-medium">25 mins</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Radiology</span>
              <span className="text-sm font-medium">45 mins</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Cardiology</span>
              <span className="text-sm font-medium">60 mins</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Pediatrics</span>
              <span className="text-sm font-medium">30 mins</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">Staff Overview</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Doctors</span>
              <span className="text-sm font-medium">25</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Nurses</span>
              <span className="text-sm font-medium">45</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Technicians</span>
              <span className="text-sm font-medium">15</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Support Staff</span>
              <span className="text-sm font-medium">20</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}