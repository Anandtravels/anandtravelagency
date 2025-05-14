import { motion } from "framer-motion";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { 
  Shield, 
  Lock, 
  UserCheck, 
  Globe, 
  Bell, 
  RefreshCw, 
  Mail, 
  FileText, 
  Key, 
  Share2, 
  Cookie, 
  ShieldAlert 
} from "lucide-react";

const Privacy = () => {
  const sections = [
    {
      icon: Shield,
      title: "Information We Collect",
      content: [
        "1. Personal Information:",
        "• Full name and title",
        "• Contact details (phone number, email address)",
        "• Travel document details (passport/ID numbers when required)",
        "• Travel preferences and special requirements",
        "• Emergency contact information",
        "",
        "2. Booking Information:",
        "• Travel dates and destinations",
        "• Ticket/booking preferences",
        "• Seat/accommodation preferences",
        "• Special assistance requirements",
        "",
        "3. Payment Information:",
        "• Payment method details",
        "• Transaction records",
        "• Billing address",
        "Note: All payment processing is handled securely through trusted payment processors."
      ]
    },
    {
      icon: Lock,
      title: "How We Protect Your Data",
      content: [
        "1. Security Measures:",
        "• Industry-standard SSL encryption",
        "• Secure data storage systems",
        "• Regular security audits and updates",
        "• Access control and authentication",
        "",
        "2. Data Storage:",
        "• Secure servers located in India",
        "• Regular data backups",
        "• Limited staff access",
        "• Encrypted databases"
      ]
    },
    {
      icon: UserCheck,
      title: "How We Use Your Information",
      content: [
        "1. Primary Uses:",
        "• Processing your travel bookings",
        "• Communicating booking confirmations",
        "• Sending important travel updates",
        "• Providing customer support",
        "",
        "2. Service Improvement:",
        "• Analyzing service quality",
        "• Personalizing user experience",
        "• Improving our offerings",
        "",
        "3. Legal Requirements:",
        "• Compliance with travel regulations",
        "• Tax and accounting purposes",
        "• Legal obligations and disputes"
      ]
    },
    {
      icon: Share2,
      title: "Information Sharing",
      content: [
        "We may share your information with:",
        "• Travel service providers (airlines, hotels, etc.)",
        "• Payment processors",
        "• Government authorities (when legally required)",
        "",
        "We DO NOT:",
        "• Sell your personal data",
        "• Share data for marketing purposes",
        "• Provide data to unauthorized third parties"
      ]
    },
    {
      icon: Cookie,
      title: "Cookies & Tracking",
      content: [
        "We use cookies for:",
        "• Session management",
        "• User preferences",
        "• Essential website functionality",
        "",
        "You can control cookies through:",
        "• Browser settings",
        "• Cookie preference center",
        "• Third-party opt-out tools"
      ]
    },
    {
      icon: Key,
      title: "Your Rights",
      content: [
        "You have the right to:",
        "• Access your personal data",
        "• Request data correction",
        "• Delete your account",
        "• Export your data",
        "• Opt-out of communications",
        "• Withdraw consent",
        "",
        "To exercise these rights, contact us at:",
        "privacy@anandtravels.com"
      ]
    },
    {
      icon: ShieldAlert,
      title: "Data Retention & Deletion",
      content: [
        "1. Retention Period:",
        "• Active accounts: Duration of service",
        "• Inactive accounts: 24 months",
        "• Financial records: 7 years (legal requirement)",
        "",
        "2. Deletion Process:",
        "• Automated after retention period",
        "• On user request (30-day process)",
        "• Immediate for marketing data"
      ]
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        {/* Hero Section */}
        <div className="relative h-[40vh] min-h-[300px] bg-cover bg-center flex items-center" 
             style={{ backgroundImage: "linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url('https://images.pexels.com/photos/5473298/pexels-photo-5473298.jpeg')" }}>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="container-custom text-white text-center"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Privacy Policy</h1>
            <p className="text-xl max-w-3xl mx-auto">
              Your privacy is our top priority. Learn how we protect and handle your information.
            </p>
            <p className="mt-4 text-gray-300">Last Updated: {new Date().toLocaleDateString()}</p>
          </motion.div>
        </div>

        {/* Content Section */}
        <div className="py-16 bg-gradient-to-b from-gray-50 to-white">
          <div className="container-custom max-w-4xl">
            {/* Add an introduction section */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mb-8 text-center"
            >
              <p className="text-gray-600 max-w-3xl mx-auto">
                This Privacy Policy explains how Anand Travel Agency ("we," "our," or "us") 
                collects, uses, and protects your personal information. By using our services, 
                you consent to the practices described in this policy.
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl shadow-xl overflow-hidden"
            >
              {sections.map((section, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className={`p-8 ${index !== sections.length - 1 ? 'border-b' : ''}`}
                >
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 rounded-full bg-travel-blue-dark/10 flex items-center justify-center">
                      <section.icon className="w-6 h-6 text-travel-blue-dark" />
                    </div>
                    <h2 className="text-2xl font-bold text-travel-blue-dark">{section.title}</h2>
                  </div>
                  <div className="space-y-3 text-gray-600">
                    {section.content.map((item, i) => (
                      <motion.p 
                        key={i}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 * i }}
                        className={item.startsWith('•') ? 'pl-6' : 'font-medium text-gray-800'}
                      >
                        {item}
                      </motion.p>
                    ))}
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* Contact Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-12 text-center"
            >
              <h3 className="text-2xl font-bold text-travel-blue-dark mb-6">Have Questions About Our Privacy Policy?</h3>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <a href="mailto:anandtravelsguide@gmail.com" 
                   className="btn-primary inline-flex items-center justify-center gap-2">
                  <Mail size={20} />
                  Contact Us
                </a>
                <a href="/terms" 
                   className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2 px-6 rounded-md transition-colors inline-flex items-center justify-center gap-2">
                  <Globe size={20} />
                  Terms & Conditions
                </a>
              </div>
            </motion.div>

            {/* Add a footer note */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="mt-8 text-center text-sm text-gray-500"
            >
              <p>This privacy policy was last updated on {new Date().toLocaleDateString()}</p>
              <p className="mt-2">
                For any privacy-related concerns, please contact our Data Protection Officer at{" "}
                <a href="mailto:privacy@anandtravels.com" className="text-travel-blue-dark hover:underline">
                  privacy@anandtravels.com
                </a>
              </p>
            </motion.div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Privacy;
