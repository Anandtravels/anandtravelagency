import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle, ArrowRight, Phone, Mail, FileText } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const EServiceSuccess = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow bg-gray-50 py-16">
        <div className="container-custom max-w-2xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="bg-green-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>

            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Application Submitted Successfully!
            </h1>
            
            <p className="text-lg text-gray-600 mb-8">
              Thank you for choosing our e-services. Your application has been received 
              and our team will contact you within 24 hours to confirm the details.
            </p>

            <Card className="mb-8">
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold text-travel-blue-dark mb-4">
                  What Happens Next?
                </h3>
                <div className="space-y-4 text-left">
                  <div className="flex items-start gap-3">
                    <div className="bg-travel-blue-dark text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium mt-1">
                      1
                    </div>
                    <div>
                      <h4 className="font-medium">Application Review</h4>
                      <p className="text-sm text-gray-600">
                        Our team will review your application and documents within 24 hours.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="bg-travel-blue-dark text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium mt-1">
                      2
                    </div>
                    <div>
                      <h4 className="font-medium">Confirmation Call</h4>
                      <p className="text-sm text-gray-600">
                        We'll call you to confirm details and explain the next steps.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="bg-travel-blue-dark text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium mt-1">
                      3
                    </div>
                    <div>
                      <h4 className="font-medium">Processing</h4>
                      <p className="text-sm text-gray-600">
                        We'll process your application and keep you updated on the progress.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="bg-travel-blue-dark text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium mt-1">
                      4
                    </div>
                    <div>
                      <h4 className="font-medium">Completion</h4>
                      <p className="text-sm text-gray-600">
                        Once completed, we'll notify you and arrange document delivery.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="bg-blue-50 p-6 rounded-lg mb-8">
              <h3 className="text-lg font-semibold text-travel-blue-dark mb-4">
                Need Help or Have Questions?
              </h3>
              <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
                <div className="flex items-center gap-2">
                  <Phone className="w-5 h-5 text-travel-orange" />
                  <span className="font-medium">+91 88888 88888</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-5 h-5 text-travel-orange" />
                  <span className="font-medium">eservices@anandtravels.com</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/eservices">
                <Button variant="outline" className="w-full sm:w-auto">
                  Apply for Another Service
                </Button>
              </Link>
              <Link to="/">
                <Button className="w-full sm:w-auto">
                  Back to Home
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>

            <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center gap-2 justify-center mb-2">
                <FileText className="w-5 h-5 text-yellow-600" />
                <span className="font-medium text-yellow-800">Important Note</span>
              </div>
              <p className="text-sm text-yellow-700">
                Please keep your phone number active as we'll contact you soon. 
                Also, check your email for a confirmation message with your application reference number.
              </p>
            </div>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default EServiceSuccess;
