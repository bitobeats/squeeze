import type { CompSettings } from "../logic/settings-manager";

import { useState, startTransition } from "react";
import { processImages } from "./utils/processImages";

/**
 * A hook used to process images.
 * @returns A Promise containing an array of compressed images as Files.
 */
export function useProcessedImages(): [
  (images: File[], settings: CompSettings) => Promise<File[]>,
  File[] | null,
  number,
  () => void,
  number
] {
  const [processedImages, setProcessedImages] = useState<File[] | null>(null);
  const [completedTask, setCompletedTask] = useState(0);
  const [totalTasks, setTotalTasks] = useState(0);

  /**
   *
   * @param images Images to be processed.
   * @param settings Settings to be used by the image processor.
   * @returns A Promise containing an array with the processed images.
   */
  const getProcessedImages = async (images: File[], settings: CompSettings) => {
    startTransition(() => {
      setCompletedTask(0);
      setTotalTasks(images.length);
    });

    const results = await processImages(images, settings, setCompletedTask);

    startTransition(() => {
      setProcessedImages(results);
    });

    return results;
  };

  /**
   * Delete the processed images.
   */
  const delProcessedImages = () => {
    startTransition(() => {
      setProcessedImages(null);
    });
  };

  return [getProcessedImages, processedImages, completedTask, delProcessedImages, totalTasks];
}
