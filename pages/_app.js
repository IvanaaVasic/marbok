import { QueryClient, QueryClientProvider } from "react-query";
import { Hydrate } from "react-query/hydration";
import "./globals.css";
import { StoreProvider } from "@/context/StoreContext";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const queryClient = new QueryClient();

export default function MyApp({ Component, pageProps }) {
    return (
        <StoreProvider>
            <QueryClientProvider client={queryClient}>
                <Hydrate state={pageProps.dehydratedState}>
                    <div id="modal" className="modal"></div>
                    <Component {...pageProps} />
                    <ToastContainer
                        position="bottom-right"
                        autoClose={2200}
                        newestOnTop
                        closeOnClick
                    />
                </Hydrate>
            </QueryClientProvider>
        </StoreProvider>
    );
}
