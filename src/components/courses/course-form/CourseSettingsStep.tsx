import React from 'react';
import { useFormContext } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  DollarSign, 
  Users, 
  Calendar, 
  Globe, 
  Lock, 
  Star,
  Clock,
  Award,
  BookOpen
} from 'lucide-react';

interface CourseSettingsStepProps {
  form: any;
  onNext: () => void;
  onPrevious: () => void;
  isLastStep: boolean;
  isFirstStep: boolean;
}

const CourseSettingsStep: React.FC<CourseSettingsStepProps> = ({
  form,
  onNext,
  onPrevious,
  isLastStep,
  isFirstStep
}) => {
  // Prefer context but fall back to provided form prop to avoid blank UI
  const context = useFormContext();
  const safeForm = (context || form);
  const register = safeForm?.register ?? (() => ({} as any));
  const watch = safeForm?.watch ?? (() => ({} as any));
  const setValue = safeForm?.setValue ?? (() => {});
  const errors = safeForm?.formState?.errors ?? {};

  const watchedValues = watch ? watch() : {};

  // Auto-calculate estimated duration (hours) from lesson durations (minutes)
  React.useEffect(() => {
    if (!setValue) return;
    try {
      const modules = (watchedValues as any)?.modules || [];
      const totalMinutes = modules.reduce((courseTotal: number, mod: any) => {
        const lessons = mod?.lessons || [];
        const moduleMinutes = lessons.reduce((moduleTotal: number, lesson: any) => {
          const d = Number(lesson?.duration || 0);
          return moduleTotal + (Number.isFinite(d) ? d : 0);
        }, 0);
        return courseTotal + moduleMinutes;
      }, 0);

      const hours = totalMinutes / 60;
      const normalized = Number.isFinite(hours) ? Number(hours.toFixed(1)) : 0;
      setValue('estimatedDuration', normalized, { shouldDirty: false, shouldValidate: false });
    } catch {
      // ignore calculation errors
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify((watchedValues as any)?.modules || [])]);

  // Initialize sensible defaults for settings so controls have values
  React.useEffect(() => {
    if (!setValue) return;
    const ensureDefault = (name: string, value: any) => {
      const current = (watchedValues as any)?.[name];
      if (current === undefined) setValue(name as any, value, { shouldDirty: false, shouldValidate: false });
    };

    ensureDefault('pricingType', 'free');
    ensureDefault('price', undefined);
    ensureDefault('hasDiscount', false);
    ensureDefault('discountPrice', undefined);
    ensureDefault('discountEndDate', undefined);
    ensureDefault('maxStudents', undefined);
    ensureDefault('enrollmentDeadline', undefined);
    ensureDefault('requiresApproval', false);
    ensureDefault('hasCertificate', false);
    ensureDefault('hasQuizzes', false);
    ensureDefault('hasAssignments', false);
    ensureDefault('hasDiscussions', false);
    ensureDefault('hasDownloads', false);
    ensureDefault('hasLiveSupport', false);
    ensureDefault('estimatedDuration', undefined);
    ensureDefault('language', 'en');
    ensureDefault('tags', '');
    ensureDefault('prerequisites', '');
    ensureDefault('learningOutcomes', '');
    ensureDefault('visibility', 'public');
    ensureDefault('isFeatured', false);
    ensureDefault('allowReviews', true);
    ensureDefault('publishDate', undefined);
    ensureDefault('seoTitle', '');
    ensureDefault('seoDescription', '');
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-8">
      {/* Fallback notice if form context is unavailable to prevent blank UI */}
      {!safeForm && (
        <div className="p-3 rounded border border-yellow-200 bg-yellow-50 text-yellow-800 text-sm">
          Form context not available. Using safe defaults for Course Settings.
        </div>
      )}
      {/* Pricing Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <DollarSign className="h-5 w-5" />
            <span>Pricing & Access</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="pricing-type">Course Type</Label>
                <Select 
                  value={watchedValues.pricingType || 'free'} 
                  onValueChange={(value) => setValue('pricingType', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select pricing type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="free">
                      <div className="flex items-center space-x-2">
                        <Globe className="h-4 w-4" />
                        <span>Free Course</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="paid">
                      <div className="flex items-center space-x-2">
                        <DollarSign className="h-4 w-4" />
                        <span>Paid Course</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="subscription">
                      <div className="flex items-center space-x-2">
                        <Star className="h-4 w-4" />
                        <span>Subscription Only</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {watchedValues.pricingType === 'paid' && (
                <div>
                  <Label htmlFor="price">Course Price ($)</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    min="0"
                    {...register('price')}
                    placeholder="99.00"
                  />
                  {errors.price && (
                    <p className="text-sm text-red-600 mt-1">{errors.price.message}</p>
                  )}
                </div>
              )}

              <div className="flex items-center space-x-2">
                <Switch
                  checked={watchedValues.hasDiscount || false}
                  onCheckedChange={(checked) => setValue('hasDiscount', checked)}
                />
                <Label>Offer Discount</Label>
              </div>

              {watchedValues.hasDiscount && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="discountPrice">Discount Price ($)</Label>
                    <Input
                      id="discountPrice"
                      type="number"
                      step="0.01"
                      min="0"
                      {...register('discountPrice')}
                      placeholder="79.00"
                    />
                  </div>
                  <div>
                    <Label htmlFor="discountEndDate">Discount End Date</Label>
                    <Input
                      id="discountEndDate"
                      type="date"
                      {...register('discountEndDate')}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="maxStudents">Maximum Students</Label>
                <Input
                  id="maxStudents"
                  type="number"
                  min="1"
                  {...register('maxStudents')}
                  placeholder="Unlimited"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Leave empty for unlimited enrollment
                </p>
              </div>

              <div>
                <Label htmlFor="enrollmentDeadline">Enrollment Deadline</Label>
                <Input
                  id="enrollmentDeadline"
                  type="date"
                  {...register('enrollmentDeadline')}
                />
                <p className="text-sm text-gray-500 mt-1">
                  Optional deadline for course enrollment
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  checked={watchedValues.requiresApproval || false}
                  onCheckedChange={(checked) => setValue('requiresApproval', checked)}
                />
                <div>
                  <Label>Requires Approval</Label>
                  <p className="text-sm text-gray-500">
                    Students must be approved before enrolling
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Course Features */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Star className="h-5 w-5" />
            <span>Course Features</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  checked={watchedValues.hasCertificate || false}
                  onCheckedChange={(checked) => setValue('hasCertificate', checked)}
                />
                <div>
                  <Label>Certificate of Completion</Label>
                  <p className="text-sm text-gray-500">
                    Award certificates to students who complete the course
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  checked={watchedValues.hasQuizzes || false}
                  onCheckedChange={(checked) => setValue('hasQuizzes', checked)}
                />
                <div>
                  <Label>Include Quizzes</Label>
                  <p className="text-sm text-gray-500">
                    Add quizzes and assessments to lessons
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  checked={watchedValues.hasAssignments || false}
                  onCheckedChange={(checked) => setValue('hasAssignments', checked)}
                />
                <div>
                  <Label>Include Assignments</Label>
                  <p className="text-sm text-gray-500">
                    Add practical assignments for students
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  checked={watchedValues.hasDiscussions || false}
                  onCheckedChange={(checked) => setValue('hasDiscussions', checked)}
                />
                <div>
                  <Label>Discussion Forums</Label>
                  <p className="text-sm text-gray-500">
                    Enable student discussions and Q&A
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  checked={watchedValues.hasDownloads || false}
                  onCheckedChange={(checked) => setValue('hasDownloads', checked)}
                />
                <div>
                  <Label>Downloadable Resources</Label>
                  <p className="text-sm text-gray-500">
                    Provide downloadable materials and resources
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  checked={watchedValues.hasLiveSupport || false}
                  onCheckedChange={(checked) => setValue('hasLiveSupport', checked)}
                />
                <div>
                  <Label>Live Support</Label>
                  <p className="text-sm text-gray-500">
                    Offer live chat or video support sessions
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Course Metadata */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BookOpen className="h-5 w-5" />
            <span>Course Metadata</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="estimatedDuration">Estimated Duration (hours)</Label>
                <Input
                  id="estimatedDuration"
                  type="number"
                  min="0"
                  step="0.5"
                  {...register('estimatedDuration')}
                  placeholder="10"
                />
                {/* Helper text showing auto-calculated minutes/hours from modules */}
                <p className="text-xs text-gray-500 mt-1">
                  Auto-calculated from lesson durations. Edit if needed.
                </p>
              </div>

              <div>
                <Label htmlFor="language">Course Language</Label>
                <Select 
                  value={watchedValues.language || 'en'} 
                  onValueChange={(value) => setValue('language', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Spanish</SelectItem>
                    <SelectItem value="fr">French</SelectItem>
                    <SelectItem value="de">German</SelectItem>
                    <SelectItem value="it">Italian</SelectItem>
                    <SelectItem value="pt">Portuguese</SelectItem>
                    <SelectItem value="zh">Chinese</SelectItem>
                    <SelectItem value="ja">Japanese</SelectItem>
                    <SelectItem value="ko">Korean</SelectItem>
                    <SelectItem value="ar">Arabic</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="tags">Course Tags</Label>
                <Input
                  id="tags"
                  {...register('tags')}
                  placeholder="medical, anatomy, healthcare (comma-separated)"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Add relevant tags separated by commas
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="prerequisites">Prerequisites</Label>
                <Textarea
                  id="prerequisites"
                  {...register('prerequisites')}
                  placeholder="List any prerequisites or requirements for this course..."
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="learningOutcomes">Learning Outcomes</Label>
                <Textarea
                  id="learningOutcomes"
                  {...register('learningOutcomes')}
                  placeholder="What will students learn from this course? List key outcomes..."
                  rows={3}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Publication Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Globe className="h-5 w-5" />
            <span>Publication Settings</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="visibility">Course Visibility</Label>
                <Select 
                  value={watchedValues.visibility || 'public'} 
                  onValueChange={(value) => setValue('visibility', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select visibility" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">
                      <div className="flex items-center space-x-2">
                        <Globe className="h-4 w-4" />
                        <span>Public - Anyone can find and enroll</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="unlisted">
                      <div className="flex items-center space-x-2">
                        <Lock className="h-4 w-4" />
                        <span>Unlisted - Only with direct link</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="private">
                      <div className="flex items-center space-x-2">
                        <Users className="h-4 w-4" />
                        <span>Private - Invitation only</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  checked={watchedValues.isFeatured || false}
                  onCheckedChange={(checked) => setValue('isFeatured', checked)}
                />
                <div>
                  <Label>Featured Course</Label>
                  <p className="text-sm text-gray-500">
                    Display this course prominently on the platform
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  checked={watchedValues.allowReviews || true}
                  onCheckedChange={(checked) => setValue('allowReviews', checked)}
                />
                <div>
                  <Label>Allow Reviews</Label>
                  <p className="text-sm text-gray-500">
                    Let students rate and review this course
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="publishDate">Publish Date</Label>
                <Input
                  id="publishDate"
                  type="datetime-local"
                  {...register('publishDate')}
                />
                <p className="text-sm text-gray-500 mt-1">
                  Schedule when this course becomes available
                </p>
              </div>

              <div>
                <Label htmlFor="seoTitle">SEO Title</Label>
                <Input
                  id="seoTitle"
                  {...register('seoTitle')}
                  placeholder="Optimized title for search engines"
                />
              </div>

              <div>
                <Label htmlFor="seoDescription">SEO Description</Label>
                <Textarea
                  id="seoDescription"
                  {...register('seoDescription')}
                  placeholder="Brief description for search engine results..."
                  rows={2}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Course Summary */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-800">Course Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {watchedValues.pricingType === 'free' ? 'Free' : `$${watchedValues.price || '0'}`}
              </div>
              <div className="text-sm text-blue-600">Price</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {watchedValues.estimatedDuration || '0'}h
              </div>
              <div className="text-sm text-blue-600">Duration</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {watchedValues.visibility || 'Public'}
              </div>
              <div className="text-sm text-blue-600">Visibility</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {watchedValues.language || 'EN'}
              </div>
              <div className="text-sm text-blue-600">Language</div>
            </div>
          </div>
          
          {/* Features Summary */}
          <Separator className="my-4" />
          <div className="flex flex-wrap gap-2">
            {watchedValues.hasCertificate && <Badge variant="secondary">Certificate</Badge>}
            {watchedValues.hasQuizzes && <Badge variant="secondary">Quizzes</Badge>}
            {watchedValues.hasAssignments && <Badge variant="secondary">Assignments</Badge>}
            {watchedValues.hasDiscussions && <Badge variant="secondary">Discussions</Badge>}
            {watchedValues.hasDownloads && <Badge variant="secondary">Downloads</Badge>}
            {watchedValues.hasLiveSupport && <Badge variant="secondary">Live Support</Badge>}
            {watchedValues.isFeatured && <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Featured</Badge>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CourseSettingsStep;