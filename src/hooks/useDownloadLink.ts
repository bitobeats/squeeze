import { useState, startTransition } from "react";
import { downloadZip } from "client-zip";

/**
 * A hook use to generate a download link.
 * @returns A download link. May be a single image file or a zip file.
 */
export function useDownloadLink(): [
  HTMLAnchorElement | null,
  (processedImages: File[]) => Promise<HTMLAnchorElement>,
  () => void
] {
  const [downloadLink, setDownloadLink] = useState<HTMLAnchorElement | null>(null);

  /**
   * Gets the download link.
   * @param processedImages Images or Image that will be in the download link.
   * @returns The download link. May be a single image file or a zip.
   */
  const getDownloadLink = async (processedImages: File[]) => {
    let blob: Blob;
    const link = document.createElement("a");
    if (processedImages.length === 1) {
      blob = processedImages[0];
      link.download = processedImages[0].name;
    } else {
      blob = await downloadZip(processedImages).blob();
      link.download = "Compressed.zip";
    }
    link.href = URL.createObjectURL(blob);

    startTransition(() => {
      setDownloadLink(link);
    });

    return link;
  };

  /**
   * Delete the download link.
   */
  const delDownloadLink = () => {
    if (downloadLink) {
      URL.revokeObjectURL(downloadLink.href);
      downloadLink.remove();
      startTransition(() => {
        setDownloadLink(null);
      });
    }
  };

  return [downloadLink, getDownloadLink, delDownloadLink];
}
