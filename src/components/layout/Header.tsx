'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

const NAV_LINKS = [
  { href: '/', label: 'الرئيسية' },
  { href: '/imsakia-ramadan/', label: 'إمساكية رمضان' },
  { href: '/developers/', label: 'المطورون' },
] as const;

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const pathname = usePathname();

  // Close mobile menu on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && menuOpen) {
        setMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [menuOpen]);

  // Close menu when route changes
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  return (
    <header ref={headerRef} className="bg-teal-700 text-white shadow-sm sticky top-0 z-40" role="banner">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Logo + Site Name */}
          <Link
            href="/"
            className="flex items-center gap-2.5 sm:gap-3 shrink-0 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-teal-700 transition-opacity hover:opacity-95"
            aria-label="مواقيت الصلاة — الصفحة الرئيسية"
          >
            <Image
              src="/salat.png"
              alt="شعار مواقيت الصلاة"
              width={34}
              height={34}
              className="rounded-lg shadow-xs sm:w-9 sm:h-9"
              priority
            />
            <span className="text-lg sm:text-xl font-extrabold tracking-tight">مواقيت الصلاة</span>
          </Link>

          {/* Desktop Navigation */}
          <nav
            aria-label="التنقل الرئيسي"
            className="hidden md:flex items-center gap-1 lg:gap-2"
          >
            {NAV_LINKS.map((link) => {
              const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-teal-700 ${
                    isActive
                      ? 'bg-teal-800 text-white font-bold shadow-xs'
                      : 'text-teal-100 hover:text-white hover:bg-teal-600/70'
                  }`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Mobile hamburger */}
          <button
            type="button"
            aria-label={menuOpen ? 'إغلاق القائمة' : 'فتح القائمة'}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            className="md:hidden p-1.5 rounded-lg text-teal-100 hover:text-white hover:bg-teal-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-teal-700 transition-colors cursor-pointer"
            onClick={() => setMenuOpen((prev) => !prev)}
          >
            {menuOpen ? (
              /* X icon */
              <svg className="w-5 h-5 sm:w-6 sm:h-6" width={24} height={24} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              /* Hamburger icon */
              <svg className="w-5 h-5 sm:w-6 sm:h-6" width={24} height={24} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile dropdown menu */}
      {menuOpen && (
        <nav
          id="mobile-menu"
          aria-label="قائمة التنقل للجوال"
          className="md:hidden bg-teal-800 border-t border-teal-600 shadow-lg animate-in slide-in-from-top-2 duration-150"
        >
          <ul className="flex flex-col py-2 px-3 space-y-1">
            {NAV_LINKS.map((link) => {
              const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={() => setMenuOpen(false)}
                    className={`block px-4 py-2.5 rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white ${
                      isActive
                        ? 'bg-teal-900 text-white font-bold'
                        : 'text-teal-100 hover:text-white hover:bg-teal-700'
                    }`}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      )}
    </header>
  );
}
