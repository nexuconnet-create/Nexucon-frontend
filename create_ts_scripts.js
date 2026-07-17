const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'scripts', 'ui-migrations');
if (!fs.existsSync(dir)){
    fs.mkdirSync(dir, { recursive: true });
}

const pyScripts = [
  "add_step2.py", "add_step3.py", "add_step4.py", "add_step5.py",
  "fix_cards.py", "fix_centering.py", "fix_font.py", "fix_register.py", "refactor.py"
];

// Helper to convert Python raw strings and multiline strings to JS template literals safely
// Actually, since we have the original .py files on disk, we can read them, do some basic regex replacements to convert Python to TS.

for (const pyFile of pyScripts) {
  if (fs.existsSync(pyFile)) {
    let pyCode = fs.readFileSync(pyFile, 'utf8');
    
    // Determine the target file
    let targetFileMatch = pyCode.match(/with open\("([^"]+)", "r"\)/);
    if (!targetFileMatch) continue;
    let targetFile = targetFileMatch[1];
    
    let tsCode = `import * as fs from 'fs';\nimport * as path from 'path';\n\n`;
    tsCode += `const targetFile = path.resolve(process.cwd(), '${targetFile}');\n`;
    tsCode += `let content = fs.readFileSync(targetFile, 'utf8');\n\n`;
    
    // Extract the middle part (the logic)
    let logic = pyCode.split(/with open\([^)]+\) as f:\s*content = f.read\(\)/)[1];
    logic = logic.split(/with open\([^)]+\) as f:\s*f.write\(content\)/)[0];
    
    // Convert python comments to JS comments
    logic = logic.replace(/^#/gm, '//');
    
    // Convert python `content = content.replace(`
    // No change needed for basic string replace, but multiline strings `"""` need to become ```
    // We also need to escape backticks inside python multiline strings before converting.
    logic = logic.replace(/`/g, '\\`');
    logic = logic.replace(/"""/g, '`');
    
    // Convert python `if "..." not in content:` to JS `if (!content.includes("...")) {`
    logic = logic.replace(/if "(.*?)" not in content:/g, 'if (!content.includes("$1")) {');
    
    // Fix python blocks (indentation based to brace based)
    // For our scripts, the only block is the if statement we just replaced. We can just add a closing brace at the end of the indented block.
    // Actually, our if blocks just have one statement inside.
    let lines = logic.split('\n');
    let insideIf = false;
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes('if (!content.includes')) {
            insideIf = true;
            lines[i] = lines[i] + '';
        } else if (insideIf && lines[i].trim() === '') {
            lines[i] = '}\n';
            insideIf = false;
        } else if (insideIf && !lines[i].startsWith('    ') && lines[i].trim() !== '') {
            lines.splice(i, 0, '}');
            insideIf = false;
            i++;
        }
    }
    if (insideIf) lines.push('}');
    logic = lines.join('\n');
    
    // Handle python regex `re.compile(r'...', re.DOTALL)`
    if (logic.includes('re.compile')) {
        // manually fix refactor.py and fix_register.py regex
        logic = logic.replace(/import re\n?/g, '');
        logic = logic.replace(/pattern = re.compile\(r'(.*?)', re.DOTALL\)/g, 'const pattern = new RegExp(`$1`, "gs");');
        logic = logic.replace(/content = pattern.sub\('(.*?)', content\)/g, 'content = content.replace(pattern, \'$1\');');
        // Fix python r'...' strings that might have backslashes
        logic = logic.replace(/\\\\s/g, '\\s');
    }
    
    tsCode += logic + '\n';
    
    tsCode += `fs.writeFileSync(targetFile, content, 'utf8');\n`;
    tsCode += `console.log('Successfully ran ${pyFile.replace('.py', '.ts')}');\n`;
    
    let tsFileName = pyFile.replace('.py', '.ts');
    fs.writeFileSync(path.join(dir, tsFileName), tsCode, 'utf8');
  }
}

console.log("Conversion complete.");
