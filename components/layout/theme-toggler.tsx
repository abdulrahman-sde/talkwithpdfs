"use client";

import { useTheme } from "next-themes";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Sun, Moon } from "lucide-react";

export default function ThemeToggler() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const iconVariants = {
    light: {
      rotate: 0,
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 20,
      },
    },
    dark: {
      rotate: 360,
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 20,
      },
    },
  };

  if (!mounted) return null;

  return (
    <motion.button
      className="py-2 px-2.5 rounded-xl bg-slate-100/80 dark:bg-gray-500/20 text-muted-foreground hover:text-foreground hover:bg-background/50 transition-colors mt-1"
      onClick={toggleTheme}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      aria-label="Toggle theme"
    >
      <motion.div
        variants={iconVariants}
        animate={theme === "dark" ? "dark" : "light"}
        initial={false}
      >
        {theme === "dark" ? (
          <Moon
            size={18}
            aria-hidden="true"
            className="h-4.5 w-4.5 mt-[1px]"
            style={{ transformOrigin: "center" }}
          />
        ) : (
          <Sun
            size={20}
            aria-hidden="true"
            className="h-5 w-5"
            style={{ transformOrigin: "center" }}
          />
        )}
      </motion.div>
    </motion.button>
  );
}
