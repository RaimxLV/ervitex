import Header from "@/components/Header";
import Footer from "@/components/Footer";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="public-readable flex-1 bg-background">{children}</main>
      <Footer />
    </div>
  );
};

export default Layout;
