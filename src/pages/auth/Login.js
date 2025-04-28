import { Button } from "primereact/button"
import {InputText} from "primereact/inputtext"
import { Password } from "primereact/password"
import AuthContext from "../../contexts/AuthContext";
import { useContext, useEffect, useState } from "react";
import { useAxios } from "../../contexts/AxiosContext";
import { useNavigate } from "react-router-dom";
import { useToast } from "../../contexts/ToastContext";

const Login = ({ setLoadingState }) => {
  const showToast = useToast();
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
        showToast({
          severity: "success", 
          summary: "Authentication Successful", 
          detail: "Welcome back! You have logged in successfully.",
        });

        login(response.data.token)

        setTimeout(() => {
          setLoadingState(false)
          navigate("main?page=dashboard")
        }, 300)

      }).catch((error) => {
        console.log(error)
        showToast({
          severity: "error", 
          summary: "Authentication Failed", 
          detail: "Invalid email or password. Please try again.",
        });
        setLoadingState(false)
      });
  }

  useEffect(() => {
    setTimeout(() => {
      setLoadingState(false);
    }, 500); 
  }, [])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 py-12 lg:px-8">
      <div className="w-[480px] py-12 font-sans bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl shadow-lg transform transition-all duration-300 hover:shadow-xl">
        <div className="sm:mx-auto sm:w-full sm:max-w-sm flex flex-col items-center gap-2 justify-center">
          <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center shadow-md">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <h2 className="text-center text-2xl font-semibold leading-9 tracking-tight text-gray-800">Sign in to your account</h2>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-sm">
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
    </div>
  )
}

export default Login