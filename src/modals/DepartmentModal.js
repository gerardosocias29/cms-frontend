import { Dialog } from "primereact/dialog";
import { useAxios } from "../contexts/AxiosContext";
import { useToast } from "../contexts/ToastContext";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { InputNumber } from "primereact/inputnumber";
import { useEffect, useState } from "react";
import { Button } from "primereact/button";

export default function DepartmentModal({
  visible = false,
  onHide,
  onSuccess,
  data = null,
  header = "Add New Department"
}) {
  const showToast = useToast();
  const axiosInstance = useAxios();
  const [errors, setErrors] = useState();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [touched, setTouched] = useState({
    name: false,
    staffCount: false,
    totalBeds: false,
    status: false
  });

  const newData = {
    'name': '',
    'staffCount': 0,
    'totalBeds': 0,
    'status': 'available'
  }
  const [formData, setFormData] = useState(newData);

  const handleOnHide = () => {
    onHide();
    setIsSubmitting(false);
  }

  const handleOnChange = (e) => {
    const {name, value} = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  }

  const handleFormSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    let api = data == null ? '/departments' : '/departments/'+formData.id;
    axiosInstance.post(api, formData).then((response) => {
      showToast({
        severity: response.data.status ? "success" : "error",
        summary: response.data.status ? "Success" : "Failed",
        detail: response.data.message
      })
      onSuccess();
      handleOnHide();
    }).catch((error) => {
      setErrors(error.response.data.message)
      showToast({
        severity: "error",
        summary: "Failed",
        detail: "Failed to " + (data == null ? 'create' : 'update')+ " department."
      })
      setIsSubmitting(false);
    })
  }

  useEffect(() => {
    if(data){
      setFormData((prev) => ({
        ...prev,
        ...data
      }));
    } else {
      setFormData(newData);
    }
  }, [data])

  useEffect(() => {
    setTouched();
  }, [errors]);

  return(
    <>
      <Dialog className="lg:w-1/2 w-[95%]" header={formData.id ? 'Update Department' : header} visible={visible} draggable={false} maximizable={false} onHide={handleOnHide}>
        <form onSubmit={handleFormSubmit}>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col lg:col-span-2">
              <label className="text-xs text-gray-500 uppercase font-medium tracking-wide">Department Name</label>
              <InputText 
                type="text"
                name="name"
                required
                className={`w-full rounded-lg ring-0 px-3 py-2 border ${!touched?.name && errors?.name ? "border-red-500" : ""}`}
                placeholder="Department Name"
                value={formData.name}
                onChange={handleOnChange}
                onClick={() => {
                  setTouched((t) => ({
                    ...t,
                    name: true
                  }))
                }}
              />
              <p className="text-xs w-full text-red-500">{!touched?.name && errors?.name ? "This field is required." : ""}</p>
            </div>
            
            <div className="flex flex-col">
              <label className="text-xs text-gray-500 uppercase font-medium tracking-wide">Staff Count</label>
              <InputNumber 
                name="staffCount"
                required
                inputClassName={`w-full rounded-lg ring-0 px-3 py-2 border ${!touched?.staffCount && errors?.staffCount ? "border-red-500" : ""}`}
                placeholder="Staff Count"
                value={formData.staffCount}
                onValueChange={(e) => {
                  setFormData((prev) => ({
                    ...prev,
                    staffCount: e.value
                  }));
                }}
                onClick={() => {
                  setTouched((t) => ({
                    ...t,
                    staffCount: true
                  }))
                }}
                min={0}
              />
              <p className="text-xs w-full text-red-500">{!touched?.staffCount && errors?.staffCount ? "This field is required." : ""}</p>
            </div>
            
            <div className="flex flex-col">
              <label className="text-xs text-gray-500 uppercase font-medium tracking-wide">Total Beds</label>
              <InputNumber 
                name="totalBeds"
                required
                inputClassName={`w-full rounded-lg ring-0 px-3 py-2 border ${!touched?.totalBeds && errors?.totalBeds ? "border-red-500" : ""}`}
                placeholder="Total Beds"
                value={formData.totalBeds}
                onValueChange={(e) => {
                  setFormData((prev) => ({
                    ...prev,
                    totalBeds: e.value
                  }));
                }}
                onClick={() => {
                  setTouched((t) => ({
                    ...t,
                    totalBeds: true
                  }))
                }}
                min={0}
              />
              <p className="text-xs w-full text-red-500">{!touched?.totalBeds && errors?.totalBeds ? "This field is required." : ""}</p>
            </div>
            
            <div className="flex flex-col">
              <label className="text-xs text-gray-500 uppercase font-medium tracking-wide">Status</label>
              <Dropdown 
                className={`w-full rounded-lg ring-0 border ${!touched?.status && errors?.status ? "border-red-500" : ""}`}
                placeholder="Status"
                name="status"
                options={[
                  {name: 'Available', value: 'available'},
                  {name: 'Busy', value: 'busy'},
                  {name: 'Full', value: 'full'},
                ]}
                optionLabel="name"
                value={formData.status}
                onChange={handleOnChange}
                onClick={() => {
                  setTouched((t) => ({
                    ...t,
                    status: true
                  }))
                }}
                required
              />
              <p className="text-xs w-full text-red-500">{!touched?.status && errors?.status ? "This field is required." : ""}</p>
            </div>

            <div className="lg:col-span-2 flex flex-col justify-end">
              <Button 
                type="submit"
                label={`${data != null ? 'Update Department' : 'Create Department'}`}
                className="px-3 py-2 w-full rounded-lg font-bold bg-[#030DD8] text-white"
                loading={isSubmitting}
              />
            </div>
          </div>
        </form>
      </Dialog>
    </>
  )
}