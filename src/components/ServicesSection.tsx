import { Train, Bus, Plane, Car, Package } from "lucide-react";

const ServicesSection = () => {
  const services = [
    {
      icon: <Train className="w-12 h-12 text-travel-blue-dark" />,
      title: "Train Tickets",
      description: "Normal & Tatkal reservations with expert assistance for confirmed bookings."
    },
    {
      icon: <Bus className="w-12 h-12 text-travel-blue-dark" />,
      title: "Bus Tickets",
      description: "Comfortable and reliable bus bookings across all major routes in India."
    },
    {
      icon: <Plane className="w-12 h-12 text-travel-blue-dark" />,
      title: "Flight Tickets",
      description: "Domestic and international flight bookings with best available fares."
    },
    {
      icon: <Car className="w-12 h-12 text-travel-blue-dark" />,
      title: "Cab Services",
      description: "Convenient city-to-city cab services for comfortable travel experience."
    },
    {
      icon: <Package className="w-12 h-12 text-travel-blue-dark" />,
      title: "Tour Packages",
      description: "Curated domestic and international tour packages with all-inclusive options."
    }
  ];

  return (
    <section className="py-16 bg-gray-50">
      <div className="container-custom">
        <div className="text-center mb-12">
          <h2 className="section-title">Our Travel Services</h2>
          <p className="text-gray-600 max-w-3xl mx-auto">
            We provide comprehensive travel solutions with a focus on efficiency, reliability, 
            and excellent customer service. From instant ticket bookings to personalized tour packages, 
            we've got all your travel needs covered.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <div 
              key={index} 
              className="bg-white rounded-lg shadow-md p-8 flex flex-col items-center text-center transition-transform hover:scale-105"
            >
              <div className="mb-4">{service.icon}</div>
              <h3 className="text-xl font-semibold mb-3 text-travel-blue-dark">{service.title}</h3>
              <p className="text-gray-600">{service.description}</p>
            </div>
          ))}
        </div>
        
        <div className="mt-12 text-center">
          <h3 className="section-subtitle">Why Choose Us for Tatkal Bookings?</h3>
          <div className="bg-travel-blue-dark text-white p-8 rounded-lg max-w-3xl mx-auto">
            <p className="mb-4 text-lg">
              With our specialized expertise in Tatkal train reservations, we ensure you get confirmed tickets even during peak travel seasons.
            </p>
            <ul className="text-left space-y-2 mb-6">
              <li className="flex items-start gap-2">
                <span className="text-travel-orange font-bold">✓</span>
                <span>Quick and efficient Tatkal booking process</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-travel-orange font-bold">✓</span>
                <span>Higher success rate compared to individual bookings</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-travel-orange font-bold">✓</span>
                <span>Assistance with last-minute travel plans</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-travel-orange font-bold">✓</span>
                <span>Experienced team that knows the ins and outs of IRCTC</span>
              </li>
            </ul>
            <blockquote className="italic text-gray-200 border-l-4 border-travel-orange pl-4">
              "Anand Travel Agency has been our go-to for all Tatkal bookings. They've never let us down!"
              <footer className="text-right text-travel-orange mt-2">— Rajesh Kumar, Mumbai</footer>
            </blockquote>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
