import type { CompSettings } from "../../types/CompSettings";
import type { WorkerCallMessage, WorkerCallPost } from "../../image-processor/worker-image-processor";

import EncodeWorker from "../../image-processor/worker-image-processor?worker";
import { loadImage } from "./loadImage";

/**
 *
 * @param images Images to be processed.
 * @param settings Settings to be used.
 * @param setCompletedTask A React state setter to comunicate with outside
 * code about the state of the process. Definitely not the brightest of the code.
 * @returns A promise containing an array of the processed images.
 */
export async function processImages(
  images: File[],
  settings: CompSettings,
  setCompletedTask: React.Dispatch<React.SetStateAction<number>>
) {
  const processedImages: File[] = [];

  const encodeWorker = new EncodeWorker();
  const canvas = new OffscreenCanvas(0, 0);
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("Couldn't get canvas context");
  }

  let innerTaskCounter = 0;

  const options = {
    quality: settings.quality ? settings.quality : 75,
  };

  for (const file of images) {
    const { imageBuffer, imageWidth, imageHeight } = await loadImage(file, ctx, settings.transparentBackgroundColor);

    // Handles prefix and sufix
    let finalFilename = file.name.substring(0, file.name.lastIndexOf("."));

    if (settings.prefix) {
      finalFilename = settings.prefix + finalFilename;
    }

    if (settings.sufix) {
      finalFilename = finalFilename + settings.sufix;
    }

    const encodeWorkerPromise = new Promise((res) => {
      encodeWorker.onmessage = (message: MessageEvent<WorkerCallPost>) => {
        processedImages.push(
          new File([message.data.imageBuffer], message.data.finalFilename + ".jpeg", { type: "image/jpeg" })
        );

        innerTaskCounter++;
        setCompletedTask(innerTaskCounter);

        res(null);
      };
    });

    encodeWorker.postMessage(
      {
        imageBuffer,
        opts: options,
        oldWidth: imageWidth,
        oldHeight: imageHeight,
        settWidth: settings.width,
        settHeight: settings.height,
        finalFilename: finalFilename,
      } as WorkerCallMessage,
      [imageBuffer]
    );

    await encodeWorkerPromise;
  }

  encodeWorker.terminate();

  return processedImages;
}
