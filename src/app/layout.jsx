import { Inter } from "next/font/google";
import "./globals.css";
import { HeaderComponent } from "@/components/shared/header/Header";
import { FooterComponent } from "@/components/shared/footer/Footer";
import NextTopLoader from "nextjs-toploader";
import { Toaster } from "react-hot-toast";
import StoreProvider from "@/components/shared/storeProvider/StoreProvider";
import FetchData from "@/components/shared/fetchData/FetchData";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Uplift",
  description:
    "Uplift bridges the gap between businesses and passionate testers. Get valuable feedback on products, content, and marketing to ensure success. Businesses gain actionable insights, testers earn rewards. Launch with confidence!",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <link rel="icon" href="/images/Logo.png" sizes="any" />
      <body className={inter.className}>
        <StoreProvider>
          <FetchData />
          <HeaderComponent />
          <main className="pt-20 pb-4"> {/* Add padding-top here */}
            <NextTopLoader
              showSpinner={true}
              color="radial-gradient(circle at 10% 20%, rgb(99, 55, 255) 0%, rgb(39, 170, 255) 90%)"
              speed={800}
            />
            {children}
          </main>
          <FooterComponent />
          <Toaster position="top-center" />
        </StoreProvider>
      </body>
    </html>
  );
}