import type { CompSettings } from "../../types/CompSettings";
import type { WorkerCallMessage, WorkerCallPost } from "../../image-processor/worker-image-processor";

import EncodeWorker from "../../image-processor/worker-image-processor?worker";

export async function processImages(
  images: File[],
  settings: CompSettings,
  setCompletedTask: React.Dispatch<React.SetStateAction<number>>
) {
  const processedImages: File[] = [];

  const encodeWorker = new EncodeWorker();

  let innerTaskCounter = 0;

  const options = {
    quality: settings.quality ?? 75,
  };

  for (const file of images) {
    const imageBitmap = await createImageBitmap(file);

    const finalFilename = getFinalFilename(file, settings.prefix, settings.sufix);

    const encodeWorkerPromise = new Promise<File>((res) => {
      encodeWorker.onmessage = (message: MessageEvent<WorkerCallPost>) => {
        innerTaskCounter++;
        setCompletedTask(innerTaskCounter);

        res(new File([message.data.imageBuffer], message.data.finalFilename + ".jpeg", { type: "image/jpeg" }));
      };
    });

    const workerCallMessage: WorkerCallMessage = {
      imageBitmap,
      opts: options,
      oldWidth: imageBitmap.width,
      oldHeight: imageBitmap.height,
      settWidth: settings.width,
      settHeight: settings.height,
      finalFilename,
      transparentBackgroundColor: settings.transparentBackgroundColor,
    };

    encodeWorker.postMessage(workerCallMessage, [imageBitmap]);

    processedImages.push(await encodeWorkerPromise);
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
