
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Brain, 
  HeartPulse, 
  UsersRound, 
  BookCopy, 
  FileSpreadsheet, 
  ArrowRight, 
  CheckCircle2 
} from "lucide-react";

const VersionFeatures = () => {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };
  
  const features = [
    {
      title: "Virtual Patient Encounters",
      description: "Interactive clinical decision-making exercises with realistic patient scenarios",
      icon: <HeartPulse className="h-8 w-8 text-rose-500" />,
      link: "/virtual-patient",
      badgeText: "New",
      badgeVariant: "default"
    },
    {
      title: "AI-Powered Tutoring",
      description: "Personalized learning assistance with adaptive feedback and explanations",
      icon: <Brain className="h-8 w-8 text-violet-500" />,
      link: "/ai-tutor",
      badgeText: "New",
      badgeVariant: "default"
    },
    {
      title: "Global Community",
      description: "International forum for medical professionals to discuss and collaborate",
      icon: <UsersRound className="h-8 w-8 text-blue-500" />,
      link: "/community-forum",
      badgeText: "New",
      badgeVariant: "default"
    },
    {
      title: "Research Portal",
      description: "Access to latest medical literature and studies with advanced filtering",
      icon: <BookCopy className="h-8 w-8 text-emerald-500" />,
      link: "/research-portal",
      badgeText: "New",
      badgeVariant: "default"
    },
    {
      title: "EMR Integration",
      description: "Seamless connection with electronic medical record systems for practical application",
      icon: <FileSpreadsheet className="h-8 w-8 text-amber-500" />,
      link: "/ehr-integration",
      badgeText: "New",
      badgeVariant: "default"
    }
  ];

  return (
    <section className="py-16 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <Badge className="mb-3">Version 2.0</Badge>
          <motion.h2 
            className="text-3xl md:text-4xl font-bold mb-4"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            New Features & Capabilities
          </motion.h2>
          <motion.p 
            className="text-muted-foreground text-lg max-w-3xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Our latest platform update introduces powerful new tools to enhance your medical education experience
          </motion.p>
        </div>
        
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={container}
          initial="hidden"
          animate="show"
        >
          {features.map((feature, index) => (
            <motion.div key={index} variants={item}>
              <Card className="h-full flex flex-col card-hover">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="p-3 rounded-full bg-muted">
                      {feature.icon}
                    </div>
                    <Badge variant={feature.badgeVariant as "default" | "secondary" | "outline"}>
                      {feature.badgeText}
                    </Badge>
                  </div>
                  <CardTitle className="mt-4">{feature.title}</CardTitle>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                  <ul className="space-y-2">
                    {[1, 2, 3].map((i) => (
                      <li key={i} className="flex items-start">
                        <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                        <span className="text-sm text-muted-foreground">
                          {getBenefitText(feature.title, i)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button asChild className="w-full bg-medblue-600 hover:bg-medblue-700">
                    <Link to={feature.link} className="flex items-center justify-center">
                      <span>Explore {feature.title}</span>
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

function getBenefitText(title: string, index: number): string {
  const benefits = {
    "Virtual Patient Encounters": [
      "Develop clinical reasoning and decision-making skills",
      "Practice in a safe environment without patient risk",
      "Receive immediate feedback on diagnostic choices"
    ],
    "AI-Powered Tutoring": [
      "Personalized learning adapted to your knowledge gaps",
      "Available 24/7 for questions and explanations",
      "Tracks progress and suggests focused study areas"
    ],
    "Global Community": [
      "Connect with medical professionals worldwide",
      "Discuss cases and share knowledge internationally",
      "Collaborate on research and educational projects"
    ],
    "Research Portal": [
      "Search and filter the latest medical literature",
      "Stay updated on cutting-edge research in your field",
      "Save and organize studies for future reference"
    ],
    "EMR Integration": [
      "Practice with realistic patient data securely",
      "Develop documentation and clinical workflow skills",
      "Learn how to navigate electronic health records"
    ]
  };
  
  return benefits[title as keyof typeof benefits][index - 1];
}

export default VersionFeatures;
