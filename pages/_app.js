import { QueryClient, QueryClientProvider } from "react-query";
import { Hydrate } from "react-query/hydration";
import "./globals.css";
import { ProductSelectionProvider } from "@/context/ProductSelectionContext";
import ProductSelectionBar from "@/components/ProductSelectionBar/ProductSelectionBar";
import { StoreProvider } from "@/context/StoreContext";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { CatalogAccessProvider } from "@/context/CatalogAccessContext";

const queryClient = new QueryClient();

export default function MyApp({ Component, pageProps }) {
    return (
        <StoreProvider>
            <QueryClientProvider client={queryClient}>
                <Hydrate state={pageProps.dehydratedState}>
                  <CatalogAccessProvider>
                    <ProductSelectionProvider>
                    <div id="modal" className="modal"></div>
                    <Component {...pageProps} />
                    <ProductSelectionBar />
                    <ToastContainer
                        position="bottom-right"
                        autoClose={2200}
                        newestOnTop
                        closeOnClick
                    />
                    </ProductSelectionProvider>
                  </CatalogAccessProvider>
                </Hydrate>
            </QueryClientProvider>
        </StoreProvider>
    );
}
