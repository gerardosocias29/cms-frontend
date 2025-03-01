import React, { useState } from 'react';
import { FaUserInjured, FaClock, FaExclamationTriangle, FaTimes } from 'react-icons/fa';
import PatientTriageModal from '../../modals/PatientTriageModal';

export default function Triage() {
  const [showNewPatientForm, setShowNewPatientForm] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    birthday: null,
    symptoms: '',
    priority: 'medium',
    bloodPressure: '',
    heartRate: '',
    temperature: ''
  });

  const [patients, setPatients] = useState([
    {
      id: 'P05',
      name: 'John Smith',
      priority: 'urgent',
      symptoms: 'Severe chest pain, shortness of breath',
      vitals: {
        bloodPressure: '140/90',
        heartRate: 95,
        temperature: 37.8
      },
      arrivalTime: '10:30 AM',
      status: 'waiting',
      estimatedWaitTime: 15
    },
    {
      id: 'R03',
      name: 'Mary Johnson',
      priority: 'medium',
      symptoms: 'Persistent headache, mild fever',
      vitals: {
        bloodPressure: '120/80',
        heartRate: 82,
        temperature: 38.2
      },
      arrivalTime: '10:45 AM',
      status: 'in-progress',
      assignedTo: 'Dr. Sarah Wilson',
      estimatedWaitTime: 30
    }
  ]);

  const [filters, setFilters] = useState({
    priority: 'all',
    status: 'all'
  });

  const getPriorityColor = (priority) => {
    const colors = {
      urgent: 'bg-red-100 text-red-800',
      high: 'bg-orange-100 text-orange-800',
      medium: 'bg-yellow-100 text-yellow-800',
      low: 'bg-green-100 text-green-800'
    };
    return colors[priority] || colors.low;
  };

  const getStatusColor = (status) => {
    const colors = {
      'waiting': 'bg-yellow-100 text-yellow-800',
      'in-progress': 'bg-blue-100 text-blue-800',
      'completed': 'bg-green-100 text-green-800'
    };
    return colors[status] || colors['waiting'];
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newPatient = {
      id: `P${Math.floor(Math.random() * 1000)}`,
      name: formData.name,
      priority: formData.priority,
      symptoms: formData.symptoms,
      vitals: {
        bloodPressure: formData.bloodPressure,
        heartRate: parseInt(formData.heartRate),
        temperature: parseFloat(formData.temperature)
      },
      arrivalTime: new Date().toLocaleTimeString(),
      status: 'waiting',
      estimatedWaitTime: calculateEstimatedWaitTime(formData.priority)
    };
    
    setPatients(prev => [...prev, newPatient]);
    setShowNewPatientForm(false);
    setFormData({
      name: '',
      symptoms: '',
      priority: 'medium',
      bloodPressure: '',
      heartRate: '',
      temperature: ''
    });
  };

  const calculateEstimatedWaitTime = (priority) => {
    const baseTime = {
      urgent: 10,
      high: 20,
      medium: 30,
      low: 45
    };
    return baseTime[priority] + patients.length * 5;
  };

  const handleStatusChange = (patientId, newStatus) => {
    setPatients(prev => prev.map(patient => 
      patient.id === patientId 
        ? { ...patient, status: newStatus }
        : patient
    ));
  };

  const handleAssignDoctor = (patientId, doctorName) => {
    setPatients(prev => prev.map(patient =>
      patient.id === patientId
        ? { ...patient, assignedTo: doctorName, status: 'in-progress' }
        : patient
    ));
  };

  const filteredPatients = patients.filter(patient => {
    if (filters.priority !== 'all' && patient.priority !== filters.priority) return false;
    if (filters.status !== 'all' && patient.status !== filters.status) return false;
    return true;
  });

  return (
    <div className="p-6 mx-auto bg-white">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Patient Triage</h1>
          <p className="text-gray-600">Manage incoming patients and assess priority</p>
        </div>
        <button 
          onClick={() => setShowNewPatientForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <FaUserInjured />
          Add New Patient
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="bg-red-100 p-3 rounded-full">
              <FaExclamationTriangle className="text-red-600 text-xl" />
            </div>
            <div>
              <p className="text-gray-600">Urgent Cases</p>
              <p className="text-2xl font-bold">{patients.filter(p => p.priority === 'urgent').length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-3 rounded-full">
              <FaUserInjured className="text-blue-600 text-xl" />
            </div>
            <div>
              <p className="text-gray-600">Waiting</p>
              <p className="text-2xl font-bold">{patients.filter(p => p.status === 'waiting').length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="bg-yellow-100 p-3 rounded-full">
              <FaUserInjured className="text-yellow-600 text-xl" />
            </div>
            <div>
              <p className="text-gray-600">In Progress</p>
              <p className="text-2xl font-bold">{patients.filter(p => p.status === 'in-progress').length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="bg-green-100 p-3 rounded-full">
              <FaClock className="text-green-600 text-xl" />
            </div>
            <div>
              <p className="text-gray-600">Completed</p>
              <p className="text-2xl font-bold">{patients.filter(p => p.status === 'completed').length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200 mb-6">
        <div className="flex gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Priority Filter
            </label>
            <select
              value={filters.priority}
              onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value }))}
              className="border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="all">All Priorities</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status Filter
            </label>
            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              className="border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="all">All Statuses</option>
              <option value="waiting">Waiting</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Patient List */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Patient ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Priority
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Assigned To
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Wait Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPatients.map((patient) => (
                <tr key={patient.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {patient.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div>{patient.name}</div>
                    <div className="text-xs text-gray-500">{patient.arrivalTime}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getPriorityColor(patient.priority)}`}>
                      {patient.priority.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(patient.status)}`}>
                      {patient.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {patient.assignedTo || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {patient.estimatedWaitTime} mins
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => setSelectedPatient(patient)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      View Details
                    </button>
                    <select
                      value={patient.status}
                      onChange={(e) => handleStatusChange(patient.id, e.target.value)}
                      className="border border-gray-300 rounded-md px-2 py-1 text-sm"
                    >
                      <option value="waiting">Waiting</option>
                      <option value="in-progress">In Progress</option>
                      <option value="completed">Completed</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <PatientTriageModal visible={showNewPatientForm} onHide={() => setShowNewPatientForm(false)}/>
    </div>
  )
}
