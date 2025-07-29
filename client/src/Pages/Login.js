import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { doLogin } from "../Api";
import { BiLockAlt, BiUser, BiLogIn } from "react-icons/bi";
import { BsStars } from "react-icons/bs";

const Login = ({ setAuthenticated, setUsername }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await doLogin(email, password);
      setAuthenticated(true);
      setUsername(data.username);
      navigate("/manager");
    } catch (err) {
      setError("Invalid credentials. Please try again!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-8 min-h-[80vh] flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 p-8 rounded-cartoon shadow-cartoon border-2 border-black"
        >
          <div className="text-center mb-8">
            <motion.div
              className="inline-block mb-4"
              whileHover={{ scale: 1.05 }}
            >
              <span className="badge badge-lg bg-cartoon-pink text-white shadow-cartoon-sm px-6 py-3">
                <BsStars className="mr-2" /> Chef's Login
              </span>
            </motion.div>
            
            <h2 className="text-3xl font-bold mb-2 text-white">Welcome Back!</h2>
            <p className="text-gray-600 dark:text-gray-400">
              Time to cook up some amazing content 🍝
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold flex items-center gap-2 text-white">
                  <BiUser className="text-cartoon-blue" />
                  Email Address
                </span>
              </label>
              <input
                type="email"
                className="input input-bordered w-full rounded-cartoon shadow-cartoon-sm focus:shadow-cartoon transition-all"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="chef@spaghettibytes.com"
                required
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold flex items-center gap-2 text-white">
                  <BiLockAlt className="text-cartoon-purple" />
                  Password
                </span>
              </label>
              <input
                type="password"
                className="input input-bordered w-full rounded-cartoon shadow-cartoon-sm focus:shadow-cartoon transition-all"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="alert alert-error rounded-cartoon shadow-cartoon-sm"
              >
                <span>{error}</span>
              </motion.div>
            )}

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="btn btn-primary w-full rounded-cartoon shadow-cartoon hover:shadow-cartoon-hover btn-lg"
              type="submit"
              disabled={loading}
            >
              {loading ? (
                <span className="loading loading-spinner"></span>
              ) : (
                <>
                  <BiLogIn size={24} />
                  Sign In to Kitchen
                </>
              )}
            </motion.button>
          </form>

          <div className="divider my-6 text-white">OR</div>

          <p className="text-center text-sm text-gray-600 dark:text-gray-400">
            Not a chef yet? Contact me to get your apron! 👨‍🍳
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Login;