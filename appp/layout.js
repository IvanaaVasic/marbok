// import { Inter } from "next/font/google";
// import "./globals.css";

// const inter = Inter({ subsets: ["latin"] });

// export const metadata = {
//   title: "Create Next App",
//   description: "Generated by create next app",
//   icons: {
//     icon: "/icon.ico",
//   },
// };

// export default function RootLayout({ children }) {
//   return (
//     <html lang="en">
//       <body className={inter.className}>
//         <div id="modal"></div>
//         {children}
//       </body>
//     </html>
//   );
// }

// "use client";
// import { QueryClient, QueryClientProvider } from "react-query";
// import { Hydrate } from "react-query/hydration";
// import { Inter } from "next/font/google";

// const queryClient = new QueryClient();
// const inter = Inter({ subsets: ["latin"] });

// export default function RootLayout({ children }) {
//   return (
//     <QueryClientProvider client={queryClient}>
//       <Hydrate state={queryClient}>
//         <html lang="en">
//           <body className={inter.className}>
//             <div id="modal"></div>
//             {children}
//           </body>
//         </html>
//       </Hydrate>
//     </QueryClientProvider>
//   );
// }
