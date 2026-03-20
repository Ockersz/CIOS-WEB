import { useEffect } from "react";
import { applySeoTags } from "../lib/seo";

export function Seo(props: Parameters<typeof applySeoTags>[0]) {
  const structuredDataKey = JSON.stringify(props.structuredData || null);

  useEffect(() => {
    applySeoTags(props);
  }, [
    props.title,
    props.description,
    props.path,
    props.image,
    props.type,
    props.noIndex,
    structuredDataKey,
  ]);

  return null;
}
