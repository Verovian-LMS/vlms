
import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Check, X, Sparkles } from "lucide-react";

const pricingPlans = [
  {
    name: "Basic",
    price: "Free",
    description: "Essential tools for medical students just getting started",
    features: [
      "Access to 10 free lectures",
      "Basic quiz functionality",
      "Community forum access",
      "Mobile app access"
    ],
    notIncluded: [
      "Full course library",
      "Downloadable resources",
      "Certificate of completion",
      "Personal study coach",
      "Practice exams"
    ],
    cta: "Start Free",
    popular: false,
    ctaLink: "/signup"
  },
  {
    name: "Premium",
    price: "$19.99",
    period: "per month",
    description: "Everything you need for comprehensive medical exam preparation",
    features: [
      "Full access to all courses",
      "Unlimited quizzes and practice tests",
      "Downloadable lecture notes",
      "Certificates of completion",
      "Priority support",
      "Offline viewing",
      "Personal progress tracking",
      "Ad-free experience"
    ],
    notIncluded: [
      "Personal study coach",
      "Custom curriculum design"
    ],
    cta: "Start 7-Day Free Trial",
    popular: true,
    ctaLink: "/signup"
  },
  {
    name: "Ultimate",
    price: "$39.99",
    period: "per month",
    description: "The complete package with personal coaching for serious students",
    features: [
      "Everything in Premium",
      "Personal study coach",
      "Custom curriculum design",
      "One-on-one tutoring sessions",
      "Mock interviews",
      "Career counseling",
      "Early access to new courses",
      "Exclusive webinars with medical experts"
    ],
    notIncluded: [],
    cta: "Get Started",
    popular: false,
    ctaLink: "/signup"
  }
];

const faqItems = [
  {
    question: "Can I cancel my subscription at any time?",
    answer: "Yes, you can cancel your subscription at any time. If you cancel, you'll continue to have access to your subscription benefits until the end of your billing cycle."
  },
  {
    question: "How do the free trials work?",
    answer: "Our free trials provide full access to all features of the selected plan for 7 days. You won't be charged during the trial period, and you can cancel anytime before the trial ends to avoid being billed."
  },
  {
    question: "Are there discounts for students?",
    answer: "Yes! We offer a 20% discount for verified students. Contact our support team with your valid student ID to get your discount code."
  },
  {
    question: "Can I switch between plans?",
    answer: "Absolutely! You can upgrade or downgrade your plan at any time. If you upgrade, the new rate will be prorated for the remainder of your billing cycle. If you downgrade, the new rate will take effect on your next billing date."
  },
  {
    question: "Do you offer group or institutional pricing?",
    answer: "Yes, we offer special rates for groups and institutions. Please contact our sales team for a custom quote tailored to your needs."
  }
];

const PricingCard = ({ plan, index }) => (
  <motion.div 
    className={`
      bg-white rounded-xl shadow-lg border overflow-hidden 
      ${plan.popular ? 'border-medblue-600 shadow-blue-100' : 'border-slate-100'}
    `}
    initial={{ opacity: 0, y: 30 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay: index * 0.1 }}
  >
    {plan.popular && (
      <div className="bg-medblue-600 py-2 text-center text-white text-sm font-medium">
        MOST POPULAR
      </div>
    )}
    <div className="p-6 pb-4">
      <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
      <div className="mb-3">
        <span className="text-4xl font-bold">{plan.price}</span>
        {plan.period && <span className="text-gray-500 ml-1">{plan.period}</span>}
      </div>
      <p className="text-gray-600 mb-6">{plan.description}</p>
      
      <Button 
        className={`w-full ${
          plan.popular 
            ? 'bg-medblue-600 hover:bg-medblue-700' 
            : 'bg-gray-800 hover:bg-gray-900'
        }`}
        asChild
      >
        <Link to={plan.ctaLink}>{plan.cta}</Link>
      </Button>
    </div>
    
    <div className="px-6 pt-4 pb-6 border-t border-slate-100">
      <p className="font-semibold text-sm mb-3">WHAT'S INCLUDED:</p>
      <ul className="space-y-2 mb-6">
        {plan.features.map((feature, i) => (
          <li key={i} className="flex items-center">
            <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
            <span className="text-sm">{feature}</span>
          </li>
        ))}
      </ul>
      
      {plan.notIncluded.length > 0 && (
        <>
          <p className="font-semibold text-sm mb-3 text-gray-500">NOT INCLUDED:</p>
          <ul className="space-y-2">
            {plan.notIncluded.map((feature, i) => (
              <li key={i} className="flex items-center text-gray-400">
                <X className="h-5 w-5 text-gray-300 mr-2 flex-shrink-0" />
                <span className="text-sm">{feature}</span>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  </motion.div>
);

const Pricing = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      
      <main className="flex-grow">
        {/* Hero section */}
        <section className="bg-gradient-to-br from-medblue-50 to-white py-20 px-4">
          <div className="container mx-auto max-w-5xl text-center">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Simple, Transparent Pricing
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
                Choose the plan that's right for your medical education journey
              </p>
              
              <div className="inline-flex items-center bg-white rounded-lg p-1 border border-slate-200 mb-8">
                <button className="py-2 px-4 rounded-md bg-medblue-600 text-white font-medium">
                  Monthly
                </button>
                <button className="py-2 px-4 rounded-md text-gray-700 font-medium">
                  Annual (Save 20%)
                </button>
              </div>
              
              <div className="flex justify-center items-center text-sm mb-4 text-gray-600">
                <Sparkles className="h-4 w-4 text-yellow-500 mr-2" />
                <p>All plans include a 7-day free trial</p>
              </div>
            </motion.div>
          </div>
        </section>
        
        {/* Pricing cards */}
        <section className="py-12 px-4 -mt-16">
          <div className="container mx-auto max-w-6xl">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {pricingPlans.map((plan, index) => (
                <PricingCard key={plan.name} plan={plan} index={index} />
              ))}
            </div>
          </div>
        </section>
        
        {/* Features comparison */}
        <section className="py-16 px-4 bg-slate-50">
          <div className="container mx-auto max-w-6xl">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-3xl font-bold text-center mb-12">Compare Features</h2>
              
              <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-50">
                      <th className="text-left py-4 px-6 font-medium text-gray-500">Features</th>
                      <th className="text-center py-4 px-4 font-medium text-gray-500">Basic</th>
                      <th className="text-center py-4 px-4 font-medium text-gray-500 bg-medblue-50">Premium</th>
                      <th className="text-center py-4 px-4 font-medium text-gray-500">Ultimate</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr>
                      <td className="py-4 px-6 font-medium">Number of courses</td>
                      <td className="text-center py-4 px-4">10</td>
                      <td className="text-center py-4 px-4 bg-medblue-50">All courses</td>
                      <td className="text-center py-4 px-4">All courses</td>
                    </tr>
                    <tr>
                      <td className="py-4 px-6 font-medium">Practice quizzes</td>
                      <td className="text-center py-4 px-4">Limited</td>
                      <td className="text-center py-4 px-4 bg-medblue-50">Unlimited</td>
                      <td className="text-center py-4 px-4">Unlimited</td>
                    </tr>
                    <tr>
                      <td className="py-4 px-6 font-medium">Flashcard system</td>
                      <td className="text-center py-4 px-4">Basic</td>
                      <td className="text-center py-4 px-4 bg-medblue-50">Advanced</td>
                      <td className="text-center py-4 px-4">Advanced</td>
                    </tr>
                    <tr>
                      <td className="py-4 px-6 font-medium">Downloadable resources</td>
                      <td className="text-center py-4 px-4">
                        <X className="h-5 w-5 text-red-500 mx-auto" />
                      </td>
                      <td className="text-center py-4 px-4 bg-medblue-50">
                        <Check className="h-5 w-5 text-green-500 mx-auto" />
                      </td>
                      <td className="text-center py-4 px-4">
                        <Check className="h-5 w-5 text-green-500 mx-auto" />
                      </td>
                    </tr>
                    <tr>
                      <td className="py-4 px-6 font-medium">Certificates</td>
                      <td className="text-center py-4 px-4">
                        <X className="h-5 w-5 text-red-500 mx-auto" />
                      </td>
                      <td className="text-center py-4 px-4 bg-medblue-50">
                        <Check className="h-5 w-5 text-green-500 mx-auto" />
                      </td>
                      <td className="text-center py-4 px-4">
                        <Check className="h-5 w-5 text-green-500 mx-auto" />
                      </td>
                    </tr>
                    <tr>
                      <td className="py-4 px-6 font-medium">Personal coach</td>
                      <td className="text-center py-4 px-4">
                        <X className="h-5 w-5 text-red-500 mx-auto" />
                      </td>
                      <td className="text-center py-4 px-4 bg-medblue-50">
                        <X className="h-5 w-5 text-red-500 mx-auto" />
                      </td>
                      <td className="text-center py-4 px-4">
                        <Check className="h-5 w-5 text-green-500 mx-auto" />
                      </td>
                    </tr>
                    <tr>
                      <td className="py-4 px-6 font-medium">One-on-one tutoring</td>
                      <td className="text-center py-4 px-4">
                        <X className="h-5 w-5 text-red-500 mx-auto" />
                      </td>
                      <td className="text-center py-4 px-4 bg-medblue-50">
                        <X className="h-5 w-5 text-red-500 mx-auto" />
                      </td>
                      <td className="text-center py-4 px-4">
                        <Check className="h-5 w-5 text-green-500 mx-auto" />
                      </td>
                    </tr>
                    <tr>
                      <td className="py-4 px-6 font-medium">Priority support</td>
                      <td className="text-center py-4 px-4">
                        <X className="h-5 w-5 text-red-500 mx-auto" />
                      </td>
                      <td className="text-center py-4 px-4 bg-medblue-50">
                        <Check className="h-5 w-5 text-green-500 mx-auto" />
                      </td>
                      <td className="text-center py-4 px-4">
                        <Check className="h-5 w-5 text-green-500 mx-auto" />
                      </td>
                    </tr>
                    <tr>
                      <td className="py-4 px-6"></td>
                      <td className="text-center py-4 px-4">
                        <Button variant="outline" size="sm" asChild>
                          <Link to="/signup">Start Free</Link>
                        </Button>
                      </td>
                      <td className="text-center py-4 px-4 bg-medblue-50">
                        <Button size="sm" className="bg-medblue-600 hover:bg-medblue-700" asChild>
                          <Link to="/signup">Start Free Trial</Link>
                        </Button>
                      </td>
                      <td className="text-center py-4 px-4">
                        <Button variant="outline" size="sm" asChild>
                          <Link to="/signup">Get Started</Link>
                        </Button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </motion.div>
          </div>
        </section>
        
        {/* FAQ section */}
        <section className="py-16 px-4">
          <div className="container mx-auto max-w-3xl">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
              
              <div className="space-y-6">
                {faqItems.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
                    className="bg-white rounded-lg shadow-sm border border-slate-100 p-6"
                  >
                    <h3 className="text-lg font-bold mb-2">{item.question}</h3>
                    <p className="text-gray-600">{item.answer}</p>
                  </motion.div>
                ))}
              </div>
              
              <div className="mt-12 text-center">
                <p className="text-gray-600 mb-4">Have more questions? We're here to help</p>
                <Button className="bg-medblue-600 hover:bg-medblue-700" asChild>
                  <Link to="/contact">Contact Support</Link>
                </Button>
              </div>
            </motion.div>
          </div>
        </section>
        
        {/* CTA Section */}
        <section className="py-20 px-4 bg-medblue-600 text-white">
          <div className="container mx-auto max-w-5xl text-center">
            <motion.h2 
              className="text-3xl md:text-4xl font-bold mb-6"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              Ready to Transform Your Medical Education?
            </motion.h2>
            <motion.p 
              className="text-xl mb-8 text-blue-100 max-w-3xl mx-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              Join thousands of medical students and professionals who've achieved their goals with MedMaster.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <Button 
                size="lg" 
                className="bg-white text-medblue-600 hover:bg-blue-50 text-lg px-8 py-6"
                asChild
              >
                <Link to="/signup">Start Your Free 7-Day Trial</Link>
              </Button>
            </motion.div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Pricing;
