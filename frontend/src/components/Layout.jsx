import React, { useEffect, useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { FaSun, FaMoon } from 'react-icons/fa';

const Layout = ({ children }) => {
  const { isDarkMode, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)]">
      <nav className="bg-[var(--color-bg-secondary)] border-b border-[var(--color-border)] py-4">
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
          <div className="text-xl font-cinzel text-[var(--color-text-primary)]">
            D&D Map Viewer
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-[var(--color-bg-hover)] transition-colors"
              aria-label="Toggle theme"
            >
              {isDarkMode ? (
                <FaSun className="text-[var(--color-text-primary)] w-5 h-5" />
              ) : (
                <FaMoon className="text-[var(--color-text-primary)] w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </nav>
      <main>{children}</main>
    </div>
  );
};

export default Layout;
