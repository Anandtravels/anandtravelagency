import { useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { ChevronDown } from 'lucide-react';

const faqs = [
  {
    category: "Train Bookings",
    questions: [
      {
        question: "How do I book a train ticket through your agency?",
        answer: "You can book train tickets in three ways: Through our website, by calling us at +91 88888 88888, or by visiting our office. For Tatkal bookings, contact us 2 hours before the booking window opens."
      },
      {
        question: "What documents are needed for train booking?",
        answer: "You'll need: Valid ID proof (Aadhar/PAN/Passport), Passenger details including age and gender, Journey details (date, train number if preferred), and Payment method."
      },
      {
        question: "What is your success rate for Tatkal bookings?",
        answer: "We maintain a success rate of over 90% for Tatkal bookings through our advanced booking system and dedicated team. We handle hundreds of Tatkal bookings daily during peak seasons."
      }
    ]
  },
  {
    category: "Tour Packages",
    questions: [
      {
        question: "Do you offer customized tour packages?",
        answer: "Yes, we specialize in creating personalized tour packages. We consider your preferences, budget, duration, and specific requirements to craft the perfect itinerary for individuals, families, and groups."
      },
      {
        question: "What's included in your tour packages?",
        answer: "Our packages typically include: Transportation (flights/trains/buses), Accommodation, Daily breakfast, Sightseeing with guide, All transfers, Taxes and fees. Specific inclusions vary by package type."
      }
    ]
  },
  {
    category: "International Travel",
    questions: [
      {
        question: "Do you provide visa assistance?",
        answer: "Yes, we offer comprehensive visa assistance including: Documentation guidance, Form filling, Appointment scheduling, Interview preparation, and Follow-up services for all major countries."
      },
      {
        question: "What travel insurance options do you offer?",
        answer: "We provide various travel insurance options covering medical emergencies, trip cancellations, lost baggage, and other travel-related incidents. Coverage and premiums vary by destination and duration."
      }
    ]
  }
].flatMap(category => category.questions);

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <div className="relative h-[30vh] min-h-[200px] bg-cover bg-center flex items-center" 
          style={{ backgroundImage: "linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url('/faq-bg.jpg')" }}>
          <div className="container-custom text-white text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Frequently Asked Questions</h1>
            <p className="text-xl">Find answers to common questions about our services</p>
          </div>
        </div>

        <section className="py-16">
          <div className="container-custom max-w-3xl">
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div key={index} className="bg-white rounded-lg shadow-sm">
                  <button
                    onClick={() => toggleFaq(index)}
                    className="w-full px-6 py-4 text-left flex justify-between items-center"
                  >
                    <span className="font-medium text-travel-blue-dark">{faq.question}</span>
                    <ChevronDown 
                      className={`w-5 h-5 text-travel-blue-dark transition-transform ${
                        openIndex === index ? 'transform rotate-180' : ''
                      }`} 
                    />
                  </button>
                  {openIndex === index && (
                    <div className="px-6 py-4 text-gray-600 border-t">
                      {faq.answer}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default FAQ;
