"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-white/20">
      <div className="mx-auto max-w-6xl px-6 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-slate-900 hover:text-[#1E3A8A] transition-colors">
            NativeWrite
          </Link>
          
          <div className="flex items-center space-x-8">
            <Link 
              href="/" 
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                pathname === '/' 
                  ? 'text-[#1E3A8A] bg-[#1E3A8A]/10' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              Home
            </Link>
            <Link 
              href="/pricing" 
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                pathname === '/pricing' 
                  ? 'text-[#1E3A8A] bg-[#1E3A8A]/10' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              Pricing
            </Link>
            <Link 
              href="/about" 
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                pathname === '/about' 
                  ? 'text-[#1E3A8A] bg-[#1E3A8A]/10' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              About
            </Link>
            <Link 
              href="/login" 
              className="bg-[#1E3A8A] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#1E40AF] transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              Login
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
