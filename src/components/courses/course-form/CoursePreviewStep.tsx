import React from 'react';
import { useFormContext } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { 
  Play,
  FileText,
  Download,
  Users,
  Clock,
  Star,
  Award,
  Globe,
  DollarSign,
  BookOpen,
  Video,
  FileImage,
  Headphones,
  MousePointer,
  Calendar,
  Eye,
  Edit3,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface CoursePreviewStepProps {
  form: any;
  onNext: () => void;
  onPrevious: () => void;
  isLastStep: boolean;
  isFirstStep: boolean;
  onEdit: (step: number) => void;
}

const CoursePreviewStep: React.FC<CoursePreviewStepProps> = ({
  form,
  onNext,
  onPrevious,
  isLastStep,
  isFirstStep,
  onEdit
}) => {
  const { watch } = useFormContext();
  const formData = watch();

  const getContentTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video className="h-4 w-4" />;
      case 'pdf': return <FileText className="h-4 w-4" />;
      case 'slides': return <FileImage className="h-4 w-4" />;
      case 'audio': return <Headphones className="h-4 w-4" />;
      case 'interactive': return <MousePointer className="h-4 w-4" />;
      case 'downloadable': return <Download className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const calculateTotalDuration = () => {
    if (!formData.modules) return 0;
    return formData.modules.reduce((total: number, module: any) => {
      return total + (module.lessons || []).reduce((moduleTotal: number, lesson: any) => {
        const d = Number(lesson?.duration || 0);
        return moduleTotal + (Number.isFinite(d) ? d : 0);
      }, 0);
    }, 0);
  };

  const getTotalLessons = () => {
    if (!formData.modules) return 0;
    return formData.modules.reduce((total: number, module: any) => {
      return total + (module.lessons || []).length;
    }, 0);
  };

  const getValidationIssues = () => {
    const issues = [];
    
    if (!formData.title) issues.push('Course title is required');
    if (!formData.description) issues.push('Course description is required');
    if (!formData.modules || formData.modules.length === 0) issues.push('At least one module is required');
    if (formData.pricingType === 'paid' && !formData.price) issues.push('Price is required for paid courses');
    
    // Check modules and lessons
    if (formData.modules) {
      formData.modules.forEach((module: any, moduleIndex: number) => {
        if (!module.title) issues.push(`Module ${moduleIndex + 1} title is required`);
        if (!module.lessons || module.lessons.length === 0) {
          issues.push(`Module ${moduleIndex + 1} needs at least one lesson`);
        } else {
          module.lessons.forEach((lesson: any, lessonIndex: number) => {
            if (!lesson.title) issues.push(`Lesson ${lessonIndex + 1} in Module ${moduleIndex + 1} needs a title`);
            const ct = (lesson?.contentType ?? lesson?.content_type ?? '').toString().trim();
            if (!ct) issues.push(`Lesson ${lessonIndex + 1} in Module ${moduleIndex + 1} needs a content type`);
          });
        }
      });
    }
    
    return issues;
  };

  const validationIssues = getValidationIssues();
  const isReadyToPublish = validationIssues.length === 0;

  return (
    <div className="space-y-8">
      {/* Validation Status */}
      <Card className={isReadyToPublish ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
        <CardHeader>
          <CardTitle className={`flex items-center space-x-2 ${isReadyToPublish ? 'text-green-800' : 'text-red-800'}`}>
            {isReadyToPublish ? (
              <CheckCircle2 className="h-5 w-5" />
            ) : (
              <AlertCircle className="h-5 w-5" />
            )}
            <span>Course Validation</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isReadyToPublish ? (
            <div className="text-green-700">
              <p className="font-medium">✅ Your course is ready to publish!</p>
              <p className="text-sm mt-1">All required fields are completed and your course structure looks good.</p>
            </div>
          ) : (
            <div className="text-red-700">
              <p className="font-medium">⚠️ Please fix the following issues before publishing:</p>
              <ul className="list-disc list-inside text-sm mt-2 space-y-1">
                {validationIssues.map((issue, index) => (
                  <li key={index}>{issue}</li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Course Overview */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <BookOpen className="h-5 w-5" />
            <span>Course Overview</span>
          </CardTitle>
          <Button variant="outline" size="sm" onClick={() => onEdit(0)}>
            <Edit3 className="h-4 w-4 mr-2" />
            Edit Basic Info
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-start space-x-4">
            {formData.thumbnail && (
              <img 
                src={formData.thumbnail} 
                alt="Course thumbnail" 
                className="w-32 h-20 object-cover rounded-lg"
              />
            )}
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-2">{formData.title || 'Untitled Course'}</h2>
              <p className="text-gray-600 mb-4">{formData.shortDescription || 'No short description provided'}</p>
              
              <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                <div className="flex items-center space-x-1">
                  <Clock className="h-4 w-4" />
                  <span>{calculateTotalDuration()} minutes</span>
                </div>
                <div className="flex items-center space-x-1">
                  <BookOpen className="h-4 w-4" />
                  <span>{getTotalLessons()} lessons</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Users className="h-4 w-4" />
                  <span>{formData.difficultyLevel || 'Beginner'}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Globe className="h-4 w-4" />
                  <span>{formData.language || 'English'}</span>
                </div>
              </div>
            </div>
          </div>

          {formData.category && (
            <div>
              <Badge variant="secondary">{formData.category}</Badge>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pricing & Settings */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <DollarSign className="h-5 w-5" />
            <span>Pricing & Settings</span>
          </CardTitle>
          <Button variant="outline" size="sm" onClick={() => onEdit(3)}>
            <Edit3 className="h-4 w-4 mr-2" />
            Edit Settings
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {formData.pricingType === 'free' ? 'Free' : `$${formData.price || '0'}`}
              </div>
              <div className="text-sm text-gray-600">Price</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {formData.visibility || 'Public'}
              </div>
              <div className="text-sm text-gray-600">Visibility</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {formData.maxStudents || '∞'}
              </div>
              <div className="text-sm text-gray-600">Max Students</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {formData.estimatedDuration || '0'}h
              </div>
              <div className="text-sm text-gray-600">Est. Duration</div>
            </div>
          </div>

          {/* Features */}
          <Separator className="my-4" />
          <div className="space-y-2">
            <h4 className="font-medium">Course Features:</h4>
            <div className="flex flex-wrap gap-2">
              {formData.hasCertificate && <Badge variant="secondary">Certificate</Badge>}
              {formData.hasQuizzes && <Badge variant="secondary">Quizzes</Badge>}
              {formData.hasAssignments && <Badge variant="secondary">Assignments</Badge>}
              {formData.hasDiscussions && <Badge variant="secondary">Discussions</Badge>}
              {formData.hasDownloads && <Badge variant="secondary">Downloads</Badge>}
              {formData.hasLiveSupport && <Badge variant="secondary">Live Support</Badge>}
              {formData.isFeatured && <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Featured</Badge>}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Course Structure */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <BookOpen className="h-5 w-5" />
            <span>Course Structure</span>
          </CardTitle>
          <Button variant="outline" size="sm" onClick={() => onEdit(2)}>
            <Edit3 className="h-4 w-4 mr-2" />
            Edit Modules
          </Button>
        </CardHeader>
        <CardContent>
          {formData.modules && formData.modules.length > 0 ? (
            <div className="space-y-4">
              {formData.modules.map((module: any, moduleIndex: number) => (
                <div key={moduleIndex} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-lg">
                      Module {moduleIndex + 1}: {module.title || 'Untitled Module'}
                    </h4>
                    <Badge variant="outline">
                      {module.lessons?.length || 0} lessons
                    </Badge>
                  </div>
                  
                  {module.description && (
                    <p className="text-gray-600 text-sm mb-3">{module.description}</p>
                  )}

                  {module.lessons && module.lessons.length > 0 && (
                    <div className="space-y-2">
                      {module.lessons.map((lesson: any, lessonIndex: number) => (
                        <div key={lessonIndex} className="flex items-center space-x-3 p-2 bg-gray-50 rounded">
                          {getContentTypeIcon(lesson?.contentType ?? lesson?.content_type)}
                          <span className="flex-1 text-sm">
                            {lesson.title || `Lesson ${lessonIndex + 1}`}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {(lesson?.contentType ?? lesson?.content_type) || 'No type'}
                          </Badge>
                          {Number(lesson?.duration) ? (
                            <span className="text-xs text-gray-500">
                              {Number(lesson.duration)}min
                            </span>
                          ) : null}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No modules created yet</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Course Description */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>Course Description</span>
          </CardTitle>
          <Button variant="outline" size="sm" onClick={() => onEdit(1)}>
            <Edit3 className="h-4 w-4 mr-2" />
            Edit Description
          </Button>
        </CardHeader>
        <CardContent>
          <div className="prose max-w-none">
            {formData.longDescription ? (
              <div dangerouslySetInnerHTML={{ __html: formData.longDescription }} />
            ) : (
              <p className="text-gray-500 italic">No detailed description provided</p>
            )}
          </div>

          {formData.learningOutcomes && (
            <div className="mt-6">
              <h4 className="font-medium mb-2">Learning Outcomes:</h4>
              <p className="text-gray-600 text-sm">{formData.learningOutcomes}</p>
            </div>
          )}

          {formData.prerequisites && (
            <div className="mt-4">
              <h4 className="font-medium mb-2">Prerequisites:</h4>
              <p className="text-gray-600 text-sm">{formData.prerequisites}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Publication Schedule */}
      {formData.publishDate && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5" />
              <span>Publication Schedule</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-gray-500" />
                <span className="text-sm">Scheduled for:</span>
              </div>
              <Badge variant="outline">
                {new Date(formData.publishDate).toLocaleString()}
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Final Actions */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <h3 className="text-lg font-medium text-blue-800">Ready to Launch Your Course?</h3>
            <p className="text-blue-600 text-sm">
              Review all the information above. Once published, students will be able to discover and enroll in your course.
            </p>
            
            {isReadyToPublish ? (
              <div className="flex justify-center space-x-4">
                <Button variant="outline" onClick={() => onNext()}>
                  <Eye className="h-4 w-4 mr-2" />
                  Save as Draft
                </Button>
                <Button onClick={() => onNext()} className="bg-blue-600 hover:bg-blue-700">
                  <Globe className="h-4 w-4 mr-2" />
                  Publish Course
                </Button>
              </div>
            ) : (
              <Button variant="outline" disabled>
                <AlertCircle className="h-4 w-4 mr-2" />
                Fix Issues to Publish
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CoursePreviewStep;