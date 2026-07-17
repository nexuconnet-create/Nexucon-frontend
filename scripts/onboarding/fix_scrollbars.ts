import * as fs from 'fs';
import * as path from 'path';

const dir = path.resolve(__dirname, '../../app/(professionals)/professional/onboarding/components');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.tsx'));

const replacement = '[&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]';

for (const file of files) {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  if (content.includes('hide-scrollbar')) {
    content = content.replace(/hide-scrollbar/g, replacement);
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${file}`);
  }
}

const pagePath = path.resolve(__dirname, '../../app/(professionals)/professional/onboarding/page.tsx');
let pageContent = fs.readFileSync(pagePath, 'utf8');
if (pageContent.includes('hide-scrollbar')) {
  pageContent = pageContent.replace(/hide-scrollbar/g, replacement);
  fs.writeFileSync(pagePath, pageContent, 'utf8');
  console.log(`Updated page.tsx`);
}

console.log('Done!');
