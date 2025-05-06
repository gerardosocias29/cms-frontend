import { Dialog } from "primereact/dialog";
import { useAxios } from "../contexts/AxiosContext";
import { useToast } from "../contexts/ToastContext";
import { InputText } from "primereact/inputtext";
import { useEffect, useState } from "react";
import { Button } from "primereact/button";
import { Trash2, PlusCircle } from "lucide-react";

export default function SpecializationModal({
  visible = false,
  onHide,
  onSuccess,
  departmentId,
  specializations = []
}) {
  const showToast = useToast();
  const axiosInstance = useAxios();
  const [errors, setErrors] = useState();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentSpecializations, setCurrentSpecializations] = useState([]);
  const [newSpecialization, setNewSpecialization] = useState('');

  useEffect(() => {
    if (visible && specializations) {
      setCurrentSpecializations([...specializations]);
    }
  }, [visible, specializations]);

  const handleOnHide = () => {
    setNewSpecialization('');
    onHide();
  };

  const addSpecialization = () => {
    if (!newSpecialization.trim()) {
      showToast({
        severity: "error",
        summary: "Error",
        detail: "Specialization name cannot be empty"
      });
      return;
    }

    // Check for duplicates
    if (currentSpecializations.some(spec => spec.name.toLowerCase() === newSpecialization.toLowerCase())) {
      showToast({
        severity: "error",
        summary: "Error",
        detail: "This specialization already exists"
      });
      return;
    }

    // Add to current list with a temporary ID
    setCurrentSpecializations([
      ...currentSpecializations,
      {
        id: `temp-${Date.now()}`, // Temporary ID until saved
        name: newSpecialization,
        isNew: true
      }
    ]);
    setNewSpecialization('');
  };

  const removeSpecialization = (specialization) => {
    setCurrentSpecializations(currentSpecializations.filter(s => s.id !== specialization.id));
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    try {
      // Send the updated specializations to the backend
      const response = await axiosInstance.post(`/departments/${departmentId}/specializations`, {
        specializations: currentSpecializations.map(spec => ({
          id: spec.isNew ? null : spec.id,
          name: spec.name
        }))
      });

      showToast({
        severity: "success",
        summary: "Success",
        detail: "Specializations updated successfully"
      });

      onSuccess(response.data);
      handleOnHide();
    } catch (error) {
      console.error('Error updating specializations:', error);
      setErrors(error.response?.data?.message || 'Failed to update specializations');
      showToast({
        severity: "error",
        summary: "Failed",
        detail: "Failed to update specializations"
      });
    } finally {
      setIsSubmitting(false);
    }
  };



  return (
    <Dialog
      className="lg:w-1/2 w-[95%]"
      header="Manage Department Specializations"
      visible={visible}
      draggable={false}
      maximizable={false}
      onHide={handleOnHide}
    >
      <div className="grid grid-cols-1 gap-4">
        <div className="flex flex-col">
          <label className="text-xs text-gray-500 uppercase font-medium tracking-wide mb-2">Current Specializations</label>
          <div className="border border-gray-200 rounded-lg p-3 bg-gray-50">
            {currentSpecializations.length > 0 ? (
              <ul className="space-y-2">
                {currentSpecializations.map((spec) => (
                  <li key={spec.id} className="flex justify-between items-center bg-white p-2 rounded border border-gray-100">
                    <span className="text-sm text-gray-700">{spec.name}</span>
                    <button
                      onClick={() => removeSpecialization(spec)}
                      className="p-1 text-rose-600 hover:text-rose-800 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500 italic py-2">No specializations added yet</p>
            )}
          </div>
        </div>

        <div className="flex flex-col">
          <label className="text-xs text-gray-500 uppercase font-medium tracking-wide mb-2">Add New Specialization</label>
          <div className="flex gap-2">
            <InputText
              className="flex-1 rounded-lg"
              value={newSpecialization}
              onChange={(e) => setNewSpecialization(e.target.value)}
              placeholder="Enter specialization name"
            />
            <Button
              icon={<PlusCircle size={16} className="mr-1" />}
              label="Add"
              onClick={addSpecialization}
              className="bg-[#030DD8] text-white rounded-lg p-2"
            />
          </div>
        </div>

        <div className="flex justify-end mt-4 pt-4 border-t border-gray-200">
          <Button
            label="Cancel"
            className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 mr-2 hover:bg-gray-50"
            onClick={handleOnHide}
          />
          <Button
            label="Save Changes"
            onClick={handleSave}
            loading={isSubmitting}
            className="px-4 py-2 rounded-lg bg-[#030DD8] text-white hover:bg-blue-700"
          />
        </div>
      </div>
    </Dialog>
  );
}
