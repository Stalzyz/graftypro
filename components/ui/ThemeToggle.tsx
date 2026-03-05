"use client";

import React, { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

export function ThemeToggle() {
    const [theme, setTheme] = useState<"light" | "dark">("light");

    // Initialize theme from document class or localStorage
    useEffect(() => {
        const isDark = document.documentElement.classList.contains("dark") ||
            localStorage.getItem("theme") === "dark";

        if (isDark) {
            setTheme("dark");
            document.documentElement.classList.add("dark");
        } else {
            setTheme("light");
            document.documentElement.classList.remove("dark");
        }
    }, []);

    const toggleTheme = () => {
        const newTheme = theme === "light" ? "dark" : "light";
        setTheme(newTheme);

        if (newTheme === "dark") {
            document.documentElement.classList.add("dark");
            localStorage.setItem("theme", "dark");
        } else {
            document.documentElement.classList.remove("dark");
            localStorage.setItem("theme", "light");
        }

        // Broadcast change for components that might need it
        window.dispatchEvent(new Event("theme-changed"));
    };

    return (
        <button
            onClick={toggleTheme}
            className="p-2 rounded-xl bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 hover:bg-slate-200 dark:hover:bg-zinc-700 transition-all active:scale-95 shadow-sm border border-slate-200 dark:border-zinc-700"
            aria-label="Toggle Theme"
        >
            {theme === "light" ? (
                <Moon size={20} strokeWidth={2} />
            ) : (
                <Sun size={20} strokeWidth={2} />
            )}
        </button>
    );
}
