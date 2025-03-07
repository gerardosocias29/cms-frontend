import React, { useState, useEffect } from 'react';
import { Building2, Users, BedDouble, Clock, Trash2, PlusCircle, Activity } from 'lucide-react';
import { useAxios } from '../../contexts/AxiosContext';

export default function Departments() {
  const axiosInstance = useAxios();
  const [departments, setDepartments] = useState([]);

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const response = await axiosInstance.get('/departments');
      setDepartments(response.data);
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  const addDepartment = async () => {
    try {
      const newDept = { 
        name: 'New Department', 
        staffCount: 0, 
        occupancy: 0, 
        totalBeds: 0, 
        waitingPatients: 0, 
        status: 'available' 
      };
      const response = await axiosInstance.post('/departments', newDept);
      setDepartments([...departments, response.data]);
    } catch (error) {
      console.error('Error adding department:', error);
    }
  };

  const deleteDepartment = async (id) => {
    try {
      await axiosInstance.delete(`/departments/${id}`);
      setDepartments(departments.filter(dept => dept.id !== id));
    } catch (error) {
      console.error('Error deleting department:', error);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      available: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
      busy: 'bg-amber-50 text-amber-700 ring-amber-600/20',
      full: 'bg-rose-50 text-rose-700 ring-rose-600/20'
    };
    return colors[status] || colors.available;
  };

  const getOccupancyColor = (occupancy) => {
    if (occupancy >= 90) return 'text-rose-600';
    if (occupancy >= 70) return 'text-amber-600';
    return 'text-emerald-600';
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Hospital Departments</h1>
            <p className="mt-2 text-gray-600">Manage and monitor department status and capacity</p>
          </div>
          <button 
            onClick={addDepartment}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            <PlusCircle className="w-5 h-5 mr-2" />
            Add Department
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {departments.map((dept) => (
            <div key={dept.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <Building2 className="w-6 h-6 text-gray-400" />
                    <h3 className="text-lg font-semibold text-gray-900">{dept.name}</h3>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ring-1 ring-inset ${getStatusColor(dept.status)}`}>
                    {dept.status?.toUpperCase() || 'ACTIVE'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <Users className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Staff Members</p>
                      <p className="text-sm font-medium text-gray-900">{dept.staffCount || 0}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <BedDouble className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Bed Capacity</p>
                      <p className={`text-sm font-medium ${getOccupancyColor(dept.occupancy)}`}>
                        {dept.occupancy}% of {dept.totalBeds}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <Clock className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Waiting List</p>
                      <p className="text-sm font-medium text-gray-900">{dept.waitingPatients} patients</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <Activity className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Current Load</p>
                      <p className={`text-sm font-medium ${getOccupancyColor(dept.occupancy)}`}>
                        {dept.occupancy >= 90 ? 'High' : dept.occupancy >= 70 ? 'Medium' : 'Low'}
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Available Services</h4>
                  <div className="space-y-1">
                    {dept.specializations?.map((service) => (
                      <div 
                        key={service.id}
                        className="text-sm text-gray-600 bg-gray-50 px-3 py-1.5 rounded-md"
                      >
                        {service.name}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
                <button 
                  onClick={() => deleteDepartment(dept.id)}
                  className="inline-flex items-center text-sm text-rose-600 hover:text-rose-700 transition-colors"
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Remove Department
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}