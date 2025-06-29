
import React from "react";
import { motion } from "framer-motion";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  MapPin,
  Phone,
  Mail,
  MessageSquare,
  Clock,
  Send,
  CheckCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Contact = () => {
  const { toast } = useToast();
  const [formStatus, setFormStatus] = React.useState("idle");
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormStatus("submitting");
    
    // Simulate form submission
    setTimeout(() => {
      setFormStatus("success");
      toast({
        title: "Message Sent!",
        description: "We've received your message and will get back to you soon.",
        action: <CheckCircle className="h-5 w-5 text-green-500" />
      });
    }, 1500);
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-medblue-50 via-white to-medteal-50 py-16 px-4">
          <div className="container mx-auto max-w-6xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center"
            >
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Get in Touch
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Have questions about our courses or need support? We're here to help.
              </p>
            </motion.div>
          </div>
        </section>
        
        {/* Contact Information */}
        <section className="py-12 px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="bg-white p-8 rounded-xl shadow-sm border border-slate-100 text-center"
              >
                <div className="w-12 h-12 bg-medblue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MapPin className="h-6 w-6 text-medblue-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Visit Our Office</h3>
                <p className="text-gray-600">
                  123 Medical Campus Drive<br />
                  San Francisco, CA 94103<br />
                  United States
                </p>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="bg-white p-8 rounded-xl shadow-sm border border-slate-100 text-center"
              >
                <div className="w-12 h-12 bg-medteal-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Phone className="h-6 w-6 text-medteal-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Call Us</h3>
                <p className="text-gray-600">
                  +1 (555) 123-4567<br />
                  Monday-Friday: 9am-5pm PST
                </p>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="bg-white p-8 rounded-xl shadow-sm border border-slate-100 text-center"
              >
                <div className="w-12 h-12 bg-medblue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mail className="h-6 w-6 text-medblue-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Email Us</h3>
                <p className="text-gray-600">
                  support@medmaster.com<br />
                  partnerships@medmaster.com
                </p>
              </motion.div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Send Us a Message</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700" htmlFor="name">
                        Full Name
                      </label>
                      <Input id="name" placeholder="John Doe" required />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700" htmlFor="email">
                        Email Address
                      </label>
                      <Input id="email" type="email" placeholder="john@example.com" required />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700" htmlFor="subject">
                      Subject
                    </label>
                    <Input id="subject" placeholder="How can we help you?" required />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700" htmlFor="message">
                      Message
                    </label>
                    <Textarea 
                      id="message" 
                      placeholder="Please describe your question or issue in detail..." 
                      rows={5}
                      required
                    />
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="bg-medblue-600 hover:bg-medblue-700 w-full"
                    disabled={formStatus === "submitting"}
                  >
                    {formStatus === "submitting" ? (
                      <><span className="animate-spin mr-2">◌</span> Sending...</>
                    ) : formStatus === "success" ? (
                      <><CheckCircle className="mr-2 h-4 w-4" /> Message Sent!</>
                    ) : (
                      <><Send className="mr-2 h-4 w-4" /> Send Message</>
                    )}
                  </Button>
                </form>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
                
                <div className="space-y-6">
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                    <div className="flex">
                      <div className="mr-4 flex-shrink-0">
                        <MessageSquare className="h-6 w-6 text-medblue-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          How do I get technical support for the platform?
                        </h3>
                        <p className="text-gray-600">
                          For technical issues, please email support@medmaster.com with details of the problem, including screenshots if possible. Our team typically responds within 24 hours on business days.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                    <div className="flex">
                      <div className="mr-4 flex-shrink-0">
                        <Clock className="h-6 w-6 text-medteal-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          What are your customer service hours?
                        </h3>
                        <p className="text-gray-600">
                          Our customer service team is available Monday through Friday, 9am to 5pm Pacific Time. We try to respond to all inquiries within one business day.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                    <div className="flex">
                      <div className="mr-4 flex-shrink-0">
                        <Mail className="h-6 w-6 text-medblue-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          How do I request a refund?
                        </h3>
                        <p className="text-gray-600">
                          If you're not satisfied with your purchase, you can request a refund within 30 days by emailing billing@medmaster.com with your order details and reason for the refund.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-8 p-6 bg-medblue-50 rounded-xl">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Need Immediate Assistance?</h3>
                  <p className="text-gray-600 mb-4">
                    Our live chat support is available during business hours for quick questions and guidance.
                  </p>
                  <Button className="bg-medblue-600 hover:bg-medblue-700">
                    Start Live Chat
                  </Button>
                </div>
              </motion.div>
            </div>
          </div>
        </section>
        
        {/* Map Section */}
        <section className="py-12 px-4">
          <div className="container mx-auto max-w-6xl">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden"
            >
              <div className="aspect-[16/9] w-full bg-gray-200">
                {/* This would typically be a Google Map or similar */}
                <div className="w-full h-full flex items-center justify-center bg-slate-100">
                  <div className="text-center">
                    <MapPin className="h-12 w-12 text-medblue-600 mx-auto mb-2" />
                    <h3 className="text-xl font-bold">MedMaster Headquarters</h3>
                    <p className="text-gray-600">123 Medical Campus Drive, San Francisco</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Contact;
