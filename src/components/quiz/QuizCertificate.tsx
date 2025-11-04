
import React, { useRef } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Share2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import html2canvas from "html2canvas";
import QRCode from "react-qr-code";

interface QuizCertificateProps {
  quizTitle: string;
  courseName: string;
  completionDate: Date;
  score: number;
  maxScore: number;
  userName: string;
  verificationCode?: string;
}

const QuizCertificate: React.FC<QuizCertificateProps> = ({
  quizTitle,
  courseName,
  completionDate,
  score,
  maxScore,
  userName,
  verificationCode = "ABC123XYZ"
}) => {
  const certificateRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric', 
      month: 'long', 
      day: 'numeric'
    }).format(date);
  };
  
  const downloadCertificate = async () => {
    if (!certificateRef.current) return;
    
    try {
      const canvas = await html2canvas(certificateRef.current);
      const image = canvas.toDataURL('image/png');
      
      const link = document.createElement('a');
      link.href = image;
      link.download = `${quizTitle.replace(/\s+/g, '-').toLowerCase()}-certificate.png`;
      link.click();
      
      toast({
        title: "Success",
        description: "Certificate downloaded successfully"
      });
    } catch (error) {
      console.error('Error generating certificate:', error);
      toast({
        title: "Error",
        description: "Failed to download certificate",
        variant: "destructive"
      });
    }
  };
  
  const shareCertificate = async () => {
    try {
      if (!certificateRef.current) return;
      
      const canvas = await html2canvas(certificateRef.current);
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((blob) => {
          if (blob) resolve(blob);
        }, 'image/png');
      });
      
      if (navigator.share) {
        await navigator.share({
          title: 'My Certificate of Completion',
          text: `I completed ${quizTitle} with a score of ${score}/${maxScore}!`,
          files: [new File([blob], 'certificate.png', { type: 'image/png' })]
        });
      } else {
        toast({
          title: "Sharing not supported",
          description: "Your browser doesn't support sharing. Try downloading instead.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error sharing certificate:', error);
      toast({
        title: "Error",
        description: "Failed to share certificate",
        variant: "destructive"
      });
    }
  };
  
  const percentScore = Math.round((score / maxScore) * 100);
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-4xl mx-auto"
    >
      <div className="mb-4 flex justify-end space-x-3">
        <Button 
          variant="outline"
          className="flex items-center"
          onClick={downloadCertificate}
        >
          <Download className="w-4 h-4 mr-2" />
          Download
        </Button>
        
        {navigator.share && (
          <Button
            className="flex items-center"
            onClick={shareCertificate}
          >
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
        )}
      </div>
      
      <Card className="p-6 border-4 border-medblue-200">
        <div 
          ref={certificateRef}
          className="bg-white p-8 md:p-12 relative certificate-bg"
        >
          {/* Decorative elements */}
          <div className="absolute top-0 left-0 w-full h-full border-8 border-medblue-100 pointer-events-none"></div>
          <div className="absolute top-8 left-8 right-8 bottom-8 border-2 border-medblue-300 pointer-events-none"></div>
          
          <div className="text-center mb-8">
            <div className="text-3xl font-bold text-medblue-800 font-nunito-sans mb-1">Certificate of Completion</div>
            <div className="text-lg text-medblue-600 font-exo2">This certifies that</div>
          </div>
          
          <div className="text-center mb-8">
            <div className="text-3xl font-bold text-slate-800 font-nunito-sans mb-2">
              {userName}
            </div>
            <div className="text-lg font-exo2">
              has successfully completed the quiz
            </div>
          </div>
          
          <div className="text-center mb-10">
            <div className="text-2xl font-bold text-slate-800 font-nunito-sans">
              {quizTitle}
            </div>
            <div className="text-lg text-slate-600 font-exo2">
              from the course: {courseName}
            </div>
          </div>
          
          <div className="flex justify-between items-center mb-10">
            <div className="text-left">
              <div className="text-sm text-slate-600 mb-1">Date of Completion</div>
              <div className="font-bold font-exo2">{formatDate(completionDate)}</div>
            </div>
            
            <div className="text-right">
              <div className="text-sm text-slate-600 mb-1">Final Score</div>
              <div className="font-bold font-exo2">{percentScore}%</div>
            </div>
          </div>
          
          <div className="flex justify-between items-end">
            <div>
              <div className="h-px w-48 bg-slate-400 mb-1"></div>
              <div className="text-sm text-slate-600">Authorized Signature</div>
            </div>
            
            <div className="flex flex-col items-center">
              <QRCode 
                value={`verify:${verificationCode}`} 
                size={80}
                className="mb-1"
              />
              <div className="text-xs text-slate-500">Verification Code: {verificationCode}</div>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

export default QuizCertificate;
