import { useState } from "react";
import { Phone, Mail, MapPin, Clock, Send } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useToast } from "@/hooks/use-toast";
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "General Inquiry",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Create message data
      const messageData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        subject: formData.subject,
        message: formData.message,
        created_at: serverTimestamp(),
        status: 'unread'
      };

      // Add to Firebase
      const docRef = await addDoc(collection(db, 'contact_submissions'), messageData);
      console.log('Message sent with ID:', docRef.id);
      
      toast({
        title: "Message Sent Successfully",
        description: "Thank you for contacting us. We'll get back to you shortly!",
      });
      
      setFormData({
        name: "",
        email: "",
        phone: "",
        subject: "General Inquiry",
        message: ""
      });
    } catch (error) {
      console.error("Error submitting form:", error);
      toast({
        title: "Submission Error",
        description: "There was an error sending your message. Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <div className="relative h-[40vh] min-h-[300px] bg-cover bg-center flex items-center" 
             style={{ backgroundImage: "linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url('https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg')" }}>
          <div className="container-custom text-white text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Contact Us</h1>
            <p className="text-xl max-w-3xl mx-auto">
              We're here to help you with all your travel needs. Reach out to us!
            </p>
          </div>
        </div>
        
        <section className="py-16">
          <div className="container-custom">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-8">
                <h2 className="text-2xl font-bold text-travel-blue-dark mb-6">Send Us a Message</h2>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="name" className="block text-gray-700 font-medium mb-2">Your Name</label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-travel-blue-dark"
                        placeholder="John Doe"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="email" className="block text-gray-700 font-medium mb-2">Your Email</label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-travel-blue-dark"
                        placeholder="john@example.com"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="phone" className="block text-gray-700 font-medium mb-2">Phone Number</label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-travel-blue-dark"
                        placeholder="+91 98765 43210"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="subject" className="block text-gray-700 font-medium mb-2">Subject</label>
                      <select
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-travel-blue-dark"
                      >
                        <option value="General Inquiry">General Inquiry</option>
                        <option value="Train Ticket Booking">Train Ticket Booking</option>
                        <option value="Tatkal Booking">Tatkal Booking</option>
                        <option value="Tour Package">Tour Package</option>
                        <option value="Flight Booking">Flight Booking</option>
                        <option value="Bus Booking">Bus Booking</option>
                        <option value="Cab Service">Cab Service</option>
                        <option value="Feedback">Feedback</option>
                        <option value="Complaint">Complaint</option>
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="message" className="block text-gray-700 font-medium mb-2">Your Message</label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows={6}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-travel-blue-dark"
                      placeholder="Please provide details of your inquiry..."
                    ></textarea>
                  </div>
                  
                  <div>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="btn-primary py-3 px-8 flex items-center gap-2"
                    >
                      {isSubmitting ? (
                        <>
                          <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                          <span>Sending...</span>
                        </>
                      ) : (
                        <>
                          <Send size={18} />
                          <span>Send Message</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
              
              <div className="bg-white rounded-lg shadow-md p-8">
                <h2 className="text-2xl font-bold text-travel-blue-dark mb-6">Contact Information</h2>
                
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="bg-travel-blue-dark/10 p-3 rounded-full">
                      <MapPin className="w-6 h-6 text-travel-blue-dark" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-travel-blue-dark mb-1">Office Address</h3>
                      <p className="text-gray-600">
                        Kakinada, India
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="bg-travel-blue-dark/10 p-3 rounded-full">
                      <Phone className="w-6 h-6 text-travel-blue-dark" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-travel-blue-dark mb-1">Phone Numbers</h3>
                      <p className="text-gray-600">
                        <a href="tel:+918985816481" className="hover:text-travel-orange">+91 8985816481</a>
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="bg-travel-blue-dark/10 p-3 rounded-full">
                      <Mail className="w-6 h-6 text-travel-blue-dark" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-travel-blue-dark mb-1">Email Address</h3>
                      <p className="text-gray-600">
                        <a href="mailto:anandtravelsguide@gmail.com" className="hover:text-travel-orange">anandtravelsguide@gmail.com</a>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        <section className="py-16 bg-gray-50">
          <div className="container-custom">
            <div className="text-center mb-12">
              <h2 className="section-title">Find Us</h2>
              <p className="text-gray-600 max-w-3xl mx-auto">
                Visit our office for a personal consultation with our travel experts
              </p>
            </div>
            
            <div className="rounded-lg overflow-hidden shadow-md h-[400px]">
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d61100.82538000701!2d82.21019765820313!3d16.978561100000003!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a382012d7e3114b%3A0x2b49fb96dd021f28!2sKakinada%2C%20Andhra%20Pradesh!5e0!3m2!1sen!2sin!4v1710612391331!5m2!1sen!2sin"
                width="100%" 
                height="100%" 
                style={{ border: 0 }} 
                allowFullScreen 
                loading="lazy"
                title="Office Location"
              ></iframe>
            </div>
          </div>
        </section>
        
        <section className="py-16">
          <div className="container-custom">
            <div className="text-center mb-12">
              <h2 className="section-title">Frequently Asked Questions</h2>
              <p className="text-gray-600 max-w-3xl mx-auto">
                Find quick answers to common questions about our services
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold text-travel-blue-dark mb-3">How do I book a Tatkal ticket through your agency?</h3>
                <p className="text-gray-600">
                  You can book Tatkal tickets by calling our dedicated Tatkal booking line, visiting our office, or submitting a request through our online booking form at least 2 hours before the Tatkal booking window opens.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold text-travel-blue-dark mb-3">What is your cancellation policy for tour packages?</h3>
                <p className="text-gray-600">
                  For domestic tour packages, cancellations made 15 days before departure incur a 10% fee, 7-14 days before incur 25%, and less than 7 days incur 50%. International packages have specific policies mentioned in the booking details.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold text-travel-blue-dark mb-3">Do you offer customized tour packages?</h3>
                <p className="text-gray-600">
                  Yes, we specialize in creating custom tour packages tailored to your preferences, budget, and schedule. Contact our team with your requirements for a personalized itinerary.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold text-travel-blue-dark mb-3">How can I pay for my bookings?</h3>
                <p className="text-gray-600">
                  We accept various payment methods including credit/debit cards, net banking, UPI transfers, and cash payments at our office. For tour packages, we offer installment options for bookings made well in advance.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold text-travel-blue-dark mb-3">Do you provide visa assistance for international trips?</h3>
                <p className="text-gray-600">
                  Yes, we provide comprehensive visa assistance for all international destinations, including documentation guidance, application filling, appointment scheduling, and follow-up services.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold text-travel-blue-dark mb-3">What is your success rate for Tatkal bookings?</h3>
                <p className="text-gray-600">
                  We maintain a success rate of over 90% for Tatkal bookings, even during peak seasons. Our specialized team and optimized systems ensure the highest probability of securing your tickets.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Contact;
