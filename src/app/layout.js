import localFont from 'next/font/local';
import './globals.css';

//vercel analytics
import { Analytics } from '@vercel/analytics/react';

//vecel speed insights
import { SpeedInsights } from '@vercel/speed-insights/next';

//clerk
import {
    ClerkProvider,
    SignInButton,
    SignedIn,
    SignedOut,
    UserButton,
} from '@clerk/nextjs';
import { useAuth } from '@clerk/nextjs';

import { Toaster } from 'react-hot-toast';
import StripeProviderWrapper from '@/components/StripeProviderWrapper';

const geistSans = localFont({
    src: './fonts/GeistVF.woff',
    variable: '--font-geist-sans',
    weight: '100 900',
});

const geistMono = localFont({
    src: './fonts/GeistMonoVF.woff',
    variable: '--font-geist-mono',
    weight: '100 900',
});

export const metadata = {
    title: 'PseudoAI',
    description: 'Your AI Powered Coding Interview Prep Tool',
};

export default function RootLayout({ children }) {
    return (
      <html lang="en">
        <head>
          <link rel="icon" href="/favicon.ico" />
        </head>
        <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
          <ClerkProvider dynamic>
            <StripeProviderWrapper>
              <Toaster position="top-right" />
              {children}
              <Analytics />
              <SpeedInsights />
              <script
                src="https://cdn.jsdelivr.net/pyodide/v0.24.1/full/pyodide.js"
                async
              ></script>
            </StripeProviderWrapper>
          </ClerkProvider>
        </body>
      </html>
    );
  }
