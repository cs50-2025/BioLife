const fs = require('fs');
let content = fs.readFileSync('src/pages/Scan.tsx', 'utf-8');

content = content.replace(
  'const handleTouchMove = (e: React.TouchEvent) => { if (!touchStartY.current) return; const currentY = e.touches[0].clientY; const diff = currentY - touchStartY.current; if (diff > 50 && !isCollapsed) { setIsCollapsed(true); touchStartY.current = null; } else if (diff < -50 && isCollapsed) { setIsCollapsed(false); touchStartY.current = null; } };',
  'const handleTouchMove = (e: React.TouchEvent) => { if (!touchStartY.current) return; const currentY = e.touches[0].clientY; const diff = currentY - touchStartY.current; const target = e.currentTarget as HTMLElement; if (diff > 50 && !isCollapsed && target.scrollTop <= 0) { setIsCollapsed(true); touchStartY.current = null; } else if (diff < -50 && isCollapsed) { setIsCollapsed(false); touchStartY.current = null; } };'
);

fs.writeFileSync('src/pages/Scan.tsx', content);
