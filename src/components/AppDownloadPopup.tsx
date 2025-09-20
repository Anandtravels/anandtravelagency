import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Smartphone, Download, Gift } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';

interface AppDownloadPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onDismissPermanently: () => void;
}

const AppDownloadPopup: React.FC<AppDownloadPopupProps> = ({ isOpen, onClose, onDismissPermanently }) => {
  const handleDownload = () => {
    window.open('https://play.google.com/store/apps/details?id=co.median.android.zrbwdr', '_blank');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden border-0 bg-transparent shadow-none">
        <DialogHeader>
          <VisuallyHidden>
            <DialogTitle>Download Mobile App</DialogTitle>
          </VisuallyHidden>
        </DialogHeader>
        <motion.div
          initial={{ scale: 0.8, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0, y: 20 }}
          transition={{ type: "spring", duration: 0.5 }}
          className="bg-gradient-to-br from-travel-blue-dark to-travel-blue-medium rounded-2xl p-6 text-white relative overflow-hidden"
        >
          {/* Close button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="absolute top-2 right-2 text-white hover:bg-white/20 rounded-full p-2 z-10"
          >
            <X size={16} />
          </Button>

          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-travel-orange/20 rounded-full translate-y-12 -translate-x-12" />

          {/* Content */}
          <div className="relative z-10 text-center space-y-4">
            {/* App Icon */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="mx-auto w-20 h-20 rounded-2xl overflow-hidden mb-4 shadow-lg"
            >
              <img 
                src="https://res.cloudinary.com/dvmrhs2ek/image/upload/v1752322617/uu6ahajhgrwpxkxnjdas.png" 
                alt="Anand Travels App" 
                className="w-full h-full object-cover"
              />
            </motion.div>

            {/* Title */}
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-2xl font-bold"
            >
              Download Our Mobile App!
            </motion.h2>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-white/90 text-sm leading-relaxed"
            >
              Get exclusive access to special offers, faster bookings, and seamless travel planning on the go!
            </motion.p>

            {/* Coupon Offer */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
              className="bg-travel-orange rounded-lg p-3 my-4"
            >
              <div className="flex items-center justify-center gap-2 text-white">
                <Gift size={18} />
                <span className="font-semibold text-sm">Exclusive App Offer!</span>
              </div>
              <div className="text-center mt-1">
                <span className="text-lg font-bold">APP50</span>
                <span className="text-sm ml-2">- Get 10% OFF</span>
              </div>
              <p className="text-xs text-white/90 mt-1">
                *Coupon valid only for app users
              </p>
            </motion.div>

            {/* Download Button */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="space-y-3"
            >
              <Button
                onClick={handleDownload}
                className="w-full bg-white text-travel-blue-dark hover:bg-gray-100 font-semibold py-3 rounded-lg transition-all duration-200 transform hover:scale-105"
              >
                <Download size={18} className="mr-2" />
                Download on Play Store
              </Button>
              
              <div className="flex justify-center gap-4 text-sm">
                <button
                  onClick={onClose}
                  className="text-white/80 hover:text-white underline transition-colors"
                >
                  Maybe later
                </button>
                <button
                  onClick={onDismissPermanently}
                  className="text-white/60 hover:text-white/80 underline transition-colors"
                >
                  Don't show again
                </button>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};

export default AppDownloadPopup;
