#!/usr/bin/env node

/**
 * Cross-platform security check script
 * Works on Windows, macOS, and Linux
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Colors for output (works in most terminals including Windows)
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  reset: '\x1b[0m',
};

// Flag to track if any security issues are found
let securityIssues = 0;

// Functions for colored output
function reportIssue(message) {
  console.log(`${colors.red}❌ SECURITY ISSUE: ${message}${colors.reset}`);
  securityIssues = 1;
}

function reportWarning(message) {
  console.log(`${colors.yellow}⚠️  WARNING: ${message}${colors.reset}`);
}

function reportSuccess(message) {
  console.log(`${colors.green}✅ ${message}${colors.reset}`);
}

// Utility function to run git commands safely
function runGitCommand(command) {
  try {
    return execSync(command, { encoding: 'utf8', stdio: 'pipe' }).trim();
  } catch (error) {
    return '';
  }
}

// Check if we're in a git repository
function isGitRepository() {
  try {
    execSync('git status', { stdio: 'pipe' });
    return true;
  } catch {
    return false;
  }
}

// Get files to check (staged files or all source files)
function getFilesToCheck() {
  if (!isGitRepository()) {
    // Fallback to finding files manually
    const srcDir = path.join(process.cwd(), 'src');
    if (!fs.existsSync(srcDir)) return [];

    const findFiles = (dir) => {
      const files = [];
      const items = fs.readdirSync(dir);

      for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
          files.push(...findFiles(fullPath));
        } else if (/\.(ts|js|json)$/.test(item)) {
          files.push(fullPath);
        }
      }

      return files;
    };

    return findFiles(srcDir);
  }

  // Check for staged files first
  const stagedFiles = runGitCommand('git diff --cached --name-only');
  if (stagedFiles) {
    console.log('    Checking staged files...');
    return stagedFiles
      .split('\n')
      .filter((file) => file.trim() && /\.(ts|js|json)$/.test(file))
      .map((file) => path.resolve(file));
  }

  // Fallback to all tracked source files
  console.log('    Checking all source files...');
  const allFiles = runGitCommand('git ls-files');
  return allFiles
    .split('\n')
    .filter((file) => file.trim() && /^src\/.*\.(ts|js|json)$/.test(file))
    .map((file) => path.resolve(file));
}

// Check file content for patterns
function checkFileForPatterns(filePath, patterns) {
  try {
    if (!fs.existsSync(filePath)) return false;

    const content = fs.readFileSync(filePath, 'utf8');
    return patterns.some((pattern) => {
      const regex = new RegExp(pattern, 'i');
      return regex.test(content);
    });
  } catch (error) {
    return false;
  }
}

// Main security checks
function runSecurityChecks() {
  console.log('🔒 Running security checks...');
  console.log('🔍 Checking for exposed secrets and sensitive files...');

  // Check 1: Look for .env files in repository
  console.log('  • Checking for .env files...');
  if (isGitRepository()) {
    const envFiles = runGitCommand('git ls-files')
      .split('\n')
      .filter((file) => {
        const isEnvFile = /\.env(\.|$)/.test(file);
        const isExample = /\.(example|template)$/.test(file);
        return isEnvFile && !isExample;
      });

    if (envFiles.length > 0) {
      reportIssue(
        'Found .env files in repository! These should not be committed.',
      );
      console.log('    Files found:');
      envFiles.forEach((file) => console.log(`      ${file}`));
    } else {
      reportSuccess('No .env files found in repository');
    }
  } else {
    reportWarning('Not in a git repository, skipping .env file check');
  }

  // Check 2: Look for common secret patterns in code
  console.log('  • Checking for hardcoded secrets in source code...');
  const filesToCheck = getFilesToCheck();

  const secretPatterns = [
    'secret\\s*=\\s*[\'"][^\'"]{10,}[\'"]',
    'api[_-]?key\\s*=\\s*[\'"][^\'"]{10,}[\'"]',
    'access[_-]?token\\s*=\\s*[\'"][^\'"]{10,}[\'"]',
    'private[_-]?key\\s*=\\s*[\'"][^\'"]{10,}[\'"]',
    'jwt[_-]?secret\\s*=\\s*[\'"][^\'"]{10,}[\'"]',
    'database[_-]?url\\s*=\\s*[\'"]mongodb://[^@]*:[^@]*@[^\'"]*[\'"]',
    'redis[_-]?url\\s*=\\s*[\'"]redis://[^@]*:[^@]*@[^\'"]*[\'"]',
  ];

  let secretFound = false;
  for (const file of filesToCheck) {
    if (checkFileForPatterns(file, secretPatterns)) {
      if (!secretFound) {
        reportIssue('Found potential hardcoded secrets in source code');
        console.log('    Files containing secrets:');
        secretFound = true;
      }
      console.log(`      ${path.relative(process.cwd(), file)}`);
    }
  }

  if (!secretFound) {
    reportSuccess('No hardcoded secrets found');
  }

  // Check 3: Look for AWS/API key patterns
  console.log('  • Checking for AWS and API key patterns...');
  const awsPatterns = [
    'AKIA[0-9A-Z]{16}',
    'aws_access_key_id=[\'"][A-Z0-9]{20}[\'"]',
    'aws_secret_access_key=[\'"][A-Za-z0-9/+=]{40}[\'"]',
    'aws_session_token=[\'"][A-Za-z0-9/+=]{40}[\'"]',
    'aws_access_key=[\'"][A-Z0-9]{20}[\'"]',
  ];

  let awsFound = false;
  for (const file of filesToCheck) {
    if (checkFileForPatterns(file, awsPatterns)) {
      if (!awsFound) {
        reportIssue('Found potential AWS/API keys');
        console.log('    Files:');
        awsFound = true;
      }
      console.log(`      ${path.relative(process.cwd(), file)}`);
    }
  }

  if (!awsFound) {
    reportSuccess('No AWS/API key patterns found');
  }

  // Check 4: Look for private keys and certificates
  console.log('  • Checking for private keys and certificates...');
  const certPatterns = [
    '-----BEGIN PRIVATE KEY-----',
    '-----BEGIN RSA PRIVATE KEY-----',
    '-----BEGIN OPENSSH PRIVATE KEY-----',
    '-----BEGIN PGP PRIVATE KEY-----',
  ];

  let certFound = false;
  for (const file of filesToCheck) {
    if (checkFileForPatterns(file, certPatterns)) {
      if (!certFound) {
        reportIssue('Found private keys or certificates');
        console.log('    Files:');
        certFound = true;
      }
      console.log(`      ${path.relative(process.cwd(), file)}`);
    }
  }

  if (!certFound) {
    reportSuccess('No private keys or certificates found');
  }

  // Check 5: Look for sensitive file extensions
  console.log('  • Checking for sensitive file extensions...');
  const sensitiveExtensions = [
    '\\.pem$',
    '\\.key$',
    '\\.p12$',
    '\\.pfx$',
    '\\.jks$',
  ];

  let allFiles = [];
  if (isGitRepository()) {
    allFiles = runGitCommand('git ls-files')
      .split('\n')
      .filter((f) => f.trim());
  } else {
    // Fallback for non-git directories
    const findAllFiles = (dir) => {
      const files = [];
      try {
        const items = fs.readdirSync(dir);
        for (const item of items) {
          const fullPath = path.join(dir, item);
          if (fs.statSync(fullPath).isDirectory() && !item.startsWith('.')) {
            files.push(...findAllFiles(fullPath));
          } else {
            files.push(path.relative(process.cwd(), fullPath));
          }
        }
      } catch (error) {
        // Ignore errors for inaccessible directories
      }
      return files;
    };
    allFiles = findAllFiles(process.cwd());
  }

  let extFound = false;
  for (const ext of sensitiveExtensions) {
    const regex = new RegExp(ext);
    const matchingFiles = allFiles.filter((file) => regex.test(file));

    if (matchingFiles.length > 0) {
      if (!extFound) {
        reportIssue('Found files with sensitive extensions');
        console.log('    Files:');
        extFound = true;
      }
      matchingFiles.forEach((file) => console.log(`      ${file}`));
    }
  }

  if (!extFound) {
    reportSuccess('No files with sensitive extensions found');
  }

  // Final result
  console.log('');
  if (securityIssues) {
    console.log(
      `${colors.red}🚨 SECURITY ISSUES DETECTED! Push has been blocked.${colors.reset}`,
    );
    console.log('');
    console.log('Please fix the security issues above before pushing:');
    console.log('  1. Remove any .env files from the repository');
    console.log('  2. Replace hardcoded secrets with environment variables');
    console.log('  3. Remove any exposed API keys or credentials');
    console.log('  4. Use .env.example files instead of real .env files');
    console.log('');
    console.log('After fixing, run: git add . && git commit --amend');
    process.exit(1);
  } else {
    console.log(`${colors.green}🔒 All security checks passed!${colors.reset}`);
  }
}

// Run the security checks
runSecurityChecks();
