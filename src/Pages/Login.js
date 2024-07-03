import React from "react";
import { motion } from "framer-motion";
const Login = () => {
  return (
    <motion.div className="p-4 space-y-10">
      <motion.div className="card w-full bg-carolina-blue p-6 flex flex-col md:flex-row mx-auto max-w-6xl items-center justify-center">
        <h2 className="card-title ">Cookies!</h2>
        <p className="card-body">
          <label className="input input-bordered flex items-center gap-2">
            Name
            <input type="text" className="grow" placeholder="Daisy" />
          </label>
          <label className="input input-bordered flex items-center gap-2">
            Email
            <input type="text" className="grow" placeholder="daisy@site.com" />
          </label>
        </p>
      </motion.div>
    </motion.div>
  );
};

export default Login;
