import styles from "./Home.module.css";
import Layout from "@/components/Layout/Layout";
import {
  getPages,
  getImages,
  getHeading,
  getBrandImages,
} from "@/sanity/sanity-utils";
import {
  usePages,
  useHeroImages,
  useHeading,
  useBrandImages,
} from "@/hooks/usePages";
import ImagesSlider from "@/components/ImagesSlider/ImagesSlider";
import Heading from "@/components/Heading/Heading";
import ProductsView from "@/components/ProductsView/ProductsView";
import Experience from "@/components/Experience/Experience";
import BrandSlider from "@/components/BrandSlider/BrandSlider";

function Home({
  initialPages,
  initialHeroImages,
  initialHeading,
  initialBrandImages,
}) {
  const pages = usePages() || initialPages;
  const heroImages = useHeroImages() || initialHeroImages;
  const heading = useHeading() || initialHeading;
  const brandImages = useBrandImages() || initialBrandImages;

  const newproducts = pages.content.find(
    (obj) => obj.title === "Novi proizvodi"
  );

  return (
    <Layout pages={pages}>
      {(filteredProducts) => (
        <div className={styles.container}>
          <ImagesSlider images={heroImages} />
          <Heading mainHeading={heading?.[0]} />
          <ProductsView products={newproducts} />
          <Experience />
          <BrandSlider brandImages={brandImages} />
        </div>
      )}
    </Layout>
  );
}

export default Home;

export async function getServerSideProps() {
  const initialPages = await getPages();
  const initialHeroImages = await getImages();
  const initialHeading = await getHeading();
  const initialBrandImages = await getBrandImages();
  return {
    props: {
      initialPages,
      initialHeroImages,
      initialHeading,
      initialBrandImages,
    },
  };
}
