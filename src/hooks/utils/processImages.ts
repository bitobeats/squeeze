import type { CompSettings } from "../../types/CompSettings";
import type { WorkerCallMessage, WorkerCallPost } from "../../image-processor/worker-image-processor";

import EncodeWorker from "../../image-processor/worker-image-processor?worker";
import { loadImage } from "./loadImage";

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
    quality: settings.quality ?? 75,
  };

  for (const file of images) {
    const { imageBuffer, imageWidth, imageHeight } = await loadImage(file, ctx, settings.transparentBackgroundColor);

    const finalFilename = getFinalFilename(file, settings.prefix, settings.sufix);

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

    const workerCallMessage: WorkerCallMessage = {
      imageBuffer,
      opts: options,
      oldWidth: imageWidth,
      oldHeight: imageHeight,
      settWidth: settings.width,
      settHeight: settings.height,
      finalFilename,
    };

    encodeWorker.postMessage(workerCallMessage, [imageBuffer]);

    await encodeWorkerPromise;
  }

  encodeWorker.terminate();

  return processedImages;
}

function getFinalFilename(file: File, prefix?: string, sufix?: string) {
  let finalFilename = file.name.substring(0, file.name.lastIndexOf("."));

  if (prefix) {
    finalFilename = prefix + finalFilename;
  }

  if (sufix) {
    finalFilename = finalFilename + sufix;
  }

  return finalFilename;
}
