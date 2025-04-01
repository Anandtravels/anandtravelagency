import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const Privacy = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <div className="relative h-[30vh] min-h-[200px] bg-cover bg-center flex items-center" 
          style={{ backgroundImage: "linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url('/privacy-bg.jpg')" }}>
          <div className="container-custom text-white text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Privacy Policy</h1>
            <p className="text-xl">Your privacy is important to us</p>
          </div>
        </div>

        <section className="py-16">
          <div className="container-custom max-w-4xl">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="space-y-8">
                {/* Information Collection Section */}
                <div className="border-b pb-8">
                  <h2 className="text-2xl font-bold text-travel-blue-dark mb-4">1. Information Collection and Use</h2>
                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="bg-gray-50 p-6 rounded-lg">
                      <h3 className="text-xl font-semibold text-travel-blue-dark mb-3">Personal Information</h3>
                      <ul className="space-y-2 text-gray-600">
                        <li>• Name, email address, phone number</li>
                        <li>• Government-issued ID details</li>
                        <li>• Travel preferences and history</li>
                        <li>• Payment information</li>
                      </ul>
                    </div>
                    <div className="bg-gray-50 p-6 rounded-lg">
                      <h3 className="text-xl font-semibold text-travel-blue-dark mb-3">Usage Information</h3>
                      <ul className="space-y-2 text-gray-600">
                        <li>• Device and browser information</li>
                        <li>• IP address and location data</li>
                        <li>• Website usage patterns</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Use of Information Section */}
                <div className="border-b pb-8">
                  <h2 className="text-2xl font-bold text-travel-blue-dark mb-4">2. Use of Information</h2>
                  <ul className="space-y-2 text-gray-600">
                    <li>• Process travel bookings and reservations</li>
                    <li>• Communicate booking confirmations and updates</li>
                    <li>• Provide customer support</li>
                    <li>• Send relevant promotional offers</li>
                    <li>• Improve our services</li>
                  </ul>
                </div>

                {/* Data Protection Section */}
                <div className="border-b pb-8">
                  <h2 className="text-2xl font-bold text-travel-blue-dark mb-4">3. Data Protection</h2>
                  <ul className="space-y-2 text-gray-600">
                    <li>• SSL encryption for all transactions</li>
                    <li>• Secure data storage systems</li>
                    <li>• Regular security audits</li>
                    <li>• Staff training on data protection</li>
                  </ul>
                </div>

                {/* Your Rights Section */}
                <div className="border-b pb-8">
                  <h2 className="text-2xl font-bold text-travel-blue-dark mb-4">4. Your Rights</h2>
                  <ul className="space-y-2 text-gray-600">
                    <li>• Access your personal data</li>
                    <li>• Correct inaccurate information</li>
                    <li>• Request data deletion</li>
                    <li>• Opt-out of marketing communications</li>
                  </ul>
                </div>

                {/* Contact Section */}
                <div className="bg-gray-50 p-6 rounded-lg mt-8">
                  <h2 className="text-2xl font-bold text-travel-blue-dark mb-4">Contact Us</h2>
                  <p className="text-gray-600 mb-4">For privacy-related queries, contact us at:</p>
                  <ul className="space-y-2 text-gray-600">
                    <li>Email: anandtravelsguide@gmail.com</li>
                    <li>Phone: +91 8985816481</li>
                    <li>Address: Kakinada, India</li>
                  </ul>
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

export default Privacy;
