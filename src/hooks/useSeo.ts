import { useEffect } from "react";

const SITE_URL = "https://money.nady4.com";

type SeoOptions = {
  title: string;
  description?: string;
  path?: string;
};

export function useSeo({ title, description, path }: SeoOptions) {
  useEffect(() => {
    document.title = title;

    if (description) {
      let meta = document.querySelector('meta[name="description"]');
      if (!meta) {
        meta = document.createElement("meta");
        meta.setAttribute("name", "description");
        document.head.appendChild(meta);
      }
      meta.setAttribute("content", description);
    }

    const canonicalUrl = `${SITE_URL}${path ?? ""}`;
    let link = document.querySelector('link[rel="canonical"]');
    if (!link) {
      link = document.createElement("link");
      link.setAttribute("rel", "canonical");
      document.head.appendChild(link);
    }
    link.setAttribute("href", canonicalUrl);
  }, [title, description, path]);
}
