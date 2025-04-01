import { motion } from "framer-motion";
import logo from "@/assets/logo.png";

const LoadingScreen = () => {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-white"
    >
      <div className="text-center w-full max-w-[350px] mx-auto">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="relative"
        >
          <motion.img
            src={logo}
            alt="Anand Travel Agency"
            className="w-full h-auto object-contain mx-auto"
            animate={{ 
              y: [0, -10, 0],
              scale: [1, 1.1, 1],
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut" 
            }}
          />
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            transition={{ duration: 1.5, delay: 0.5 }}
            className="h-1 bg-travel-orange mt-4 rounded-full"
          />
        </motion.div>
        <div className="mt-4 space-y-1">
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-travel-blue-dark text-xl font-bold"
          >
               Welcome To 
          Anand Travels Agency
          </motion.p>
        </div>
      </div>
    </motion.div>
  );
};

export default LoadingScreen;
