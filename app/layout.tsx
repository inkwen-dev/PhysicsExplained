import type { Metadata } from "next";
import Script from "next/script";
import Header from "@/components/layout/Header";
import FriendLinksBand from "@/components/layout/FriendLinksBand";
import Footer from "@/components/layout/Footer";
import "./globals.css";

export const metadata: Metadata = {
  title: "Physics Explained",
  description: "Understanding Physics, Simply Explained",
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const gaId = process.env.NEXT_PUBLIC_GA_ID || 'G-7NNNN03VPV';

  return (
    <html lang="en">
      <head>
        {/* Google Tag Manager: initialize the shared data layer before loading. */}
        <Script id="google-tag-manager" strategy="afterInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','GTM-MBKZZW34');`}
        </Script>
        {/* Preconnect to Google Analytics for faster loading */}
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        
        {/* Google tag (gtag.js) */}
        {gaId && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
              strategy="afterInteractive"
            />
            <Script
              id="google-analytics"
              strategy="afterInteractive"
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${gaId}');
                `,
              }}
            />
          </>
        )}
      </head>
      <body className="flex flex-col min-h-screen">
        <noscript>
          <iframe src="https://www.googletagmanager.com/ns.html?id=GTM-MBKZZW34" height="0" width="0" style={{ display: 'none', visibility: 'hidden' }} title="Google Tag Manager" />
        </noscript>
        <Header />
        <main className="flex-grow">{children}</main>
        <FriendLinksBand />
        <Footer />
      </body>
    </html>
  );
}

