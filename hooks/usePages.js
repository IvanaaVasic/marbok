import { useState, useEffect } from "react";
import {
  getPages,
  getImages,
  getHeading,
  getBrandImages,
} from "@/sanity/sanity-utils";

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

export function useHeroImages() {
  const [images, setImages] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const data = await getImages();
      setImages(data);
    };
    fetchData();
  }, []);

  return images;
}

export function useHeading() {
  const [heading, setHeading] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const data = await getHeading();
      setHeading(data);
    };
    fetchData();
  }, []);

  return heading;
}

export function useBrandImages() {
  const [brandImages, setBrandImages] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const data = await getBrandImages();
      setBrandImages(data);
    };
    fetchData();
  }, []);

  return brandImages;
}
