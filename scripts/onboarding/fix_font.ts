import * as fs from 'fs';
import * as path from 'path';

const targetFile = path.resolve(__dirname, '../../app/(client)/onboarding/page.tsx');
let content = fs.readFileSync(targetFile, 'utf8');

content = content.replace('className="text-sm font-semibold px-2"', 'className="text-sm font-normal leading-relaxed px-4"')

fs.writeFileSync(targetFile, content, 'utf8');
console.log('Successfully ran fix_font.ts');
