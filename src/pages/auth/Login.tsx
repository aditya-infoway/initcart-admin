// import { useState } from "react";
// import { FaEye, FaEyeSlash } from "react-icons/fa";
// import MainButton from "../../components/common/MainButton";
// import { IoMdCart } from "react-icons/io";
// import { motion } from "framer-motion";
// import { useFormik } from "formik";
// import * as Yup from "yup";
// import { useAuthStore } from "../../store/authStore";

// const Login = () => {
//   const [showPassword, setShowPassword] = useState<boolean>(false);
//   const [loading, setLoading] = useState<boolean>(false);
//   const { login } = useAuthStore();

//   const formik = useFormik({
//     initialValues: {
//       email: "",
//       password: "",
//     },
//     validationSchema: Yup.object({
//       email: Yup.string()
//         .email("Invalid email address")
//         .required("Email is Required"),
//       password: Yup.string().required("Password is Required"),
//     }),
//     onSubmit: (values) => {
//       setLoading(true);
//       setTimeout(() => {
//         // console.log("Login Request Here", values);
//         login(values);
//         setLoading(false);
//       }, 2000);
//     },
//   });

//   return (
//     <div className="flex w-full" style={{ height: "100svh" }}>
//       <div className="hidden lg:flex w-[55%] relative p-5 lg:p-10 bg-gradient-to-br from-[#0165ff] to-[#0053cf] overflow-hidden">
//         {/* Branding Text */}
//         <div className="relative z-10 text-white flex flex-col justify-center h-full gap-6">
//           <motion.h1
//             initial={{ x: -50, opacity: 0 }}
//             animate={{ x: 0, opacity: 1 }}
//             transition={{ duration: 0.8 }}
//             className="text-4xl font-bold"
//           >
//             Welcome to Admin Panel
//           </motion.h1>
//           <motion.p
//             initial={{ x: -50, opacity: 0 }}
//             animate={{ x: 0, opacity: 1 }}
//             transition={{ delay: 0.3, duration: 0.8 }}
//             className="text-lg text-gray-200"
//           >
//             Manage vendors, orders, and analytics effortlessly.
//           </motion.p>
//         </div>

//         {/* Optional Decorative Circles */}
//         <motion.div
//           initial={{ scale: 0 }}
//           animate={{ scale: 1 }}
//           transition={{ delay: 0.5, duration: 1 }}
//           className="absolute -top-10 -left-10 w-40 h-40 bg-white opacity-10 rounded-full"
//         />
//         <motion.div
//           initial={{ scale: 0 }}
//           animate={{ scale: 1 }}
//           transition={{ delay: 0.7, duration: 1 }}
//           className="absolute -bottom-10 -right-20 w-60 h-60 bg-white opacity-10 rounded-full"
//         />
//       </div>

//       <div className="w-full lg:w-[45%] p-5 lg:p-10 flex flex-col justify-center gap-14">
//         <motion.div
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.6 }}
//           className="flex flex-col gap-20"
//         >
//           {/* Header */}
//           <div className="text-center flex flex-col gap-3">
//             <motion.div
//               initial={{ scale: 0 }}
//               animate={{ scale: 1 }}
//               transition={{ duration: 0.5 }}
//               className="flex items-center justify-center gap-2"
//             >
//               <div className="bg-gradient-to-br from-[#0165ff] to-[#004bb5] rounded-full p-2 shadow-[4px_4px_10px_rgba(0,0,0,0.3), -4px_-4px_10px_rgba(255,255,255,0.2)] transform transition-transform duration-300">
//                 <IoMdCart color="white" size={22} />
//               </div>
//               <div className="font-bold text-xl">Ecommerce</div>
//             </motion.div>

//             <motion.div
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               transition={{ delay: 0.3 }}
//               className="flex flex-col gap-2"
//             >
//               <div className="font-heading font-bold text-[38px] ">
//                 Welcome Back
//               </div>
//               <div className="text-gray-500 text-lg">
//                 Please login to your account
//               </div>
//             </motion.div>
//           </div>

//           {/* Form */}
//           <motion.div
//             initial={{ opacity: 0, y: 10 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ delay: 0.5, duration: 0.5 }}
//           >
//             <form
//               onSubmit={formik.handleSubmit}
//               className="flex flex-col gap-5"
//             >
//               <div>
//                 <input
//                   type="email"
//                   className={` ${
//                     formik.touched.email && formik.errors.email
//                       ? "customInputError"
//                       : "customInput"
//                   } `}
//                   placeholder="Email address"
//                   name="email"
//                   onChange={formik.handleChange}
//                   onBlur={formik.handleBlur}
//                   value={formik.values.email}
//                 />
//                 {formik.touched.email && formik.errors.email ? (
//                   <div className="text-red-500 text-sm mt-1 ms-2">
//                     {formik.errors.email}
//                   </div>
//                 ) : null}
//               </div>
//               <div>
//                 <div className="relative">
//                   <input
//                     type={!showPassword ? "password" : "text"}
//                     className={`${
//                       formik.touched.password && formik.errors.password
//                         ? "customInputError"
//                         : "customInput"
//                     } `}
//                     style={{ paddingRight: "50px" }}
//                     placeholder="Password"
//                     name="password"
//                     onChange={formik.handleChange}
//                     onBlur={formik.handleBlur}
//                     value={formik.values.password}
//                   />
//                   <div
//                     onClick={() => setShowPassword((prev) => !prev)}
//                     className="absolute right-4 top-[50%] transform -translate-y-1/2 cursor-pointer text-gray-500 hover:text-gray-900 transition-colors duration-300"
//                   >
//                     {showPassword ? (
//                       <FaEye size={19} />
//                     ) : (
//                       <FaEyeSlash size={19} />
//                     )}
//                   </div>
//                 </div>
//                 {formik.touched.password && formik.errors.password ? (
//                   <div className="text-red-500 text-sm mt-1 ms-2">
//                     {formik.errors.password}
//                   </div>
//                 ) : null}
//               </div>
//             </form>
//           </motion.div>
//         </motion.div>

//         {/* Login Button */}
//         <motion.div
//           initial={{ opacity: 0, scale: 0.95 }}
//           animate={{ opacity: 1, scale: 1 }}
//           transition={{ delay: 0.7, duration: 0.5 }}
//           className="select-none cursor-pointer"
//         >
//           <MainButton
//             text="Login"
//             loading={loading}
//             disabled={!formik.isValid}
//             submit={() => formik.handleSubmit()}
//             className="hover:scale-103 transition-transform duration-300"
//           />
//         </motion.div>
//       </div>
//     </div>
//   );
// };

// export default Login;

// src/pages/auth/Login.tsx
import { useState, useEffect } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import MainButton from "../../components/common/MainButton";
import { IoMdCart } from "react-icons/io";
import { motion } from "framer-motion";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useAuthStore } from "../../store/authStore";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

const LOCKOUT_SECONDS = 5 * 60; // 5 minutes — backend se match karo

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Lockout state
  const [isLocked, setIsLocked]     = useState(false);
  const [countdown, setCountdown]   = useState(0);

  const login    = useAuthStore((state) => state.login);
  const navigate = useNavigate();

  // ── Countdown timer ──────────────────────────────────────────────────
  useEffect(() => {
    if (countdown <= 0) {
      setIsLocked(false);
      return;
    }
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setIsLocked(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  // ── Format seconds → MM:SS ───────────────────────────────────────────
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const formik = useFormik({
    initialValues: { email: "", password: "" },
    validationSchema: Yup.object({
      email:    Yup.string().email("Invalid email").required("Email is required"),
      password: Yup.string().required("Password is required"),
    }),
onSubmit: async (values) => {
  if (isLocked) return;
  setLoading(true);

  const result = await login({ email: values.email, password: values.password });
  setLoading(false);

  if (result.success) {
    Swal.fire("Welcome", "Login successful!", "success");
    navigate("/");
  } else if (result.rateLimited) {
    setIsLocked(true);
    setCountdown(LOCKOUT_SECONDS);
  } else {
    Swal.fire("Error", "Invalid email / password", "error");
  }
},
  });

  return (
    <div className="flex w-full h-screen">
      {/* Left Section */}
      <div className="hidden lg:flex w-[55%] relative p-10 bg-gradient-to-br from-[#0165ff] to-[#0053cf] overflow-hidden">
        <div className="relative z-10 text-white flex flex-col justify-center h-full gap-6">
          <motion.h1
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="text-4xl font-bold"
          >
            Welcome to Admin Panel
          </motion.h1>
        </div>
      </div>

      {/* Right Section */}
      <div className="w-full lg:w-[45%] p-10 flex flex-col justify-center gap-14">
        <div className="text-center flex flex-col gap-3">
          <div className="flex items-center justify-center gap-2">
            <div className="bg-gradient-to-br from-[#0165ff] to-[#004bb5] rounded-full p-2">
              <IoMdCart color="white" size={22} />
            </div>
            <div className="font-bold text-xl">Ecommerce</div>
          </div>
          <div className="font-heading font-bold text-[38px]">Welcome Back</div>
          <div className="text-gray-500 text-lg">Please login to your account</div>
        </div>

        {/* Lockout Banner */}
        {isLocked && (
          <div className="bg-red-50 border border-red-300 rounded-lg p-4 text-center">
            <p className="text-red-600 font-semibold text-sm">
               Too many failed attempts
            </p>
            <p className="text-red-500 text-sm mt-1">
              Please wait <span className="font-bold text-red-700">{formatTime(countdown)}</span> before trying again
            </p>
          </div>
        )}

        {/* Login Form */}
        <form
          onSubmit={formik.handleSubmit}
          className="flex flex-col gap-5 max-w-md mx-auto w-full"
        >
          <div>
            <input
              type="email"
              className={`customInput ${
                formik.touched.email && formik.errors.email ? "customInputError" : ""
              }`}
              placeholder="Email address"
              disabled={isLocked}
              {...formik.getFieldProps("email")}
            />
            {formik.touched.email && formik.errors.email && (
              <div className="text-red-500 text-sm mt-1">{formik.errors.email}</div>
            )}
          </div>

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              className={`customInput ${
                formik.touched.password && formik.errors.password ? "customInputError" : ""
              }`}
              placeholder="Password"
              disabled={isLocked}
              {...formik.getFieldProps("password")}
            />
            <div
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-4 top-[50%] transform -translate-y-1/2 cursor-pointer text-gray-500 hover:text-gray-900"
            >
              {showPassword ? <FaEye size={18} /> : <FaEyeSlash size={18} />}
            </div>
          </div>

          {formik.touched.password && formik.errors.password && (
            <div className="text-red-500 text-sm mt-1">{formik.errors.password}</div>
          )}

          <MainButton
            text={isLocked ? `Locked (${formatTime(countdown)})` : "Login"}
            loading={loading}
            disabled={!formik.isValid || loading || isLocked}
            submit={formik.handleSubmit}
            className="mt-3 hover:scale-105 transition-transform duration-300"
          />
        </form>
      </div>
    </div>
  );
};

export default Login;