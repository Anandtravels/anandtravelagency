import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  FileText, 
  Clock, 
  Users, 
  CheckCircle, 
  ArrowRight,
  Download,
  Shield,
  Phone,
  Mail
} from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useDynamicEServiceTypes } from "@/hooks/useDynamicEServiceTypes";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth";
import { usePageVisibility } from "@/hooks/usePageVisibility";

const EServices = () => {
  const navigate = useNavigate();
  const { isPageVisible, loading: visibilityLoading } = usePageVisibility();
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const { serviceTypes, getActiveServiceTypes, loading, error } = useDynamicEServiceTypes();
  const { user } = useAuth();

  // Redirect if page is toggled OFF (skip for admin)
  useEffect(() => {
    if (!visibilityLoading && !isPageVisible('eservices') && user?.email !== 'admin@anandtravels.com') {
      navigate('/', { replace: true });
    }
  }, [visibilityLoading, isPageVisible, user, navigate]);
  
  // Debug logs
  console.log('Service types loaded:', Object.keys(serviceTypes).length);
  console.log('Active service types:', Object.keys(getActiveServiceTypes()).length);
  
  // Determine which services to show based on user role
  const displayServices = user?.email === 'admin@anandtravels.com' 
    ? serviceTypes 
    : getActiveServiceTypes();

  const stats = [
    { icon: Users, label: "Satisfied Clients", value: "500+" },
    { icon: FileText, label: "Applications Processed", value: "1000+" },
    { icon: CheckCircle, label: "Success Rate", value: "98%" },
    { icon: Clock, label: "Average Processing", value: "15 Days" }
  ];

  const benefits = [
    {
      icon: Shield,
      title: "Secure & Confidential",
      description: "All your documents and personal information are handled with utmost security and confidentiality."
    },
    {
      icon: Clock,
      title: "Fast Processing",
      description: "We ensure quick processing of your applications with regular status updates."
    },
    {
      icon: Users,
      title: "Expert Assistance",
      description: "Our experienced team guides you through the entire process from start to finish."
    },
    {
      icon: Phone,
      title: "24/7 Support",
      description: "Get help whenever you need it with our dedicated customer support team."
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        {/* Hero Section */}
        <section 
          className="relative h-[50vh] min-h-[400px] bg-cover bg-center flex items-center"
          style={{ 
            backgroundImage: "linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url('https://images.unsplash.com/photo-1554224155-6726b3ff858f?ixlib=rb-4.0.3')" 
          }}
        >
          <div className="container-custom text-white text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-4xl md:text-6xl font-bold mb-4">E-Services</h1>
              <p className="text-xl md:text-2xl max-w-3xl mx-auto mb-8">
                Simplified online services for all your document and financial needs
              </p>
              <Button size="lg" className="btn-primary text-lg px-8 py-3">
                <a href="#services">Explore Services</a>
              </Button>
            </motion.div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 bg-gray-50">
          <div className="container-custom">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="text-center"
                  >
                    <div className="bg-travel-blue-dark w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-2xl md:text-3xl font-bold text-travel-blue-dark mb-2">
                      {stat.value}
                    </h3>
                    <p className="text-gray-600">{stat.label}</p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Services Grid */}
        <section id="services" className="py-16">
          <div className="container-custom">
            <div className="text-center mb-12">
              <h2 className="section-title">Our E-Services</h2>
              <p className="text-gray-600 max-w-3xl mx-auto">
                Choose from our comprehensive range of online services designed to make 
                your document and financial processes hassle-free.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {loading ? (
                <div className="col-span-full text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-travel-blue-dark"></div>
                  <p className="mt-2 text-gray-600">Loading services...</p>
                </div>
              ) : error ? (
                <div className="col-span-full text-center py-8 bg-red-50 p-4 rounded-lg">
                  <p className="text-red-600">Error loading services: {error}</p>
                  <p className="text-gray-600 mt-2">Please try refreshing the page or contact support if the issue persists.</p>
                </div>
              ) : Object.keys(displayServices).length === 0 ? (
                <div className="col-span-full text-center py-8">
                  <p className="text-gray-600">No services are currently available. Please check back later.</p>
                </div>
              ) : (
                Object.entries(displayServices).map(([key, service]) => (
                  <motion.div
                    key={key}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    whileHover={{ y: -5 }}
                    className="cursor-pointer"
                    onClick={() => setSelectedService(selectedService === key ? null : key)}
                  >
                    <Card className={`h-full border-2 hover:border-travel-blue-dark transition-all duration-300 hover:shadow-lg ${
                      service.isActive === false ? 'opacity-60' : ''
                    }`}>
                      <CardHeader className="text-center pb-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="text-4xl">{service.icon}</div>
                          {user?.email === 'admin@anandtravels.com' && (
                            <Badge variant={service.isActive !== false ? "default" : "secondary"}>
                              {service.isActive !== false ? "Active" : "Inactive"}
                            </Badge>
                          )}
                        </div>
                        <CardTitle className="text-xl text-travel-blue-dark">
                          {service.label}
                        </CardTitle>
                        <CardDescription className="text-gray-600">
                          {service.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3 mb-6">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">Processing Time:</span>
                            <Badge variant="secondary">{service.estimatedTime}</Badge>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">Fee:</span>
                            <span className="text-sm text-travel-blue-dark font-semibold">
                              {service.fee}
                            </span>
                          </div>
                        </div>

                        {selectedService === key && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            className="mt-4 pt-4 border-t border-gray-200"
                          >
                            <h4 className="font-medium mb-2">Required Documents:</h4>
                            <ul className="text-sm text-gray-600 space-y-1 mb-4">
                              {service.documents.map((doc, idx) => (
                                <li key={idx} className="flex items-center gap-2">
                                  <CheckCircle className="w-4 h-4 text-green-500" />
                                  {doc}
                                </li>
                              ))}
                            </ul>
                          </motion.div>
                        )}

                        <Link to={`/eservices/apply/${key}`}>
                          <Button 
                            className="w-full btn-primary"
                            disabled={service.isActive === false}
                          >
                            Apply Now
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </Button>
                        </Link>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-16 bg-gray-50">
          <div className="container-custom">
            <div className="text-center mb-12">
              <h2 className="section-title">Why Choose Our E-Services?</h2>
              <p className="text-gray-600 max-w-3xl mx-auto">
                Experience the convenience of digital services with the trust of personalized assistance
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {benefits.map((benefit, index) => {
                const Icon = benefit.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="text-center"
                  >
                    <div className="bg-travel-blue-dark w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-travel-blue-dark mb-2">
                      {benefit.title}
                    </h3>
                    <p className="text-gray-600 text-sm">
                      {benefit.description}
                    </p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Process Section */}
        <section className="py-16">
          <div className="container-custom">
            <div className="text-center mb-12">
              <h2 className="section-title">How It Works</h2>
              <p className="text-gray-600 max-w-3xl mx-auto">
                Simple steps to get your documents and services processed
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {[
                { step: "1", title: "Choose Service", desc: "Select the service you need from our comprehensive list" },
                { step: "2", title: "Fill Application", desc: "Complete the online form with required details" },
                { step: "3", title: "Upload Documents", desc: "Upload necessary documents securely" },
                { step: "4", title: "Track Progress", desc: "Monitor your application status in real-time" }
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="text-center"
                >
                  <div className="bg-travel-orange text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                    {item.step}
                  </div>
                  <h3 className="text-lg font-semibold text-travel-blue-dark mb-2">
                    {item.title}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {item.desc}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-travel-blue-dark text-white">
          <div className="container-custom text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Get Started?
            </h2>
            <p className="text-xl mb-8 max-w-3xl mx-auto">
              Join thousands of satisfied customers who have simplified their document processes with our e-services
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/eservices/apply">
                <Button size="lg" className="bg-white text-travel-blue-dark hover:bg-gray-100 font-medium text-lg px-8 py-3">
                  Start Application
                </Button>
              </Link>
              <Link to="/contact">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-travel-blue-dark font-medium text-lg px-8 py-3">
                  Contact Support
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Contact Info */}
        <section className="py-12 bg-gray-50">
          <div className="container-custom">
            <div className="text-center">
              <h3 className="text-xl font-semibold text-travel-blue-dark mb-4">
                Need Help? Contact Our E-Services Team
              </h3>
              <div className="flex flex-col sm:flex-row justify-center items-center gap-6">
                <div className="flex items-center gap-2">
                  <Phone className="w-5 h-5 text-travel-orange" />
                  <span>+91 88888 88888</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-5 h-5 text-travel-orange" />
                  <span>eservices@anandtravels.com</span>
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

export default EServices;
