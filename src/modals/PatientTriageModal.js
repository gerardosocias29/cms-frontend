import { Button } from "primereact/button";
import { Calendar } from "primereact/calendar";
import { Dialog } from "primereact/dialog";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { useEffect, useState } from "react";
import { useAxios } from "../contexts/AxiosContext";
import { useToast } from "../contexts/ToastContext";

export default function PatientTriageModal({
  visible = false,
  onHide,
  onSuccess = () => {},
  data = null,
  header = "Add New Patient",
  staffs
}) {
  const axiosInstance = useAxios();
  const showToast = useToast();

  const fields = [
    'id',
    'name',
    'birthday',
    'priority',
    'address',
    'symptoms',
    'bloodpressure',
    'heartrate',
    'temperature',
    'assigned_user_id',
  ];

  const [touched, setTouched] = useState();
  const [errors, setErrors] = useState();

  const [formData, setFormData] = useState();

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOnHide = () => {
    setFormData();
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
    console.log(formData);
    let api = data == null ? '/patients' : '/patients/'+formData.id;
    axiosInstance.post(api, formData).then((response) => {
      showToast({
        severity: response.data.status ? "success" : "error",
        summary: response.data.status ? "Success" : "Failed",
        detail: response.data.message
      })
      onSuccess(response.data);
      handleOnHide();
    }).catch((error) => {
      console.log(errors)
      setErrors(error?.response?.data?.message)
      showToast({
        severity: "error",
        summary: "Failed",
        detail: "Failed to " + (data == null ? 'create' : 'update')+ " patient."
      })
      setIsSubmitting(false);
    })
  }

  
  useEffect( () => {
    if(visible){
      const initialTouchedState = Object.fromEntries(fields.map(field => [field, false]));
      setTouched(initialTouchedState);

      const initialFormData = Object.fromEntries(fields.map(field => [field, data?.[field] || '']));

      if (data) {
        Object.keys(initialFormData).forEach((key) => {
          initialFormData[key] = key === 'birthday' && data[key] ? new Date(data[key]) : data[key] ?? '';
        });
      }

      setFormData(initialFormData);
    }
  }, [visible])

  useEffect(() => {
    setTouched();
  }, [errors]);

  return (
    <>
      <Dialog className="lg:w-1/2 w-[95%]" header={formData?.id ? 'Update Patient' : header} visible={visible} draggable={false} maximizable={false} onHide={handleOnHide}>
        {
          formData &&
          <form onSubmit={handleFormSubmit}>
            <div className="grid grid-cols-8 gap-4">

              <div className="flex flex-col lg:col-span-4">
                <label className="text-xs text-gray-500 uppercase font-medium tracking-wide">Full Name</label>
                <InputText 
                  type="text"
                  name="name"
                  autoComplete=""
                  required
                  className={`w-full rounded-lg ring-0 px-3 py-2 border ${!touched?.name && errors?.name ? "border-red-500" : ""}`}
                  placeholder="Full Name"
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

              <div className="flex flex-col lg:col-span-2">
                <label htmlFor="buttondisplay" className="text-xs text-gray-500 uppercase font-medium tracking-wide">Birthday</label>
                <Calendar 
                  placeholder="MM/DD/YYYY"
                  maxDate={new Date}
                  name="birthday"
                  inputClassName="ring-0"
                  className={`w-full rounded-lg ring-0 px-3 py-2 border ${!touched?.birthday && errors?.birthday ? "border-red-500" : ""}`}
                  id="buttondisplay" 
                  value={formData.birthday} onChange={handleOnChange} showIcon 
                  onClick={() => {
                    setTouched((t) => ({
                      ...t,
                      birthday: true
                    }))
                  }}
                  required
                />
                <p className="text-xs w-full text-red-500">{!touched?.birthday && errors?.birthday ? "This field is required." : ""}</p>
              </div>

              <div className="flex flex-col lg:col-span-2">
                <label className="text-xs text-gray-500 uppercase font-medium tracking-wide">Priority</label>
                <Dropdown 
                  className={`w-full rounded-lg ring-0 border ${!touched?.priority && errors?.priority ? "border-red-500" : ""}`}
                  placeholder="Priority"
                  name="priority"
                  options={[
                    {name: 'Urgent', value: 'P'},
                    {name: 'Senior/Pwd', value: 'SC'},
                    {name: 'Regular', value: 'R'},
                  ]}
                  optionLabel="name"
                  value={formData.priority}
                  onChange={handleOnChange}
                  onClick={() => {
                    setTouched((t) => ({
                      ...t,
                      priority: true
                    }))
                  }}
                  required
                />
                <p className="text-xs w-full text-red-500">{!touched?.priority && errors?.priority ? "This field is required." : ""}</p>
              </div>

              <div className="flex flex-col lg:col-span-4">
                <label className="text-xs text-gray-500 uppercase font-medium tracking-wide">Address</label>
                <InputText
                  name="address"
                  autoComplete="new-address"
                  placeholder="Address"
                  required  
                  className={`w-full rounded-lg ring-0 px-3 py-2 border ${!touched?.address && errors?.address ? "border-red-500" : ""}`}
                  value={formData.address}
                  onChange={handleOnChange}
                  onClick={() => {
                    setTouched((t) => ({
                      ...t,
                      address: true
                    }))
                  }}
                />
                <p className="text-xs w-full text-red-500">{!touched?.address && errors?.address ? "This field is required." : ""}</p>
              </div>

              <div className="flex flex-col lg:col-span-4">
                <label className="text-xs text-gray-500 uppercase font-medium tracking-wide">Assign Doctor</label>
                <Dropdown 
                  className={`w-full rounded-lg ring-0 border ${!touched?.assigned_user_id && errors?.assigned_user_id ? "border-red-500" : ""}`}
                  placeholder={`Assign a doctor`}
                  name="assigned_user_id"
                  options={staffs || []}
                  optionLabel="name"
                  optionValue="id"
                  value={formData?.assigned_user_id}
                  onChange={handleOnChange}
                  onClick={() => {
                    setTouched((t) => ({
                      ...t,
                      assigned_user_id: true
                    }))
                  }}
                  required
                />
                <p className="text-xs w-full text-red-500">{!touched?.assigned_user_id && errors?.assigned_user_id ? "This field is required." : ""}</p>
              </div>

              <div className="flex flex-col lg:col-span-8">
                <label className="text-xs text-gray-500 uppercase font-medium tracking-wide">Symptoms</label>
                <InputTextarea
                  name="symptoms"
                  placeholder="Symptoms"
                  required  
                  className={`w-full rounded-lg ring-0 px-3 py-2 border ${!touched?.symptoms && errors?.symptoms ? "border-red-500" : ""}`}
                  value={formData.symptoms}
                  onChange={handleOnChange}
                  onClick={() => {
                    setTouched((t) => ({
                      ...t,
                      symptoms: true
                    }))
                  }}
                />
                <p className="text-xs w-full text-red-500">{!touched?.symptoms && errors?.symptoms ? "This field is required." : ""}</p>
              </div>

              <div className="flex flex-col lg:col-span-2">
                <label className="text-xs text-gray-500 uppercase font-medium tracking-wide">Blood Pressure</label>
                <InputText 
                  type="text"
                  name="bloodpressure"
                  autoComplete=""
                  required
                  className={`w-full rounded-lg ring-0 px-3 py-2 border ${!touched?.bloodpressure && errors?.bloodpressure ? "border-red-500" : ""}`}
                  placeholder="120/80" 
                  value={formData.bloodpressure}
                  onChange={handleOnChange}
                  onClick={() => {
                    setTouched((t) => ({
                      ...t,
                      bloodpressure: true
                    }))
                  }}
                />
                <p className="text-xs w-full text-red-500">{!touched?.bloodpressure && errors?.bloodpressure ? "This field is required." : ""}</p>
              </div>

              <div className="flex flex-col lg:col-span-2">
                <label className="text-xs text-gray-500 uppercase font-medium tracking-wide">Heart Rate</label>
                <InputText 
                  type="text"
                  keyfilter={'num'}
                  name="heartrate"
                  autoComplete=""
                  required
                  className={`w-full rounded-lg ring-0 px-3 py-2 border ${!touched?.heartrate && errors?.heartrate ? "border-red-500" : ""}`}
                  placeholder="BPM" 
                  value={formData.heartrate}
                  onChange={handleOnChange}
                  onClick={() => {
                    setTouched((t) => ({
                      ...t,
                      heartrate: true
                    }))
                  }}
                />
                <p className="text-xs w-full text-red-500">{!touched?.heartrate && errors?.heartrate ? "This field is required." : ""}</p>
              </div>

              <div className="flex flex-col lg:col-span-2">
                <label className="text-xs text-gray-500 uppercase font-medium tracking-wide">Temperature</label>
                <InputText 
                  type="text"
                  keyfilter={'num'}
                  name="temperature"
                  autoComplete=""
                  required
                  className={`w-full rounded-lg ring-0 px-3 py-2 border ${!touched?.temperature && errors?.temperature ? "border-red-500" : ""}`}
                  placeholder="°C" 
                  value={formData.temperature}
                  onChange={handleOnChange}
                  onClick={() => {
                    setTouched((t) => ({
                      ...t,
                      temperature: true
                    }))
                  }}
                />
                <p className="text-xs w-full text-red-500">{!touched?.temperature && errors?.temperature ? "This field is required." : ""}</p>
              </div>
              
              <div className="lg:col-span-8 flex flex-col justify-end">
                <Button 
                  type="submit"
                  label={`${data != null ? 'Update User' : 'Create Patient'}`}
                  className="px-3 py-2 w-full rounded-lg font-bold bg-[#030DD8] text-white"
                  loading={isSubmitting}
                />
              </div>
            </div>
          </form>
        }
      </Dialog>
    </>
  );
}