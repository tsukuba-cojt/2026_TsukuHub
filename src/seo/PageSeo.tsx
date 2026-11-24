import { useLayoutEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { defaultDescription, defaultTitle, type PageMetadata } from "./metadata";

function setMetadata(title: string, description: string, type = "website", path?: string) {
  document.title = title;
  for (const [selector, value] of [
    ['meta[name="description"]', description], ['meta[property="og:description"]', description],
    ['meta[name="twitter:description"]', description], ['meta[property="og:title"]', title],
    ['meta[name="twitter:title"]', title], ['meta[property="og:type"]', type],
  ]) document.head.querySelector<HTMLMetaElement>(selector)?.setAttribute("content", value);

  const url = path ? new URL(path, window.location.origin).href : "";
  for (const [tag, key, value, attribute] of [
    ["link", "rel", "canonical", "href"], ["meta", "property", "og:url", "content"],
  ]) {
    const element = document.head.querySelector(`${tag}[${key}="${value}"]`);
    if (!url) { element?.remove(); continue; }
    const node = element ?? document.createElement(tag);
    node.setAttribute(key, value);
    node.setAttribute(attribute, url);
    if (!element) document.head.appendChild(node);
  }
}

// A document can enter on a server-rendered page and then move to an unrelated SPA route.
export function SeoNavigation() {
  const { pathname, search } = useLocation();
  const key = pathname + search;
  const previous = useRef(key);
  useLayoutEffect(() => {
    if (key !== previous.current) setMetadata(defaultTitle, defaultDescription);
    previous.current = key;
  }, [key]);
  return null;
}

export function PageSeo({ title, description, path, type }: PageMetadata) {
  const { pathname, search } = useLocation();
  useLayoutEffect(() => {
    setMetadata(title, description, type, path);
    return () => setMetadata(defaultTitle, defaultDescription);
  }, [title, description, type, path, pathname, search]);
  return null;
}
