import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { EditFormData } from "@/types/admin";
import ProfitCalculator from "./ProfitCalculator";
import { StationAutocomplete } from "@/components/StationAutocomplete";
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
  
  // Update station states when formData changes (when modal opens with booking data)
  useEffect(() => {
    setTrainFromStation(formData.from || '');
    setTrainToStation(formData.to || '');
  }, [formData.from, formData.to, isOpen]);
  
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
                                <option value="2A">AC 2-Tier (2A)</option>
                                <option value="1A">AC First Class (1A)</option>
                            </select>
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium mb-1.5 text-gray-700">Preferred Trains</label>
                            <input type="text" name="preferred_trains" value={formData.preferred_trains} onChange={onFormChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg" />
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
