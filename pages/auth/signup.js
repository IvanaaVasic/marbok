import Layout from "@/components/Layout/Layout";
import { RegistrationForm } from "@/components/RegistrationForm/RegistrationForm";
import { getPages, getCategories, getStores } from "@/sanity/sanity-utils";
import { usePages, useCategories } from "@/hooks/usePages";

function Signup({ initialPages, initialCategory, initialStores }) {
    const pages = usePages() || initialPages;
    const categories = useCategories() || initialCategory;
    return (
        <Layout pages={pages} categories={categories} stores={initialStores}>
            {(filteredProducts) => <RegistrationForm />}
        </Layout>
    );
}
export default Signup;
export async function getServerSideProps() {
    const initialPages = await getPages();
    const initialCategory = await getCategories();
    const initialStores = await getStores();

    return {
        props: { initialPages, initialCategory, initialStores },
    };
}
