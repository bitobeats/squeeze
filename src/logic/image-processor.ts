import type { CompSettings, TransparentBackgroundColor } from "./settings-manager";
import type { WorkerCallMessage, WorkerCallPost } from "./worker-image-processor";
import { useState, startTransition, useCallback } from "react";
import { downloadZip } from "client-zip";
import EncodeWorker from "./worker-image-processor?worker";

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

/**
 * A hook used to process images.
 * @returns A Promise containing an array of compressed images as Files.
 */
export function useProcessedImages(): [
    (images: File[], settings: CompSettings) => Promise<File[]>,
    File[] | null,
    number,
    () => void,
    number
] {
    const [processedImages, setProcessedImages] = useState<File[] | null>(null);
    const [completedTask, setCompletedTask] = useState(0);
    const [totalTasks, setTotalTasks] = useState(0);

    /**
     *
     * @param images Images to be processed.
     * @param settings Settings to be used by the image processor.
     * @returns A Promise containing an array with the processed images.
     */
    const getProcessedImages = async (images: File[], settings: CompSettings) => {
        startTransition(() => {
            setCompletedTask(0);
            setTotalTasks(images.length);
        });

        const results = await processImages(images, settings, setCompletedTask);

        startTransition(() => {
            setProcessedImages(results);
        });

        return results;
    };

    /**
     * Delete the processed images.
     */
    const delProcessedImages = () => {
        startTransition(() => {
            setProcessedImages(null);
        });
    };

    return [getProcessedImages, processedImages, completedTask, delProcessedImages, totalTasks];
}

/**
 * A hook use to generate a download link.
 * @returns A download link. May be a single image file or a zip file.
 */
export function useDownloadLink(): [
    HTMLAnchorElement | null,
    (processedImages: File[]) => Promise<HTMLAnchorElement>,
    () => void
] {
    const [downloadLink, setDownloadLink] = useState<HTMLAnchorElement | null>(null);

    /**
     * Gets the download link.
     * @param processedImages Images or Image that will be in the download link.
     * @returns The download link. May be a single image file or a zip.
     */
    const getDownloadLink = async (processedImages: File[]) => {
        let blob: Blob;
        const link = document.createElement("a");
        if (processedImages.length === 1) {
            blob = processedImages[0];
            link.download = processedImages[0].name;
        } else {
            blob = await downloadZip(processedImages).blob();
            link.download = "Compressed.zip";
        }
        link.href = URL.createObjectURL(blob);

        startTransition(() => {
            setDownloadLink(link);
        });

        return link;
    };

    /**
     * Delete the download link.
     */
    const delDownloadLink = () => {
        if (downloadLink) {
            URL.revokeObjectURL(downloadLink.href);
            downloadLink.remove();
            startTransition(() => {
                setDownloadLink(null);
            });
        }
    };

    return [downloadLink, getDownloadLink, delDownloadLink];
}

/**
 *
 * @param images Images to be processed.
 * @param settings Settings to be used.
 * @param setCompletedTask A React state setter to comunicate with outside
 * code about the state of the process. Definitely not the brightest of the code.
 * @returns A promise containing an array of the processed images.
 */
async function processImages(
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
        console.log("Started processing image");
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

        await new Promise((res) => {
            encodeWorker.onmessage = (message: MessageEvent<WorkerCallPost>) => {
                processedImages.push(
                    new File([message.data.imageBuffer], message.data.finalFilename + ".jpeg", { type: "image/jpeg" })
                );

                innerTaskCounter++;
                setCompletedTask(innerTaskCounter);

                res(null);
            };
        });

        console.log("Finished processing image");
    }

    canvas.remove();
    imgEl.remove();
    encodeWorker.terminate();

    return processedImages;
}

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
const loadImage = async (
    file: File,
    imgEl: HTMLImageElement,
    canvas: HTMLCanvasElement,
    fr: FileReader,
    transparentBackgroundColor: TransparentBackgroundColor
) => {
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
};
