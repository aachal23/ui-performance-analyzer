import { ReactNode } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { InstrumentationProvider } from '@/contexts/InstrumentationContext';

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider defaultTheme="dark">
      <BrowserRouter>
        <InstrumentationProvider>{children}</InstrumentationProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}
