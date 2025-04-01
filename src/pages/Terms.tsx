import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const Terms = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <div className="relative h-[30vh] min-h-[200px] bg-cover bg-center flex items-center" 
          style={{ backgroundImage: "linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url('/terms-bg.jpg')" }}>
          <div className="container-custom text-white text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Terms & Conditions</h1>
            <p className="text-xl">Please read these terms carefully</p>
          </div>
        </div>

        <section className="py-16">
          <div className="container-custom max-w-4xl">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="space-y-8">
                {/* Booking Terms Section */}
                <div className="border-b pb-8">
                  <h2 className="text-2xl font-bold text-travel-blue-dark mb-6">1. Booking Terms</h2>
                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="bg-gray-50 p-6 rounded-lg">
                      <h3 className="text-xl font-semibold text-travel-blue-dark mb-3">Reservations</h3>
                      <ul className="space-y-2 text-gray-600">
                        <li>• All bookings subject to availability</li>
                        <li>• Valid ID proof required</li>
                        <li>• Advance payment may be required</li>
                      </ul>
                    </div>
                    <div className="bg-gray-50 p-6 rounded-lg">
                      <h3 className="text-xl font-semibold text-travel-blue-dark mb-3">Payment Terms</h3>
                      <ul className="space-y-2 text-gray-600">
                        <li>• Full payment for tickets</li>
                        <li>• 50% advance for packages</li>
                        <li>• Balance 30 days before departure</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Cancellation & Refunds Section */}
                <div className="border-b pb-8">
                  <h2 className="text-2xl font-bold text-travel-blue-dark mb-6">2. Cancellation & Refunds</h2>
                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="bg-gray-50 p-6 rounded-lg">
                      <h3 className="text-xl font-semibold text-travel-blue-dark mb-3">Train Tickets</h3>
                      <ul className="space-y-2 text-gray-600">
                        <li>• As per Indian Railways policy</li>
                        <li>• Service charge non-refundable</li>
                        <li>• Tatkal tickets non-refundable</li>
                      </ul>
                    </div>
                    <div className="bg-gray-50 p-6 rounded-lg">
                      <h3 className="text-xl font-semibold text-travel-blue-dark mb-3">Tour Packages</h3>
                      <ul className="space-y-2 text-gray-600">
                        <li>• 30+ days: 10% of package cost</li>
                        <li>• 15-29 days: 25% of package cost</li>
                        <li>• 7-14 days: 50% of package cost</li>
                        <li>• Less than 7 days: 100% of package cost</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Travel Insurance Section */}
                <div className="border-b pb-8">
                  <h2 className="text-2xl font-bold text-travel-blue-dark mb-6">3. Travel Insurance</h2>
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <ul className="space-y-2 text-gray-600">
                      <li>• Recommended for all bookings</li>
                      <li>• Mandatory for international packages</li>
                      <li>• Terms as per insurance provider</li>
                    </ul>
                  </div>
                </div>

                {/* Liability Section */}
                <div className="border-b pb-8">
                  <h2 className="text-2xl font-bold text-travel-blue-dark mb-6">4. Liability</h2>
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <p className="text-gray-600">Anand Travel Agency acts as a booking agent and is not liable for:</p>
                    <ul className="space-y-2 text-gray-600">
                      <li>• Schedule changes by carriers</li>
                      <li>• Natural disasters or force majeure events</li>
                      <li>• Loss of personal belongings</li>
                      <li>• Third-party service issues</li>
                    </ul>
                  </div>
                </div>

                {/* Documentation Section */}
                <div className="border-b pb-8">
                  <h2 className="text-2xl font-bold text-travel-blue-dark mb-6">5. Documentation</h2>
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <p className="text-gray-600">Travelers are responsible for:</p>
                    <ul className="space-y-2 text-gray-600">
                      <li>• Valid ID proofs</li>
                      <li>• Passport and visa requirements</li>
                      <li>• Travel insurance documentation</li>
                      <li>• Health certificates if required</li>
                    </ul>
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

export default Terms;
