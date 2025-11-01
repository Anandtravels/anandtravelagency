import { Link } from "react-router-dom";
import { Award, Star, Users, ThumbsUp, Calendar } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import QuoteSection from "../components/QuoteSection";
import { useTeamManagement } from "@/hooks/useTeamManagement";

const About = () => {
  // SEO-optimized CEO image
  const founderImageUrl = "/anand-pinisetty-founder-anand-travel-agency.jpg";
  const founderImageAlt = "Anand Pinisetty – Founder & CEO of Anand Travel Agency, India's first AI-powered travel agency";
  
  // Fetch team members from Firebase
  const { teamMembers, loading } = useTeamManagement();

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
        
        {/* Team Section */}
        <section className="py-16">
          <div className="container-custom">
            <div className="text-center mb-12">
              <h2 className="section-title">Meet Our Team</h2>
              <p className="text-gray-600 max-w-3xl mx-auto">
                Meet the dedicated professionals who make your travel experiences exceptional
              </p>
            </div>
            
            {loading ? (
              <div className="text-center py-8">
                <p className="text-gray-500">Loading team members...</p>
              </div>
            ) : teamMembers.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No team members to display</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {teamMembers.map((member) => (
                  <div key={member.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="aspect-square w-full overflow-hidden">
                      <img 
                        src={member.image} 
                        alt={`${member.name} - ${member.role}`}
                        title={`${member.name} - ${member.role}`}
                        loading="lazy"
                        className="w-full h-full object-cover"
                        itemProp="image"
                      />
                    </div>
                    <div className="p-6" itemScope itemType="https://schema.org/Person">
                      <meta itemProp="name" content={member.name} />
                      <meta itemProp="jobTitle" content={member.role} />
                      <meta itemProp="image" content={member.image} />
                      <meta itemProp="worksFor" content="Anand Travel Agency" />
                      <h3 className="text-xl font-semibold text-travel-blue-dark mb-2" itemProp="name">{member.name}</h3>
                      <p className="text-travel-orange font-medium mb-3" itemProp="jobTitle">{member.role}</p>
                      <p className="text-gray-600 mb-3" itemProp="description">{member.bio}</p>
                      {member.email && (
                        <p className="text-sm text-gray-500">
                          <a href={`mailto:${member.email}`} className="hover:text-travel-blue-dark">{member.email}</a>
                        </p>
                      )}
                      {member.phone && (
                        <p className="text-sm text-gray-500">
                          <a href={`tel:${member.phone}`} className="hover:text-travel-blue-dark">{member.phone}</a>
                        </p>
                      )}
                      
                      {/* Social Media Links */}
                      {(member.instagram || member.linkedin || member.idCard) && (
                        <div className="flex gap-3 mt-4 pt-4 border-t border-gray-100">
                          {member.instagram && (
                            <a 
                              href={member.instagram} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-pink-600 hover:text-pink-700 transition-colors"
                              title="Instagram"
                            >
                              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                              </svg>
                            </a>
                          )}
                          {member.linkedin && (
                            <a 
                              href={member.linkedin} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-700 transition-colors"
                              title="LinkedIn"
                            >
                              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                              </svg>
                            </a>
                          )}
                          {member.idCard && (
                            <a 
                              href={member.idCard} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-gray-600 hover:text-gray-700 transition-colors"
                              title="ID Card"
                            >
                              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm-5 14H4v-4h11v4zm0-5H4V9h11v4zm5 5h-4V9h4v9z"/>
                              </svg>
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
        
        {/* Our Story Section */}
        <section className="py-16 bg-gray-50">
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
