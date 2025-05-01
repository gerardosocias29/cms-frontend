import React, { useEffect, useState } from 'react';
import { FaUserPlus, FaUserMd, FaUserCog, FaTimes, FaKey, FaHistory } from 'react-icons/fa';
import LazyTable from '../../components/LazyTable';
import convertUTCToTimeZone from '../../utils/convertUTCToTimeZone';
import UserModal from '../../modals/UserModal';
import { Button } from 'primereact/button';
import { LiaUserEditSolid } from 'react-icons/lia';
import { GoTrash } from 'react-icons/go';

export default function Users({axiosInstance}) {
  const [showNewUserForm, setShowNewUserForm] = useState(false);
  const [refreshTable, setRefreshTable] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const [filters, setFilters] = useState({
    role: 'all',
    status: 'all',
    department: 'all'
  });

  const getRoleColor = (role) => {
    return role == '2' 
      ? 'bg-purple-100 text-purple-800' 
      : 'bg-blue-100 text-blue-800';
  };

  const getStatusColor = (status) => {
    return status == null
      ? 'bg-green-100 text-green-800'
      : 'bg-red-100 text-red-800';
  };

  const handleOnSuccess = () => {
    setShowNewUserForm(false);
    setRefreshTable(true);
    setSelectedUser(null);
  }

  const [departments, setDepartments] = useState(null);
  const [cardTotals, setCardTotals] = useState({
    staff: 0,
    admin: 0,
    active: 0,
    inactive: 0
  });
  
  const getData = async () => {
    try {
      const [departmentsResponse, cardTotalsResponse] = await Promise.all([
        axiosInstance.get("/departments"),
        axiosInstance.get("/users/get/card-total")
      ]);

      setDepartments(departmentsResponse.data);
      setCardTotals(cardTotalsResponse.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }

  const handleEditUserClick = (data) => {
    setSelectedUser(data);
    setShowNewUserForm(true);
  }

  const customActions = (data) => {
    return <div className='flex justify-end'>
      <Button
        rounded
        size='small'
        icon={<LiaUserEditSolid />}
        className='text-blue-500 ring-0'
        tooltip='Edit User'
        data-pr-position='top'
        onClick={() => handleEditUserClick(data)}
      />
      <Button
        rounded
        size='small'
        icon={<GoTrash />}
        className='text-red-500 ring-0'
        tooltip='Delete User'
        data-pr-position='top'
      />
    </div>
  }

  useEffect(() => {
    getData();
  }, [])

  return (
    <div className="p-6 mx-auto bg-white">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600">Manage staff and admin accounts</p>
        </div>
        <button 
          onClick={() => setShowNewUserForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <FaUserPlus />
          Add New User
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-3 rounded-full">
              <FaUserMd className="text-blue-600 text-xl" />
            </div>
            <div>
              <p className="text-gray-600">Total Staff</p>
              <p className="text-2xl font-bold">{cardTotals.staff}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="bg-purple-100 p-3 rounded-full">
              <FaUserCog className="text-purple-600 text-xl" />
            </div>
            <div>
              <p className="text-gray-600">Admins</p>
              <p className="text-2xl font-bold">{cardTotals.admin}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="bg-green-100 p-3 rounded-full">
              <FaKey className="text-green-600 text-xl" />
            </div>
            <div>
              <p className="text-gray-600">Active Users</p>
              <p className="text-2xl font-bold">{cardTotals.active}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="bg-red-100 p-3 rounded-full">
              <FaHistory className="text-red-600 text-xl" />
            </div>
            <div>
              <p className="text-gray-600">Inactive Users</p>
              <p className="text-2xl font-bold">{cardTotals.inactive}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200 mb-6 hidden">
        <div className="flex gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Role Filter
            </label>
            <select
              value={filters.role}
              onChange={(e) => setFilters(prev => ({ ...prev, role: e.target.value }))}
              className="border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="all">All Roles</option>
              <option value="admin">Admin</option>
              <option value="staff">Staff</option>
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
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Department Filter
            </label>
            <select
              value={filters.department}
              onChange={(e) => setFilters(prev => ({ ...prev, department: e.target.value }))}
              className="border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="all">All Departments</option>
              {departments && departments.map((dept, id) => (
                <option key={id} value={dept.id}>{dept.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Users List */}
      <LazyTable 
        refreshTable={refreshTable}
        setRefreshTable={setRefreshTable}
        checkbox={false}
        selectionMode=""
        api={'/users'}
        columns={[
          {field: 'name', header: 'User', hasTemplate: true, template: (data, rowData) => {
            return <div className="flex flex-col items-start">
              <div className="text-sm font-medium">{rowData.name}</div>
              <div className="text-sm">{rowData.email}</div>
            </div>
          }},
          {field: 'role_id', header: 'Role', hasTemplate: true, template: (data, rowData) => {
            return <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getRoleColor(data)}`}>
              {data == 2 ? "ADMIN" : data == 3 ? "STAFF" : "NO ROLE"}
            </span>
          }},
          {field: 'department_specialization.department.name', header: 'Department'},
          {field: 'deleted_at', header: 'Status', hasTemplate: true, template: (data, rowData) => {
            return <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(data)}`}>
              {data == null ? "ACTIVE" : "INACTIVE"}
            </span>
          }},
          {field: 'updated_at', header: 'Last Login', hasTemplate: true, template: (data, rowData) => {
            return convertUTCToTimeZone(data, "", true);
          }},
        ]}
        actions={true}
        customActions={customActions}
      />

      <UserModal visible={showNewUserForm} 
        onSuccess={handleOnSuccess}
        data={selectedUser}
        onHide={() => {
          setShowNewUserForm(false)
          setSelectedUser(null)
        }}
        departments={departments}
      />
    </div>
  );
}