import { useState } from "react";
import { useForm } from "react-hook-form";
import { Calendar, MapPin, User, Phone, Mail, Train, Bus, Plane, Car } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useToast } from "@/hooks/use-toast";
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const Booking = () => {
  const [bookingType, setBookingType] = useState("train");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const [passengerCount, setPassengerCount] = useState(1);
  const [passengers, setPassengers] = useState([
    { name: '', age: '', gender: 'male' }
  ]);
  const [flightTripType, setFlightTripType] = useState("one_way");

  const { register, handleSubmit, reset, formState: { errors }, setValue } = useForm({
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
      drop_point: "", // Add this new field
      // Cab-specific fields
      cab_type: "sedan",
      cab_trip_type: "one_way",
      pickup_address: ""
    }
  });
  
  const handleBookingTypeChange = (type) => {
    setBookingType(type);
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
      drop_point: "", // Add this new field
      cab_type: "sedan",
      cab_trip_type: "one_way",
      pickup_address: ""
    });
  };

  const handlePassengerCountChange = (e) => {
    const count = parseInt(e.target.value);
    setPassengerCount(count);
    setPassengers(prev => {
      if (count > prev.length) {
        return [...prev, ...Array(count - prev.length).fill({ name: '', age: '', gender: 'male' })];
      }
      return prev.slice(0, count);
    });
  };

  const handlePassengerChange = (index: number, field: string, value: string) => {
    const updatedPassengers = [...passengers.map(passenger => ({...passenger}))];
    updatedPassengers[index] = {
      ...updatedPassengers[index],
      [field]: value
    };
    setPassengers(updatedPassengers);
  };
  
  const onSubmit = async (data) => {
    setIsLoading(true);
    
    try {
      const bookingData = {
        ...data,
        phone: "+91" + data.phone,
        booking_type: bookingType,
        passengers: passengers,
        status: "pending",
        created_at: serverTimestamp()
      };
      
      const docRef = await addDoc(collection(db, 'bookings'), bookingData);
      
      toast({
        title: "Booking Submitted Successfully",
        description: "We've received your booking request. Our team will contact you shortly!",
      });
      
      reset({
        phone: "",
        name: "",
        email: "",
        from: "",
        to: "",
        journey_date: "",
        passengers: "",
        additional_requirements: "",
        train_booking_type: "general",
        train_class: "SL",
        preferred_trains: "",
        flight_trip_type: "one_way",
        flight_class: "economy",
        return_date: "",
        preferred_airlines: "",
        bus_type: "ac_seater",
        boarding_point: "",
        drop_point: "", // Add this new field
        cab_type: "sedan",
        cab_trip_type: "one_way",
        pickup_address: ""
      });
    } catch (error) {
      console.error("Error submitting booking:", error);
      toast({
        title: "Submission Error",
        description: "There was an error processing your booking. Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
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
              
              <button
                type="button"
                onClick={() => handleBookingTypeChange("cab")}
                className={`flex flex-col items-center gap-2 p-4 rounded-lg transition-colors ${
                  bookingType === "cab"
                    ? "bg-travel-blue-dark text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <Car className={`w-8 h-8 ${bookingType === "cab" ? "text-travel-orange" : "text-travel-blue-dark"}`} />
                <span className="font-medium">Cab Service</span>
              </button>
            </div>
          </div>
        </section>
        
        <section className="py-16 bg-gray-50">
          <div className="container-custom">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <div className="bg-white rounded-lg shadow-md p-8">
                  <h2 className="text-2xl font-bold text-travel-blue-dark mb-6">
                    {bookingType === "train" && "Train Ticket Booking"}
                    {bookingType === "bus" && "Bus Ticket Booking"}
                    {bookingType === "flight" && "Flight Ticket Booking"}
                    {bookingType === "cab" && "Cab Service Booking"}
                  </h2>
                  
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-gray-700 font-medium mb-2">
                          Journey Date <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                          <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                          <input
                            type="date"
                            {...register("journey_date", { required: "Journey date is required" })}
                            min={new Date().toISOString().split('T')[0]}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-travel-blue-dark"
                          />
                        </div>
                        {errors.journey_date && <p className="text-red-500 text-sm mt-1">{String(errors.journey_date.message)}</p>}
                      </div>
                    </div>
                    
                    {bookingType === "train" && (
                      <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-gray-700 font-medium mb-2">
                              Booking Type <span className="text-rose-500">*</span>
                            </label>
                            <select
                              {...register("train_booking_type", { required: "Booking type is required" })}
                              defaultValue="general"
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
                              <option value="2A">AC 2-Tier (2A)</option>
                              <option value="1A">AC First Class (1A)</option>
                              <option value="CC">Chair Car (CC)</option>
                              <option value="EC">Executive Chair Car (EC)</option>
                            </select>
                            {errors.train_class && <p className="text-red-500 text-sm mt-1">{String(errors.train_class.message)}</p>}
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-gray-700 font-medium mb-2">Preferred Trains (Optional)</label>
                          <textarea
                            {...register("preferred_trains")}
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-travel-blue-dark"
                            placeholder="Enter train numbers or names if you have specific preferences"
                            rows={2}
                          ></textarea>
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
                                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                  type="date"
                                  {...register("return_date")}
                                  min={new Date().toISOString().split('T')[0]}
                                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-travel-blue-dark"
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
                    
                    {bookingType === "cab" && (
                      <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-gray-700 font-medium mb-2">
                              Cab Type <span className="text-rose-500">*</span>
                            </label>
                            <select
                              {...register("cab_type", { required: "Cab type is required" })}
                              defaultValue="sedan"
                              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-travel-blue-dark"
                            >
                              <option value="hatchback">Hatchback</option>
                              <option value="sedan">Sedan</option>
                              <option value="suv">SUV</option>
                              <option value="luxury">Luxury</option>
                              <option value="tempo_traveller">Tempo Traveller</option>
                            </select>
                            {errors.cab_type && <p className="text-red-500 text-sm mt-1">{String(errors.cab_type.message)}</p>}
                          </div>
                          
                          <div>
                            <label className="block text-gray-700 font-medium mb-2">
                              Trip Type <span className="text-rose-500">*</span>
                            </label>
                            <select
                              {...register("cab_trip_type", { required: "Trip type is required" })}
                              defaultValue="one_way"
                              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-travel-blue-dark"
                            >
                              <option value="one_way">One Way</option>
                              <option value="round_trip">Round Trip</option>
                              <option value="local">Local Package</option>
                              <option value="outstation">Outstation Package</option>
                            </select>
                            {errors.cab_trip_type && <p className="text-red-500 text-sm mt-1">{String(errors.cab_trip_type.message)}</p>}
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-gray-700 font-medium mb-2">
                            Pickup Address <span className="text-rose-500">*</span>
                          </label>
                          <textarea
                            {...register("pickup_address", { required: "Pickup address is required" })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-travel-blue-dark"
                            placeholder="Enter complete pickup address with landmark"
                            rows={2}
                          ></textarea>
                          {errors.pickup_address && <p className="text-red-500 text-sm mt-1">{String(errors.pickup_address.message)}</p>}
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
                                    ...Array(newCount - prev.length).fill({ name: '', age: '', gender: 'male' })
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
                                <label className="block text-sm font-medium mb-1">Name</label>
                                <input
                                  type="text"
                                  value={passenger.name || ''}
                                  onChange={(e) => handlePassengerChange(index, 'name', e.target.value)}
                                  className="w-full px-3 py-2 border rounded-md"
                                  required
                                />
                              </div>
                              
                              <div>
                                <label className="block text-sm font-medium mb-1">Age</label>
                                <input
                                  type="number"
                                  value={passenger.age || ''}
                                  onChange={(e) => handlePassengerChange(index, 'age', e.target.value)}
                                  className="w-full px-3 py-2 border rounded-md"
                                  required
                                />
                              </div>
                              
                              <div>
                                <label className="block text-sm font-medium mb-1">Gender</label>
                                <select
                                  value={passenger.gender || 'male'}
                                  onChange={(e) => handlePassengerChange(index, 'gender', e.target.value)}
                                  className="w-full px-3 py-2 border rounded-md"
                                  required
                                >
                                  <option value="male">Male</option>
                                  <option value="female">Female</option>
                                  <option value="other">Other</option>
                                </select>
                              </div>
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
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="btn-primary py-3 px-8 flex items-center gap-2"
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
                            <span>Tatkal bookings open at 10:00 AM for AC classes</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-travel-orange font-bold">✓</span>
                            <span>Tatkal bookings open at 11:00 AM for non-AC classes</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-travel-orange font-bold">✓</span>
                            <span>For Tatkal bookings, submit your request at least 2 hours before the booking window opens</span>
                          </li>
                        </ul>
                      </div>
                      
                      <div className="bg-travel-blue-dark/10 p-4 rounded-lg">
                        <h4 className="font-medium text-travel-blue-dark mb-2">Our Tatkal Success Rate</h4>
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
                  
                  {bookingType === "cab" && (
                    <div className="space-y-6">
                      <div>
                        <h4 className="font-medium text-travel-blue-medium mb-2">About Cab Services</h4>
                        <p className="text-gray-600 text-sm mb-3">
                          We offer reliable and comfortable cab services for various travel needs with transparent pricing.
                        </p>
                        <ul className="text-sm text-gray-600 space-y-2">
                          <li className="flex items-start gap-2">
                            <span className="text-travel-orange font-bold">✓</span>
                            <span>One-way and round trip options</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-travel-orange font-bold">✓</span>
                            <span>Local and outstation packages</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-travel-orange font-bold">✓</span>
                            <span>Airport transfers</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-travel-orange font-bold">✓</span>
                            <span>Professional and experienced drivers</span>
                          </li>
                        </ul>
                      </div>
                      
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-medium text-travel-blue-dark mb-2">Cab Types Available</h4>
                        <ul className="text-sm text-gray-600 space-y-1">
                          <li>• Hatchback - Economy option for 2-3 passengers</li>
                          <li>• Sedan - Comfort option for 3-4 passengers</li>
                          <li>• SUV - Spacious option for 5-6 passengers</li>
                          <li>• Luxury - Premium cars for a superior experience</li>
                          <li>• Tempo Traveller - For groups of 10-12 passengers</li>
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
