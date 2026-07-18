const fs = require('fs');
const path = require('path');

const files = [
  "src/components/transactions/transaction-form.tsx",
  "src/components/transactions/transaction-filters.tsx",
  "src/components/recurring/recurring-form.tsx",
  "src/components/dashboard/dashboard-filters.tsx",
  "src/components/categories/category-form.tsx",
  "src/components/budgets/new-budget-form.tsx",
  "src/app/login/page.tsx",
  "src/app/(app)/transactions/page.tsx",
  "src/app/(app)/settings/export/page.tsx",
  "src/app/(app)/recurring/page.tsx",
  "src/app/(app)/debts/[id]/page.tsx",
  "src/app/(app)/debts/[id]/edit/page.tsx",
  "src/app/(app)/debts/new/page.tsx",
  "src/app/(app)/categories/page.tsx",
  "src/app/(app)/budgets/[id]/edit/page.tsx",
  "src/app/(app)/budgets/page.tsx",
  "src/components/layout/app-shell.tsx"
];

for (const relPath of files) {
  const fullPath = path.join(__dirname, relPath);
  if (!fs.existsSync(fullPath)) {
    console.error(`File not found: ${fullPath}`);
    continue;
  }
  
  let content = fs.readFileSync(fullPath, 'utf8');
  
  // Skip if already has SubmitButton
  if (content.includes("SubmitButton")) continue;

  // Add import if not present
  if (content.includes("<Button type=\"submit\"")) {
    const importStatement = `import { SubmitButton } from "@/components/ui/submit-button"\n`;
    
    // Find the last import
    const lastImportIndex = content.lastIndexOf("import ");
    if (lastImportIndex !== -1) {
      const endOfLastImport = content.indexOf("\n", lastImportIndex) + 1;
      content = content.substring(0, endOfLastImport) + importStatement + content.substring(endOfLastImport);
    } else {
      content = importStatement + content;
    }

    // Replace <Button type="submit"...> with <SubmitButton...>
    // Note: Since button tags span multiple lines sometimes, regex is needed.
    // We only want to replace the specific <Button type="submit" ...> opening tag
    // and its corresponding closing tag.
    // This is simple if we assume the structure is <Button type="submit" [props]>Children</Button>
    
    // A simpler way: replace `<Button type="submit"` with `<SubmitButton`
    // but wait, then the closing tag is still `</Button>`. 
    // We can use a regex to match the whole tag and its closing.
    content = content.replace(/<Button\s+type="submit"([\s\S]*?)<\/Button>/g, `<SubmitButton$1</SubmitButton>`);
    
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`Updated ${relPath}`);
  }
}
