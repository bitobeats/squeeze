/// <reference lib="webworker" />
import type { MozJPEGModule } from "../libs/squoosh/codecs/mozjpeg/enc/mozjpeg_enc";

import mozEnc, { EncodeOptions } from "../libs/squoosh/codecs/mozjpeg/enc/mozjpeg_enc";
import initResize, { resize } from "../libs/squoosh/codecs/resize/pkg/squoosh_resize";
import resizeWasm from "../libs/squoosh/codecs/resize/pkg/squoosh_resize_bg.wasm?url";

let module: MozJPEGModule;
let isLoaded = false;

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
 * An interface representing the resizeWams.resize() options.
 */
type ResizeJpegOpts = {
  method: number;
  fitMethod: string;
  premultiply: boolean;
  linearRGB: boolean;
};

/**
 * An interface representing the message that the web worker receives.
 */
export type WorkerCallMessage = {
  imageBuffer: ArrayBuffer;
  opts: EncodeJpegOpts;
  oldWidth: number;
  oldHeight: number;
  settWidth: number;
  settHeight: number;
  finalFilename: string;
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
onmessage = async (message: MessageEvent<WorkerCallMessage>) => {
  const data = message.data;
  let finalWidth = data.oldWidth;
  let finalHeight = data.oldHeight;
  const finalFileName = data.finalFilename;

  let imageToProcess = new Uint8ClampedArray(data.imageBuffer);

  if (data.settHeight !== 0 || data.settWidth !== 0) {
    const { newWidth, newHeight } = _getResizingDimensions(
      data.oldWidth,
      data.oldHeight,
      data.settWidth,
      data.settHeight
    );

    finalWidth = newWidth;
    finalHeight = newHeight;

    if (!isLoaded) {
      await initResize(resizeWasm);
    }

    const resizedImage = await resizeImage(imageToProcess, data.oldWidth, data.oldHeight, finalWidth, finalHeight);
    imageToProcess = resizedImage;
  }

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

export const resizeImage = async (
  image: Uint8ClampedArray,
  imageWidth: number,
  imageHeight: number,
  outputWidth: number,
  outputHeight: number,
  opts?: ResizeJpegOpts
): Promise<Uint8ClampedArray> => {
  const defaultOpts = {
    method: 3, // triangle = 0, catrom = 1, mitchell = 2, lanczos3 = 3
    fitMethod: "stretch",
    premultiply: true,
    linearRGB: true,
  };

  opts = opts ? Object.assign(defaultOpts, opts) : defaultOpts;

  const uintArray = resize(
    //@ts-ignore
    image,
    imageWidth,
    imageHeight,
    outputWidth,
    outputHeight,
    opts.method,
    opts.premultiply,
    opts.linearRGB
  );

  return new Uint8ClampedArray(uintArray);
  // return _Uint8ArrayToBase64(uintArray, outputWidth, outputHeight);
};

function _getResizingDimensions(
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
