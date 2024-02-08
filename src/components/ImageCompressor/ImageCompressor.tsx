import type { CompSettings } from "../../types/CompSettings";

import { useState, useCallback, lazy, Suspense } from "react";
import { Container, Typography, CircularProgress } from "@mui/material";

import CompActions from "./CompActions";
import DownloadSnackbar from "./DownloadSnackbar";
import { useDeliverableImages } from "../../hooks/useDeliverableImages";

const Dropzone = lazy(() => import("./Dropzone"));
const StatusIndicator = lazy(() => import("./StatusIndicator"));
const filesLimit = 32;

function ImageCompressor() {
  // General

  // Files
  const [importedFiles, setImportedFiles] = useState<Array<File> | null>(null);
  const {
    deliverImages,
    getDeliverableImages,
    delDeliverable,
    currentTask,
    isProcessing,
    downloadReady,
    totalTasks,
    elapsedTime,
  } = useDeliverableImages();

  // Memos
  const memoGetDeliverableImages = useCallback(
    (images: File[], settings: CompSettings) => {
      getDeliverableImages(images, settings);
    },
    [importedFiles]
  );

  return (
    <Container maxWidth={"md"}>
      <Dropzone loadedFiles={importedFiles} setLoadedFiles={setImportedFiles} filesLimit={filesLimit} />
      <Typography color={"white"} variant="body2">
        {" "}
        Files: {importedFiles ? importedFiles.length : 0}/{filesLimit}
      </Typography>
      <Suspense fallback={<CircularProgress />}>
        <CompActions getDeliverableImages={memoGetDeliverableImages} importedFiles={importedFiles} />
      </Suspense>
      <Suspense fallback={<CircularProgress />}>
        <StatusIndicator
          isOpen={isProcessing}
          currentTask={currentTask}
          totalTasks={totalTasks}
          elapsedTime={elapsedTime}
        />
      </Suspense>

      <DownloadSnackbar isOpen={downloadReady} handleDownload={deliverImages} handleClose={delDeliverable} />
    </Container>
  );
}

export default ImageCompressor;
