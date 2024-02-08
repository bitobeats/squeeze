import type { TransparentBackgroundColor } from "./TransparentBackgroundColor";

/**
 * Image Compressor's settings.
 */
export type CompSettings = {
  quality: number;
  width: number;
  height: number;
  prefix: string;
  sufix: string;
  transparentBackgroundColor: TransparentBackgroundColor;
  keepSettings: boolean;
};
