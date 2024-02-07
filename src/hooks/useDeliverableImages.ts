import type { CompSettings } from "../logic/settings-manager";

import { useState, startTransition, useCallback } from "react";

import { useDownloadLink } from "./useDownloadLink";
import { useProcessedImages } from "./useProcessedImages";

/**
 * A hook used to process and deliver images.
 */
export function useDeliverableImages() {
  const [getProcessedImages, processedImages, currentTask, delProcessedImages, totalTasks] = useProcessedImages();
  const [downloadLink, getDownloadLink, delDownloadLink] = useDownloadLink();
  const [isProcessing, setIsProcessing] = useState(false);
  const [downloadReady, setDownloadReady] = useState(false);
  const [elapsedTime, setElapsedTime] = useState("00:00");

  /**
   * Processes the passed images and, if app isn't opened as a PWA, tries to download the processed files to the user's system.
   * Also, creates a timer.
   * @param images Images to be compressed.
   * @param settings Settings to be used by the compressor.
   * @returns An empty Promise.
   */
  const getDeliverableImages = async (images: File[], settings: CompSettings) => {
    const startTime = new Date();

    if (images.length === 0) {
      alert("You have to select some images to compress first!");
      return;
    }

    const elapsedTimeTimer = setInterval(() => {
      startTransition(() => {
        const elapsedTimeMili = new Date().getTime() - startTime.getTime();
        let elapsedTimeSecs: string | number = Math.floor(elapsedTimeMili / 1000);
        let elapsedTimeMins: string | number = Math.floor(elapsedTimeSecs / 60);

        elapsedTimeSecs = elapsedTimeSecs % 60;
        elapsedTimeMins = elapsedTimeMins % 60;
        if (elapsedTimeSecs < 10) {
          elapsedTimeSecs = "0" + elapsedTimeSecs.toString();
        }
        if (elapsedTimeMins < 10) {
          elapsedTimeMins = "0" + elapsedTimeMins.toString();
        }
        setElapsedTime(`${elapsedTimeMins}:${elapsedTimeSecs}`);
      });
    }, 1000);

    if (processedImages) {
      startTransition(() => {
        delDeliverable();
        setDownloadReady(false);
      });
    }

    startTransition(() => {
      setIsProcessing(true);
    });

    const results = await getProcessedImages(images, settings);
    const resultsLink = await getDownloadLink(results);

    startTransition(() => {
      setIsProcessing(false);
      setDownloadReady(true);
      clearInterval(elapsedTimeTimer);
    });

    if ("standalone" in window.navigator === true) {
      return;
    } else {
      resultsLink.click();
    }
  };

  /**
   * Deliver images that are alerady processed.
   */
  const deliverImages = useCallback(() => {
    if ("standalone" in window.navigator === true) {
      try {
        navigator.share({ files: processedImages! });
      } catch {
        downloadLink?.click();
      }
    } else {
      downloadLink?.click();
    }
  }, [downloadReady]);

  /**
   * Delete all the generated files from the processor, as well as the download link.
   * Also, resets the timer.
   */
  const delDeliverable = useCallback(() => {
    startTransition(() => {
      delDownloadLink();
      delProcessedImages();
      setDownloadReady(false);
      setElapsedTime("00:00");
    });
  }, [downloadReady]);

  return {
    deliverImages,
    getDeliverableImages,
    delDeliverable,
    currentTask,
    isProcessing,
    downloadReady,
    totalTasks,
    elapsedTime,
  };
}
