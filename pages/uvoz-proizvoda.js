import Head from "next/head";
import { createClient } from "next-sanity";
import clientConfig from "@/sanity/config/client-config";
import ProductImport from "@/components/ProductImport/ProductImport";

export default function ProductImportPage({ categories }) {
    return <><Head><title>Uvoz proizvoda | Marbok</title><meta name="robots" content="noindex,nofollow" /></Head><ProductImport categories={categories} /></>;
}

export async function getServerSideProps() {
    const categories = await createClient(clientConfig).fetch(`*[_type == "categoryPage"] | order(title asc){_id,title,"slug":slug.current,categoryProducts[]->{_id,title}}`);
    return { props: { categories: categories || [] } };
}
