
import { supabase } from "@/integrations/supabase/client";

// Check if a specific bucket exists and is accessible
export const isBucketAccessible = async (bucketName: string): Promise<boolean> => {
  try {
    console.log(`Checking accessibility of bucket ${bucketName}...`);
    
    // First check if bucket exists in the list of all buckets
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      console.error(`Error listing buckets when checking ${bucketName}:`, bucketsError);
      return false;
    }
    
    // If bucket is not in the list, it doesn't exist
    const bucketExists = buckets.some(bucket => bucket.name === bucketName);
    if (!bucketExists) {
      console.error(`Bucket ${bucketName} does not exist in buckets list:`, buckets.map(b => b.name));
      return false;
    }
    
    console.log(`Bucket ${bucketName} exists in buckets list`);
    
    // Now check if we have permission to list files in the bucket
    try {
      const { data, error } = await supabase.storage
        .from(bucketName)
        .list('', { limit: 1 });
      
      if (error) {
        console.error(`Permission error when accessing bucket ${bucketName}:`, error);
        return false;
      }
      
      console.log(`Successfully listed files in bucket ${bucketName}:`, data);
      return true;
    } catch (listError) {
      console.error(`Error listing files in bucket ${bucketName}:`, listError);
      return false;
    }
  } catch (error) {
    console.error(`Unexpected error checking bucket ${bucketName}:`, error);
    return false;
  }
};

// Check if all required buckets are accessible
export const areAllBucketsAccessible = async (): Promise<boolean> => {
  try {
    console.log("Checking accessibility of all required storage buckets...");
    // Modified: Only check for course-images and course-videos buckets
    const requiredBuckets = ['course-images', 'course-videos'];
    
    // Get list of all buckets
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      console.error("Error listing buckets:", bucketsError);
      return false;
    }
    
    console.log("Available buckets:", buckets.map(b => b.name));
    
    // Check if all required buckets exist
    const bucketNames = buckets.map(bucket => bucket.name);
    const missingBuckets = requiredBuckets.filter(name => !bucketNames.includes(name));
    
    if (missingBuckets.length > 0) {
      console.error("Missing required buckets:", missingBuckets);
      return false;
    }
    
    // Verify buckets are actually accessible by testing them individually
    for (const bucketName of requiredBuckets) {
      try {
        const { data, error } = await supabase.storage
          .from(bucketName)
          .list('', { limit: 1 });
          
        if (error) {
          console.error(`Cannot access bucket ${bucketName}:`, error);
          return false;
        }
        
        console.log(`Successfully verified access to bucket ${bucketName}`);
      } catch (err) {
        console.error(`Error verifying access to bucket ${bucketName}:`, err);
        return false;
      }
    }
    
    console.log("All required buckets are accessible");
    return true;
  } catch (error) {
    console.error("Error checking storage buckets:", error);
    return false;
  }
};

// For backward compatibility, provide the initializeStorage function
export const initializeStorage = async (): Promise<Record<string, {accessible: boolean, error: string | null}>> => {
  try {
    // Modified: Only check for course-images and course-videos buckets
    const requiredBuckets = ['course-images', 'course-videos'];
    const results: Record<string, {accessible: boolean, error: string | null}> = {};
    
    // Check each required bucket separately
    for (const bucketName of requiredBuckets) {
      try {
        // Direct access test to reduce complexity
        const { data, error } = await supabase.storage
          .from(bucketName)
          .list('', { limit: 1 });
          
        const isAccessible = !error;
        results[bucketName] = {
          accessible: isAccessible,
          error: isAccessible ? null : `Bucket ${bucketName} is not accessible: ${error?.message}`
        };
        
        console.log(`Bucket ${bucketName} access test result:`, isAccessible ? "Success" : error);
      } catch (err) {
        results[bucketName] = {
          accessible: false,
          error: `Error testing bucket ${bucketName}: ${err instanceof Error ? err.message : String(err)}`
        };
      }
    }
    
    return results;
  } catch (error) {
    console.error("Error checking storage buckets:", error);
    
    // Return all buckets as inaccessible on error
    const requiredBuckets = ['course-images', 'course-videos'];
    const results: Record<string, {accessible: boolean, error: string | null}> = {};
    
    requiredBuckets.forEach(bucket => {
      results[bucket] = {
        accessible: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    });
    
    return results;
  }
};
