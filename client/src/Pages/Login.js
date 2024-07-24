import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
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
    <motion.div className="p-4 space-y-16 flex flex-col my-16">
      <motion.div className="card w-full bg-carolina-blue p-6 flex flex-col mx-auto max-w-6xl items-center justify-center">
        <div className="flex flex-col md:flex-row justify-center items-center">
          <div className="flex flex-col items-center justify-center md:w-3/5 space-y-4">
            <h2 className="card-title">Sign in</h2>
            <p className="card-body">
              <form
                onSubmit={handleLogin}
                className="w-full flex flex-col gap-4"
              >
                <label className="input input-bordered flex items-center gap-2 w-full">
                  Email
                  <input
                    type="text"
                    className="grow"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="daisy@site.com"
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
            </p>
          </div>
          <div className="flex flex-col items-center justify-center md:w-2/5 space-y-4">
            <img
              src={illustrationLogin}
              alt="Illustration Login"
              className="w-full max-w-lg"
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
      </motion.div>
    </motion.div>
  );
};

export default Login;
