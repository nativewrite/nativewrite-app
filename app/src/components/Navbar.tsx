"use client";

import Link from "next/link";

export function Navbar() {
  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/" className="text-xl font-bold text-gray-900">
            NativeWrite
          </Link>
        </div>
        
        <div className="flex items-center space-x-4">
          <Link 
            href="/dashboard" 
            className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
          >
            Dashboard
          </Link>
          <Link 
            href="/humanizer" 
            className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
          >
            Humanizer
          </Link>
          <Link 
            href="/transcriber" 
            className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
          >
            Transcriber
          </Link>
          <Link 
            href="/bookwriter" 
            className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
          >
            Book Writer
          </Link>
          <Link 
            href="/pricing" 
            className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
          >
            Pricing
          </Link>
          <Link 
            href="/account" 
            className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
          >
            Account
          </Link>
        </div>
      </div>
    </nav>
  );
}
