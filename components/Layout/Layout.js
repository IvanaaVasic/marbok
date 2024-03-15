import React, { useState } from "react";
import Header from "@/components/Header/Header";
import Footer from "@/components/Footer/Footer";
import Head from "next/head";

function Layout({ children, pages }) {
  const [filteredProducts, setFilteredProducts] = useState([]);

  return (
    <div>
      <Head>
        <link rel="shortcut icon" href="/icon.ico" />
      </Head>
      <Header pages={pages} setFilteredProducts={setFilteredProducts} />
      {children({ pages, filteredProducts })}
      <Footer />
    </div>
  );
}

export default Layout;
