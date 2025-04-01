
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const QuoteSection = () => {
  return (
    <section className="py-10 bg-gradient-to-r from-travel-blue-dark to-travel-blue-medium">
      <div className="container-custom">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-white/10 backdrop-blur-sm p-6 rounded-lg border border-white/20">
          <div className="text-white">
            <h2 className="text-2xl md:text-3xl font-bold mb-2">Get a Free Travel Quote Today</h2>
            <p className="text-white/80 text-lg">
              Tell us your travel needs and receive a personalized quote within 24 hours
            </p>
          </div>
          
          <Link 
            to="/contact" 
            className="bg-travel-orange hover:bg-orange-600 text-white font-semibold px-6 py-3 rounded-md inline-flex items-center gap-2 whitespace-nowrap transition-all transform hover:translate-x-1"
          >
            Get a Free Quote <ArrowRight size={18} />
            <span className="ml-1 text-xs bg-white text-travel-orange rounded px-2 py-0.5">HIGH PRIORITY</span>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default QuoteSection;
