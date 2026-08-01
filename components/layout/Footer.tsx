import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-bg-secondary border-t border-border mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Quick Links - First priority */}
          <div>
            <h3 className="font-semibold text-text-primary mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/categories" className="text-text-secondary hover:text-accent transition-colors">
                  Categories
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-text-secondary hover:text-accent transition-colors">
                  About
                </Link>
              </li>
            </ul>
          </div>

          {/* About Section */}
          <div>
            <h3 className="font-semibold text-text-primary mb-4">About</h3>
            <p className="text-sm text-text-secondary">
              Exploring physics through simple explanations and real-world examples.
            </p>
          </div>
        </div>
        <div className="border-t border-border mt-8 pt-4 text-center text-sm text-text-secondary">
          <p>&copy; 2026 Physics Explained. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
