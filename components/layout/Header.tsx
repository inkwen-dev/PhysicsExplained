import Link from "next/link";

// Logo Icon Component (inline SVG for better performance)
function LogoIcon({ className }: { className?: string }) {
  return (
    <svg 
      width="32" 
      height="32" 
      viewBox="0 0 32 32" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Rounded background */}
      <rect width="32" height="32" rx="6" fill="#00d4ff"/>
      {/* Letter P - bold strokes for clarity at small sizes */}
      <path 
        d="M9 7 L9 25 M9 7 L19 7 Q23 7 23 11 L23 16 Q23 20 19 20 L9 20" 
        stroke="#2d1b4e" 
        strokeWidth="3.5" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function Header() {
  return (
    <header className="bg-primary text-white">
      <div className="container mx-auto px-4 py-4">
        <nav className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
            <LogoIcon className="w-8 h-8 flex-shrink-0" />
            <span className="text-xl font-bold hidden md:inline">
              Physics Explained
            </span>
            <span className="text-xl font-bold md:hidden">
              PE
            </span>
          </Link>
          <div className="flex gap-4">
            <Link href="/categories" className="hover:text-accent transition-colors">
              Categories
            </Link>
            <Link href="/about" className="hover:text-accent transition-colors">
              About
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
}

