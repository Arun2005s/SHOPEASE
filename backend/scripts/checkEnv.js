import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env file
const envPath = path.join(__dirname, '..', '.env');
console.log('📁 Checking .env file at:', envPath);
console.log('   File exists:', fs.existsSync(envPath));

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const lines = envContent.split('\n');
  
  console.log('\n📋 .env file contents:');
  console.log('   Total lines:', lines.length);
  
  const cloudinaryVars = ['CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET', 'CLOUDINARY_URL'];
  
  lines.forEach((line, index) => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key] = trimmed.split('=');
      if (cloudinaryVars.some(v => key && key.includes('CLOUDINARY'))) {
        console.log(`   Line ${index + 1}: ${key ? key.substring(0, 30) + '...' : 'empty'}`);
      }
    }
  });
}

// Load with dotenv
dotenv.config({ path: envPath });

console.log('\n🔍 Environment variables after loading:');
console.log('   CLOUDINARY_CLOUD_NAME:', process.env.CLOUDINARY_CLOUD_NAME ? `✅ "${process.env.CLOUDINARY_CLOUD_NAME}"` : '❌ Not found');
console.log('   CLOUDINARY_API_KEY:', process.env.CLOUDINARY_API_KEY ? `✅ "${process.env.CLOUDINARY_API_KEY.substring(0, 5)}..."` : '❌ Not found');
console.log('   CLOUDINARY_API_SECRET:', process.env.CLOUDINARY_API_SECRET ? `✅ "${process.env.CLOUDINARY_API_SECRET.substring(0, 5)}..."` : '❌ Not found');
console.log('   CLOUDINARY_URL:', process.env.CLOUDINARY_URL ? `✅ "${process.env.CLOUDINARY_URL.substring(0, 30)}..."` : '❌ Not found');

