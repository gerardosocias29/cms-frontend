import React from 'react';
import { Building2, Users, BedDouble, Clock, Activity, Edit, Trash2, ListPlus } from 'lucide-react';

/**
 * Department component for displaying a single department card
 *
 * @param {Object} department - The department object with all its properties
 * @param {Function} onEdit - Function to call when edit button is clicked
 * @param {Function} onDelete - Function to call when delete button is clicked
 * @param {Function} onManageSpecializations - Function to call when manage specializations button is clicked
 * @param {boolean} showActions - Whether to show edit/delete buttons (default: true)
 * @returns {JSX.Element} - The department card component
 */
const Department = ({
  department,
  onEdit,
  onDelete,
  onManageSpecializations,
  showActions = true
}) => {
  // Debug the department object
  console.log('Department component received:', department);

  // Handle null or undefined department
  if (!department) {
    return null;
  }

  // Ensure department is an object
  if (typeof department !== 'object') {
    console.error('Department is not an object:', department);
    return null;
  }

  // Create a safe department object with defaults for all required properties
  const safeDepartment = {
    id: department.id || 0,
    name: typeof department.name === 'string' ? department.name : 'Unnamed Department',
    staffs: Number(department.staffs?.length || 0),
    totalBeds: Number(department.totalBeds || 0),
    occupancy: Number(department.occupancy || 0),
    waitingPatients: Number(department.waitingPatients || 0),
    status: typeof department.status === 'string' ? department.status : 'available',
    specializations: Array.isArray(department.specializations) ? department.specializations : []
  };

  // Debug the safe department object
  console.log('Safe department object:', safeDepartment);

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
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Building2 className="w-6 h-6 text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-900">{safeDepartment.name}</h3>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ring-1 ring-inset ${getStatusColor(safeDepartment.status)}`}>
            {safeDepartment.status?.toUpperCase() || 'ACTIVE'}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <Users className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-xs text-gray-500">Staff Members</p>
              <p className="text-sm font-medium text-gray-900">{safeDepartment.staffs || 0}</p>
            </div>
          </div>

          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <BedDouble className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-xs text-gray-500">Bed Capacity</p>
              <p className={`text-sm font-medium ${getOccupancyColor(safeDepartment.occupancy)}`}>
                {safeDepartment.occupancy}% of {safeDepartment.totalBeds}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <Clock className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-xs text-gray-500">Waiting List</p>
              <p className="text-sm font-medium text-gray-900">{safeDepartment.waitingPatients} patients</p>
            </div>
          </div>

          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <Activity className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-xs text-gray-500">Current Load</p>
              <p className={`text-sm font-medium ${getOccupancyColor(safeDepartment.occupancy)}`}>
                {safeDepartment.occupancy >= 90 ? 'High' : safeDepartment.occupancy >= 70 ? 'Medium' : 'Low'}
              </p>
            </div>
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <h4 className="text-sm font-medium text-gray-900">Available Services</h4>
            {onManageSpecializations && (
              <button
                onClick={() => onManageSpecializations(safeDepartment)}
                className="inline-flex items-center text-xs text-indigo-600 hover:text-indigo-700 transition-colors"
              >
                <ListPlus className="w-3 h-3 mr-1" />
                Manage
              </button>
            )}
          </div>
          <div className="space-y-1">
            {Array.isArray(safeDepartment.specializations) && safeDepartment.specializations.length > 0 ? (
              safeDepartment.specializations.map((service, index) => {
                // Ensure service is an object with a name property
                if (!service || typeof service !== 'object') {
                  console.error('Invalid service object:', service);
                  return null;
                }

                const serviceName = service.name ?
                  (typeof service.name === 'string' ? service.name : 'Invalid Service Name')
                  : 'Unknown Service';

                return (
                  <div
                    key={service.id || `service-${index}-${Math.random()}`}
                    className="text-sm text-gray-600 bg-gray-50 px-3 py-1.5 rounded-md"
                  >
                    {serviceName}
                  </div>
                );
              })
            ) : (
              <div className="text-sm text-gray-500 italic">No services available</div>
            )}
          </div>
        </div>
      </div>

      {showActions && (
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-between">
          <button
            onClick={() => onEdit && onEdit(safeDepartment)}
            className="inline-flex items-center text-sm text-blue-600 hover:text-blue-700 transition-colors"
          >
            <Edit className="w-4 h-4 mr-1" />
            Edit Department
          </button>
          <button
            onClick={() => onDelete && onDelete(safeDepartment.id)}
            className="inline-flex items-center text-sm text-rose-600 hover:text-rose-700 transition-colors"
          >
            <Trash2 className="w-4 h-4 mr-1" />
            Remove Department
          </button>
        </div>
      )}
    </div>
  );
};

export default Department;
