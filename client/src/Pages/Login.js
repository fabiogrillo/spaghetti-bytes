import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const Login = ({ setAuthenticated, setUsername }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
        credentials: "include", // Importante per inviare i cookie di sessione
      });

      if (response.ok) {
        const data = await response.json();
        setAuthenticated(true);
        setUsername(data.username);
        navigate("/"); // Redirige l'utente alla homepage dopo il login
      } else {
        const data = await response.json();
        setError(data.message);
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    }
  };

  return (
    <motion.div className="p-4 space-y-10 flex flex-col">
      <motion.div className="card w-full bg-carolina-blue p-6 flex flex-col mx-auto max-w-6xl items-center justify-center">
        <h2 className="card-title">Sign in</h2>
        <p className="card-body">
          <form onSubmit={handleLogin}>
            <label className="input input-bordered flex items-center gap-2">
              Email
              <input
                type="text"
                className="grow"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="daisy@site.com"
              />
            </label>
            <label className="input input-bordered flex items-center gap-2">
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
            <button className="btn btn-primary" type="submit">
              Login
            </button>
          </form>
        </p>
      </motion.div>
    </motion.div>
  );
};

export default Login;
