import React, { useState } from "react";
import Header from "@/components/Header/Header";
import Footer from "@/components/Footer/Footer";
import Head from "next/head";

function Layout({ children, category, footerClassName, categories }) {
    const [filteredProducts, setFilteredProducts] = useState([]);

    return (
        <div>
            <Head>
                <link rel="shortcut icon" href="/icon.ico" />
            </Head>
            <Header
                category={category}
                categories={categories}
                setFilteredProducts={setFilteredProducts}
            />
            {children({ category, filteredProducts })}
            <Footer footerClassName={footerClassName} />
        </div>
    );
}

export default Layout;
