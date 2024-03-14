import { useState, useEffect } from "react";
import { getPages } from "@/sanity/sanity-utils";

export function usePages() {
  const [pages, setPages] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const data = await getPages();
      setPages(data);
    };
    fetchData();
  }, []);

  return pages;
}
