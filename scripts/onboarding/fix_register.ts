import * as fs from 'fs';
import * as path from 'path';

const targetFile = path.resolve(__dirname, '../../app/(auth)/client/register/page.tsx');
let content = fs.readFileSync(targetFile, 'utf8');

// Remove the inline CustomSelect definition
const pattern = new RegExp(`interface CustomSelectProps.*?\s+</div>\n\s+\);\n}\n`, 'gs');
content = content.replace(pattern, '');

// Add the import
if (!content.includes('import { CustomSelect } from "../../../../components/CustomSelect";')) {
    content = content.replace(
        'import { Country, State } from "country-state-city";',
        'import { Country, State } from "country-state-city";\nimport { CustomSelect } from "../../../../components/CustomSelect";'
    );
}

fs.writeFileSync(targetFile, content, 'utf8');
console.log('Successfully ran fix_register.ts');
