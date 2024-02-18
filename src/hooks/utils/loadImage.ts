import type { TransparentBackgroundColor } from "../../types/TransparentBackgroundColor";

export async function loadImage(
  file: File,
  ctx: CanvasRenderingContext2D,
  transparentBackgroundColor: TransparentBackgroundColor
) {
  const imageBitmap = await createImageBitmap(file);

  const imageWidth = Math.floor(imageBitmap.width);
  const imageHeight = Math.floor(imageBitmap.height);

  [ctx.canvas.width, ctx.canvas.height] = [imageWidth, imageHeight];

  ctx.fillStyle = transparentBackgroundColor;
  ctx.fillRect(0, 0, imageWidth, imageHeight);
  ctx.drawImage(imageBitmap, 0, 0, imageWidth, imageHeight);
  const imageBuffer = ctx.getImageData(0, 0, imageWidth, imageHeight).data.buffer;
  ctx.clearRect(0, 0, imageWidth, imageHeight);

  imageBitmap.close();

  return {
    imageBuffer,
    imageWidth,
    imageHeight,
  };
}
