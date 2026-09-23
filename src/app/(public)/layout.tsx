import { Suspense } from 'react';
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ToasterProvider } from "@/components/toaster-provider";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Suspense fallback={null}>
        <Header />
      </Suspense>
      <main className="min-h-screen">
        {children}
      </main>
      <Footer />
      <ToasterProvider />
    </>
  );
}
