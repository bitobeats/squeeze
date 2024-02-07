import type { CompSettings } from "../../logic/settings-manager";
import type { WorkerCallMessage, WorkerCallPost } from "../../logic/worker-image-processor";

import EncodeWorker from "../../logic/worker-image-processor?worker";
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
  const processedImages = [] as File[];

  const encodeWorker = new EncodeWorker();
  const canvas = document.createElement("canvas");
  const imgEl = new Image();
  const fr = new FileReader();

  let innerTaskCounter = 0;

  const options = {
    quality: settings.quality ? settings.quality : 75,
  };

  for (const file of images) {
    const { image, imageWidth, imageHeight } = await loadImage(
      file,
      imgEl,
      canvas,
      fr,
      settings.transparentBackgroundColor
    );

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
        imageBuffer: image,
        opts: options,
        oldWidth: imageWidth,
        oldHeight: imageHeight,
        settWidth: settings.width,
        settHeight: settings.height,
        finalFilename: finalFilename,
      } as WorkerCallMessage,
      [image]
    );

    await encodeWorkerPromise;
  }

  canvas.remove();
  imgEl.remove();
  encodeWorker.terminate();

  return processedImages;
}
