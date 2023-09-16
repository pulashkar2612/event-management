import { useState } from "react";
import { loginAPI } from "../utils/apis";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [loginData, setLoginData] = useState({});
  const [displayOtp, setDisplayOtp] = useState(false);
  const [otp, setOtp] = useState("");
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState("");
  const navigate = useNavigate();

  function checkAllFields() {
    let flag = true;
    if (loginData && loginData.email && loginData.password) {
      flag = false;
    } else {
      flag = true;
    }
    return flag;
  }

  function login() {
    loginAPI({
      email: loginData.email,
      password: btoa(loginData.password),
    })
      .then((res) => {
        if (res.data.success) {
          sessionStorage.setItem("token", res.data.token);
          sessionStorage.setItem("refreshToken", res.data.refreshToken);
          if (res.data.role === "ADMIN") {
            navigate("/admin");
          } else {
            navigate("/home");
          }
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }

  return (
    <div>
      <div className="text-center mt-5">
        <div className="row justify-content-center flex-column align-items-center">
          <div className="col-md-4">
            <label for="email">Email - </label>
            <input
              type="email"
              id="email"
              value={loginData.email}
              onChange={(e) =>
                setLoginData({
                  ...loginData,
                  email: e.target.value,
                })
              }
            />
          </div>

          <div className="col-md-4">
            <label for="password">Password - </label>
            <input
              type="password"
              id="password"
              value={loginData.password}
              onChange={(e) =>
                setLoginData({
                  ...loginData,
                  password: e.target.value,
                })
              }
            />
          </div>

          {displayOtp && (
            <div className="my-3">
              <label>{displayOtp}</label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
              />
            </div>
          )}

          <div className="mt-3">
            <button onClick={login} disabled={checkAllFields()}>
              Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
