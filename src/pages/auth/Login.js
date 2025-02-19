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
        setLoadingState(false)
        login(response.data.token)
        setTimeout(() => {
          navigate("main?page=")
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
    <div class="flex min-h-screen flex-col justify-center px-6 py-12 lg:px-8">
      <div class="sm:mx-auto sm:w-full sm:max-w-sm">
        <h2 class="mt-10 text-center text-2xl/9 font-bold tracking-tight text-gray-900">Sign in to your account</h2>
      </div>

      <div class="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        <form class="space-y-6" onSubmit={handleFormSubmit}>
          <div>
            <label for="email" class="block text-sm/6 font-medium text-gray-900">Email address</label>
            <div class="mt-1">
              <InputText 
                type="email"
                name="email"
                autoComplete="new-email"
                required
                className="w-full rounded-lg ring-0 px-3 py-2 border"
                placeholder="Email address"
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
            <div class="flex items-center justify-between">
              <label for="password" class="block text-sm/6 font-medium text-gray-900">Password</label>
              <div class="text-sm">
                <a href="#" class="font-semibold text-[#030DD8]">Forgot password?</a>
              </div>
            </div>
            <div class="mt-1">
              <Password 
                type="password"
                name="password"
                autoComplete="new-password"
                required
                className="w-full flex flex-col"
                placeholder="Password"
                inputClassName="w-full rounded-lg ring-0 px-3 py-2 border pr-10"
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
              className="px-3 py-2 w-full rounded-lg font-bold bg-[#030DD8] text-white"
            />
          </div>
        </form>
      </div>
    </div>
  )
}

export default Login