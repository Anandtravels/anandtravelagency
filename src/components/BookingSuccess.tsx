import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import '@/styles/bookingSuccess.css';

interface BookingSuccessProps {
  show: boolean;
  onClose: () => void;
  bookingDetails?: {
    bookingType?: string; // Added to track booking type
    coupon?: {
      code: string;
      discount: number;
      type: 'fixed' | 'percentage';
      originalAmount: number;
      discountAmount: number;
      finalAmount: number;
    };
  };
}

const BookingSuccess = ({ show, onClose, bookingDetails }: BookingSuccessProps) => {
  // Function to get the correct booking charge based on booking type
  const getBookingChargeByType = (bookingType?: string): number => {
    if (!bookingType) return 50; // Default to General Booking
    
    switch (bookingType) {
      case 'Tatkal Booking':
        return 200;
      case 'Premium Booking':
        return 250;
      case 'Advance Booking':
        return 150;
      case 'General Booking':
      default:
        return 50;
    }
  };

  // Calculate the correct original amount based on booking type
  const originalAmount = bookingDetails?.coupon?.originalAmount || 
                        getBookingChargeByType(bookingDetails?.bookingType);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center"
        >
          {/* Backdrop with blur and gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-gray-900/90 to-black/80 backdrop-blur-sm" />

          {/* Close button */}
          <motion.button
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            onClick={onClose}
            className="absolute top-6 right-6 text-white/80 hover:text-white transition-colors p-2 rounded-full hover:bg-white/10 z-10"
          >
            <X size={24} />
          </motion.button>

          {/* Content container */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="relative w-full max-w-md mx-4"
          >
            {/* Floating particles background */}
            <div className="absolute inset-0 overflow-hidden">
              {[...Array(20)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ 
                    x: Math.random() * 100 - 50,
                    y: Math.random() * 100 - 50,
                    opacity: 0 
                  }}
                  animate={{ 
                    x: Math.random() * 200 - 100,
                    y: Math.random() * 200 - 100,
                    opacity: [0, 1, 0],
                    scale: [1, 1.2, 0.8]
                  }}
                  transition={{
                    duration: Math.random() * 3 + 2,
                    repeat: Infinity,
                    repeatType: "reverse"
                  }}
                  className="absolute w-2 h-2 rounded-full"
                  style={{
                    background: ['#4AB1D3', '#38BDF8', '#F59E0B', '#2DD4BF'][Math.floor(Math.random() * 4)]
                  }}
                />
              ))}
            </div>

            {/* Success card */}
            <motion.div
              className="bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-[0_20px_60px_-15px_rgba(0,0,0,0.25)]"
              initial={{ y: 20 }}
              animate={{ y: 0 }}
            >
              {/* Colorful top bar */}
              <div className="h-1.5 bg-gradient-to-r from-travel-blue-dark via-travel-orange to-travel-blue-medium" />

              <div className="p-8">
                {/* Checkmark animation */}
                <motion.div 
                  className="relative w-24 h-24 mx-auto mb-6"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", delay: 0.2 }}
                >
                  {/* Outer rings */}
                  <div className="absolute inset-0 rounded-full bg-green-500/10 animate-ping-slow" />
                  <div className="absolute inset-2 rounded-full bg-green-500/20 animate-pulse" />
                  
                  {/* Checkmark circle */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <svg 
                      className="w-20 h-20 transform scale-75"
                      viewBox="0 0 52 52"
                    >
                      <circle 
                        className="stroke-[3] stroke-green-500 fill-none"
                        cx="26" 
                        cy="26" 
                        r="24"
                        style={{
                          strokeDasharray: 180,
                          strokeDashoffset: 180,
                          animation: "drawCircle 0.6s cubic-bezier(0.65, 0, 0.45, 1) forwards"
                        }}
                      />
                      <path
                        className="stroke-[3] stroke-green-500 fill-none"
                        d="M14.1 27.2l7.1 7.2 16.7-16.8"
                        style={{
                          strokeDasharray: 80,
                          strokeDashoffset: 80,
                          animation: "drawCheck 0.3s 0.8s cubic-bezier(0.65, 0, 0.45, 1) forwards"
                        }}
                      />
                    </svg>
                  </div>
                </motion.div>

                {/* Success text */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9 }}
                  className="text-center"
                >
                  <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
                    Booking Request Submitted Successfully
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Our team will contact you before the day of your journey by 8:00 AM.
                  </p>
                </motion.div>

                {/* Coupon details */}
                {bookingDetails?.coupon && (
                  <div className="mt-4 bg-green-50 p-4 rounded-lg border border-green-100">
                    <h4 className="text-sm font-semibold text-green-800">Coupon Applied Successfully!</h4>
                    <p className="text-sm text-green-700 mt-1">
                      Coupon code: {bookingDetails.coupon.code}
                      <br />
                      Discount: {bookingDetails.coupon.type === 'percentage' 
                        ? `${bookingDetails.coupon.discount}% off` 
                        : `₹${bookingDetails.coupon.discount} off`}
                      <br />
                      Original Amount: ₹{bookingDetails.bookingType ? getBookingChargeByType(bookingDetails.bookingType).toFixed(2) : bookingDetails.coupon.originalAmount.toFixed(2)}
                      <br />
                      Savings: ₹{bookingDetails.coupon.discountAmount.toFixed(2)}
                      <br />
                      Final Amount: ₹{bookingDetails.coupon.finalAmount.toFixed(2)}
                    </p>
                  </div>
                )}

                {/* Close Button */}
                <motion.div 
                  className="mt-8"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.2 }}
                >
                  <button
                    onClick={onClose}
                    className="w-full py-3 px-6 bg-gradient-to-r from-travel-blue-dark to-travel-blue-medium text-white font-semibold rounded-lg shadow-md hover:shadow-lg transform hover:scale-[1.02] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-travel-blue-dark focus:ring-offset-2"
                  >
                    Close
                  </button>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default BookingSuccess;
