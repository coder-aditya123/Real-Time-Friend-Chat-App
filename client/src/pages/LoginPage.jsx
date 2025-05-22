import React, { useContext, useState } from "react";
import assets from "../assets/assets";
import toast from "react-hot-toast"; // Import toast
import { AuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";  // <-- Added import

const LoginPage = () => {
  const [currState, setCurrState] = useState("Sign up");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [bio, setBio] = useState("");
  const [isDataSubmitted, setIsDataSubmitted] = useState(false);
  const [agree, setAgree] = useState(false);

  const { login } = useContext(AuthContext);
  const navigate = useNavigate(); // <-- Added navigate hook

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
          navigate("/");  // <-- Redirect on successful signup
        }
      }
    } else {
      if (!email || !password) {
        toast.error("Please enter Email and Password.");
        return;
      }
      const success = await login("login", { email, password });
      if (success) {
        navigate("/profile");  // <-- Redirect on successful login
      }
    }
  };

  return (
    <div className="min-h-screen bg-cover bg-center flex items-center justify-center gap-8 sm:justify-evenly max-sm:flex-col backdrop-blur-2xl px-6">
      {/* --------left-------- */}
      <img
        src={assets.logo_big}
        alt="logo"
        className="w-[min(40vw,180px)] max-w-[200px]"
      />

      {/* --------right-------- */}
      <form
        onSubmit={onSubmitHandler}
        className="border-2 bg-white/8 text-white border-gray-500 p-6 flex flex-col gap-6 rounded-lg shadow-lg max-w-sm w-full"
      >
        <h2 className="font-medium text-2xl flex justify-between items-center">
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
            className="p-2 border border-gray-500 rounded-md focus:outline-none"
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
              className="p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <input
              onChange={(e) => setPassword(e.target.value)}
              value={password}
              type="password"
              placeholder="Password"
              required
              className="p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </>
        )}

        {currState === "Sign up" && isDataSubmitted && (
          <textarea
            onChange={(e) => setBio(e.target.value)}
            value={bio}
            rows={4}
            className="p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Provide a short bio..."
            required
          ></textarea>
        )}

        <button
          type="submit"
          className="py-3 bg-gradient-to-r from-purple-400 to-violet-600 text-white rounded-md cursor-pointer"
        >
          {currState === "Sign up" && !isDataSubmitted
            ? "Create Account"
            : currState === "Sign up" && isDataSubmitted
            ? "Submit Bio"
            : "Login Now"}
        </button>

        <div className="flex items-center gap-2 text-sm text-gray-500">
          <input
            type="checkbox"
            checked={agree}
            onChange={(e) => setAgree(e.target.checked)}
          />
          <p>Agree to the terms of use & privacy policy</p>
        </div>

        <div className="text-sm text-center text-white">
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
