import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { Calendar, MapPin, User, Phone, Mail, Train, Bus, Plane, Check, ArrowLeftRight } from "lucide-react";
import { collection, addDoc, serverTimestamp, query, where, getDocs, updateDoc, doc, Timestamp } from 'firebase/firestore';
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useToast } from "@/hooks/use-toast";
import { db } from '@/lib/firebase';
import BookingSuccess from "@/components/BookingSuccess";
import { CouponInput } from "@/components/CouponSystem/CouponInput";
import { StationAutocomplete } from "@/components/StationAutocomplete";
import { MultiSelectTrainAutocomplete } from "@/components/MultiSelectTrainAutocomplete";
import { preloadStationData } from "@/utils/stationDataLoader";
import { trackButtonClick } from "@/services/clickTracker";
import { sendPushNotification } from "@/utils/sendPushNotification";
import { sendWhatsAppConfirmation } from "@/utils/sendWhatsAppConfirmation";

const Booking = () => {
  const [bookingType, setBookingType] = useState("train");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const [passengerCount, setPassengerCount] = useState(1);
  const [passengers, setPassengers] = useState<Array<{ name: string; age: string; gender: string; dob?: string; aadhar?: string; inputMode?: 'age' | 'dob'; }>>([
    { name: '', age: '', gender: 'male', dob: '', aadhar: '', inputMode: 'age' }
  ]);
  const [flightTripType, setFlightTripType] = useState("one_way");
  const [showSuccess, setShowSuccess] = useState(false);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponCode, setCouponCode] = useState('');
  const [couponType, setCouponType] = useState<'fixed' | 'percentage' | null>(null);
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discount: number;
    type: 'fixed' | 'percentage';
    originalAmount: number;
    discountAmount: number;
    finalAmount: number;
  } | null>(null);
  const [bookingDetails, setBookingDetails] = useState<{
    coupon?: {
      code: string;
      discount: number;
      type: 'fixed' | 'percentage';
      originalAmount: number;
      discountAmount: number;
      finalAmount: number;
    } | null;
  }>({
    coupon: null
  });
  
  // State for train station autocomplete
  const [trainFromStation, setTrainFromStation] = useState("");
  const [trainToStation, setTrainToStation] = useState("");
  const [preferredTrains, setPreferredTrains] = useState("");
  
  // State for advance booking toggle
  const [isAdvanceBooking, setIsAdvanceBooking] = useState(false);
  
  // Function to swap from and to stations
  const handleSwapStations = () => {
    // Swap the state values
    const tempFrom = trainFromStation;
    const tempTo = trainToStation;
    
    setTrainFromStation(tempTo);
    setTrainToStation(tempFrom);
    
    // Update form values
    setValue("from", tempTo, { shouldValidate: true });
    setValue("to", tempFrom, { shouldValidate: true });
  };
  
  // Preload station data immediately when page loads (background loading)
  useEffect(() => {
    // Start loading station data in the background as soon as page loads
    // This ensures data is ready before user interacts with the form
    preloadStationData();
  }, []);
  
  // Helper to format date for input (YYYY-MM-DD for Safari compatibility)
  const formatDateForInput = useCallback((date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }, []);
  
  // Get min date for date inputs
  const getMinDate = useCallback((): string => {
    return formatDateForInput(new Date());
  }, [formatDateForInput]);

  // Get tomorrow's date
  const getTomorrowDate = useCallback((): string => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return formatDateForInput(tomorrow);
  }, [formatDateForInput]);
  
  // Toggle advance booking with touch support
  const handleAdvanceBookingToggle = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsAdvanceBooking(prev => !prev);
  }, []);
  
  // Validate passenger data before submission
  const validatePassengers = useCallback((): boolean => {
    for (let i = 0; i < passengers.length; i++) {
      const p = passengers[i];
      if (!p.name || p.name.trim() === '') {
        toast({
          title: "Validation Error",
          description: `Please enter name for Passenger ${i + 1}`,
          variant: "destructive"
        });
        return false;
      }
      if (!p.age || p.age.trim() === '') {
        toast({
          title: "Validation Error", 
          description: `Please enter age for Passenger ${i + 1}`,
          variant: "destructive"
        });
        return false;
      }
      const age = parseInt(p.age);
      if (isNaN(age) || age < 0 || age > 120) {
        toast({
          title: "Validation Error",
          description: `Please enter valid age (0-120) for Passenger ${i + 1}`,
          variant: "destructive"
        });
        return false;
      }
    }
    return true;
  }, [passengers, toast]);
  
  const { register, handleSubmit, reset, formState: { errors }, setValue, getValues } = useForm({
    defaultValues: {
      phone: "",
      name: "",
      email: "",
      from: "",
      to: "",
      journey_date: "",
      passengers: "",
      additional_requirements: "",
      // Transport-specific fields
      train_booking_type: "general",
      train_class: "SL",
      preferred_trains: "",
      // Flight-specific fields
      flight_trip_type: "one_way",
      flight_class: "economy",
      return_date: "",
      preferred_airlines: "",
      // Bus-specific fields
      bus_type: "ac_seater",
      boarding_point: "",
      drop_point: "" // Add this new field
    }
  });
  
  const handleBookingTypeChange = (type) => {
    setBookingType(type);
    // Reset station autocomplete values
    setTrainFromStation("");
    setTrainToStation("");
    setPreferredTrains("");
    // Reset advance booking toggle when changing booking type
    setIsAdvanceBooking(false);
    reset({
      phone: "",
      name: "",
      email: "",
      from: "",
      to: "",
      journey_date: "",
      passengers: "",
      additional_requirements: "",
      // Keep the defaults for all transport types
      train_booking_type: "general",
      train_class: "SL",
      preferred_trains: "",
      flight_trip_type: "one_way",
      flight_class: "economy",
      return_date: "",
      preferred_airlines: "",
      bus_type: "ac_seater",
      boarding_point: "",
      drop_point: "" // Add this new field
    });
  };

  const handlePassengerCountChange = (e) => {
    const count = parseInt(e.target.value);
    setPassengerCount(count);
    setPassengers(prev => {
      if (count > prev.length) {
        return [...prev, ...Array(count - prev.length).fill({ name: '', age: '', gender: 'male', dob: '', aadhar: '', inputMode: 'age' })];
      }
      return prev.slice(0, count);
    });
  };

  // Calculate Date of Birth from Age with random month and day
  const calculateDOBFromAge = (age: string): string => {
    if (!age || isNaN(parseInt(age))) return '';
    const currentYear = new Date().getFullYear();
    const birthYear = currentYear - parseInt(age);
    
    // Generate random month (1-12)
    const randomMonth = Math.floor(Math.random() * 12) + 1;
    
    // Generate random day based on the month
    const daysInMonth = new Date(birthYear, randomMonth, 0).getDate();
    const randomDay = Math.floor(Math.random() * daysInMonth) + 1;
    
    // Format with leading zeros
    const month = String(randomMonth).padStart(2, '0');
    const day = String(randomDay).padStart(2, '0');
    
    // Return date in YYYY-MM-DD format with random date and month
    return `${birthYear}-${month}-${day}`;
  };

  // Calculate Age from Date of Birth
  const calculateAgeFromDOB = (dobString: string): string => {
    if (!dobString) return '';
    const dob = new Date(dobString);
    if (isNaN(dob.getTime())) return '';
    
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    
    // Adjust age if birthday hasn't occurred this year
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      age--;
    }
    
    return age >= 0 ? age.toString() : '';
  };

  // Parse DOB from various formats (DD/MM/YYYY, DD-MM-YYYY, DD MM YYYY, DD/MM/YY, DD-MM-YY)
  const parseDOBInput = (input: string): string => {
    if (!input) return '';
    
    // Remove extra spaces and normalize separators
    const cleaned = input.trim().replace(/\s+/g, '/').replace(/-/g, '/');
    const parts = cleaned.split('/');
    
    if (parts.length !== 3) return '';
    
    const day = parseInt(parts[0]);
    const month = parseInt(parts[1]);
    let year = parseInt(parts[2]);
    
    if (isNaN(day) || isNaN(month) || isNaN(year)) return '';
    if (day < 1 || day > 31 || month < 1 || month > 12) return '';
    
    // Handle 2-digit year (YY format)
    if (year < 100) {
      const currentYear = new Date().getFullYear();
      const century = Math.floor(currentYear / 100) * 100;
      // If 2-digit year would be in the future, assume previous century
      year = year + century;
      if (year > currentYear) {
        year -= 100;
      }
    }
    
    // Validate year range
    if (year < 1900 || year > new Date().getFullYear()) return '';
    
    // Return in YYYY-MM-DD format for internal use
    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };

  const formatDateToDDMMYYYY = (dateString: string): string => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const handlePassengerChange = (index: number, field: string, value: string) => {
    const updatedPassengers = [...passengers.map(passenger => ({...passenger}))];
    
    if (field === 'age') {
      // Calculate DOB when age changes
      const dob = calculateDOBFromAge(value);
      updatedPassengers[index] = {
        ...updatedPassengers[index],
        age: value,
        dob: dob
      };
    } else if (field === 'dobInput') {
      // Parse DOB input and calculate age
      const parsedDOB = parseDOBInput(value);
      const age = calculateAgeFromDOB(parsedDOB);
      updatedPassengers[index] = {
        ...updatedPassengers[index],
        dob: parsedDOB,
        age: age
      };
    } else if (field === 'inputMode') {
      // Switch input mode and clear values
      updatedPassengers[index] = {
        ...updatedPassengers[index],
        inputMode: value as 'age' | 'dob',
        age: '',
        dob: ''
      };
    } else {
      updatedPassengers[index] = {
        ...updatedPassengers[index],
        [field]: value
      };
    }
    setPassengers(updatedPassengers);
  };
  
  // Calculate booking charge based on booking type
  const calculateBookingCharge = (type: string) => {
    switch(type) {
      case 'tatkal':
        return 200;
      case 'premium_tatkal':
        return 250;
      default:
        return 50;
    }
  };

  // Function to handle booking type change and refresh coupon
  const handleBookingTypeSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newBookingType = event.target.value;
    setValue("train_booking_type", newBookingType);
    
    // If a coupon is applied, recalculate it with the new booking charge
    if (appliedCoupon) {
      const newOriginalAmount = calculateBookingCharge(newBookingType);
      const discountAmount = appliedCoupon.type === 'percentage' 
        ? (newOriginalAmount * appliedCoupon.discount / 100) 
        : appliedCoupon.discount;
      const finalAmount = Math.max(0, newOriginalAmount - discountAmount);

      setAppliedCoupon({
        ...appliedCoupon,
        originalAmount: newOriginalAmount,
        discountAmount,
        finalAmount
      });
    }
  };

  // Function to clear applied coupon
  const clearAppliedCoupon = () => {
    setAppliedCoupon(null);
    setCouponDiscount(0);
    setCouponCode('');
    setCouponType(null);
  };

  // Function to handle applying a coupon
  const handleApplyCoupon = (discount: number, code: string, type: 'fixed' | 'percentage') => {
    // Get current form values to determine the correct booking charge
    const currentFormValues = getValues();
    const currentBookingType = currentFormValues.train_booking_type || 'general';
    const originalAmount = calculateBookingCharge(currentBookingType);
    
    const discountAmount = type === 'percentage' 
      ? (originalAmount * discount / 100) 
      : discount;
    const finalAmount = Math.max(0, originalAmount - discountAmount);

    setAppliedCoupon({
      code,
      discount,
      type,
      originalAmount,
      discountAmount,
      finalAmount
    });
    setCouponDiscount(discount);
    setCouponCode(code);
    setCouponType(type);
  };

  const onSubmit = async (data) => {
    // Validate passengers first (manual validation for Safari compatibility)
    if (!validatePassengers()) {
      return;
    }
    
    // Track the booking submission
    try {
      trackButtonClick(`Submit Booking - ${bookingType.charAt(0).toUpperCase() + bookingType.slice(1)}`);
    } catch (trackError) {
      console.warn('Click tracking failed:', trackError);
    }
    
    setIsLoading(true);
    
    // Helper function to attempt submission with retry
    const attemptSubmission = async (useServerTimestamp: boolean, retryCount = 0): Promise<any> => {
      try {
        // Calculate final booking charge
        const baseCharge = calculateBookingCharge(data.train_booking_type || 'general');
        const finalCharge = appliedCoupon ? appliedCoupon.finalAmount : baseCharge;
        
        // Use serverTimestamp on first try, fallback to client timestamp on retry
        const timestampValue = useServerTimestamp ? serverTimestamp() : Timestamp.fromDate(new Date());

        const bookingData = {
          ...data,
          phone: "+91" + data.phone,
          booking_type: bookingType,
          passengers: passengers.map(p => ({
            name: p.name || '',
            age: p.age || '',
            gender: p.gender || 'male',
            dob: p.dob || '',
            aadhar: p.aadhar || ''
          })),
          status: "pending",
          advance_booking: isAdvanceBooking,
          created_at: timestampValue,
          booking_charge: {
            original: baseCharge,
            final: finalCharge,
            currency: 'INR'
          },
          coupon: appliedCoupon ? {
            code: appliedCoupon.code,
            discount: appliedCoupon.discount,
            type: appliedCoupon.type,
            originalAmount: appliedCoupon.originalAmount,
            discountAmount: appliedCoupon.discountAmount,
            finalAmount: appliedCoupon.finalAmount,
            appliedAt: timestampValue
          } : null,
          // Add device info for debugging
          _deviceInfo: {
            userAgent: typeof navigator !== 'undefined' ? navigator.userAgent.substring(0, 200) : 'unknown',
            platform: typeof navigator !== 'undefined' ? navigator.platform : 'unknown',
            submittedAt: new Date().toISOString()
          }
        };

        const docRef = await addDoc(collection(db, 'bookings'), bookingData);

        // Send push notification to admin
        sendPushNotification('new_booking', {
          bookingId: docRef.id,
          name: data.name,
          from: data.from,
          to: data.to,
          journeyDate: data.journey_date,
          bookingType: data.train_booking_type || 'General'
        });

        // Send WhatsApp booking confirmation to customer
        sendWhatsAppConfirmation(bookingData, 'booking', docRef.id);

        return { success: true, docRef, bookingData, baseCharge, finalCharge };
        
      } catch (error: any) {
        // If serverTimestamp failed, retry with client timestamp
        if (useServerTimestamp && retryCount < 2) {
          console.warn(`Submission attempt ${retryCount + 1} failed, retrying with client timestamp...`);
          return attemptSubmission(false, retryCount + 1);
        }
        throw error;
      }
    };
    
    try {
      const result = await attemptSubmission(true);
      const { docRef, baseCharge, finalCharge } = result;

      // Try to update coupon usage, but don't fail the booking if it fails
      if (couponCode && appliedCoupon) {
        try {
          const couponsRef = collection(db, 'coupons');
          const q = query(couponsRef, where('code', '==', couponCode));
          const snapshot = await getDocs(q);

          if (!snapshot.empty) {
            const couponDoc = snapshot.docs[0];
            const couponData = couponDoc.data();
            
            // Convert booking type for display
            let displayBookingType = "General Booking";
            if (data.train_booking_type === "tatkal") {
              displayBookingType = "Tatkal Booking";
            } else if (data.train_booking_type === "premium_tatkal") {
              displayBookingType = "Premium Booking";
            }
            
            // Create a new redemption object with the correct amount based on booking type
            const redemptionData = {
              bookingId: docRef.id,
              bookingType: displayBookingType, // Store user-friendly booking type
              appliedAt: new Date().toISOString(),
              originalAmount: baseCharge, // Use the correct base charge calculated above
              discountAmount: appliedCoupon?.discountAmount,
              finalAmount: finalCharge,
              personName: data.name, // Add person information as requested
              personPhone: "+91" + data.phone
            };

            await updateDoc(doc(db, 'coupons', couponDoc.id), {
              usedCount: (couponData.usedCount || 0) + 1,
              redemptions: [...(couponData.redemptions || []), redemptionData],
              lastUsed: serverTimestamp() // Use serverTimestamp only for the top-level field
            });
          }
        } catch (couponError) {
          // Log coupon update error but don't fail the booking
          console.warn("Could not update coupon usage (this doesn't affect your booking):", couponError);
          // Note: The booking was still successful, we just couldn't track coupon usage
        }
      }

      setShowSuccess(true);
      setBookingDetails({
        coupon: appliedCoupon
      });
      
      // Reset form and all state values after successful submission
      reset();
      setPassengerCount(1);
      setPassengers([{ name: '', age: '', gender: 'male', dob: '', aadhar: '', inputMode: 'age' }]);
      setTrainFromStation("");
      setTrainToStation("");
      setPreferredTrains("");
      setIsAdvanceBooking(false); // Reset advance booking toggle
      clearAppliedCoupon();

    } catch (error: any) {
      // Enhanced error logging for mobile debugging
      const errorDetails = {
        message: error?.message || 'Unknown error',
        code: error?.code || 'no-code',
        name: error?.name || 'Error',
        stack: error?.stack?.substring(0, 500) || 'no-stack',
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
        timestamp: new Date().toISOString(),
        bookingType,
        formData: { from: data.from, to: data.to, journey_date: data.journey_date }
      };
      console.error("Booking submission error:", errorDetails);
      
      // Provide more specific error messages based on the error type
      let errorMessage = "There was an error processing your booking. Please try again later.";
      let showWhatsAppOption = false;
      
      if (error?.code === 'permission-denied') {
        errorMessage = "Service temporarily unavailable. You can book via WhatsApp instead.";
        showWhatsAppOption = true;
      } else if (error?.code === 'unavailable' || error?.code === 'failed-precondition') {
        errorMessage = "Service temporarily unavailable. Please try again or book via WhatsApp.";
        showWhatsAppOption = true;
      } else if (error?.code === 'network-request-failed' || error?.message?.includes('network')) {
        errorMessage = "Network error. Please check your internet connection and try again.";
      } else if (error?.message?.includes('Failed to fetch') || error?.message?.includes('NetworkError')) {
        errorMessage = "Connection failed. Please check your internet and try again.";
      } else if (error?.message?.includes('offline')) {
        errorMessage = "You appear to be offline. Please connect to the internet and try again.";
      } else if (error?.message) {
        errorMessage = `Error: ${error.message.substring(0, 100)}`;
      }
      
      // If permission denied, offer WhatsApp as fallback
      if (showWhatsAppOption) {
        const bookingInfo = `Train Booking Request:%0AFrom: ${data.from}%0ATo: ${data.to}%0ADate: ${data.journey_date}%0APassengers: ${passengerCount}%0AName: ${data.name}%0APhone: ${data.phone}`;
        toast({
          title: "Booking Issue",
          description: (
            <div className="space-y-2">
              <p>{errorMessage}</p>
              <a 
                href={`https://wa.me/918985816481?text=${bookingInfo}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-green-500 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-600"
              >
                📱 Book via WhatsApp
              </a>
            </div>
          ) as any,
          variant: "destructive",
          duration: 15000
        });
      } else {
        toast({
          title: "Submission Error",
          description: errorMessage,
          variant: "destructive"
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      {/* Add Success Overlay */}
      <BookingSuccess 
        show={showSuccess}
        onClose={() => setShowSuccess(false)}
      />
      
      <main className="flex-grow">
        <div className="relative h-[40vh] min-h-[300px] bg-cover bg-center flex items-center" 
             style={{ backgroundImage: "linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url('https://source.unsplash.com/photo-1544620347-c4fd4a3d5957')" }}>
          <div className="container-custom text-white text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Book Your Journey</h1>
            <p className="text-xl max-w-3xl mx-auto">
              Easy and secure booking for all your travel needs
            </p>
          </div>
        </div>
        
        <section className="bg-white py-8 border-b">
          <div className="container-custom">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <button
                type="button"
                onClick={() => handleBookingTypeChange("train")}
                className={`flex flex-col items-center gap-2 p-4 rounded-lg transition-colors ${
                  bookingType === "train"
                    ? "bg-travel-blue-dark text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <Train className={`w-8 h-8 ${bookingType === "train" ? "text-travel-orange" : "text-travel-blue-dark"}`} />
                <span className="font-medium">Train Ticket</span>
              </button>
              
              <button
                type="button"
                onClick={() => handleBookingTypeChange("bus")}
                className={`flex flex-col items-center gap-2 p-4 rounded-lg transition-colors ${
                  bookingType === "bus"
                    ? "bg-travel-blue-dark text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <Bus className={`w-8 h-8 ${bookingType === "bus" ? "text-travel-orange" : "text-travel-blue-dark"}`} />
                <span className="font-medium">Bus Ticket</span>
              </button>
              
              <button
                type="button"
                onClick={() => handleBookingTypeChange("flight")}
                className={`flex flex-col items-center gap-2 p-4 rounded-lg transition-colors ${
                  bookingType === "flight"
                    ? "bg-travel-blue-dark text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <Plane className={`w-8 h-8 ${bookingType === "flight" ? "text-travel-orange" : "text-travel-blue-dark"}`} />
                <span className="font-medium">Flight Ticket</span>
              </button>
            </div>
          </div>
        </section>
        
        <section className="py-12 md:py-16 bg-gray-50">
          <div className="container-custom">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
              <div className="lg:col-span-2">
                <div className="bg-white rounded-lg shadow-md p-4 md:p-8">
                  <h2 className="text-2xl font-bold text-travel-blue-dark mb-6">
                    {bookingType === "train" && "Train Ticket Booking"}
                    {bookingType === "bus" && "Bus Ticket Booking"}
                    {bookingType === "flight" && "Flight Ticket Booking"}
                  </h2>
                  
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    {bookingType === "train" ? (
                      <div className="relative">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* From Station */}
                          <div>
                            <StationAutocomplete
                              label="From"
                              required={true}
                              value={trainFromStation}
                              onChange={(value) => {
                                setTrainFromStation(value);
                                setValue("from", value, { shouldValidate: true });
                              }}
                              placeholder="Search station name or code..."
                              error={errors.from ? String(errors.from.message) : undefined}
                            />
                            {/* Hidden input for form validation */}
                            <input
                              type="hidden"
                              {...register("from", { required: "Origin is required" })}
                            />
                          </div>
                          
                          {/* To Station */}
                          <div>
                            <StationAutocomplete
                              label="To"
                              required={true}
                              value={trainToStation}
                              onChange={(value) => {
                                setTrainToStation(value);
                                setValue("to", value, { shouldValidate: true });
                              }}
                              placeholder="Search station name or code..."
                              error={errors.to ? String(errors.to.message) : undefined}
                            />
                            {/* Hidden input for form validation */}
                            <input
                              type="hidden"
                              {...register("to", { required: "Destination is required" })}
                            />
                          </div>
                        </div>
                        
                        {/* Swap Button - Positioned between From and To */}
                        <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 hidden md:block">
                          <button
                            type="button"
                            onClick={handleSwapStations}
                            className="bg-white border-2 border-travel-orange text-travel-orange rounded-full p-2.5 shadow-lg hover:bg-travel-orange hover:text-white transition-all duration-300 hover:scale-110 active:scale-95 focus:outline-none focus:ring-2 focus:ring-travel-orange focus:ring-offset-2"
                            title="Swap stations"
                            aria-label="Swap from and to stations"
                          >
                            <ArrowLeftRight className="w-5 h-5" />
                          </button>
                        </div>
                        
                        {/* Mobile Swap Button - Below the fields */}
                        <div className="md:hidden mt-3 flex justify-center">
                          <button
                            type="button"
                            onClick={handleSwapStations}
                            className="flex items-center gap-2 bg-travel-orange text-white px-4 py-2 rounded-lg shadow-md hover:bg-orange-600 transition-all duration-300 active:scale-95 focus:outline-none focus:ring-2 focus:ring-travel-orange focus:ring-offset-2"
                            title="Swap stations"
                            aria-label="Swap from and to stations"
                          >
                            <ArrowLeftRight className="w-4 h-4" />
                            <span className="text-sm font-medium">Swap Stations</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Other booking types with regular input */}
                        <div>
                          <label className="block text-gray-700 font-medium mb-2">
                            From <span className="text-rose-500">*</span>
                          </label>
                          <div className="relative">
                            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                            <input
                              type="text"
                              {...register("from", { required: "Origin is required" })}
                              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-travel-blue-dark"
                              placeholder="City/Station/Airport"
                            />
                          </div>
                          {errors.from && <p className="text-red-500 text-sm mt-1">{String(errors.from.message)}</p>}
                        </div>
                        
                        <div>
                          <label className="block text-gray-700 font-medium mb-2">
                            To <span className="text-rose-500">*</span>
                          </label>
                          <div className="relative">
                            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                            <input
                              type="text"
                              {...register("to", { required: "Destination is required" })}
                              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-travel-blue-dark"
                              placeholder="City/Station/Airport"
                            />
                          </div>
                          {errors.to && <p className="text-red-500 text-sm mt-1">{String(errors.to.message)}</p>}
                        </div>
                      </div>
                    )}
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-gray-700 font-medium mb-2">
                          Journey Date <span className="text-rose-500">*</span>
                        </label>
                        <div className="flex items-center gap-2">
                          <div className="relative flex-1">
                            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
                            <input
                              type="date"
                              {...register("journey_date", { required: "Journey date is required" })}
                              min={getMinDate()}
                              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-travel-blue-dark appearance-none"
                              style={{ WebkitAppearance: 'none' }}
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => setValue("journey_date", getTomorrowDate(), { shouldValidate: true })}
                            className="px-3 py-2 text-xs font-semibold bg-travel-orange text-white rounded-md hover:bg-orange-600 transition-colors whitespace-nowrap shadow-sm"
                          >
                            Tomorrow
                          </button>
                        </div>
                        {errors.journey_date && <p className="text-red-500 text-sm mt-1">{String(errors.journey_date.message)}</p>}
                      </div>
                    </div>
                    
                    {bookingType === "train" && (
                      <>
                        {/* Advance Booking Toggle - Responsive Design */}
                        <div className="mb-6">
                          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg md:rounded-xl p-4 md:p-6 border-2 border-blue-200 shadow-sm">
                            {/* Mobile Layout - Stacked */}
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                              {/* Title and Description */}
                              <div className="flex-1">
                                <h3 className="text-base md:text-lg font-semibold text-travel-blue-dark mb-1 flex items-center gap-2">
                                  <Calendar className="w-4 h-4 md:w-5 md:h-5 text-travel-orange flex-shrink-0" />
                                  <span>Booking Mode</span>
                                </h3>
                                <p className="text-xs md:text-sm text-gray-600 leading-relaxed">
                                  {isAdvanceBooking 
                                    ? "Plan ahead! Book tickets in advance" 
                                    : "Regular booking for immediate travel"}
                                </p>
                              </div>
                              
                              {/* Toggle Button - Responsive Size */}
                              <div className="flex items-center gap-2 sm:gap-3 self-start sm:self-auto">
                                <button
                                  type="button"
                                  onClick={handleAdvanceBookingToggle}
                                  className={`relative inline-flex h-8 w-16 sm:h-10 sm:w-20 md:h-12 md:w-24 items-center rounded-full transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 flex-shrink-0 touch-manipulation ${
                                    isAdvanceBooking 
                                      ? 'bg-gradient-to-r from-travel-orange to-orange-500 focus:ring-travel-orange shadow-lg' 
                                      : 'bg-gray-300 focus:ring-gray-400 shadow-md'
                                  }`}
                                  aria-label="Toggle advance booking"
                                >
                                  <span
                                    className={`inline-block h-6 w-6 sm:h-8 sm:w-8 md:h-10 md:w-10 transform rounded-full bg-white transition-all duration-300 ease-in-out shadow-lg ${
                                      isAdvanceBooking ? 'translate-x-8 sm:translate-x-10 md:translate-x-12' : 'translate-x-1'
                                    }`}
                                  >
                                    {isAdvanceBooking ? (
                                      <Check className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-travel-orange m-1 sm:m-1.5 md:m-2" />
                                    ) : (
                                      <span className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-gray-400 m-1 sm:m-1.5 md:m-2 block" />
                                    )}
                                  </span>
                                </button>
                                
                                <div className="text-left sm:text-right min-w-[100px] sm:min-w-[110px] md:min-w-[120px]">
                                  <div className={`font-bold text-xs sm:text-sm transition-colors duration-200 ${
                                    isAdvanceBooking ? 'text-travel-orange' : 'text-gray-600'
                                  }`}>
                                    {isAdvanceBooking ? 'Advance' : 'Regular'}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    {isAdvanceBooking ? 'Active' : 'Standard'}
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            {/* Additional Info Badge - Responsive */}
                            {isAdvanceBooking && (
                              <div className="mt-3 md:mt-4 flex items-start gap-2 bg-white rounded-lg p-2.5 md:p-3 border border-blue-200">
                                <div className="bg-travel-orange rounded-full p-1 mt-0.5 flex-shrink-0">
                                  <Check className="w-3 h-3 text-white" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-medium text-travel-blue-dark">Advance Booking Selected</p>
                                  <p className="text-xs text-gray-600 leading-relaxed">Your booking will be marked for advance scheduling</p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-gray-700 font-medium mb-2">
                              Booking Type <span className="text-rose-500">*</span>
                            </label>
                            <select
                              {...register("train_booking_type", { required: "Booking type is required" })}
                              defaultValue="general"
                              onChange={handleBookingTypeSelectChange}
                              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-travel-blue-dark"
                            >
                              <option value="general">General Booking</option>
                              <option value="tatkal">Tatkal Booking</option>
                              <option value="premium_tatkal">Premium Tatkal</option>
                            </select>
                            {errors.train_booking_type && <p className="text-red-500 text-sm mt-1">{String(errors.train_booking_type.message)}</p>}
                          </div>
                          
                          <div>
                            <label className="block text-gray-700 font-medium mb-2">
                              Class Preference <span className="text-rose-500">*</span>
                            </label>
                            <select
                              {...register("train_class", { required: "Class preference is required" })}
                              defaultValue="SL"
                              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-travel-blue-dark"
                            >
                              <option value="SL">Sleeper (SL)</option>
                              <option value="3A">AC 3-Tier (3A)</option>
                              <option value="3E">AC 3 Economy (3E)</option>
                              <option value="2A">AC 2-Tier (2A)</option>
                              <option value="2S">Second Sitting (2S)</option>
                              <option value="1A">AC First Class (1A)</option>
                              <option value="CC">Chair Car (CC)</option>
                              <option value="EC">Executive Chair Car (EC)</option>
                            </select>
                            {errors.train_class && <p className="text-red-500 text-sm mt-1">{String(errors.train_class.message)}</p>}
                          </div>
                        </div>
                        
                        <div>
                          <MultiSelectTrainAutocomplete
                            label="Preferred Trains (Optional)"
                            required={false}
                            value={preferredTrains}
                            onChange={(value) => {
                              setPreferredTrains(value);
                              setValue("preferred_trains", value);
                            }}
                            placeholder="Search by train number or name (e.g., 12345 or Rajdhani)"
                          />
                          {/* Hidden input for form registration */}
                          <input
                            type="hidden"
                            {...register("preferred_trains")}
                          />
                        </div>
                      </>
                    )}
                    
                    {bookingType === "bus" && (
                      <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-gray-700 font-medium mb-2">
                              Bus Type <span className="text-rose-500">*</span>
                            </label>
                            <select
                              {...register("bus_type", { required: "Bus type is required" })}
                              defaultValue="ac_seater"
                              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-travel-blue-dark"
                            >
                              <option value="ac_seater">AC Seater</option>
                              <option value="non_ac_seater">Non-AC Seater</option>
                              <option value="ac_sleeper">AC Sleeper</option>
                              <option value="non_ac_sleeper">Non-AC Sleeper</option>
                              <option value="volvo">Volvo</option>
                            </select>
                            {errors.bus_type && <p className="text-red-500 text-sm mt-1">{String(errors.bus_type.message)}</p>}
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-gray-700 font-medium mb-2">
                              Boarding Point <span className="text-rose-500">*</span>
                            </label>
                            <input
                              type="text"
                              {...register("boarding_point", { required: "Boarding point is required" })}
                              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-travel-blue-dark"
                              placeholder="Specific boarding location"
                            />
                            {errors.boarding_point && <p className="text-red-500 text-sm mt-1">{String(errors.boarding_point.message)}</p>}
                          </div>
                          
                          <div>
                            <label className="block text-gray-700 font-medium mb-2">
                              Drop Point <span className="text-rose-500">*</span>
                            </label>
                            <input
                              type="text"
                              {...register("drop_point", { required: "Drop point is required" })}
                              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-travel-blue-dark"
                              placeholder="Specific drop location"
                            />
                            {errors.drop_point && <p className="text-red-500 text-sm mt-1">{String(errors.drop_point.message)}</p>}
                          </div>
                        </div>
                      </>
                    )}
                    
                    {bookingType === "flight" && (
                      <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-gray-700 font-medium mb-2">
                              Trip Type <span className="text-rose-500">*</span>
                            </label>
                            <select
                              {...register("flight_trip_type", { required: "Trip type is required" })}
                              defaultValue="one_way"
                              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-travel-blue-dark"
                              onChange={(e) => setFlightTripType(e.target.value)}
                            >
                              <option value="one_way">One Way</option>
                              <option value="round_trip">Round Trip</option>
                            </select>
                            {errors.flight_trip_type && <p className="text-red-500 text-sm mt-1">{String(errors.flight_trip_type.message)}</p>}
                          </div>
                          
                          {flightTripType === "round_trip" && (
                            <div>
                              <label className="block text-gray-700 font-medium mb-2">Return Date (for Round Trip)</label>
                              <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
                                <input
                                  type="date"
                                  {...register("return_date")}
                                  min={getMinDate()}
                                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-travel-blue-dark appearance-none"
                                  style={{ WebkitAppearance: 'none' }}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-gray-700 font-medium mb-2">
                              Class Preference <span className="text-rose-500">*</span>
                            </label>
                            <select
                              {...register("flight_class", { required: "Class preference is required" })}
                              defaultValue="economy"
                              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-travel-blue-dark"
                            >
                              <option value="economy">Economy</option>
                              <option value="premium_economy">Premium Economy</option>
                              <option value="business">Business</option>
                              <option value="first">First Class</option>
                            </select>
                            {errors.flight_class && <p className="text-red-500 text-sm mt-1">{String(errors.flight_class.message)}</p>}
                          </div>
                          
                          <div>
                            <label className="block text-gray-700 font-medium mb-2">Preferred Airlines (Optional)</label>
                            <input
                              type="text"
                              {...register("preferred_airlines")}
                              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-travel-blue-dark"
                              placeholder="E.g., IndiGo, Air India"
                            />
                          </div>
                        </div>
                      </>
                    )}
                    
                    <div className="border-t border-gray-200 pt-6">
                      <h3 className="text-xl font-semibold text-travel-blue-dark mb-4">Passenger Details</h3>
                      
                      <div className="space-y-6">
                        <div>
                          <label className="block text-gray-700 font-medium mb-2">
                            Number of Passengers
                            {bookingType === "train" && (
                              <span className="text-sm text-gray-500 ml-2">(Maximum 6)</span>
                            )}
                          </label>
                          <div className="flex items-center">
                            <button 
                              type="button"
                              onClick={() => {
                                if (passengerCount > 1) {
                                  const newCount = passengerCount - 1;
                                  setPassengerCount(newCount);
                                  setPassengers(prev => prev.slice(0, newCount));
                                  setValue("passengers", newCount.toString());
                                }
                              }}
                              className="px-3 py-2 bg-gray-200 rounded-l-md border border-gray-300 hover:bg-gray-300 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                              disabled={passengerCount <= 1}
                            >
                              -
                            </button>
                            <div className="px-4 py-2 border-t border-b border-gray-300 bg-white text-center" style={{minWidth: "60px"}}>
                              {passengerCount}
                            </div>
                            <button 
                              type="button"
                              onClick={() => {
                                const maxPassengers = bookingType === "train" ? 6 : 20;
                                if (passengerCount < maxPassengers) {
                                  const newCount = passengerCount + 1;
                                  setPassengerCount(newCount);
                                  setPassengers(prev => [
                                    ...prev, 
                                    ...Array(newCount - prev.length).fill({ name: '', age: '', gender: 'male', dob: '', aadhar: '', inputMode: 'age' })
                                  ]);
                                  setValue("passengers", newCount.toString());
                                }
                              }}
                              className="px-3 py-2 bg-gray-200 rounded-r-md border border-gray-300 hover:bg-gray-300 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                              disabled={bookingType === "train" ? passengerCount >= 6 : false}
                            >
                              +
                            </button>
                          </div>
                        </div>

                        {passengers.map((passenger, index) => (
                          <div key={index} className="space-y-4 p-4 border rounded-md">
                            <h3 className="font-medium">Passenger {index + 1}</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                              <div>
                                <label className="block text-sm font-medium mb-1">Name <span className="text-rose-500">*</span></label>
                                <input
                                  type="text"
                                  value={passenger.name || ''}
                                  onChange={(e) => handlePassengerChange(index, 'name', e.target.value)}
                                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-travel-blue-dark"
                                  placeholder="Enter name"
                                  autoComplete="name"
                                />
                              </div>
                              
                              <div>
                                {/* Age/DOB Toggle */}
                                <div className="flex items-center justify-between mb-1">
                                  <label className="block text-sm font-medium">
                                    {passenger.inputMode === 'dob' ? 'Date of Birth' : 'Age'}
                                  </label>
                                  <button
                                    type="button"
                                    onClick={() => handlePassengerChange(index, 'inputMode', passenger.inputMode === 'age' ? 'dob' : 'age')}
                                    className="text-xs text-travel-blue-dark hover:text-travel-orange underline transition-colors"
                                  >
                                    Enter {passenger.inputMode === 'age' ? 'DOB' : 'Age'} instead
                                  </button>
                                </div>
                                
                                {passenger.inputMode === 'dob' ? (
                                  <>
                                    <input
                                      type="text"
                                      placeholder="DD/MM/YYYY or DD/MM/YY"
                                      onChange={(e) => handlePassengerChange(index, 'dobInput', e.target.value)}
                                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-travel-blue-dark"
                                      inputMode="numeric"
                                      autoComplete="bday"
                                    />
                                    {passenger.dob && passenger.age && (
                                      <p className="text-xs text-green-600 mt-1">
                                        ✓ Age: {passenger.age} years (DOB: {formatDateToDDMMYYYY(passenger.dob)})
                                      </p>
                                    )}
                                    <p className="text-xs text-gray-400 mt-1">Format: DD/MM/YYYY or DD/MM/YY</p>
                                  </>
                                ) : (
                                  <>
                                    <input
                                      type="text"
                                      inputMode="numeric"
                                      pattern="[0-9]*"
                                      value={passenger.age || ''}
                                      onChange={(e) => {
                                        const value = e.target.value.replace(/\D/g, '').slice(0, 3);
                                        handlePassengerChange(index, 'age', value);
                                      }}
                                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-travel-blue-dark"
                                      placeholder="Enter age"
                                      autoComplete="off"
                                    />
                                    {passenger.age && passenger.dob && (
                                      <p className="text-xs text-green-600 mt-1">
                                        ✓ DOB: {formatDateToDDMMYYYY(passenger.dob)}
                                      </p>
                                    )}
                                  </>
                                )}
                              </div>
                              
                              <div>
                                <label className="block text-sm font-medium mb-1">Gender <span className="text-rose-500">*</span></label>
                                <select
                                  value={passenger.gender || 'male'}
                                  onChange={(e) => handlePassengerChange(index, 'gender', e.target.value)}
                                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-travel-blue-dark"
                                >
                                  <option value="male">Male</option>
                                  <option value="female">Female</option>
                                  <option value="other">Other</option>
                                </select>
                              </div>
                            </div>
                            
                            <div className="mt-4">
                              <label className="block text-sm font-medium mb-1">
                                Aadhar Card Number <span className="text-gray-500 text-xs">(Optional)</span>
                              </label>
                              <input
                                type="text"
                                value={passenger.aadhar || ''}
                                onChange={(e) => {
                                  const value = e.target.value.replace(/\D/g, '').slice(0, 12);
                                  handlePassengerChange(index, 'aadhar', value);
                                }}
                                placeholder="Enter 12-digit Aadhar number"
                                className="w-full px-3 py-2 border rounded-md"
                                maxLength={12}
                              />
                              {passenger.aadhar && passenger.aadhar.length < 12 && passenger.aadhar.length > 0 && (
                                <p className="text-xs text-red-500 mt-1">Aadhar card number must be 12 digits</p>
                              )}
                              {passenger.aadhar && passenger.aadhar.length === 12 && (
                                <p className="text-xs text-green-600 mt-1">✓ Valid Aadhar number</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="border-t border-gray-200 pt-6">
                      <h3 className="text-xl font-semibold text-travel-blue-dark mb-4">Contact Information</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-gray-700 font-medium mb-2">
                            Full Name <span className="text-rose-500">*</span>
                          </label>
                          <div className="relative">
                            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                            <input
                              type="text"
                              {...register("name", { required: "Full name is required" })}
                              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-travel-blue-dark"
                              placeholder="Your full name"
                            />
                          </div>
                          {errors.name && <p className="text-red-500 text-sm mt-1">{String(errors.name.message)}</p>}
                        </div>
                        
                        <div>
                          <label className="block text-gray-700 font-medium mb-2">
                            Phone Number <span className="text-rose-500">*</span>
                          </label>
                          <div className="relative flex">
                            <div className="bg-gray-100 flex items-center px-3 border border-r-0 border-gray-300 rounded-l-md">
                              <span className="text-gray-600 font-medium">+91</span>
                            </div>
                            <div className="relative flex-1">
                              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                              <input
                                type="tel"
                                {...register("phone", { 
                                  required: "Phone number is required",
                                  pattern: { 
                                    value: /^[0-9]{10}$/, 
                                    message: "Enter a valid 10-digit phone number" 
                                  }
                                })}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-r-md focus:outline-none focus:ring-2 focus:ring-travel-blue-dark"
                                placeholder="10-digit number"
                                inputMode="numeric"
                                autoComplete="tel-national"
                                data-phone-input="true"
                              />
                            </div>
                          </div>
                          {errors.phone && <p className="text-red-500 text-sm mt-1">{String(errors.phone.message)}</p>}
                        </div>
                      </div>
                      
                      <div className="mt-6">
                        <label className="block text-gray-700 font-medium mb-2">
                          Email Address
                          <span className="text-sm text-gray-500 ml-2">(Optional)</span>
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                          <input
                            type="email"
                            {...register("email", { 
                              pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: "Enter a valid email address" }
                            })}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-travel-blue-dark"
                            placeholder="Your email address (optional)"
                          />
                        </div>
                        {errors.email && <p className="text-red-500 text-sm mt-1">{String(errors.email.message)}</p>}
                      </div>
                      
                      <div className="mt-6">
                        <label className="block text-gray-700 font-medium mb-2">Additional Requirements (Optional)</label>
                        <textarea
                          {...register("additional_requirements")}
                          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-travel-blue-dark"
                          placeholder="Any special requests or requirements"
                          rows={3}
                        ></textarea>
                      </div>
                    </div>
                    
                    <div className="border-t border-gray-200 pt-6">
                      {/* Add the Coupon Input component here */}
                      <h3 className="text-xl font-semibold text-travel-blue-dark mb-4">Apply Coupon</h3>
                      <div className="bg-gray-50 p-4 rounded-lg mb-6">
                        <CouponInput onApplyCoupon={handleApplyCoupon} />
                      </div>
                      
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="btn-primary py-3 px-8 flex items-center gap-2 touch-manipulation select-none"
                        style={{ WebkitTapHighlightColor: 'transparent' }}
                      >
                        {isLoading ? (
                          <>
                            <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                            <span>Processing...</span>
                          </>
                        ) : (
                          <span>Submit Booking Request</span>
                        )}
                      </button>
                      
                      {/* Display coupon discount if applied */}
                      {appliedCoupon && (
                        <div className="mt-4 p-4 bg-green-50 border border-green-100 rounded-md">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center text-green-700">
                              <Check className="mr-2 h-4 w-4" />
                              <span className="font-medium">
                                Coupon "{appliedCoupon.code}" applied successfully!
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={clearAppliedCoupon}
                              className="text-green-600 hover:text-green-800 text-sm underline"
                            >
                              Remove
                            </button>
                          </div>
                          <div className="mt-2 text-sm text-green-600">
                            <p>Original Amount: ₹{appliedCoupon.originalAmount}</p>
                            <p>Discount: {appliedCoupon.type === 'percentage' 
                              ? `${appliedCoupon.discount}% (₹${appliedCoupon.discountAmount.toFixed(2)})` 
                              : `₹${appliedCoupon.discount}`}</p>
                            <p className="font-semibold">Final Amount: ₹{appliedCoupon.finalAmount.toFixed(2)}</p>
                          </div>
                        </div>
                      )}
                      
                      <p className="text-sm text-gray-500 mt-4">
                        * By submitting this form, you agree to our Terms & Conditions and Privacy Policy.
                      </p>
                    </div>
                  </form>
                </div>
              </div>
              
              <div className="lg:col-span-1">
                <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
                  <h3 className="text-xl font-semibold text-travel-blue-dark mb-4">Booking Information</h3>
                  
                  {bookingType === "train" && (
                    <div className="space-y-6">
                      <div>
                        <h4 className="font-medium text-travel-blue-medium mb-2">About Train Bookings</h4>
                        <p className="text-gray-600 text-sm mb-3">
                          We offer both general and Tatkal train ticket bookings with a high success rate even during peak seasons.
                        </p>
                        <ul className="text-sm text-gray-600 space-y-2">
                          <li className="flex items-start gap-2">
                            <span className="text-travel-orange font-bold">✓</span>
                            <span>General bookings open 60 days in advance</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-travel-orange font-bold">✓</span>
                            <span>Tatkal bookings open at 10:15 AM for AC classes</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-travel-orange font-bold">✓</span>
                            <span>Tatkal bookings open at 11:15 AM for non-AC classes</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-travel-orange font-bold">✓</span>
                            <span>For Tatkal bookings, submit your request at least 2 hours before the booking window opens</span>
                          </li>
                        </ul>
                      </div>
                      
                      <div className="bg-travel-blue-dark/10 p-4 rounded-lg">
                        <h4 className="font-medium text-travel-blue-dark mb-2">Our Emergency Train ticket  Success Rate</h4>
                        <div className="flex items-center gap-2">
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div className="bg-travel-orange h-2.5 rounded-full" style={{ width: "95%" }}></div>
                          </div>
                          <span className="text-sm font-medium">95%</span>
                        </div>
                        <p className="text-xs text-gray-600 mt-2">
                          Based on our last 500+ Tatkal booking attempts
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {bookingType === "bus" && (
                    <div className="space-y-6">
                      <div>
                        <h4 className="font-medium text-travel-blue-medium mb-2">About Bus Bookings</h4>
                        <p className="text-gray-600 text-sm mb-3">
                          We offer bus ticket bookings across all major operators and routes in India with various comfort options.
                        </p>
                        <ul className="text-sm text-gray-600 space-y-2">
                          <li className="flex items-start gap-2">
                            <span className="text-travel-orange font-bold">✓</span>
                            <span>AC and Non-AC options available</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-travel-orange font-bold">✓</span>
                            <span>Sleeper and seater categories</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-travel-orange font-bold">✓</span>
                            <span>All major operators covered</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-travel-orange font-bold">✓</span>
                            <span>Door pickup available for select routes</span>
                          </li>
                        </ul>
                      </div>
                      
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-medium text-travel-blue-dark mb-2">Popular Bus Routes</h4>
                        <ul className="text-sm text-gray-600 space-y-1">
                          <li>Kakinada - Hyderabad </li>
                          <li>Kakinada - Tirupati </li>
                          <li>kakinda - Vijayawada</li>
                          <li>Kakinada - Vizag</li>
                          <li>Kakinada - Bangalore</li>
                          <li>Kakinada - Chennai</li>
                        </ul>
                      </div>
                    </div>
                  )}
                  
                  {bookingType === "flight" && (
                    <div className="space-y-6">
                      <div>
                        <h4 className="font-medium text-travel-blue-medium mb-2">About Flight Bookings</h4>
                        <p className="text-gray-600 text-sm mb-3">
                          We offer domestic and international flight bookings with competitive pricing and flexible options.
                        </p>
                        <ul className="text-sm text-gray-600 space-y-2">
                          <li className="flex items-start gap-2">
                            <span className="text-travel-orange font-bold">✓</span>
                            <span>All major airlines covered</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-travel-orange font-bold">✓</span>
                            <span>Competitive fare comparison</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-travel-orange font-bold">✓</span>
                            <span>Web check-in assistance</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-travel-orange font-bold">✓</span>
                            <span>Meal and seat selection assistance</span>
                          </li>
                        </ul>
                      </div>
                      
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-medium text-travel-blue-dark mb-2">Travel Documents Required</h4>
                        <ul className="text-sm text-gray-600 space-y-1">
                          <li>• Government issued photo ID</li>
                          <li>• Passport for international flights</li>
                          <li>• Visa (for international travel)</li>
                          <li>• Travel insurance (recommended)</li>
                        </ul>
                      </div>
                    </div>
                  )}
                  
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <h4 className="font-medium text-travel-blue-dark mb-3">Need Assistance?</h4>
                    <div className="flex items-center gap-3 mb-2">
                      <Phone size={18} className="text-travel-orange" />
                      <a href="tel:+918985816481" className="text-gray-600 hover:text-travel-orange">
                      +91 8985816481
                      </a>
                    </div>
                    <div className="flex items-center gap-3">
                      <Mail size={18} className="text-travel-orange" />
                      <a href="mailto:anandtravelsguide@gmail.com" className="text-gray-600 hover:text-travel-orange">
                        anandtravelsguide@gmail.com
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Booking;
