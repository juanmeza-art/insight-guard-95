import { useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function ThemeToggle() {
  const [dark, setDark] = useState(true);

  const toggle = () => {
    setDark(!dark);
    document.documentElement.classList.toggle('dark');
  };

  // Initialize dark mode
  if (typeof window !== 'undefined' && !document.documentElement.classList.contains('dark') && dark) {
    document.documentElement.classList.add('dark');
  }

  return (
    <Button variant="ghost" size="icon" onClick={toggle} className="rounded-full">
      {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </Button>
  );
}
