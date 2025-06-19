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
      console.log('Departments API response:', response.data);

      // Check if response.data is an array
      if (!Array.isArray(response.data)) {
        console.error('API response is not an array:', response.data);
        // Try to extract data from a nested property if it exists
        const possibleDataFields = ['data', 'departments', 'items', 'results'];
        for (const field of possibleDataFields) {
          if (response.data && Array.isArray(response.data[field])) {
            console.log(`Found array data in response.data.${field}`);
            setDepartments(response.data[field]);
            return;
          }
        }
        // If we can't find an array, set an empty array
        setDepartments([]);
        return;
      }

      // Validate each department object
      const validDepartments = response.data.filter(dept => {
        if (!dept || typeof dept !== 'object') {
          console.error('Invalid department in API response:', dept);
          return false;
        }
        return true;
      });

      console.log(`Found ${validDepartments.length} valid departments out of ${response.data.length}`);
      setDepartments(validDepartments);
    } catch (error) {
      console.error('Error fetching departments:', error);
      setDepartments([]);
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
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
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
          {Array.isArray(departments) ? (
            departments.map((dept) => {
              // Check if dept is a valid object
              if (!dept || typeof dept !== 'object') {
                console.error('Invalid department object:', dept);
                return null;
              }

              return (
                <Department
                  key={dept.id || Math.random()}
                  department={dept}
                  onEdit={editDepartment}
                  onDelete={deleteDepartment}
                  onManageSpecializations={manageSpecializations}
                />
              );
            })
          ) : (
            <div className="col-span-3 text-center py-8">
              <p className="text-gray-500">No departments found or data is loading...</p>
            </div>
          )}
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
