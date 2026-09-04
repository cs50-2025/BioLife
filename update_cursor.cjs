const fs = require('fs');
let content = fs.readFileSync('src/pages/Scan.tsx', 'utf-8');

content = content.replace(
  'className="p-6 max-h-[70vh] overflow-y-auto"',
  'className={clsx("p-6 max-h-[70vh] overflow-y-auto", isCollapsed ? "cursor-pointer" : "")}'
);

fs.writeFileSync('src/pages/Scan.tsx', content);
