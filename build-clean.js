// build-clean.js
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Check if a file has valid UTF-8 encoding
function hasValidUtf8Encoding(filePath) {
  try {
    // Attempt to read the file as UTF-8 - will throw if not valid UTF-8
    fs.readFileSync(filePath, 'utf8');
    return true;
  } catch (error) {
    if (error.code === 'ERR_ENCODING_INVALID_ENCODED_DATA') {
      console.error(`Invalid UTF-8 encoding in file: ${filePath}`);
      return false;
    }
    // Other errors (like file not found) - log but don't consider as encoding issue
    console.error(`Error checking file ${filePath}:`, error.message);
    return true;
  }
}

// Scan directory recursively for files with encoding issues
function scanDirectoryForEncodingIssues(dir, extensions = ['.ts', '.tsx', '.js', '.jsx']) {
  const issues = [];
  
  function scanDir(currentDir) {
    const files = fs.readdirSync(currentDir);
    
    for (const file of files) {
      const filePath = path.join(currentDir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        if (file !== 'node_modules' && file !== '.next' && file !== '.git') {
          scanDir(filePath);
        }
      } else if (extensions.includes(path.extname(file))) {
        if (!hasValidUtf8Encoding(filePath)) {
          issues.push(filePath);
        }
      }
    }
  }
  
  scanDir(dir);
  return issues;
}

// Main function
function main() {
  const rootDir = process.cwd();
  console.log(`Scanning ${rootDir} for encoding issues...`);
  
  const issues = scanDirectoryForEncodingIssues(rootDir);
  
  if (issues.length > 0) {
    console.error('\nFiles with encoding issues:');
    issues.forEach(file => console.error(`- ${file}`));
    console.error('\nPlease fix these files before building the project.');
    process.exit(1);
  } else {
    console.log('No encoding issues found.');
    console.log('Now running the build...');
    
    try {
      // Run the npm build script
      execSync('npm run build', { stdio: 'inherit' });
      console.log('Build completed successfully.');
    } catch (error) {
      console.error('Build failed:', error.message);
      process.exit(1);
    }
  }
}

main(); 