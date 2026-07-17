import * as fs from 'fs';
import * as path from 'path';

const targetFile = path.resolve(__dirname, '../../app/(client)/onboarding/page.tsx');
let content = fs.readFileSync(targetFile, 'utf8');

// Make sure all cards have items-center
content = content.replace(
    'flex flex-col justify-center min-h-[280px]',
    'flex flex-col justify-center items-center min-h-[280px]'
)

// And make the text span a div with w-full to guarantee centering
content = content.replace(
    '<span className="text-sm font-normal leading-relaxed px-4">',
    '<div className="text-sm font-normal leading-relaxed px-2 w-full text-center flex flex-col items-center justify-center">'
)
content = content.replace('</span>', '</div>')

fs.writeFileSync(targetFile, content, 'utf8');
console.log('Successfully ran fix_centering.ts');
