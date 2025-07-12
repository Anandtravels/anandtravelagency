import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/lib/auth';
import { Check, X } from 'lucide-react';

interface CouponInputProps {
  onApplyCoupon: (discount: number, code: string, type: 'fixed' | 'percentage') => void;
}

export function CouponInput({ onApplyCoupon }: CouponInputProps) {
  const [couponCode, setCouponCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const { user } = useAuth();

  const validateCoupon = async () => {
    if (!couponCode.trim()) return;
    
    setLoading(true);
    setStatus('loading');
    
    try {
      // Query the coupons collection for the coupon code
      const couponsRef = collection(db, 'coupons');
      const q = query(couponsRef, where('code', '==', couponCode.toUpperCase()), where('active', '==', true));
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        setStatus('error');
        setMessage('Invalid coupon code');
        setLoading(false);
        return;
      }
      
      const couponData = snapshot.docs[0].data();
      
      // Check if coupon is expired
      const now = new Date();
      const startDate = couponData.startDate?.toDate() || new Date(0);
      const endDate = couponData.endDate?.toDate() || new Date(8640000000000000); // Max date
      
      if (now < startDate || now > endDate) {
        setStatus('error');
        setMessage('Coupon has expired');
        setLoading(false);
        return;
      }
      
      // Check if max uses is reached
      if (couponData.maxUses && couponData.usedCount && couponData.usedCount >= couponData.maxUses) {
        setStatus('error');
        setMessage('Coupon usage limit reached');
        setLoading(false);
        return;
      }
      
      // Check if user has already used the coupon
      if (user && couponData.usedBy && couponData.usedBy.includes(user.uid)) {
        setStatus('error');
        setMessage('You have already used this coupon');
        setLoading(false);
        return;
      }
      
      // Check if this is an app-only coupon
      if (couponData.appOnly === true) {
        setStatus('error');
        setMessage('This coupon is only available for mobile app users. Download our app to use this offer!');
        setLoading(false);
        return;
      }
      
      // Coupon is valid
      const discountValue = couponData.value;
      const discountType = couponData.type as 'fixed' | 'percentage';
      
      setStatus('success');
      setMessage(`Coupon applied: ${discountType === 'percentage' ? `${discountValue}% OFF` : `₹${discountValue} OFF`}`);
      
      // Call the parent component's callback to apply the discount
      onApplyCoupon(discountValue, couponCode, discountType);
      
    } catch (error) {
      console.error("Error validating coupon:", error);
      setStatus('error');
      setMessage('An error occurred while validating the coupon');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      className="space-y-2"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center gap-2">
        <motion.div 
          className="flex-1 relative"
          whileFocus={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
        >
          <Input
            type="text"
            placeholder="Enter coupon code"
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
            className={`transition-all duration-300 border-2 ${
              status === 'success' 
                ? 'border-green-500 shadow-[0_0_10px_rgba(34,197,94,0.3)]' 
                : status === 'error' 
                ? 'border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.3)]' 
                : 'border-gray-200 hover:border-gray-300 focus:border-blue-500 focus:shadow-[0_0_10px_rgba(59,130,246,0.3)]'
            }`}
            disabled={loading || status === 'success'}
          />
        </motion.div>
        <Button 
          onClick={validateCoupon}
          disabled={loading || status === 'success' || !couponCode.trim()}
          className="transition-all duration-300 hover:scale-[1.03]"
        >
          {loading ? (
            <motion.div 
              className="h-5 w-5 border-2 border-white border-t-transparent rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            />
          ) : status === 'success' ? (
            <Check className="h-5 w-5" />
          ) : (
            'Apply'
          )}
        </Button>
      </div>

      <AnimatePresence>
        {(status === 'success' || status === 'error') && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Badge 
              className={`${
                status === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              } flex items-center gap-2 px-3 py-1 font-medium`}
            >
              {status === 'success' ? (
                <motion.span 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="h-4 w-4 bg-green-500 text-white rounded-full flex items-center justify-center"
                >
                  <Check className="h-3 w-3" />
                </motion.span>
              ) : (
                <motion.span 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="h-4 w-4 bg-red-500 text-white rounded-full flex items-center justify-center"
                >
                  <X className="h-3 w-3" />
                </motion.span>
              )}
              {message}
            </Badge>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
