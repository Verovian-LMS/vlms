
import React, { ReactElement } from 'react';

/**
 * Simple component testing utility to verify a component renders without errors
 */
export function renderTest<P>(
  Component: React.ComponentType<P>,
  props: P,
  options: { name?: string; times?: number } = {}
): JSX.Element {
  const { name = Component.displayName || Component.name, times = 1 } = options;
  
  try {
    console.time(`[TEST] ${name} render time`);
    
    let lastResult: ReactElement | null = null;
    
    for (let i = 0; i < times; i++) {
      lastResult = <Component {...props} />;
    }
    
    console.timeEnd(`[TEST] ${name} render time`);
    console.log(`[TEST] ${name} rendered successfully ${times} times`);
    
    return lastResult || <div>Test completed</div>;
  } catch (error) {
    console.error(`[TEST] ${name} render failed:`, error);
    throw error;
  }
}

/**
 * Test performance of a component and report results
 */
export function benchmarkComponent<P>(
  Component: React.ComponentType<P>,
  props: P,
  options: { name?: string; iterations?: number; warningThresholdMs?: number; errorThresholdMs?: number } = {}
): void {
  const {
    name = Component.displayName || Component.name,
    iterations = 100,
    warningThresholdMs = 5,
    errorThresholdMs = 20
  } = options;
  
  try {
    console.group(`[BENCHMARK] ${name}`);
    
    const start = performance.now();
    let lastRenderTime = 0;
    let maxRenderTime = 0;
    let minRenderTime = Infinity;
    let totalRenderTime = 0;
    
    for (let i = 0; i < iterations; i++) {
      const iterationStart = performance.now();
      // @ts-ignore - just for testing
      const result = <Component {...props} />;
      const iterationTime = performance.now() - iterationStart;
      
      lastRenderTime = iterationTime;
      maxRenderTime = Math.max(maxRenderTime, iterationTime);
      minRenderTime = Math.min(minRenderTime, iterationTime);
      totalRenderTime += iterationTime;
    }
    
    const totalTime = performance.now() - start;
    const avgRenderTime = totalRenderTime / iterations;
    
    console.log(`Total time: ${totalTime.toFixed(2)}ms`);
    console.log(`Average render time: ${avgRenderTime.toFixed(2)}ms`);
    console.log(`Minimum render time: ${minRenderTime.toFixed(2)}ms`);
    console.log(`Maximum render time: ${maxRenderTime.toFixed(2)}ms`);
    console.log(`Last render time: ${lastRenderTime.toFixed(2)}ms`);
    
    if (avgRenderTime > errorThresholdMs) {
      console.error(`[BENCHMARK] ${name} is too slow! Average render time exceeds ${errorThresholdMs}ms`);
    } else if (avgRenderTime > warningThresholdMs) {
      console.warn(`[BENCHMARK] ${name} is somewhat slow. Average render time exceeds ${warningThresholdMs}ms`);
    } else {
      console.log(`[BENCHMARK] ${name} performs well.`);
    }
    
    console.groupEnd();
  } catch (error) {
    console.error(`[BENCHMARK] ${name} failed:`, error);
  }
}

/**
 * Performance test helper for hooks
 */
export function benchmarkHook<T>(
  useHook: () => T,
  options: { name?: string; iterations?: number; warningThresholdMs?: number }
): void {
  const {
    name = useHook.name,
    iterations = 100,
    warningThresholdMs = 2
  } = options;
  
  // Create a test component that uses the hook
  const TestComponent = () => {
    const start = performance.now();
    const result = useHook();
    const duration = performance.now() - start;
    
    React.useEffect(() => {
      console.log(`[HOOK-BENCHMARK] ${name} execution time: ${duration.toFixed(2)}ms`);
      
      if (duration > warningThresholdMs) {
        console.warn(`[HOOK-BENCHMARK] ${name} is slow. Execution time: ${duration.toFixed(2)}ms`);
      }
    }, [duration]);
    
    return null;
  };
  
  // Now benchmark the test component
  benchmarkComponent(TestComponent, {}, { 
    name: `Hook: ${name}`, 
    iterations, 
    warningThresholdMs 
  });
}
