import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Briefcase,
  GraduationCap,
  MessageSquare,
  Laptop,
  TrendingUp,
  Users,
  Video,
  Bot,
  FileSpreadsheet,
  Home,
  IndianRupee,
  ArrowRight,
  Send,
  Upload,
  CheckCircle,
  Globe,
  Phone,
  Mail,
  User,
  ChevronDown
} from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useToast } from "@/hooks/use-toast";
import { collection, addDoc, getDocs, query, where, orderBy, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { trackButtonClick } from "@/services/clickTracker";
import { usePageVisibility } from "@/hooks/usePageVisibility";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface JobListing {
  id: string;
  title: string;
  type: string;
  description: string;
  requirements: string;
  status: string;
  createdAt: any;
}

const Careers = () => {
  const navigate = useNavigate();
  const formRef = useRef<HTMLDivElement>(null);
  const { isPageVisible, loading: visibilityLoading } = usePageVisibility();
  const { toast } = useToast();

  const [jobs, setJobs] = useState<JobListing[]>([]);
  const [jobsLoading, setJobsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    knowsHindi: "",
    hasLaptop: "",
    message: "",
  });
  const [resumeFile, setResumeFile] = useState<File | null>(null);

  // Redirect if careers page is turned off
  useEffect(() => {
    if (!visibilityLoading && !isPageVisible('careers')) {
      navigate('/', { replace: true });
    }
  }, [visibilityLoading, isPageVisible, navigate]);

  // Fetch open jobs
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const q = query(
          collection(db, 'career_jobs'),
          where('status', '==', 'Open'),
          orderBy('createdAt', 'desc')
        );
        const snapshot = await getDocs(q);
        const jobsList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as JobListing[];
        setJobs(jobsList);
      } catch (error) {
        console.error("Error fetching jobs:", error);
      } finally {
        setJobsLoading(false);
      }
    };
    fetchJobs();
  }, []);

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: "Resume file must be less than 5MB.",
          variant: "destructive"
        });
        return;
      }
      setResumeFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    trackButtonClick("Careers Form Submit");

    if (!formData.fullName || !formData.email || !formData.phone || !formData.knowsHindi || !formData.hasLaptop) {
      toast({
        title: "Missing Fields",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      let resumeData = null;
      if (resumeFile) {
        // Convert file to base64 for Firebase storage
        const reader = new FileReader();
        resumeData = await new Promise<string>((resolve, reject) => {
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(resumeFile);
        });
      }

      const applicationData = {
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        knowsHindi: formData.knowsHindi,
        hasLaptop: formData.hasLaptop,
        resumeFileName: resumeFile?.name || null,
        resumeData: resumeData,
        message: formData.message,
        status: 'New',
        createdAt: serverTimestamp(),
      };

      await addDoc(collection(db, 'career_applications'), applicationData);

      setSubmitted(true);
      setFormData({
        fullName: "",
        email: "",
        phone: "",
        knowsHindi: "",
        hasLaptop: "",
        message: "",
      });
      setResumeFile(null);

      toast({
        title: "Application Submitted!",
        description: "Thank you! Our team will contact you soon.",
      });
    } catch (error) {
      console.error("Error submitting application:", error);
      toast({
        title: "Submission Error",
        description: "There was an error submitting your application. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Benefits data
  const benefits = [
    { icon: MessageSquare, title: "Communication Skills", description: "Improve your speaking and writing skills through real client interactions" },
    { icon: Users, title: "Client Handling", description: "Learn how to manage and assist customers professionally" },
    { icon: FileSpreadsheet, title: "Excel & Typing", description: "Master Excel and improve your typing speed for office work" },
    { icon: Bot, title: "AI Tools & Automation", description: "Learn cutting-edge AI tools used in modern business workflows" },
    { icon: Video, title: "Poster & Video Creation", description: "Create engaging marketing materials and social media content" },
    { icon: Briefcase, title: "Practical Experience", description: "Get hands-on work experience in a real travel startup environment" },
  ];

  // Stipend timeline data
  const stipendTimeline = [
    { month: "1st Month", amount: "₹1,000", label: "Training Stipend" },
    { month: "2nd Month", amount: "₹1,500", label: "+₹500 Increment" },
    { month: "3rd Month", amount: "₹2,000", label: "+₹500 Increment" },
    { month: "4th Month+", amount: "₹2,500+", label: "Growing Stipend" },
  ];

  if (visibilityLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-travel-orange"></div>
      </div>
    );
  }

  if (!isPageVisible('careers')) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        {/* Hero Section */}
        <section 
          className="relative w-screen h-[calc(100vh-80px)] bg-cover bg-center bg-no-repeat overflow-hidden flex items-center -ml-[calc((100vw-100%)/2)]"
          style={{ backgroundImage: "linear-gradient(rgba(0,0,0,0.55), rgba(0,0,0,0.55)), url('https://res.cloudinary.com/dvmrhs2ek/image/upload/v1770469542/mphqbyokceqppnws8c4p.png')" }}
        >
          <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28 lg:py-36 relative z-10">
            <div className="max-w-3xl mx-auto text-center">
              {/* Title */}
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight"
              >
                Join Our Team at{" "}
                <span className="text-travel-orange">Anand Travel Agency</span>
              </motion.h1>

              {/* Subtitle */}
              <motion.p
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.15 }}
                className="text-base md:text-lg lg:text-xl text-gray-200 mb-10 leading-relaxed max-w-2xl mx-auto"
              >
                Start your career with us and gain real work experience in a growing travel startup.
              </motion.p>

              {/* CTA Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="flex flex-col sm:flex-row gap-4 justify-center"
              >
                <Button
                  size="lg"
                  onClick={scrollToForm}
                  className="bg-travel-orange hover:bg-orange-600 text-white text-lg px-10 py-6 rounded-lg transition-all duration-200"
                >
                  Apply Now <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => document.getElementById('openings')?.scrollIntoView({ behavior: 'smooth' })}
                  className="border-2 border-white text-white bg-transparent hover:bg-white hover:text-gray-900 text-lg px-10 py-6 rounded-lg transition-all duration-300"
                >
                  View Openings <ChevronDown className="ml-2 h-5 w-5" />
                </Button>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Internship Details / Stipend Section */}
        <section className="py-16 md:py-20 bg-gradient-to-b from-gray-50 to-white">
          <div className="container-custom">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Internship Details</h2>
              <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                We believe in rewarding your growth. Your stipend increases every month!
              </p>
            </motion.div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 max-w-4xl mx-auto mb-12">
              {stipendTimeline.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                >
                  <Card className="text-center border-2 hover:border-travel-orange/50 transition-all hover:shadow-lg h-full">
                    <CardContent className="pt-6 pb-4">
                      <div className="w-12 h-12 rounded-full bg-travel-orange/10 flex items-center justify-center mx-auto mb-3">
                        <IndianRupee className="h-6 w-6 text-travel-orange" />
                      </div>
                      <p className="text-sm text-gray-500 font-medium">{item.month}</p>
                      <p className="text-2xl md:text-3xl font-bold text-gray-900 my-1">{item.amount}</p>
                      <p className="text-xs text-travel-orange font-medium">{item.label}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* WFH Highlight */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="max-w-2xl mx-auto"
            >
              <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 shadow-md">
                <CardContent className="flex items-center gap-4 p-6">
                  <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                    <Home className="h-7 w-7 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-green-800">Work From Home Opportunity</h3>
                    <p className="text-green-700 text-sm">
                      Performance-based permanent Work From Home opportunity available for dedicated candidates.
                    </p>
                  </div>
                  <Badge className="bg-green-600 text-white flex-shrink-0 hidden sm:flex">WFH</Badge>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </section>

        {/* Key Benefits */}
        <section className="py-16 md:py-20 bg-white">
          <div className="container-custom">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">What You'll Learn</h2>
              <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                Gain valuable skills that will boost your career in any industry
              </p>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                >
                  <Card className="h-full hover:shadow-lg transition-all border-gray-100 hover:border-travel-orange/30 group">
                    <CardContent className="p-6">
                      <div className="w-12 h-12 rounded-xl bg-blue-50 group-hover:bg-travel-orange/10 flex items-center justify-center mb-4 transition-colors">
                        <benefit.icon className="h-6 w-6 text-blue-600 group-hover:text-travel-orange transition-colors" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{benefit.title}</h3>
                      <p className="text-gray-600 text-sm leading-relaxed">{benefit.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Requirements */}
        <section className="py-16 md:py-20 bg-gray-50">
          <div className="container-custom">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Requirements</h2>
              <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                Simple requirements to get started with us
              </p>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto">
              {[
                { icon: Globe, text: "Must know Hindi and English" },
                { icon: Laptop, text: "Must have a laptop" },
                { icon: TrendingUp, text: "Willing to work seriously" },
                { icon: Home, text: "Work From Home" },
              ].map((req, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                >
                  <Card className="text-center h-full hover:shadow-md transition-all">
                    <CardContent className="p-6 flex flex-col items-center">
                      <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                        <req.icon className="h-7 w-7 text-blue-600" />
                      </div>
                      <p className="font-medium text-gray-800">{req.text}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Current Openings */}
        <section id="openings" className="py-16 md:py-20 bg-white">
          <div className="container-custom">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Current Openings</h2>
              <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                Explore available positions and find the right fit for you
              </p>
            </motion.div>

            {jobsLoading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-travel-orange"></div>
              </div>
            ) : jobs.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
                {jobs.map((job, index) => (
                  <motion.div
                    key={job.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                  >
                    <Card className="h-full hover:shadow-lg transition-all border-gray-100 hover:border-blue-200">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <CardTitle className="text-lg">{job.title}</CardTitle>
                          <Badge className={`flex-shrink-0 ${job.status === 'Open' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {job.status}
                          </Badge>
                        </div>
                        <div className="flex gap-2 mt-2">
                          <Badge variant="outline" className="text-xs">
                            {job.type}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-600 text-sm mb-4">{job.description}</p>
                        {job.requirements && (
                          <div className="text-xs text-gray-500">
                            <p className="font-medium text-gray-700 mb-1">Requirements:</p>
                            <p>{job.requirements}</p>
                          </div>
                        )}
                        <Button
                          onClick={scrollToForm}
                          className="mt-4 w-full bg-travel-orange hover:bg-orange-600"
                          size="sm"
                        >
                          Apply Now <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12"
              >
                <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                  <Briefcase className="h-10 w-10 text-gray-400" />
                </div>
                <p className="text-gray-600 text-lg mb-2">Currently, there are no openings.</p>
                <p className="text-gray-500">You can submit your details below for future opportunities.</p>
              </motion.div>
            )}
          </div>
        </section>

        {/* Application Form */}
        <section ref={formRef} className="py-16 md:py-20 bg-gradient-to-b from-gray-50 to-white">
          <div className="container-custom">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Apply Now</h2>
              <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                Fill in the form below and our team will get in touch with you
              </p>
            </motion.div>

            <div className="max-w-2xl mx-auto">
              {submitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-16"
                >
                  <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="h-10 w-10 text-green-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">Thank You!</h3>
                  <p className="text-gray-600 text-lg mb-6">Our team will contact you soon.</p>
                  <Button onClick={() => setSubmitted(false)} variant="outline">
                    Submit Another Application
                  </Button>
                </motion.div>
              ) : (
                <Card className="shadow-lg border-gray-100">
                  <CardContent className="p-6 md:p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                      {/* Full Name */}
                      <div className="space-y-2">
                        <Label htmlFor="fullName" className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-500" />
                          Full Name <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="fullName"
                          name="fullName"
                          value={formData.fullName}
                          onChange={handleChange}
                          placeholder="Enter your full name"
                          required
                        />
                      </div>

                      {/* Email */}
                      <div className="space-y-2">
                        <Label htmlFor="email" className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-gray-500" />
                          Email <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="Enter your email address"
                          required
                        />
                      </div>

                      {/* Phone Number */}
                      <div className="space-y-2">
                        <Label htmlFor="phone" className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-gray-500" />
                          Phone Number <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="phone"
                          name="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={handleChange}
                          placeholder="Enter your phone number"
                          required
                        />
                      </div>

                      {/* Hindi & Laptop - side by side */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="flex items-center gap-2">
                            <Globe className="h-4 w-4 text-gray-500" />
                            Do you know Hindi? <span className="text-red-500">*</span>
                          </Label>
                          <Select
                            value={formData.knowsHindi}
                            onValueChange={(val) => handleSelectChange('knowsHindi', val)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Yes">Yes</SelectItem>
                              <SelectItem value="No">No</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label className="flex items-center gap-2">
                            <Laptop className="h-4 w-4 text-gray-500" />
                            Do you have a laptop? <span className="text-red-500">*</span>
                          </Label>
                          <Select
                            value={formData.hasLaptop}
                            onValueChange={(val) => handleSelectChange('hasLaptop', val)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Yes">Yes</SelectItem>
                              <SelectItem value="No">No</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {/* Resume Upload */}
                      <div className="space-y-2">
                        <Label htmlFor="resume" className="flex items-center gap-2">
                          <Upload className="h-4 w-4 text-gray-500" />
                          Upload Resume <span className="text-gray-400 text-sm">(optional, max 5MB)</span>
                        </Label>
                        <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 hover:border-travel-orange/50 transition-colors">
                          <input
                            id="resume"
                            type="file"
                            accept=".pdf,.doc,.docx"
                            onChange={handleFileChange}
                            className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-travel-orange/10 file:text-travel-orange hover:file:bg-travel-orange/20 cursor-pointer"
                          />
                          {resumeFile && (
                            <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                              <CheckCircle className="h-3 w-3" /> {resumeFile.name}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Message */}
                      <div className="space-y-2">
                        <Label htmlFor="message" className="flex items-center gap-2">
                          <MessageSquare className="h-4 w-4 text-gray-500" />
                          Message <span className="text-gray-400 text-sm">(optional)</span>
                        </Label>
                        <Textarea
                          id="message"
                          name="message"
                          value={formData.message}
                          onChange={handleChange}
                          placeholder="Tell us about yourself, your skills, or why you want to join..."
                          rows={4}
                        />
                      </div>

                      {/* Submit */}
                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-travel-orange hover:bg-orange-600 text-white py-6 text-lg rounded-xl shadow-md hover:shadow-lg transition-all"
                      >
                        {isSubmitting ? (
                          <span className="flex items-center gap-2">
                            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                            Submitting...
                          </span>
                        ) : (
                          <span className="flex items-center gap-2">
                            <Send className="h-5 w-5" />
                            Submit Application
                          </span>
                        )}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Careers;
