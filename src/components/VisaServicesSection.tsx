import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FileText, Globe, Calendar, Send, CheckCircle, FileCheck } from "lucide-react";
import { motion } from "framer-motion";
import { useVisaForm } from "@/hooks/useVisaForm";
import { trackButtonClick } from "@/services/clickTracker";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

// Comprehensive list of countries
const COUNTRIES = [
  "United States", "France", "Spain", "China", "Italy", "Turkey", "Mexico", "Germany", 
  "United Kingdom", "Thailand", "Japan", "United Arab Emirates", "Canada", "India", 
  "Australia", "Saudi Arabia", "Greece", "Portugal", "Netherlands", "South Korea", 
  "Malaysia", "Vietnam", "Austria", "Singapore", "Russia", "Morocco", "Indonesia", 
  "Philippines", "Poland", "Switzerland", "Hungary", "Czechia (Czech Republic)", 
  "Egypt", "Ireland", "Brazil", "Argentina", "Colombia", "Peru", "Dominican Republic", 
  "South Africa", "Tunisia", "Algeria", "Bangladesh", "Pakistan", "Sri Lanka", "Nepal", 
  "Israel", "Jordan", "Kazakhstan", "Uzbekistan", "Qatar", "Bahrain", "Kuwait", "Chile", 
  "Uruguay", "Paraguay", "Ecuador", "Panama", "Costa Rica", "Guatemala", "Honduras", 
  "El Salvador", "Nicaragua", "Belize", "Jamaica", "Bahamas", "Trinidad and Tobago", 
  "Puerto Rico (territory)", "Cuba", "Venezuela", "Bolivia", "Serbia", "Croatia", 
  "Slovenia", "Slovakia", "Romania", "Bulgaria", "Lithuania", "Latvia", "Estonia", 
  "Finland", "Sweden", "Norway", "Denmark", "Belgium", "Luxembourg", "Iceland", 
  "Montenegro", "North Macedonia", "Albania", "Bosnia and Herzegovina", "Kosovo", 
  "Moldova", "Belarus", "Armenia", "Georgia", "Azerbaijan", "Cyprus", "Malta", 
  "Andorra", "San Marino", "Monaco", "Vatican City (Holy See)", "Kyrgyzstan", 
  "Tajikistan", "Turkmenistan", "Afghanistan", "Iran", "Iraq", "Lebanon", "Oman", 
  "Yemen", "Syria", "Mauritius", "Seychelles", "Madagascar", "Mozambique", "Tanzania", 
  "Kenya", "Uganda", "Rwanda", "Ethiopia", "Sudan", "South Sudan", "Somalia", 
  "Djibouti", "Eritrea", "Guinea", "Guinea-Bissau", "Sierra Leone", "Liberia", 
  "Ivory Coast (Côte d'Ivoire)", "Ghana", "Togo", "Benin", "Burkina Faso", "Mali", 
  "Niger", "Chad", "Central African Republic", "Cameroon", "Gabon", "Congo (Republic of the)", 
  "Democratic Republic of the Congo", "São Tomé and Príncipe", "Equatorial Guinea", 
  "Angola", "Namibia", "Botswana", "Zimbabwe", "Zambia", "Malawi", "Lesotho", 
  "Eswatini (Swaziland)", "Comoros", "Maldives", "Bhutan", "Mongolia", "Myanmar", 
  "Laos", "Cambodia", "Brunei", "Timor-Leste (East Timor)", "Papua New Guinea", 
  "Solomon Islands", "Vanuatu", "Fiji", "Samoa", "Tonga", "Kiribati", "Tuvalu", 
  "Nauru", "Palau", "Micronesia (Federated States of)", "Marshall Islands", 
  "Cook Islands", "Niue", "Saint Kitts and Nevis", "Antigua and Barbuda", "Dominica", 
  "Saint Lucia", "Saint Vincent and the Grenadines", "Grenada", "Guyana", "Suriname"
];

const VISA_TYPES = [
  "Visit/Tourism Visa",
  "Business Visa", 
  "Dependent Visa",
  "E-Visa",
  "On Arrival Visa",
  "Student Visa Assistance"
];

// Form validation schema
const visaFormSchema = z.object({
  visaType: z.string().min(1, "Please select a visa type"),
  name: z.string()
    .min(2, "Name must be at least 2 characters")
    .regex(/^[a-zA-Z\s\-\']+$/, "Name can only contain letters, spaces, hyphens, and apostrophes"),
  contactNumber: z.string()
    .min(10, "Contact number must be at least 10 digits")
    .regex(/^[\+]?[0-9\-\s\(\)]+$/, "Please enter a valid contact number"),
  email: z.string()
    .email("Please enter a valid email address"),
  travelDate: z.string()
    .min(1, "Please select a travel date"),
  countryName: z.string()
    .min(2, "Please select or enter a country name"),
});

type VisaFormData = z.infer<typeof visaFormSchema>;

const VisaServicesSection = () => {
  const [countrySearch, setCountrySearch] = useState("");
  const [isCountryOpen, setIsCountryOpen] = useState(false);
  const { isSubmitting, showSuccess, handleSubmit, resetForm } = useVisaForm();

  const form = useForm<VisaFormData>({
    resolver: zodResolver(visaFormSchema),
    defaultValues: {
      visaType: "",
      name: "",
      contactNumber: "",
      email: "",
      travelDate: "",
      countryName: "",
    },
  });

  // Get today's date in YYYY-MM-DD format for min date
  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  // Filter countries based on search
  const filteredCountries = COUNTRIES.filter(country =>
    country.toLowerCase().includes(countrySearch.toLowerCase())
  );

  const onSubmit = async (data: VisaFormData) => {
    trackButtonClick("Visa Application Submit");
    await handleSubmit(data as VisaFormData);
    if (!isSubmitting) {
      form.reset();
    }
  };

  if (showSuccess) {
    return (
      <section className="py-16 bg-gradient-to-br from-travel-blue-dark/5 to-travel-teal/5">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="max-w-2xl mx-auto text-center"
          >
            <div className="bg-white rounded-2xl shadow-lg p-12 border border-gray-100">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <h3 className="text-3xl font-bold text-travel-blue-dark mb-4">
                Application Submitted Successfully!
              </h3>
              <p className="text-gray-600 text-lg mb-8">
                Thank you for choosing Anand Travel Agency for your visa services. 
                Our expert team will review your application and contact you within 24 hours.
              </p>
              <Button 
                onClick={() => resetForm()}
                className="btn-primary"
              >
                Submit Another Application
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative py-16 overflow-hidden">
      {/* Hero Background Images */}
      <div className="absolute inset-0 z-0">
        <div className="relative h-full w-full">
          {/* Background gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-travel-blue-dark/90 via-travel-blue-medium/85 to-travel-teal/80 z-10" />
          
          {/* Background image pattern */}
          <div className="absolute inset-0 opacity-20">
            <div className="h-full w-full bg-gradient-to-r from-blue-900/50 to-teal-800/50" />
            {/* Subtle pattern overlay */}
            <div className="absolute inset-0 bg-blue-900/10 opacity-30" 
                 style={{
                   backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M30 30c0-11.046-8.954-20-20-20s-20 8.954-20 20 8.954 20 20 20 20-8.954 20-20zm10 0c0-11.046-8.954-20-20-20s-20 8.954-20 20 8.954 20 20 20 20-8.954 20-20z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
                 }} 
            />
          </div>
        </div>
      </div>

      <div className="container-custom relative z-20">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center mb-4">
            <FileCheck className="w-8 h-8 text-travel-orange mr-3" />
            <h2 className="section-title text-white">Visa Services</h2>
          </div>
          <p className="text-white/90 max-w-3xl mx-auto text-lg font-medium">
            Hassle-Free Visa Assistance for Your Next Journey
          </p>
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
              className="flex flex-col items-center text-center bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20"
            >
              <div className="w-16 h-16 bg-travel-orange/20 rounded-full flex items-center justify-center mb-4">
                <FileText className="w-8 h-8 text-travel-orange" />
              </div>
              <h3 className="text-white font-semibold text-lg mb-2">Expert Documentation</h3>
              <p className="text-white/80 text-sm">Complete assistance with all required documents and paperwork</p>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="flex flex-col items-center text-center bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20"
            >
              <div className="w-16 h-16 bg-travel-teal/20 rounded-full flex items-center justify-center mb-4">
                <Globe className="w-8 h-8 text-travel-teal" />
              </div>
              <h3 className="text-white font-semibold text-lg mb-2">Global Coverage</h3>
              <p className="text-white/80 text-sm">Visa services for destinations worldwide with expert knowledge</p>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
              className="flex flex-col items-center text-center bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20"
            >
              <div className="w-16 h-16 bg-travel-blue-medium/20 rounded-full flex items-center justify-center mb-4">
                <Calendar className="w-8 h-8 text-travel-blue-medium" />
              </div>
              <h3 className="text-white font-semibold text-lg mb-2">Fast Processing</h3>
              <p className="text-white/80 text-sm">Quick turnaround times with regular status updates</p>
            </motion.div>
          </div>
        </motion.div>

        {/* Form Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto mb-16"
        >
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-white/20">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Visa Type */}
                <FormField
                  control={form.control}
                  name="visaType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-travel-blue-dark font-semibold">
                        Visa Type *
                      </FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-12 border-gray-200 focus:border-travel-orange focus:ring-travel-orange/20">
                            <SelectValue placeholder="Select Visa Type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {VISA_TYPES.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Name */}
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-travel-blue-dark font-semibold">
                        Full Name *
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter your full name"
                          className="h-12 border-gray-200 focus:border-travel-orange focus:ring-travel-orange/20"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Contact Number */}
                <FormField
                  control={form.control}
                  name="contactNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-travel-blue-dark font-semibold">
                        Contact Number *
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="tel"
                          placeholder="+91 9876543210"
                          className="h-12 border-gray-200 focus:border-travel-orange focus:ring-travel-orange/20"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Email */}
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-travel-blue-dark font-semibold">
                        Email Address *
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="your.email@example.com"
                          className="h-12 border-gray-200 focus:border-travel-orange focus:ring-travel-orange/20"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Travel Date */}
                <FormField
                  control={form.control}
                  name="travelDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-travel-blue-dark font-semibold">
                        Intended Travel Date *
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          min={getTodayDate()}
                          className="h-12 border-gray-200 focus:border-travel-orange focus:ring-travel-orange/20"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Country Name - Searchable Dropdown */}
                <FormField
                  control={form.control}
                  name="countryName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-travel-blue-dark font-semibold">
                        Destination Country *
                      </FormLabel>
                      <Popover open={isCountryOpen} onOpenChange={setIsCountryOpen}>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              role="combobox"
                              aria-expanded={isCountryOpen}
                              className="h-12 w-full justify-between border-gray-200 hover:border-travel-orange focus:border-travel-orange focus:ring-travel-orange/20 text-left"
                            >
                              <span className={field.value ? "text-gray-900" : "text-gray-500"}>
                                {field.value || "Select destination country or type to search"}
                              </span>
                              <Globe className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-full p-0" align="start">
                          <Command>
                            <CommandInput
                              placeholder="Search countries or type custom name..."
                              value={countrySearch}
                              onValueChange={setCountrySearch}
                            />
                            <CommandList>
                              <CommandEmpty>
                                <div className="p-4 text-center">
                                  <p className="text-sm text-gray-500 mb-2">
                                    {countrySearch ? `"${countrySearch}" not found in predefined list` : 'Start typing to search countries'}
                                  </p>
                                  {countrySearch && countrySearch.trim().length >= 2 && (
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      onClick={() => {
                                        if (countrySearch.trim()) {
                                          field.onChange(countrySearch.trim());
                                          setIsCountryOpen(false);
                                          setCountrySearch("");
                                        }
                                      }}
                                      className="text-travel-orange border-travel-orange hover:bg-travel-orange hover:text-white"
                                    >
                                      Use "{countrySearch.trim()}" as destination
                                    </Button>
                                  )}
                                </div>
                              </CommandEmpty>
                              <CommandGroup>
                                {filteredCountries.map((country) => (
                                  <CommandItem
                                    key={country}
                                    onSelect={() => {
                                      field.onChange(country);
                                      setIsCountryOpen(false);
                                      setCountrySearch("");
                                    }}
                                    className="flex items-center gap-2 cursor-pointer"
                                  >
                                    <Globe className="w-4 h-4 text-gray-400" />
                                    {country}
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-12 bg-travel-orange hover:bg-travel-orange/90 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Submitting Application...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Send className="w-4 h-4" />
                      Submit Visa Application
                    </div>
                  )}
                </Button>
              </form>
            </Form>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default VisaServicesSection;
