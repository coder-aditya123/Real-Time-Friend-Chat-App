// client/src/pages/LoginPage.jsx
import React, { useContext, useState } from "react";
import assets from "../assets/assets";
import toast from "react-hot-toast";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

const LoginPage = () => {
  const [currState, setCurrState] = useState("Sign up");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [bio, setBio] = useState("");
  const [isDataSubmitted, setIsDataSubmitted] = useState(false);
  const [agree, setAgree] = useState(false);

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const onSubmitHandler = async (event) => {
    event.preventDefault();

    if (!agree) {
      toast.error("Please agree to the terms and conditions.");
      return;
    }

    if (currState === "Sign up") {
      if (!isDataSubmitted) {
        if (!fullName || !email || !password) {
          toast.error("Please fill in Full Name, Email, and Password.");
          return;
        }
        setIsDataSubmitted(true);
      } else {
        if (!bio) {
          toast.error("Please provide a bio.");
          return;
        }
        const success = await login("signup", { fullName, email, password, bio });
        if (success) {
          navigate("/"); // Redirect on successful signup
        }
      }
    } else {
      if (!email || !password) {
        toast.error("Please enter Email and Password.");
        return;
      }
      const success = await login("login", { email, password });
      if (success) {
        navigate("/"); // Redirect on successful login (changed from /profile to /)
      }
    }
  };

  return (
    <div className="min-h-screen bg-cover bg-center flex items-center justify-center gap-8 sm:justify-evenly max-sm:flex-col backdrop-blur-2xl px-6">
      {/* --------left-------- */}
      <img
        src={assets.logo_big}
        alt="logo"
        className="w-[min(40vw,180px)] max-w-[200px] md:max-w-[250px] lg:max-w-[300px]" // Responsive logo size
      />

      {/* --------right-------- */}
      <form
        onSubmit={onSubmitHandler}
        className="border-2 bg-white/8 text-white border-gray-500 p-6 flex flex-col gap-6 rounded-lg shadow-lg max-w-sm w-full md:p-8" // Responsive padding
      >
        <h2 className="font-medium text-2xl md:text-3xl flex justify-between items-center"> {/* Responsive text size */}
          {currState}
          {isDataSubmitted && (
            <img
              onClick={() => setIsDataSubmitted(false)}
              src={assets.arrow_icon}
              alt="icon"
              className="w-5 cursor-pointer"
            />
          )}
        </h2>

        {currState === "Sign up" && !isDataSubmitted && (
          <input
            onChange={(e) => setFullName(e.target.value)}
            value={fullName}
            type="text"
            className="p-2 border border-gray-500 rounded-md focus:outline-none bg-transparent text-white placeholder-gray-400 md:p-3" // Responsive padding, transparent bg
            placeholder="Full Name"
            required
          />
        )}

        {!isDataSubmitted && (
          <>
            <input
              onChange={(e) => setEmail(e.target.value)}
              value={email}
              type="email"
              placeholder="Email Address"
              required
              className="p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-transparent text-white placeholder-gray-400 md:p-3" // Responsive padding, transparent bg
            />
            <input
              onChange={(e) => setPassword(e.target.value)}
              value={password}
              type="password"
              placeholder="Password"
              required
              className="p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-transparent text-white placeholder-gray-400 md:p-3" // Responsive padding, transparent bg
            />
          </>
        )}

        {currState === "Sign up" && isDataSubmitted && (
          <textarea
            onChange={(e) => setBio(e.target.value)}
            value={bio}
            rows={4}
            className="p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-transparent text-white placeholder-gray-400 md:p-3" // Responsive padding, transparent bg
            placeholder="Provide a short bio..."
            required
          ></textarea>
        )}

        <button
          type="submit"
          className="py-3 bg-gradient-to-r from-purple-400 to-violet-600 text-white rounded-md cursor-pointer text-lg md:text-xl" // Responsive text size
        >
          {currState === "Sign up" && !isDataSubmitted
            ? "Create Account"
            : currState === "Sign up" && isDataSubmitted
            ? "Submit Bio"
            : "Login Now"}
        </button>

        <div className="flex items-center gap-2 text-sm text-gray-400 md:text-base"> {/* Responsive text size */}
          <input
            type="checkbox"
            checked={agree}
            onChange={(e) => setAgree(e.target.checked)}
            className="w-4 h-4 md:w-5 md:h-5" // Responsive checkbox size
          />
          <p>Agree to the terms of use & privacy policy</p>
        </div>

        <div className="text-sm text-center text-white md:text-base"> {/* Responsive text size */}
          {currState === "Sign up" ? (
            <>
              Already have an account?{" "}
              <span
                className="text-indigo-300 underline cursor-pointer"
                onClick={() => {
                  setCurrState("Login");
                  setIsDataSubmitted(false);
                }}
              >
                Login here
              </span>
            </>
          ) : (
            <>
              Don't have an account?{" "}
              <span
                className="text-indigo-300 underline cursor-pointer"
                onClick={() => {
                  setCurrState("Sign up");
                  setIsDataSubmitted(false);
                }}
              >
                Sign up
              </span>
            </>
          )}
        </div>
      </form>
    </div>
  );
};

export default LoginPage;