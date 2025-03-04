import React, { useState } from 'react';
import { FaUserInjured, FaClock, FaExclamationTriangle, FaTimes } from 'react-icons/fa';
import PatientTriageModal from '../../modals/PatientTriageModal';
import LazyTable from '../../components/LazyTable';
import convertUTCToTimeZone from '../../utils/convertUTCToTimeZone';
import { LiaUserEditSolid } from 'react-icons/lia';
import { GoTrash } from 'react-icons/go';
import { Button } from 'primereact/button';

export default function Triage() {
  const [showNewPatientForm, setShowNewPatientForm] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);

  const [refreshTable, setRefreshTable] = useState(false);

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

  const [filters, setFilters] = useState({
    priority: 'all',
    status: 'all'
  });

  const getPriorityColor = (priority) => {
    const colors = {
      P: 'bg-red-100 text-red-800',
      SC: 'bg-orange-100 text-orange-800',
      R: 'bg-blue-100 text-blue-800'
    };
    return colors[priority] || colors['R'];
  };

  const getStatusColor = (status) => {
    const colors = {
      'waiting': 'bg-yellow-100 text-yellow-800',
      'in-progress': 'bg-blue-100 text-blue-800',
      'completed': 'bg-green-100 text-green-800'
    };
    return colors[status] || colors['waiting'];
  };

  const handleEditPatient = (data) => {
    setSelectedPatient(data);
    setShowNewPatientForm(true);
  }
  
  const customActions = (data) => {
    return <div className='flex gap-4 justify-end'>
      <Button
        rounded
        icon={<LiaUserEditSolid />}
        className='text-blue-500 border border-blue-500 bg-blue-100'
        tooltip='Edit Patient'
        data-pr-position='top'
        onClick={() => handleEditPatient(data)}
      />
      <Button
        rounded
        icon={<GoTrash />}
        className='text-red-500 border border-red-500 bg-red-100'
        tooltip='Delete User'
        data-pr-position='top'
      />
    </div>
  }

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
              <p className="text-2xl font-bold">{0}</p>
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
              <p className="text-2xl font-bold">{0}</p>
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
              <p className="text-2xl font-bold">{0}</p>
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
              <p className="text-2xl font-bold">{0}</p>
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
      <LazyTable 
        refreshTable={refreshTable}
        setRefreshTable={setRefreshTable}
        checkbox={false}
        selectionMode=""
        api={'/patients'}
        columns={[
          {field: 'priority_number', header: 'Patient ID', hasTemplate: true, template: (data, rowData) => {
            return <div className="flex flex-col items-start">
              <div className="text-sm">{rowData.priority}{rowData.priority_number.toString().padStart(2, '0')}</div>
            </div>
          }},
          {field: 'name', header: 'Name', headerClassname: "text-xs"},
          {field: 'priority', header: 'Priority', hasTemplate: true, template: (data) => {
            const priority = data == "P" ? "Urgent" : (data == "in-progress" ? "Senior/Pwd" : "Regular")
            return <span className={`${getPriorityColor(data)} px-3 py-1 rounded-full uppercase font-medium text-xs`}>
              {priority}
            </span>
          }},
          {field: 'status', header: 'Status', hasTemplate: true, template: (data) => {
            const status = data == "completed" ? "Completed" : (data == "SC" ? "In Progress" : "Waiting")
            return <span className={`${getStatusColor(data)} px-3 py-1 rounded-full uppercase font-medium text-xs`}>
              {status}
            </span>
          }},
          {field: 'assigned_to.name', header: 'Assigned To'},
        ]}
        actions={true}
        customActions={customActions}
      />

      <PatientTriageModal visible={showNewPatientForm} data={selectedPatient} onSuccess={() => {setRefreshTable(true)}} onHide={() => {setShowNewPatientForm(false); setSelectedPatient(null)}}/>
    </div>
  )
}
