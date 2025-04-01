import { Link } from "react-router-dom";
import { Award, Star, Users, ThumbsUp, Calendar } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import QuoteSection from "../components/QuoteSection";

const About = () => {
  const teamMembers = [
    {
      name: "Anand Kumar",
      role: "Founder & CEO",
      image: "https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg",
      bio: "A passionate travel entrepreneur who founded Anand Travel Agency with a vision to make travel bookings seamless and hassle-free for everyone."
    },
    {
      name: "Priya Sharma",
      role: "Travel Operations Manager",
      image: "https://images.pexels.com/photos/1239288/pexels-photo-1239288.jpeg",
      bio: "Priya oversees all operational aspects of our travel packages, ensuring seamless experiences for our customers with her 10+ years of expertise in tour management."
    },
    {
      name: "Rajesh Agarwal",
      role: "Tatkal Booking Specialist",
      image: "https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg",
      bio: "Rajesh is our expert in securing Tatkal train tickets with a remarkable success rate. His deep knowledge of the IRCTC system helps our clients get confirmed bookings even during peak seasons."
    },
    {
      name: "Meena Patel",
      role: "International Tours Head",
      image: "https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg",
      bio: "With experience across 30+ countries, Meena designs our international tour packages, bringing unique cultural insights and hidden gems to our travelers."
    }
  ];

  const milestones = [
    {
      year: 2023,
      title: "Agency Founded",
      description: "Anand Travel Agency was established with a focus on train ticket bookings and comprehensive travel solutions."
    },
    {
      year: 2023,
      title: "Service Expansion",
      description: "Expanded our services to include flight bookings, tour packages, and specialized Tatkal booking services."
    },
    {
      year: 2024,
      title: "Digital Transformation",
      description: "Launched our online booking platform and expanded our reach across India."
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        {/* Hero Section */}
        <div className="relative h-[40vh] min-h-[300px] bg-cover bg-center flex items-center" 
             style={{ backgroundImage: "linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url('https://images.pexels.com/photos/3184338/pexels-photo-3184338.jpeg')" }}>
          <div className="container-custom text-white text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">About Us</h1>
            <p className="text-xl max-w-3xl mx-auto">
              Learn about our journey, our mission, and the team behind Anand Travel Agency
            </p>
          </div>
        </div>
        
        {/* Our Story Section */}
        <section className="py-16">
          <div className="container-custom">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="section-title mb-6">Our Story</h2>
                <p className="text-gray-700 mb-4">
                  Founded in 2003 by Mr. Anand Kumar, Anand Travel Agency started as a small office in Mumbai providing train ticket booking services. With a vision to make travel accessible and hassle-free for everyone, Mr. Anand leveraged his extensive knowledge of the Indian Railways system to help customers secure seats even during peak seasons.
                </p>
                <p className="text-gray-700 mb-4">
                  What began as a modest ticket booking service quickly expanded into a comprehensive travel agency. As our reputation for reliability and customer service grew, so did our offerings. We ventured into domestic tour packages, bus bookings, and flight reservations, becoming a one-stop solution for all travel needs.
                </p>
                <p className="text-gray-700 mb-4">
                  Today, with over 20 years of experience, Anand Travel Agency has established itself as a trusted name in the travel industry across India. Our specialization in Tatkal bookings continues to be our unique strength, while our expanding portfolio of domestic and international tour packages caters to the evolving needs of the modern traveler.
                </p>
                <p className="text-gray-700">
                  Throughout our journey, our commitment to personalized service, transparency, and customer satisfaction has remained unwavering. We take pride in turning travel dreams into memorable experiences for thousands of satisfied customers.
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg overflow-hidden shadow-md h-64">
                  <img 
                    src="https://source.unsplash.com/photo-1551632436-cbf8dd35adfa" 
                    alt="Our office in 2003" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="rounded-lg overflow-hidden shadow-md h-64">
                  <img 
                    src="https://source.unsplash.com/photo-1622547748225-3fc4abd2cca0" 
                    alt="Team celebration" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="rounded-lg overflow-hidden shadow-md h-64">
                  <img 
                    src="https://source.unsplash.com/photo-1625447205262-0dc98cf9ea53" 
                    alt="Customer receiving award" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="rounded-lg overflow-hidden shadow-md h-64">
                  <img 
                    src="https://source.unsplash.com/photo-1560698848-59b577a3e7af" 
                    alt="Modern office" 
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Mission & Vision Section */}
        <section className="py-16 bg-gray-50">
          <div className="container-custom">
            <div className="text-center mb-12">
              <h2 className="section-title">Our Mission & Vision</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white p-8 rounded-lg shadow-md">
                <h3 className="text-2xl font-bold text-travel-blue-dark mb-4">Our Mission</h3>
                <p className="text-gray-700 mb-6">
                  To provide accessible, affordable, and reliable travel solutions that cater to the diverse needs of our customers. We strive to make the journey as memorable as the destination through personalized service and attention to detail.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <span className="text-travel-orange font-bold mt-1">✓</span>
                    <span className="text-gray-700">Ensure hassle-free travel arrangements for all customers</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-travel-orange font-bold mt-1">✓</span>
                    <span className="text-gray-700">Provide transparent pricing and honest travel advice</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-travel-orange font-bold mt-1">✓</span>
                    <span className="text-gray-700">Deliver exceptional value through carefully curated services</span>
                  </li>
                </ul>
              </div>
              
              <div className="bg-white p-8 rounded-lg shadow-md">
                <h3 className="text-2xl font-bold text-travel-blue-dark mb-4">Our Vision</h3>
                <p className="text-gray-700 mb-6">
                  To be the most trusted travel partner for Indian travelers, recognized for our expertise, reliability, and customer-centric approach. We aim to evolve continuously with changing travel trends while maintaining our core values.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <span className="text-travel-orange font-bold mt-1">✓</span>
                    <span className="text-gray-700">Expand our reach to serve travelers across all of India</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-travel-orange font-bold mt-1">✓</span>
                    <span className="text-gray-700">Innovate with technology while maintaining the human touch</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-travel-orange font-bold mt-1">✓</span>
                    <span className="text-gray-700">Promote responsible and sustainable tourism practices</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>
        
        {/* Why Choose Us Section */}
        <section className="py-16">
          <div className="container-custom">
            <div className="text-center mb-12">
              <h2 className="section-title">Why Choose Us</h2>
              <p className="text-gray-600 max-w-3xl mx-auto">
                Here's what sets us apart and makes us the preferred choice for travelers across India
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="bg-white p-6 rounded-lg shadow-md text-center">
                <div className="bg-travel-blue-dark/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Award className="w-8 h-8 text-travel-blue-dark" />
                </div>
                <h3 className="text-xl font-semibold text-travel-blue-dark mb-3">20+ Years Experience</h3>
                <p className="text-gray-600">
                  Two decades of expertise in the travel industry, consistently delivering reliable service.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md text-center">
                <div className="bg-travel-blue-dark/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Star className="w-8 h-8 text-travel-blue-dark" />
                </div>
                <h3 className="text-xl font-semibold text-travel-blue-dark mb-3">Tatkal Expertise</h3>
                <p className="text-gray-600">
                  Unmatched success rate in securing Tatkal tickets even during peak travel seasons.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md text-center">
                <div className="bg-travel-blue-dark/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-travel-blue-dark" />
                </div>
                <h3 className="text-xl font-semibold text-travel-blue-dark mb-3">Personalized Service</h3>
                <p className="text-gray-600">
                  Tailored travel solutions that cater to your specific requirements and preferences.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md text-center">
                <div className="bg-travel-blue-dark/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ThumbsUp className="w-8 h-8 text-travel-blue-dark" />
                </div>
                <h3 className="text-xl font-semibold text-travel-blue-dark mb-3">50,000+ Happy Customers</h3>
                <p className="text-gray-600">
                  A large community of satisfied travelers who rely on us for all their travel needs.
                </p>
              </div>
            </div>
          </div>
        </section>
        
        {/* Our Journey Timeline */}
        <section className="py-16 bg-gray-50">
          <div className="container-custom">
            <div className="text-center mb-12">
              <h2 className="section-title">Our Journey</h2>
              <p className="text-gray-600 max-w-3xl mx-auto">
                Two decades of growth, innovation, and memorable journeys
              </p>
            </div>
            
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-travel-blue-dark"></div>
              
              {/* Timeline items */}
              <div className="space-y-12">
                {milestones.map((milestone, index) => (
                  <div key={index} className={`relative flex items-center ${index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}>
                    {/* Timeline point */}
                    <div className="absolute left-1/2 transform -translate-x-1/2 w-8 h-8 rounded-full bg-travel-orange border-4 border-travel-blue-dark z-10"></div>
                    
                    {/* Content */}
                    <div className={`w-5/12 ${index % 2 === 0 ? 'pr-8 text-right' : 'pl-8'}`}>
                      <div className="bg-white p-6 rounded-lg shadow-md">
                        <div className="flex items-center gap-2 mb-2 justify-end">
                          <Calendar className="w-5 h-5 text-travel-orange" />
                          <span className="text-travel-orange font-semibold">{milestone.year}</span>
                        </div>
                        <h3 className="text-xl font-semibold text-travel-blue-dark mb-2">{milestone.title}</h3>
                        <p className="text-gray-600">{milestone.description}</p>
                      </div>
                    </div>
                    
                    {/* Empty space for the other side */}
                    <div className="w-5/12"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
        
        {/* Team Section */}
        <section className="py-16">
          <div className="container-custom">
            <div className="text-center mb-12">
              <h2 className="section-title">Meet Our Team</h2>
              <p className="text-gray-600 max-w-3xl mx-auto">
                The passionate professionals who make your travel experiences exceptional
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {teamMembers.map((member, index) => (
                <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="h-64 overflow-hidden">
                    <img 
                      src={member.image} 
                      alt={member.name} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-travel-blue-dark mb-1">{member.name}</h3>
                    <p className="text-travel-orange font-medium mb-3">{member.role}</p>
                    <p className="text-gray-600">{member.bio}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
        
        {/* QuoteSection */}
        <QuoteSection />
        
        {/* CTA Section */}
        <section className="py-16 bg-travel-blue-dark text-white">
          <div className="container-custom text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Experience Our Services?</h2>
            <p className="text-xl mb-8 max-w-3xl mx-auto">
              Join thousands of satisfied travelers who trust Anand Travel Agency for their journey
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/booking" className="btn-primary text-lg px-8 py-3">
                Book Now
              </Link>
              <Link to="/contact" className="bg-white text-travel-blue-dark hover:bg-gray-100 font-medium text-lg px-8 py-3 rounded-md transition-colors">
                Contact Us
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default About;
