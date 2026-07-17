import * as fs from 'fs';
import * as path from 'path';

const targetFile = path.resolve(__dirname, '../../app/(client)/onboarding/page.tsx');
let content = fs.readFileSync(targetFile, 'utf8');

content = content.replace('min-h-[240px]', 'min-h-[280px]')

fs.writeFileSync(targetFile, content, 'utf8');
console.log('Successfully ran fix_cards.ts');
