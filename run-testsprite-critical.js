#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class TestSpriteCriticalRunner {
    constructor() {
        this.config = {
            baseUrl: {
                development: 'http://localhost:8082',
                backend: 'http://localhost:8000'
            },
            timeout: 30000,
            retries: 1
        };
    }

    async checkServers() {
        console.log('🔍 Checking if servers are running...');
        
        try {
            // Check if frontend is running
            execSync(`curl -f ${this.config.baseUrl.development} > nul 2>&1`, { 
                stdio: 'ignore',
                timeout: 5000 
            });
            console.log('✅ Frontend server is running');
        } catch (error) {
            console.log('⚠️  Frontend server not running - skipping UI tests');
            return false;
        }

        try {
            // Check if backend is running
            execSync(`curl -f ${this.config.baseUrl.backend}/health > nul 2>&1`, { 
                stdio: 'ignore',
                timeout: 5000 
            });
            console.log('✅ Backend server is running');
            return true;
        } catch (error) {
            console.log('⚠️  Backend server not running - skipping API tests');
            return false;
        }
    }

    async runCriticalTests() {
        console.log('🧪 Running TestSprite Critical Tests (Pre-commit)');
        console.log('=' .repeat(60));

        const serversRunning = await this.checkServers();
        
        if (!serversRunning) {
            console.log('⚠️  Servers not running - running static analysis only');
            return this.runStaticAnalysis();
        }

        const criticalTests = [
            {
                name: 'Authentication API Health',
                test: () => this.testAuthHealth()
            },
            {
                name: 'Course API Health',
                test: () => this.testCourseHealth()
            },
            {
                name: 'Frontend Bundle Check',
                test: () => this.testFrontendBundle()
            }
        ];

        let passed = 0;
        let failed = 0;

        for (const test of criticalTests) {
            try {
                console.log(`🔄 Running: ${test.name}`);
                await test.test();
                console.log(`✅ ${test.name} - PASSED`);
                passed++;
            } catch (error) {
                console.log(`❌ ${test.name} - FAILED: ${error.message}`);
                failed++;
            }
        }

        console.log('\\n' + '=' .repeat(60));
        console.log(`📊 Critical Tests Summary: ${passed} passed, ${failed} failed`);
        
        if (failed > 0) {
            console.log('❌ Critical tests failed - commit blocked');
            process.exit(1);
        } else {
            console.log('✅ All critical tests passed - commit allowed');
        }
    }

    async testAuthHealth() {
        try {
            execSync(`curl -f ${this.config.baseUrl.backend}/api/v1/auth/health`, { 
                stdio: 'ignore',
                timeout: 10000 
            });
        } catch (error) {
            throw new Error('Authentication API not responding');
        }
    }

    async testCourseHealth() {
        try {
            execSync(`curl -f ${this.config.baseUrl.backend}/api/v1/courses/health`, { 
                stdio: 'ignore',
                timeout: 10000 
            });
        } catch (error) {
            throw new Error('Course API not responding');
        }
    }

    async testFrontendBundle() {
        try {
            execSync(`curl -f ${this.config.baseUrl.development}`, { 
                stdio: 'ignore',
                timeout: 10000 
            });
        } catch (error) {
            throw new Error('Frontend bundle not accessible');
        }
    }

    async runStaticAnalysis() {
        console.log('🔍 Running static analysis checks...');
        
        const checks = [
            {
                name: 'TypeScript Compilation',
                command: 'npx tsc --noEmit'
            },
            {
                name: 'ESLint Check',
                command: 'npx eslint src/ --quiet'
            },
            {
                name: 'Python Syntax Check',
                command: 'python -m py_compile backend/**/*.py',
                optional: true
            }
        ];

        let passed = 0;
        let failed = 0;

        for (const check of checks) {
            try {
                console.log(`🔄 Running: ${check.name}`);
                execSync(check.command, { stdio: 'ignore', timeout: 30000 });
                console.log(`✅ ${check.name} - PASSED`);
                passed++;
            } catch (error) {
                if (check.optional) {
                    console.log(`⚠️  ${check.name} - SKIPPED (optional)`);
                } else {
                    console.log(`❌ ${check.name} - FAILED`);
                    failed++;
                }
            }
        }

        console.log('\\n' + '=' .repeat(60));
        console.log(`📊 Static Analysis Summary: ${passed} passed, ${failed} failed`);
        
        if (failed > 0) {
            console.log('❌ Static analysis failed - commit blocked');
            process.exit(1);
        } else {
            console.log('✅ All static checks passed - commit allowed');
        }
    }
}

// Check if this script is being run directly
const isMainModule = import.meta.url === `file://${process.argv[1]}` || 
                     import.meta.url.endsWith('run-testsprite-critical.js');

if (isMainModule) {
    const runner = new TestSpriteCriticalRunner();
    runner.runCriticalTests().catch(error => {
        console.error('❌ Critical test runner failed:', error);
        process.exit(1);
    });
}

export default TestSpriteCriticalRunner;