import React, { useState, useEffect } from 'react';
import { PlusCircle } from 'lucide-react';
import { useAxios } from '../../contexts/AxiosContext';
import { useToast } from '../../contexts/ToastContext';
import DepartmentModal from '../../modals/DepartmentModal';
import SpecializationModal from '../../modals/SpecializationModal';
import Department from '../../components/Department';

export default function Departments() {
  const axiosInstance = useAxios();
  const showToast = useToast();
  const [departments, setDepartments] = useState([]);
  const [showDepartmentModal, setShowDepartmentModal] = useState(false);
  const [showSpecializationModal, setShowSpecializationModal] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [refreshData, setRefreshData] = useState(false);

  useEffect(() => {
    fetchDepartments();
  }, [refreshData]);

  const fetchDepartments = async () => {
    try {
      const response = await axiosInstance.get('/departments');
      setDepartments(response.data);
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  const addDepartment = async () => {
    setSelectedDepartment(null);
    setShowDepartmentModal(true);
  };

  const editDepartment = (dept) => {
    setSelectedDepartment(dept);
    setShowDepartmentModal(true);
  };

  const deleteDepartment = async (id) => {
    if (!window.confirm('Are you sure you want to delete this department?')) {
      return;
    }

    try {
      await axiosInstance.delete(`/departments/${id}`);
      showToast({
        severity: "success",
        summary: "Success",
        detail: "Department deleted successfully"
      });
      setDepartments(departments.filter(dept => dept.id !== id));
    } catch (error) {
      console.error('Error deleting department:', error);
      showToast({
        severity: "error",
        summary: "Failed",
        detail: "Failed to delete department."
      });
    }
  };

  const handleModalSuccess = () => {
    setRefreshData(!refreshData);
  };

  const manageSpecializations = (department) => {
    setSelectedDepartment(department);
    setShowSpecializationModal(true);
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
            <Department
              key={dept.id}
              department={dept}
              onEdit={editDepartment}
              onDelete={deleteDepartment}
              onManageSpecializations={manageSpecializations}
            />
          ))}
        </div>
      </div>

      <DepartmentModal
        visible={showDepartmentModal}
        onHide={() => {
          setShowDepartmentModal(false);
          setSelectedDepartment(null);
        }}
        onSuccess={handleModalSuccess}
        data={selectedDepartment}
        header="Add New Department"
      />

      <SpecializationModal
        visible={showSpecializationModal}
        onHide={() => {
          setShowSpecializationModal(false);
          setSelectedDepartment(null);
        }}
        onSuccess={handleModalSuccess}
        departmentId={selectedDepartment?.id}
        specializations={selectedDepartment?.specializations || []}
      />
    </div>
  );
}
