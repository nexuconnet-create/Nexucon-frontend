import * as fs from 'fs';
import * as path from 'path';

function copyDirRecursiveSync(src: string, dest: string, role: string, isPlural: boolean) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (let entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDirRecursiveSync(srcPath, destPath, role, isPlural);
    } else if (entry.name.endsWith('.tsx') || entry.name.endsWith('.ts')) {
      let content = fs.readFileSync(srcPath, 'utf8');
      
      const roleCapitalized = role.charAt(0).toUpperCase() + role.slice(1);
      const rolePlural = isPlural ? role + 's' : role;
      
      // Replace routes first
      content = content.replace(/\/professional\//g, `/${rolePlural}/`);
      
      // Replace React Component names
      content = content.replace(/Professional/g, roleCapitalized);
      
      // Replace lowercase texts
      content = content.replace(/professional/g, role);
      
      fs.writeFileSync(destPath, content, 'utf8');
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

const basePath = path.resolve(__dirname, '../');
const authSrc = path.join(basePath, 'app/(auth)/professional');
const authDestMentor = path.join(basePath, 'app/(auth)/mentor');
const authDestMentee = path.join(basePath, 'app/(auth)/mentee');

// 1. Copy Auth
console.log('Copying Auth...');
copyDirRecursiveSync(authSrc, authDestMentor, 'mentor', true);
copyDirRecursiveSync(authSrc, authDestMentee, 'mentee', false);

const verifSrc = path.join(basePath, 'app/(professionals)/professional/verification');
const verifDestMentor = path.join(basePath, 'app/(professionals)/mentors/verification');
const verifDestMentee = path.join(basePath, 'app/(professionals)/mentee/verification');

// 2. Copy Verification
console.log('Copying Verification...');
copyDirRecursiveSync(verifSrc, verifDestMentor, 'mentor', true);
copyDirRecursiveSync(verifSrc, verifDestMentee, 'mentee', false);

console.log('Done!');
