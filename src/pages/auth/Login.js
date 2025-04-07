import { Button } from "primereact/button"
import {InputText} from "primereact/inputtext"
import { Password } from "primereact/password"
import AuthContext from "../../contexts/AuthContext";
import { useContext, useEffect, useState } from "react";
import { useAxios } from "../../contexts/AxiosContext";
import { useNavigate } from "react-router-dom";

const Login = ({ setLoadingState }) => {
  const navigate = useNavigate()
  const { login, token } = useContext(AuthContext);
  const axiosInstance = useAxios();

  const [loginDetails, setLoginDetails] = useState({
    email: "",
    password: ""
  });
  
  const handleFormSubmit = (e) => {
    e.preventDefault();
    setLoadingState(true);
    axiosInstance
      .post('/login', loginDetails)
      .then((response) => {
        login(response.data.token)

        setTimeout(() => {
          setLoadingState(false)
          navigate("main?page=dashboard")
        }, 300)

      }).catch((error) => {
        console.log(error)
        setLoadingState(false)
      });
  }

  useEffect(() => {
    setTimeout(() => {
      setLoadingState(false);
    }, 500); 
  }, [])

  return (
    <div className="flex min-h-screen flex-col justify-center px-6 py-12 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <h2 className="mt-10 text-center text-2xl font-semibold leading-9 tracking-tight text-gray-800">Sign in to your account</h2>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        <form className="space-y-6" onSubmit={handleFormSubmit}>
          <div>
            <label htmlFor="email" className="block text-sm font-medium leading-6 text-gray-700">Email address</label>
            <div className="mt-1">
              <InputText 
                type="email"
                name="email"
                autoComplete=""
                required
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary sm:text-sm sm:leading-6"
                placeholder="you@example.com"
                value={loginDetails.email}
                onChange={(e) => {
                  setLoginDetails((prevState) => ({
                    ...prevState,
                    email: e.target.value
                  }))
                }}
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="block text-sm font-medium leading-6 text-gray-700">Password</label>
              <div className="text-sm">
                <a href="#" className="font-semibold text-primary hover:text-primary-dark">Forgot password?</a>
              </div>
            </div>
            <div className="mt-1">
              <Password 
                type="password"
                name="password"
                autoComplete=""
                required
                className="w-full flex flex-col"
                placeholder="Password"
                inputClassName="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary sm:text-sm sm:leading-6 pr-10"
                feedback={false} 
                toggleMask
                pt={{
                  root: {className: 'w-full'}
                }}
                value={loginDetails.password}
                onChange={(e) => {
                  setLoginDetails((prevState) => ({
                    ...prevState,
                    password: e.target.value
                  }))
                }}
              />
            </div>
          </div>

          <div>
            <Button 
              type="submit"
              label="Sign In"
              className="flex w-full justify-center rounded-md bg-primary px-3 py-2 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-primary-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            />
          </div>
        </form>
      </div>
    </div>
  )
}

export default Login