// frontend/src/app/components/NavBar.tsx

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function NavBar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [dark, setDark] = useState(false);

  // Load theme from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("theme");
    if (saved === "dark") {
      document.documentElement.classList.add("dark");
      setDark(true);
    }
  }, []);

  // Toggle theme
  const toggleTheme = () => {
    const html = document.documentElement;
    if (html.classList.contains("dark")) {
      html.classList.remove("dark");
      localStorage.setItem("theme", "light");
      setDark(false);
    } else {
      html.classList.add("dark");
      localStorage.setItem("theme", "dark");
      setDark(true);
    }
  };

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Donors", href: "/donors" },
    { name: "Hospitals", href: "/hospitals" },
    { name: "Requests", href: "/requests" },
    { name: "AI Search", href: "/ai-search" },
  ];

  const actionLinks = [
    { name: "+ New Donor", href: "/donors/new" },
    { name: "+ New Hospital", href: "/hospitals/new" },
    { name: "+ New Request", href: "/requests/new" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-[var(--border)] bg-[var(--surface)]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex h-16 items-center justify-between">
          {/* Brand */}
          <Link
            href="/"
            className="text-lg font-semibold"
            onClick={() => setOpen(false)}
          >
            Blood Bank <span className="text-[var(--accent)]">AI</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={
                    active
                      ? "text-[var(--accent)] border-b-2 border-[var(--accent)] pb-1 text-sm font-medium"
                      : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-sm font-medium transition"
                  }
                >
                  {link.name}
                </Link>
              );
            })}
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-2">
            {actionLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-full border border-[var(--border)] px-3 py-1.5 text-sm hover:bg-gray-100 dark:hover:bg-slate-800 transition"
              >
                {link.name}
              </Link>
            ))}

            {/* 🌙 / ☀️ Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="ml-2 rounded-full border border-[var(--border)] px-3 py-1.5 text-sm hover:bg-gray-100 dark:hover:bg-slate-800 transition"
              aria-label="Toggle theme"
            >
              {dark ? "☀️" : "🌙"}
            </button>
          </div>

          {/* Mobile Hamburger */}
          <button
            className="md:hidden rounded-md border border-[var(--border)] px-3 py-2 text-sm"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            ☰
          </button>
        </div>
      </div>
    </nav>
  );
}
