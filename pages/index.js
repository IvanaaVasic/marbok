import React from "react";
import { getPages } from "@/sanity/sanity-utils";
import styles from "./page.module.css";
import Content from "@/components/Content/Content";
import { usePages } from "@/hooks/usePages";
import Layout from "@/components/Layout/Layout";

export default function Home({ initialPages }) {
  const pages = usePages() || initialPages;

  return (
    <div>
      <Layout pages={pages}>
        <div className={styles.container}>
          <Content pages={pages} />
        </div>
      </Layout>
    </div>
  );
}

export async function getServerSideProps() {
  const initialPages = await getPages();
  return {
    props: { initialPages },
  };
}
