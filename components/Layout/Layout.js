import Header from "@/components/Header/Header";
import Footer from "@/components/Footer/Footer";
import Head from "next/head";

function Layout({ children, pages }) {
  return (
    <div>
      <Head>
        <link rel="shortcut icon" href="/icon.ico" />
      </Head>
      <Header pages={pages} />
      {children}
      <Footer />
    </div>
  );
}
export default Layout;
