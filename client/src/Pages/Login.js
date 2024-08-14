import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { doLogin } from "../Api";
import illustrationLogin from "../Assets/Images/dazzle-artificial-intelligence-powers-sound-data-analysis-and-image-neural-network.gif";

const Login = ({ setAuthenticated, setUsername }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const data = await doLogin(email, password);
      setAuthenticated(true);
      setUsername(data.username);
      navigate("/manager");
    } catch (err) {
      setError("An error occurred. Please try again.");
    }
  };

  return (
    <div className="container mx-auto p-8">
      <div className="flex flex-col items-center text-center">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold">Sign in</h1>
          <form onSubmit={handleLogin} className="py-2 md:text-base space-y-4 my-6">
            <label className="input input-bordered flex items-center gap-2 w-full">
              Email
              <input
                type="text"
                className="grow"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="spaghetti@bytes.blog"
              />
            </label>
            <label className="input input-bordered flex items-center gap-2 w-full">
              Password
              <input
                type="password"
                className="grow"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="******"
              />
            </label>
            {error && <p className="text-red-500">{error}</p>}
            <button className="btn btn-primary w-full" type="submit">
              Login
            </button>
          </form>
          <div className="mb-8">
            <img
              src={illustrationLogin}
              alt="Illustration Login"
              className="w-full max-w-sm md:max-w-lg"
            />
            <p className="text-xs text-center ">
              Illustration by{" "}
              <a href="https://icons8.com/illustrations/author/JTmm71Rqvb2T">
                Dani Grapevine
              </a>{" "}
              from <a href="https://icons8.com/illustrations">Ouch!</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
