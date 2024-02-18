/// <reference lib="webworker" />
import type { MozJPEGModule } from "../libs/squoosh/codecs/mozjpeg/enc/mozjpeg_enc";
import type { TransparentBackgroundColor } from "../types/TransparentBackgroundColor";

import mozEnc, { EncodeOptions } from "../libs/squoosh/codecs/mozjpeg/enc/mozjpeg_enc";

/**
 * An interface representing the mozEnc.encode() options.
 */
type EncodeJpegOpts = {
  quality: number;
  baseline?: boolean;
  arithmetic?: boolean;
  progressive?: boolean;
  optimize_coding?: boolean;
  smoothing?: number;
  color_space?: number;
  quant_table?: number;
  trellis_multipass?: boolean;
  trellis_opt_zero?: boolean;
  trellis_opt_table?: boolean;
  trellis_loops?: number;
  auto_subsample?: boolean;
  chroma_subsample?: number;
  separate_chroma_quality?: boolean;
  chroma_quality?: number;
};

/**
 * An interface representing the message that the web worker receives.
 */
export type WorkerCallMessage = {
  imageBitmap: ImageBitmap;
  opts: EncodeJpegOpts;
  oldWidth: number;
  oldHeight: number;
  settWidth: number;
  settHeight: number;
  finalFilename: string;
  transparentBackgroundColor: TransparentBackgroundColor;
};

/**
 * An interface representing the message that the web worker returns.
 */
export type WorkerCallPost = {
  imageBuffer: ArrayBuffer;
  width: number;
  height: number;
  finalFilename: string;
};

let module: MozJPEGModule;
let isLoaded = false;

const canvas = new OffscreenCanvas(0, 0);
const ctx = canvas.getContext("2d", { antialias: true, premultipliedAlpha: true });

onmessage = async (message: MessageEvent<WorkerCallMessage>) => {
  const data = message.data;
  const { newWidth: finalWidth, newHeight: finalHeight } = getResizingDimensions(
    data.oldWidth,
    data.oldHeight,
    data.settWidth,
    data.settHeight
  );
  const finalFileName = data.finalFilename;

  if (!ctx) {
    throw new Error("Couldn't load offscreen canvas");
  }

  [ctx.canvas.width, ctx.canvas.height] = [finalWidth, finalHeight];

  ctx.fillStyle = message.data.transparentBackgroundColor;
  ctx.fillRect(0, 0, finalWidth, finalHeight);
  ctx.drawImage(data.imageBitmap, 0, 0, finalWidth, finalHeight);
  const imageBuffer = ctx.getImageData(0, 0, finalWidth, finalHeight).data.buffer;
  ctx.clearRect(0, 0, finalWidth, finalHeight);

  const imageToProcess = new Uint8ClampedArray(imageBuffer);

  if (!isLoaded) {
    module = await mozEnc();
    isLoaded = true;
  }

  const result = await encodeJpeg(imageToProcess, finalWidth, finalHeight, data.opts);
  const resultBuffer = result.buffer;

  const response: WorkerCallPost = {
    imageBuffer: resultBuffer,
    width: finalWidth,
    height: finalHeight,
    finalFilename: finalFileName,
  };

  postMessage(response, [response.imageBuffer]);
};

export const encodeJpeg = async (image: Uint8ClampedArray, width: number, height: number, opts: EncodeJpegOpts) => {
  const defaultOpts: EncodeJpegOpts = {
    quality: 75,
    baseline: false,
    arithmetic: false,
    progressive: true,
    optimize_coding: true,
    smoothing: 0,
    color_space: 3 /*YCbCr*/,
    quant_table: 3,
    trellis_multipass: false,
    trellis_opt_zero: false,
    trellis_opt_table: false,
    trellis_loops: 1,
    auto_subsample: true,
    chroma_subsample: 2,
    separate_chroma_quality: false,
    chroma_quality: 75,
  };

  opts = opts ? Object.assign(defaultOpts, opts) : defaultOpts;

  const result = module.encode(image, width, height, opts as EncodeOptions);
  return result;
};

function getResizingDimensions(
  originalWidth: number,
  originalHeight: number,
  maxWidth: number = 0,
  maxHeight: number = 0
) {
  let [newWidth, newHeight] = [maxWidth, maxHeight];

  if (maxWidth === 0) {
    newWidth = Math.round(originalWidth * (maxHeight / originalHeight));
  } else if (maxHeight === 0) {
    newHeight = Math.round(originalHeight * (maxWidth / originalWidth));
  } else {
    if (originalWidth > originalHeight) {
      newHeight = Math.round(originalHeight * (newWidth / originalWidth));
    } else if (originalHeight > originalWidth) {
      newWidth = Math.round(originalWidth * (newHeight / originalHeight));
    } else if (originalWidth === originalHeight) {
      if (maxWidth > maxHeight) {
        newWidth = maxHeight;
      } else if (maxHeight > maxWidth) {
        newHeight = maxWidth;
      }
    }
  }

  if (newWidth > maxWidth && maxWidth !== 0) {
    newWidth = maxWidth;
    newHeight = Math.round(originalHeight * (newWidth / originalWidth));
  }

  if (newHeight > maxHeight && maxHeight !== 0) {
    newHeight = maxHeight;
    newWidth = Math.round(originalWidth * (newHeight / originalHeight));
  }

  return { newWidth: newWidth, newHeight: newHeight };
}
