const fs = require('fs');
const path = require('path');

const BASE_DIR = path.join(__dirname, 'public', 'assets');
const JSON_DIR = path.join(__dirname, 'captured_dom');
const PROJECT_PREFIX = '/FlaconiCareers';

const NEW_STRUCTURE = {
  images: path.join(BASE_DIR, 'images'),
  css: path.join(BASE_DIR, 'css'),
  fonts: path.join(BASE_DIR, 'fonts'),
  videos: path.join(BASE_DIR, 'videos'),
  others: path.join(BASE_DIR, 'others')
};

// Ensure new directories exist
Object.values(NEW_STRUCTURE).forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

const assetMap = {}; // Maps old /FlaconiCareers/assets/... path to new one

function getAllFiles(dirPath, arrayOfFiles) {
  const files = fs.readdirSync(dirPath);
  arrayOfFiles = arrayOfFiles || [];

  files.forEach(function(file) {
    if (fs.statSync(dirPath + "/" + file).isDirectory()) {
      arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
    } else {
      arrayOfFiles.push(path.join(dirPath, "/", file));
    }
  });

  return arrayOfFiles;
}

console.log('--- Phase 1: Moving Files ---');

// Get all files currently in assets, excluding the new category folders
const allFiles = getAllFiles(BASE_DIR).filter(f => {
  return !f.includes(NEW_STRUCTURE.images) &&
         !f.includes(NEW_STRUCTURE.css) &&
         !f.includes(NEW_STRUCTURE.fonts) &&
         !f.includes(NEW_STRUCTURE.videos) &&
         !f.includes(NEW_STRUCTURE.others);
});

allFiles.forEach(oldPath => {
  const ext = path.extname(oldPath).toLowerCase();
  let category = 'others';
  if (['.jpg', '.jpeg', '.png', '.webp', '.svg', '.gif', '.ico'].includes(ext)) category = 'images';
  else if (['.css'].includes(ext)) category = 'css';
  else if (['.woff2', '.woff', '.ttf', '.otf', '.eot'].includes(ext)) category = 'fonts';
  else if (['.mp4', '.webm', '.ogg'].includes(ext)) category = 'videos';

  // Create a clean unique name based on the original path to avoid collisions
  const relFromAssets = path.relative(BASE_DIR, oldPath);
  const newFileName = relFromAssets.replace(/\//g, '_');
  const newPath = path.join(NEW_STRUCTURE[category], newFileName);

  // Store the mapping for JSON updates
  // Old stored path was usually /FlaconiCareers/assets/wp-content/...
  const oldLocalRef = PROJECT_PREFIX + '/assets/' + relFromAssets;
  const newLocalRef = PROJECT_PREFIX + '/assets/' + category + '/' + newFileName;
  
  assetMap[oldLocalRef] = newLocalRef;

  console.log(`  Moving: ${relFromAssets} -> ${category}/${newFileName}`);
  fs.renameSync(oldPath, newPath);
});

console.log('--- Phase 2: Updating JSON files ---');

const jsonFiles = fs.readdirSync(JSON_DIR).filter(f => f.endsWith('.json'));

jsonFiles.forEach(jsonFile => {
  const filePath = path.join(JSON_DIR, jsonFile);
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  Object.entries(assetMap).forEach(([oldRef, newRef]) => {
    // Escape dots and slashes for regex
    const escapedOld = oldRef.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(escapedOld, 'g');
    if (content.includes(oldRef)) {
      content = content.replace(regex, newRef);
      changed = true;
    }
  });

  if (changed) {
    fs.writeFileSync(filePath, content);
    console.log(`  Updated: ${jsonFile}`);
  }
});

// Cleanup empty old directories
function removeEmptyDirs(dir) {
  const isDir = fs.statSync(dir).isDirectory();
  if (!isDir) return;

  let files = fs.readdirSync(dir);
  if (files.length > 0) {
    files.forEach(file => removeEmptyDirs(path.join(dir, file)));
    files = fs.readdirSync(dir);
  }

  if (files.length === 0 && 
      !Object.values(NEW_STRUCTURE).includes(dir) && 
      dir !== BASE_DIR) {
    console.log(`  Removing empty dir: ${dir}`);
    fs.rmdirSync(dir);
  }
}
removeEmptyDirs(BASE_DIR);

console.log('--- Refactoring Complete ---');
