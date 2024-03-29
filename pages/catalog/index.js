import React from "react";
import { getPages } from "@/sanity/sanity-utils";
import styles from "./page.module.css";
import Content from "@/components/Content/Content";
import { usePages } from "@/hooks/usePages";
import Layout from "@/components/Layout/Layout";

export default function Catalog({ initialPages }) {
  const pages = usePages() || initialPages;

  return (
    <Layout pages={pages}>
      {(filteredProducts) => (
        <div className={styles.container}>
          <Content pages={pages} filteredProducts={filteredProducts} />
        </div>
      )}
    </Layout>
  );
}

export async function getServerSideProps() {
  const initialPages = await getPages();
  return {
    props: { initialPages },
  };
}
