import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { EditFormData } from "@/types/admin";
import ProfitCalculator from "./ProfitCalculator";
import { StationAutocomplete } from "@/components/StationAutocomplete";
import { MultiSelectTrainAutocomplete } from "@/components/MultiSelectTrainAutocomplete";
import { useState, useEffect } from "react";

interface EditBookingModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  booking: any;
  formData: EditFormData;
  onFormChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  onSave: () => void;
}

const EditBookingModal = ({ isOpen, onOpenChange, booking, formData, onFormChange, onSave }: EditBookingModalProps) => {
  const [trainFromStation, setTrainFromStation] = useState(formData.from || '');
  const [trainToStation, setTrainToStation] = useState(formData.to || '');
  const [preferredTrains, setPreferredTrains] = useState(formData.preferred_trains || '');
  
  // Update station states when formData changes (when modal opens with booking data)
  useEffect(() => {
    setTrainFromStation(formData.from || '');
    setTrainToStation(formData.to || '');
    setPreferredTrains(formData.preferred_trains || '');
  }, [formData.from, formData.to, formData.preferred_trains, isOpen]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto p-0 bg-white rounded-xl shadow-xl border-0">
        <div className="sticky top-0 z-10 bg-gradient-to-r from-travel-blue-dark to-blue-600 text-white p-6 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-2xl font-bold">Edit Booking</DialogTitle>
              <p className="text-blue-100 text-sm mt-1">{booking?.name || ""} • {booking?.booking_type || ""}</p>
            </div>
            <div className="bg-white/20 rounded-lg p-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
            </div>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="px-6 pb-6">
          <div className="border-b border-gray-200 py-3 sticky top-[84px] bg-white z-10">
            <div className="flex overflow-x-auto hide-scrollbar" style={{scrollbarWidth: 'none'}}>
              {/* Navigation buttons */}
            </div>
          </div>

          <div className="space-y-8 mt-6">
            {/* Customer Details */}
            <section id="customer-section" className="scroll-mt-32 bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
              <h3 className="text-lg font-semibold text-travel-blue-dark mb-5">Customer Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-1.5 text-gray-700">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input type="text" name="name" value={formData.name} onChange={onFormChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg" required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5 text-gray-700">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input type="tel" name="phone" value={formData.phone} onChange={onFormChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg" required />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1.5 text-gray-700">Email Address (Optional)</label>
                  <input type="email" name="email" value={formData.email} onChange={onFormChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg" placeholder="Enter email address (optional)" />
                </div>
              </div>
              <div className="mt-4 text-xs text-gray-500">
                <span className="text-red-500">*</span> Required fields
              </div>
            </section>

            {/* Journey Details */}
            <section id="journey-section" className="scroll-mt-32 bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-800 mb-5">Journey Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {formData.booking_type === "train" ? (
                      <>
                        <div>
                          <StationAutocomplete
                            label="From"
                            value={trainFromStation}
                            onChange={(value) => {
                              setTrainFromStation(value);
                              onFormChange({ target: { name: 'from', value } } as any);
                            }}
                            placeholder="Search station name or code..."
                          />
                        </div>
                        <div>
                          <StationAutocomplete
                            label="To"
                            value={trainToStation}
                            onChange={(value) => {
                              setTrainToStation(value);
                              onFormChange({ target: { name: 'to', value } } as any);
                            }}
                            placeholder="Search station name or code..."
                          />
                        </div>
                      </>
                    ) : (
                      <>
                        <div>
                          <label className="block text-sm font-medium mb-1.5 text-gray-700">From</label>
                          <input type="text" name="from" value={formData.from} onChange={onFormChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1.5 text-gray-700">To</label>
                          <input type="text" name="to" value={formData.to} onChange={onFormChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg" />
                        </div>
                      </>
                    )}
                    <div>
                        <label className="block text-sm font-medium mb-1.5 text-gray-700">Journey Date</label>
                        <input type="date" name="journey_date" value={formData.journey_date} onChange={onFormChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1.5 text-gray-700">Service Type</label>
                        <select name="booking_type" value={formData.booking_type} onChange={onFormChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg">
                            <option value="">Select Type</option>
                            <option value="train">Train</option>
                            <option value="bus">Bus</option>
                            <option value="flight">Flight</option>
                            <option value="cab">Cab</option>
                        </select>
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium mb-1.5 text-gray-700">Passenger Details</label>
                        <textarea 
                          name="passengers" 
                          value={formData.passengers} 
                          onChange={onFormChange} 
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg font-mono text-sm" 
                          rows={6}
                          placeholder="Enter passenger details (one per line):&#10;Name (Age yrs, Gender)&#10;&#10;Examples:&#10;John Doe (25 yrs, male)&#10;Jane Smith (30, female)&#10;Bob Johnson (45 years, male)"
                        ></textarea>
                        <p className="text-xs text-gray-500 mt-1">
                          💡 <strong>Format:</strong> Name (Age yrs, Gender) - Each passenger on a new line
                          <br />
                          ✅ Accepts: "John (30 yrs, male)" or "John (30, male)" or "John (30 years, male)"
                        </p>
                    </div>
                </div>
            </section>

            {/* Train Booking Details */}
            {formData.booking_type === "train" && (
                <section id="train-section" className="scroll-mt-32 bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-800 mb-5">Train Booking Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium mb-1.5 text-gray-700">Booking Type</label>
                            <select name="train_booking_type" value={formData.train_booking_type} onChange={onFormChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg">
                                <option value="general">General</option>
                                <option value="tatkal">Tatkal</option>
                                <option value="premium_tatkal">Premium Tatkal</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1.5 text-gray-700">Class Preference</label>
                            <select name="train_class" value={formData.train_class} onChange={onFormChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg">
                                <option value="SL">Sleeper (SL)</option>
                                <option value="3A">AC 3-Tier (3A)</option>
                                <option value="3E">AC 3 Economy (3E)</option>
                                <option value="2A">AC 2-Tier (2A)</option>
                                <option value="2S">Second Sitting (2S)</option>
                                <option value="1A">AC First Class (1A)</option>
                                <option value="CC">Chair Car (CC)</option>
                                <option value="EC">Executive Chair Car (EC)</option>
                            </select>
                        </div>
                        <div className="md:col-span-2">
                            <MultiSelectTrainAutocomplete
                              label="Preferred Trains (Optional)"
                              required={false}
                              value={preferredTrains}
                              onChange={(value) => {
                                setPreferredTrains(value);
                                // Update formData through synthetic event
                                const syntheticEvent = {
                                  target: {
                                    name: 'preferred_trains',
                                    value: value
                                  }
                                } as React.ChangeEvent<HTMLInputElement>;
                                onFormChange(syntheticEvent);
                              }}
                              placeholder="Search by train number or name (e.g., 12345 or Rajdhani)"
                            />
                        </div>
                    </div>
                </section>
            )}

            {/* Special Requirements */}
            <section id="requirements-section" className="scroll-mt-32 bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-800 mb-5">Special Requirements</h3>
                <textarea 
                  name="additional_requirements" 
                  value={formData.additional_requirements} 
                  onChange={onFormChange} 
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg" 
                  rows={4}
                  placeholder="Enter special requirements (e.g., lower berth, window seat, wheelchair assistance, meal preference, etc.)"
                ></textarea>
                <div className="mt-2 flex flex-wrap gap-2">
                  <span className="text-xs text-gray-500">Common requirements:</span>
                  {['Lower berth preferred', 'Window seat', 'Wheelchair assistance', 'Vegetarian meal', 'Senior citizen', 'Pregnant woman', 'Child berth'].map((req) => (
                    <button
                      key={req}
                      type="button"
                      onClick={() => {
                        const currentValue = formData.additional_requirements || '';
                        const newValue = currentValue ? `${currentValue}\n${req}` : req;
                        onFormChange({ target: { name: 'additional_requirements', value: newValue } } as any);
                      }}
                      className="text-xs px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-md transition-colors"
                    >
                      + {req}
                    </button>
                  ))}
                </div>
            </section>

            {/* Ticket Details */}
            <section id="ticket-section" className="scroll-mt-32 bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-800 mb-5">Ticket Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <label className="block text-sm font-medium mb-1.5 text-gray-700">Ticket Number</label>
                        <input type="text" name="ticket_number" value={formData.ticket_number} onChange={onFormChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1.5 text-gray-700">PNR</label>
                        <input type="text" name="pnr" value={formData.pnr} onChange={onFormChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1.5 text-gray-700">Train Number</label>
                        <input type="text" name="train_number" value={formData.train_number} onChange={onFormChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1.5 text-gray-700">Booking Reference</label>
                        <input type="text" name="booking_reference" value={formData.booking_reference} onChange={onFormChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1.5 text-gray-700">Tatkal Booking Date</label>
                        <input type="date" name="tatkal_booking_date" value={formData.tatkal_booking_date} onChange={onFormChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg" />
                    </div>
                    <div className="md:col-span-3">
                        <label className="block text-sm font-medium mb-1.5 text-gray-700">Fare Details</label>
                        <textarea name="fare_details" value={formData.fare_details} onChange={onFormChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg" rows={3}></textarea>
                    </div>
                </div>
            </section>

            {/* Booking Mode Section */}
            {formData.booking_type === "train" && (
              <section id="booking-mode-section" className="scroll-mt-32 bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-800 mb-5">Booking Mode</h3>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 p-4 sm:p-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl border-2 border-blue-100">
                  {/* Icon and Label */}
                  <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                    <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-base sm:text-lg md:text-xl font-bold text-gray-800 leading-tight">
                        {formData.advance_booking === true ? 'Advance Booking' : 'Regular Booking'}
                      </h4>
                      <p className="text-xs sm:text-sm text-gray-600 mt-0.5 sm:mt-1">
                        {formData.advance_booking === true 
                          ? 'Book well in advance' 
                          : 'Standard booking'}
                      </p>
                    </div>
                  </div>

                  {/* Toggle Button */}
                  <button
                    type="button"
                    onClick={() => {
                      const newValue = !formData.advance_booking;
                      onFormChange({ 
                        target: { 
                          name: 'advance_booking', 
                          value: newValue 
                        } 
                      } as any);
                    }}
                    className={`
                      relative flex-shrink-0 transition-all duration-300 ease-in-out rounded-full shadow-lg
                      h-8 w-16 sm:h-10 sm:w-20 md:h-12 md:w-24
                      ${formData.advance_booking === true
                        ? 'bg-gradient-to-r from-green-500 to-emerald-600 shadow-green-200' 
                        : 'bg-gradient-to-r from-gray-300 to-gray-400 shadow-gray-200'
                      }
                      hover:shadow-xl transform hover:scale-105
                    `}
                    aria-label={formData.advance_booking === true ? 'Switch to Regular Booking' : 'Switch to Advance Booking'}
                  >
                    {/* Toggle Circle */}
                    <span
                      className={`
                        absolute top-1 transition-all duration-300 ease-in-out
                        bg-white rounded-full shadow-md flex items-center justify-center
                        h-6 w-6 sm:h-8 sm:w-8 md:h-10 md:w-10
                        ${formData.advance_booking === true 
                          ? 'left-[calc(100%-1.75rem)] sm:left-[calc(100%-2.25rem)] md:left-[calc(100%-2.75rem)]' 
                          : 'left-1'
                        }
                      `}
                    >
                      {formData.advance_booking === true ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      )}
                    </span>
                  </button>
                </div>

                {/* Info Box */}
                <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
                  <div className="flex items-start gap-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="flex-1">
                      <p className="text-sm text-blue-800 font-medium mb-1">About Booking Modes</p>
                      <ul className="text-xs text-blue-700 space-y-1">
                        <li className="flex items-start gap-2">
                          <span className="text-green-600 mt-0.5">✓</span>
                          <span><strong>Advance Booking:</strong> Bookings made well in advance for future travel dates</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-gray-600 mt-0.5">•</span>
                          <span><strong>Regular Booking:</strong> Standard bookings for immediate or near-term travel</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* Pricing & Commission Details */}
            <section id="pricing-section" className="scroll-mt-32 bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-800 mb-5">Pricing & Commission Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                    <div>
                        <label className="block text-sm font-medium mb-1.5 text-gray-700">Ticket Cost (₹)</label>
                        <input type="number" name="ticket_cost" value={formData.ticket_cost} onChange={onFormChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg" step="0.01" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1.5 text-gray-700">Actual Price (₹)</label>
                        <input type="number" name="actual_price" value={formData.actual_price} onChange={onFormChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg" step="0.01" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1.5 text-gray-700">Commission Amount (₹)</label>
                        <input type="number" name="commission_amount" value={formData.commission_amount} onChange={onFormChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg" step="0.01" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1.5 text-gray-700">Profit Amount (₹)</label>
                        <input type="number" name="profit_amount" value={formData.profit_amount} onChange={onFormChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg" step="0.01" />
                    </div>
                </div>
                
                {/* Real-time Profit Calculator */}
                <ProfitCalculator formData={formData} className="mb-4" />
                
                <div className="p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-700">
                        <strong>Note:</strong> Commission can be manually entered or will be automatically calculated based on booking type if left empty. 
                        Profit = Actual Price - Ticket Cost - Commission Amount.
                    </p>
                </div>
            </section>
          </div>

          <div className="sticky bottom-0 mt-8 pt-4 pb-1 bg-white flex flex-col sm:flex-row-reverse gap-2 border-t border-gray-200">
            <Button type="submit" className="w-full sm:w-auto py-3 px-8 text-base font-medium shadow-lg">Save Changes</Button>
            <Button type="button" variant="outline" className="w-full sm:w-auto py-3 px-6 text-base" onClick={() => onOpenChange(false)}>Cancel</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditBookingModal;
