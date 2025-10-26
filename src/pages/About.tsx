import { Link } from "react-router-dom";
import { Award, Star, Users, ThumbsUp, Calendar } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import QuoteSection from "../components/QuoteSection";

const About = () => {
  // SEO-optimized CEO image
  const founderImageUrl = "/anand-pinisetty-founder-anand-travel-agency.jpg";
  const founderImageAlt = "Anand Pinisetty – Founder & CEO of Anand Travel Agency, India's first AI-powered travel agency";
  
  const teamMembers = [
    {
      name: "Anand Pinisetty",
      role: "Founder & CEO",
      image: founderImageUrl,
      bio: "A passionate travel entrepreneur who founded Anand Travel Agency with a vision to make travel bookings seamless and hassle-free for everyone."
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
                  Founded in 2023 by Mr. Anand Pinisetty, Anand Travel Agency started as a small office in Kakinada providing train ticket booking services. With a vision to make travel accessible and hassle-free for everyone, Mr. Anand leveraged his extensive knowledge of the Indian Railways system to help customers secure seats even during peak seasons.
                </p>
                <p className="text-gray-700 mb-4">
                  What began as a modest ticket booking service quickly expanded into a comprehensive travel agency. As our reputation for reliability and customer service grew, so did our offerings. We ventured into domestic tour packages, bus bookings, and flight reservations, becoming a one-stop solution for all travel needs.
                </p>
                <p className="text-gray-700 mb-4">
                  Today, Anand Travel Agency has established itself as a trusted name in the travel industry. Our specialization in Tatkal bookings continues to be our unique strength, while our expanding portfolio of domestic and international tour packages caters to the evolving needs of the modern traveler.
                </p>
                <p className="text-gray-700">
                  Throughout our journey, our commitment to personalized service, transparency, and customer satisfaction has remained unwavering. We take pride in turning travel dreams into memorable experiences for thousands of satisfied customers.
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg overflow-hidden shadow-md h-64">
                  <img 
                    src="https://www.winnershtriangle.co.uk/wp-content/uploads/2023/06/WT-banner.jpg" 
                    alt="Our office in 2023" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="rounded-lg overflow-hidden shadow-md h-64">
                  <img 
                    src="https://images.stockcake.com/public/9/1/9/919e4519-5b34-4859-b8f1-e45ccbd58df9_large/joyful-office-celebration-stockcake.jpg" 
                    alt="Team celebration" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="rounded-lg overflow-hidden shadow-md h-64">
                  <img 
                    src="https://officebanao.com/wp-content/uploads/2023/08/Modern-Office-Design-Ideas-1024x723.jpg" 
                    alt="Customer receiving award" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="rounded-lg overflow-hidden shadow-md h-64">
                  <img 
                    src="https://www.ecobook.io/wp-content/uploads/2022/12/1273978367-Modern-Office-Layout-compress.jpg" 
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
                <h3 className="text-xl font-semibold text-travel-blue-dark mb-3">1000+ Trusted Customers</h3>
                <p className="text-gray-600">
                  Over a thousand satisfied customers who rely on our expertise for their travel needs.
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
                <h3 className="text-xl font-semibold text-travel-blue-dark mb-3">Customer Satisfaction</h3>
                <p className="text-gray-600">
                  Our dedication to ensuring every travel experience exceeds expectations.
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
                Our growth, innovation, and memorable journeys
              </p>
            </div>
            
            <div className="relative">
              {/* Timeline line - hidden on mobile, visible on md screens and up */}
              <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-travel-blue-dark"></div>
              
              {/* Mobile timeline line - visible only on mobile */}
              <div className="md:hidden absolute left-4 top-0 bottom-0 w-1 bg-travel-blue-dark"></div>
              
              {/* Timeline items */}
              <div className="space-y-8 md:space-y-12">
                {milestones.map((milestone, index) => (
                  <div key={index} className="relative">
                    {/* Desktop layout */}
                    <div className={`hidden md:flex items-center ${index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}>
                      {/* Timeline point for desktop */}
                      <div className="absolute left-1/2 transform -translate-x-1/2 w-8 h-8 rounded-full bg-travel-orange border-4 border-travel-blue-dark z-10"></div>
                      
                      {/* Content for desktop */}
                      <div className={`w-5/12 ${index % 2 === 0 ? 'pr-8 text-right' : 'pl-8'}`}>
                        <div className="bg-white p-6 rounded-lg shadow-md">
                          <div className={`flex items-center gap-2 mb-2 ${index % 2 === 0 ? 'justify-end' : 'justify-start'}`}>
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
                    
                    {/* Mobile layout - only displays on small screens */}
                    <div className="md:hidden flex">
                      {/* Timeline point for mobile */}
                      <div className="absolute left-4 transform -translate-x-1/2 w-6 h-6 rounded-full bg-travel-orange border-3 border-travel-blue-dark z-10"></div>
                      
                      {/* Content for mobile */}
                      <div className="ml-10 w-full">
                        <div className="bg-white p-4 rounded-lg shadow-md">
                          <div className="flex items-center gap-2 mb-2">
                            <Calendar className="w-5 h-5 text-travel-orange" />
                            <span className="text-travel-orange font-semibold">{milestone.year}</span>
                          </div>
                          <h3 className="text-lg font-semibold text-travel-blue-dark mb-2">{milestone.title}</h3>
                          <p className="text-gray-600 text-sm">{milestone.description}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
        
        {/* Founder Section */}
        <section className="py-16">
          <div className="container-custom">
            <div className="text-center mb-12">
              <h2 className="section-title">The Man Behind Anand Travel Agency</h2>
              <p className="text-gray-600 max-w-3xl mx-auto">
                Meet the visionary who makes your travel experiences exceptional
              </p>
            </div>
            
            <div className="max-w-2xl mx-auto">
              <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-square w-full overflow-hidden">
                  <img 
                    src={teamMembers[0].image} 
                    alt={founderImageAlt}
                    title="Anand Pinisetty - Founder & CEO of Anand Travel Agency"
                    loading="lazy"
                    className="w-full h-full object-cover"
                    itemProp="image"
                  />
                </div>
                <div className="p-8" itemScope itemType="https://schema.org/Person">
                  <meta itemProp="name" content="Anand Pinisetty" />
                  <meta itemProp="jobTitle" content="Founder & CEO" />
                  <meta itemProp="image" content={founderImageUrl} />
                  <meta itemProp="worksFor" content="Anand Travel Agency" />
                  <h3 className="text-2xl font-semibold text-travel-blue-dark mb-2" itemProp="name">{teamMembers[0].name}</h3>
                  <p className="text-travel-orange font-medium mb-4" itemProp="jobTitle">{teamMembers[0].role}</p>
                  <p className="text-gray-600 text-lg" itemProp="description">{teamMembers[0].bio}</p>
                  <p className="text-gray-600 mt-4 text-lg">
                    Based in Kakinada, Mr. Anand has built a reputation for excellence in the travel industry. 
                    His deep understanding of customer needs and commitment to service has helped transform 
                    Anand Travel Agency into a trusted name for travelers across India.
                  </p>
                </div>
              </div>
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
