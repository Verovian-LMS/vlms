
// Storage utilities aligned with FastAPI file endpoints
const API_BASE_URL = 'http://localhost:8000';

const getAuthHeaders = (): HeadersInit => {
  const token = localStorage.getItem('auth_token') || localStorage.getItem('access_token');
  const headers: HeadersInit = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
};

// Check if a specific bucket exists and is accessible
export const isBucketAccessible = async (bucketName: string): Promise<boolean> => {
  try {
    console.log(`Checking accessibility of bucket ${bucketName} via FastAPI...`);
    const response = await fetch(`${API_BASE_URL}/api/v1/storage/status`, { headers: getAuthHeaders() });
    if (!response.ok) {
      console.error('Storage status error:', response.statusText);
      return false;
    }
    const status = await response.json();
    const bucketStatus = status?.buckets?.[bucketName]?.status;
    return bucketStatus === 'available';
  } catch (error) {
    console.error(`Unexpected error checking bucket ${bucketName}:`, error);
    return false;
  }
};

// Check if all required buckets are accessible
export const areAllBucketsAccessible = async (): Promise<boolean> => {
  try {
    console.log('Checking accessibility of required storage buckets via FastAPI...');
    const response = await fetch(`${API_BASE_URL}/api/v1/storage/status`, { headers: getAuthHeaders() });
    if (!response.ok) {
      console.error('Storage status error:', response.statusText);
      return false;
    }
    const status = await response.json();
    const requiredBuckets = ['course-images', 'course-videos'];
    return requiredBuckets.every((b) => status?.buckets?.[b]?.status === 'available');
  } catch (error) {
    console.error('Error checking storage buckets:', error);
    return false;
  }
};

// For backward compatibility, provide the initializeStorage function
export const initializeStorage = async (): Promise<Record<string, {accessible: boolean, error: string | null}>> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/storage/status`, { headers: getAuthHeaders() });
    if (!response.ok) {
      throw new Error(response.statusText);
    }
    const status = await response.json();
    const requiredBuckets = ['course-images', 'course-videos'];
    const results: Record<string, { accessible: boolean; error: string | null }> = {};
    for (const bucket of requiredBuckets) {
      const available = status?.buckets?.[bucket]?.status === 'available';
      results[bucket] = {
        accessible: !!available,
        error: available ? null : `Bucket ${bucket} is not available`,
      };
    }
    return results;
  } catch (error) {
    console.error('Error checking storage buckets:', error);
    const requiredBuckets = ['course-images', 'course-videos'];
    const results: Record<string, { accessible: boolean; error: string | null }> = {};
    requiredBuckets.forEach((bucket) => {
      results[bucket] = {
        accessible: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    });
    return results;
  }
};
