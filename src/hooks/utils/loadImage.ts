import type { TransparentBackgroundColor } from "../../types/TransparentBackgroundColor";

/**
 * Loads an image with the Canvas element and returns its ArrayBuffer together
 * with it's width and height.
 * @param file The file to be load.
 * @param imgEl A HTMLImageElement to be used.
 * @param canvas A HTMLCanvasElement to be used.
 * @param fr A FileReader to use.
 * @param transparentBackgroundColor How to deal with images that have
 * transparent background.
 * @returns An object containing the image's ArrayBuffer, width and height.
 */
export async function loadImage(
  file: File,
  imgEl: HTMLImageElement,
  canvas: HTMLCanvasElement,
  fr: FileReader,
  transparentBackgroundColor: TransparentBackgroundColor
) {
  // Load image

  const src = await new Promise<string>((res) => {
    fr.onload = () => {
      res(fr.result as string);
    };

    fr.readAsDataURL(file);
  });

  imgEl.src = src;

  await new Promise((res) => (imgEl.onload = res));

  const imgWidth = Math.floor(imgEl.width);
  const imgHeight = Math.floor(imgEl.height);

  // Make canvas same size as image

  [canvas.width, canvas.height] = [imgWidth, imgHeight];
  // Draw image onto canvas
  const ctx = canvas.getContext("2d");
  ctx!.fillStyle = transparentBackgroundColor;
  ctx!.fillRect(0, 0, imgWidth, imgHeight);
  ctx!.drawImage(imgEl, 0, 0, imgWidth, imgHeight);
  const imageBuffer = ctx!.getImageData(0, 0, imgWidth, imgHeight).data.buffer;
  ctx!.clearRect(0, 0, 0, 0);

  return {
    image: imageBuffer,
    imageWidth: imgWidth,
    imageHeight: imgHeight,
  };
}
