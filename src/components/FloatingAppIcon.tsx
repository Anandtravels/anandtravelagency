import React from 'react';
import { motion } from 'framer-motion';
import { Download } from 'lucide-react';

interface FloatingAppIconProps {
  onClick: () => void;
}

const FloatingAppIcon: React.FC<FloatingAppIconProps> = ({ onClick }) => {
  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 1, type: "spring", stiffness: 260, damping: 20 }}
      className="fixed bottom-6 right-6 z-50"
    >
      <motion.button
        onClick={onClick}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className="relative group bg-gradient-to-r from-travel-blue-dark to-travel-blue-medium text-white rounded-full p-4 shadow-lg hover:shadow-xl transition-all duration-300"
      >
        {/* App Icon */}
        <div className="w-12 h-12 rounded-lg overflow-hidden bg-white p-1">
          <img 
            src="https://res.cloudinary.com/dvmrhs2ek/image/upload/v1752322617/uu6ahajhgrwpxkxnjdas.png" 
            alt="Download App" 
            className="w-full h-full object-cover rounded-md"
          />
        </div>
        
        {/* Download Badge */}
        <div className="absolute -top-1 -right-1 bg-travel-orange text-white rounded-full p-1">
          <Download size={12} />
        </div>
        
        {/* Pulsing Ring Animation */}
        <div className="absolute inset-0 rounded-full bg-travel-blue-dark opacity-30 animate-ping"></div>
        
        {/* Tooltip */}
        <div className="absolute bottom-full right-0 mb-2 hidden group-hover:block">
          <div className="bg-black text-white text-xs rounded py-1 px-2 whitespace-nowrap">
            Download Our App
            <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-black"></div>
          </div>
        </div>
      </motion.button>
    </motion.div>
  );
};

export default FloatingAppIcon;
