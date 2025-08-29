import { readFileSync, writeFileSync } from 'fs';

// Read the existing file
let content = readFileSync('c:\\Users\\Gokova\\OneDrive - CELEBI HAVACILIK HOLDING A.S\\Personel\\Programming\\Python\\CopyCat\\pages.tsx', 'utf8');

// Add the export line at the end
content += '\nexport { default as POSHareketleriYuklemePage } from "./pages/POSHareketleriYukleme";\n';

// Write back to the file
writeFileSync('c:\\Users\\Gokova\\OneDrive - CELEBI HAVACILIK HOLDING A.S\\Personel\\Programming\\Python\\CopyCat\\pages.tsx', content);