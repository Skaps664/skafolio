import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 mb-6">
            Your Digital Business Card,
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              {" "}Reimagined
            </span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Create stunning digital business cards in minutes. Share instantly via QR code or NFC tap. 
            Track analytics in real-time. Start free, upgrade as you grow.
          </p>
          
          <div className="flex gap-4 justify-center flex-col sm:flex-row">
            <Link
              href="/auth/register"
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all"
            >
              Get Started Free
            </Link>
            <Link
              href="/card/demo"
              className="px-8 py-4 bg-white text-gray-900 rounded-lg font-semibold border-2 border-gray-200 hover:border-blue-600 transition-all"
            >
              View Demo Card
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="bg-white p-8 rounded-2xl shadow-lg">
            <div className="text-4xl mb-4">⚡</div>
            <h3 className="text-2xl font-bold mb-3 text-gray-900">Lightning Fast</h3>
            <p className="text-gray-600">
              Sub-100ms load times with edge-optimized delivery. Your card loads instantly, everywhere.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-white p-8 rounded-2xl shadow-lg">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-2xl font-bold mb-3 text-gray-900">Analytics Included</h3>
            <p className="text-gray-600">
              Track views, clicks, and engagement. Know who&apos;s viewing your card and when.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-white p-8 rounded-2xl shadow-lg">
            <div className="text-4xl mb-4">📱</div>
            <h3 className="text-2xl font-bold mb-3 text-gray-900">NFC Ready</h3>
            <p className="text-gray-600">
              Order physical NFC cards that open your digital card with a single tap.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="bg-white p-8 rounded-2xl shadow-lg">
            <div className="text-4xl mb-4">🎨</div>
            <h3 className="text-2xl font-bold mb-3 text-gray-900">Beautiful Themes</h3>
            <p className="text-gray-600">
              Choose from free and premium themes. Customize colors, fonts, and layouts.
            </p>
          </div>

          {/* Feature 5 */}
          <div className="bg-white p-8 rounded-2xl shadow-lg">
            <div className="text-4xl mb-4">🔒</div>
            <h3 className="text-2xl font-bold mb-3 text-gray-900">Secure & Private</h3>
            <p className="text-gray-600">
              Enterprise-grade security. Your data is encrypted and protected at all times.
            </p>
          </div>

          {/* Feature 6 */}
          <div className="bg-white p-8 rounded-2xl shadow-lg">
            <div className="text-4xl mb-4">💳</div>
            <h3 className="text-2xl font-bold mb-3 text-gray-900">Easy Payments</h3>
            <p className="text-gray-600">
              Integrated PayFast payments for NFC cards. COD available for local orders.
            </p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-4xl font-bold mb-4">Ready to Go Digital?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of professionals who&apos;ve ditched paper cards.
          </p>
          <Link
            href="/auth/register"
            className="inline-block px-8 py-4 bg-white text-blue-600 rounded-lg font-semibold hover:shadow-2xl transition-all"
          >
            Create Your Free Card Now
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-white font-bold text-xl mb-4">Skafolio</h3>
              <p className="text-sm">
                Modern digital business cards for the modern professional.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/features" className="hover:text-white">Features</Link></li>
                <li><Link href="/pricing" className="hover:text-white">Pricing</Link></li>
                <li><Link href="/templates" className="hover:text-white">Templates</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/about" className="hover:text-white">About</Link></li>
                <li><Link href="/blog" className="hover:text-white">Blog</Link></li>
                <li><Link href="/contact" className="hover:text-white">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/privacy" className="hover:text-white">Privacy</Link></li>
                <li><Link href="/terms" className="hover:text-white">Terms</Link></li>
                <li><Link href="/security" className="hover:text-white">Security</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
            <p>&copy; 2025 Skafolio. Built with ⚡ Next.js for speed.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

