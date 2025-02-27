import { Dialog } from "primereact/dialog";
import { useAxios } from "../contexts/AxiosContext";
import { useToast } from "../contexts/ToastContext";
import { InputText } from "primereact/inputtext";
import { Password } from "primereact/password";
import { Dropdown } from "primereact/dropdown";
import { useEffect, useState } from "react";
import { Button } from "primereact/button";

export default function UserModal({
  visible = false,
  onHide,
  onSuccess,
  data = {},
  header = "Add New User"
}) {
  const showToast = useToast();
  const axiosInstance = useAxios();
  const [errors, setErrors] = useState();

  const [touched, setTouched] = useState({
    name: false,
    email: false,
    password: false,
    password_confirmation: false,
    role_id: false,
    deparment_id: false,
    specialization_id: false,
  });

  const newData = {
    'name': '',
    'email': '',
    'password': '',
    'password_confirmation': '',
    'role_id': null,
    'deparment_id': null,
    'specialization_id': null,
  }
  const [formData, setFormData] = useState(newData);

  const handleOnHide = () => {
    onHide();
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

    console.log(formData);
    axiosInstance.post('/users', formData).then((response) => {
      showToast({
        severity: response.data.status ? "success" : "error",
        summary: response.data.status ? "Success" : "Failed",
        detail: response.data.message
      })
      onSuccess();
    }).catch((error) => {
      setErrors(error.response.data.message)
      showToast({
        severity: "error",
        summary: "Failed",
        detail: "Failed to create user."
      })
    })
  }


  const [departments, setDepartments] = useState();
  useEffect(() => {
    if(visible){
      setFormData(newData);
      axiosInstance.get('/departments').then((response) => setDepartments(response.data));
    }
  }, [visible])

  useEffect(() => {
    setTouched();
  }, [errors]);

  return(
    <>
      <Dialog className="lg:w-1/2 w-[95%]" header={header} visible={visible} draggable={false} maximizable={false} onHide={handleOnHide}>
        <form onSubmit={handleFormSubmit}>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col lg:col-span-2">
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
            <div className="flex flex-col">
              <label className="text-xs text-gray-500 uppercase font-medium tracking-wide">Email</label>
              <InputText 
                type="email"
                name="email"
                autoComplete="new-email"
                required
                className={`w-full rounded-lg ring-0 px-3 py-2 border ${!touched?.email && errors?.email ? "border-red-500" : ""}`}
                placeholder="Email"
                value={formData.email}
                onChange={handleOnChange}
                onClick={() => {
                  setTouched((t) => ({
                    ...t,
                    email: true
                  }))
                }}
              />
              <p className="text-xs w-full text-red-500">{!touched?.email && errors?.email }</p>
            </div>
            <div className="flex flex-col">
              <label className="text-xs text-gray-500 uppercase font-medium tracking-wide">Role</label>
              <Dropdown 
                className={`w-full rounded-lg ring-0 border ${!touched?.role_id && errors?.role_id ? "border-red-500" : ""}`}
                placeholder="Role Name"
                name="role_id"
                options={[
                  {name: 'Staff', value: '3'},
                  {name: 'Admin', value: '2'},
                ]}
                optionLabel="name"
                optionValue="value"
                value={formData.role_id}
                onChange={handleOnChange}
                onClick={() => {
                  setTouched((t) => ({
                    ...t,
                    role_id: true
                  }))
                }}
                required
              />
              <p className="text-xs w-full text-red-500">{!touched?.role_id && errors?.role_id ? "This field is required." : ""}</p>
            </div>
            
            <div className="flex flex-col">
              <label className="text-xs text-gray-500 uppercase font-medium tracking-wide">Password</label>
              <Password 
                type="password"
                name="password"
                autoComplete="new-password"
                required
                className="w-full flex flex-col"
                placeholder="Password"
                inputClassName={`w-full rounded-lg ring-0 px-3 py-2 border pr-10  ${!touched?.password && errors?.password ? "border-red-500" : ""}`}
                feedback={false} 
                toggleMask
                pt={{
                  root: {className: 'w-full'}
                }}
                value={formData.password}
                onChange={handleOnChange}
                onClick={() => {
                  setTouched((t) => ({
                    ...t,
                    password: true
                  }))
                }}
              />
              {
                !touched?.password && errors?.password &&  errors?.password?.map((d, i) => {
                  return <p key={i} className="text-xs w-full text-red-500">{d}</p>
                })
              }
               
            </div>
            <div className="flex flex-col">
              <label className="text-xs text-gray-500 uppercase font-medium tracking-wide">Confirm Password</label>
              <Password 
                type="password"
                name="password_confirmation"
                autoComplete="new-password"
                required
                className="w-full flex flex-col"
                placeholder="Confirm Password"
                inputClassName="w-full rounded-lg ring-0 px-3 py-2 border pr-10"
                feedback={false} 
                toggleMask
                pt={{
                  root: {className: 'w-full'}
                }}
                value={formData.password_confirmation}
                onChange={handleOnChange}
              />
            </div>
            <div className="flex flex-col">
              <label className="text-xs text-gray-500 uppercase font-medium tracking-wide">Department</label>
              <Dropdown 
                className={`w-full rounded-lg ring-0 border ${!touched?.department_id && errors?.department_id ? "border-red-500" : ""}`}
                placeholder="Department"
                name="department_id"
                options={departments}
                optionLabel="name"
                optionValue="id"
                value={formData.department_id}
                onChange={handleOnChange}
                onClick={() => {
                  setTouched((t) => ({
                    ...t,
                    department_id: true
                  }))
                }}
                required
              />
              <p className="text-xs w-full text-red-500">{!touched?.department_id && errors?.department_id ? "This field is required." : ""}</p>
            </div>
            <div className="flex flex-col">
              <label className="text-xs text-gray-500 uppercase font-medium tracking-wide">Specialization</label>
              <Dropdown 
                className={`w-full rounded-lg ring-0 border ${!touched?.specialization_id && errors?.specialization_id ? "border-red-500" : ""}`}
                placeholder="Specialization"
                name="specialization_id"
                options={departments && departments.find((d) => d.id === formData.department_id)?.specializations}
                optionLabel="name"
                optionValue="id"
                value={formData.specialization_id}
                onChange={handleOnChange}
                onClick={() => {
                  setTouched((t) => ({
                    ...t,
                    specialization_id: true
                  }))
                }}
                required
              />
              <p className="text-xs w-full text-red-500">{!touched?.specialization_id && errors?.specialization_id ? "This field is required." : ""}</p>
            </div>

            <div className="lg:col-span-2 flex flex-col justify-end">
              <Button 
                type="submit"
                label="Create User"
                className="px-3 py-2 w-full rounded-lg font-bold bg-[#030DD8] text-white"
              />
            </div>
          </div>
        </form>
      </Dialog>
    </>
  )
}