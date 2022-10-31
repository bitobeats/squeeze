import { memo } from "react";
import { DropzoneArea } from "react-mui-dropzone";
import { makeStyles } from "@mui/styles";
import UploadFileIcon from "@mui/icons-material/UploadFile";

const useStyles = makeStyles({
    customDropzone: {
        minHeight: 500,
        backgroundColor: "rgba(255, 255, 255, 0.3)",
        color: "#FFF",
    },
    customIcon: {
        color: "white",
        minHeight: 80,
        minWidth: 80,
    },
    customTextContainer: {
        display: "flex",
        flexDirection: "column-reverse",
        justifyContent: "center",
        alignItems: "center",
        minHeight: 500,
    },
    hidden: {
        display: "none",
    },
});

interface LoadedFiles {
    loadedFiles: Array<File> | null;
    setLoadedFiles: React.Dispatch<React.SetStateAction<File[] | null>>;
    filesLimit: number;
}

function Dropzone({ loadedFiles, setLoadedFiles, filesLimit }: LoadedFiles) {
    const classes = useStyles();
    return (
        <DropzoneArea
            Icon={UploadFileIcon}
            dropzoneText="Drag and drop or click here to select your files."
            filesLimit={filesLimit}
            acceptedFiles={["image/*"]}
            maxFileSize={5e7}
            showFileNames={false}
            showAlerts={false}
            onChange={(files) => setLoadedFiles(files)}
            previewGridProps={{
                container: {
                    columns: 12,
                    sx: { padding: 2 },
                },
                item: {
                    xs: 4,
                    md: 3,
                    lg: 2,
                },
            }}
            classes={{
                root: classes.customDropzone,
                icon: classes.customIcon,
                textContainer: loadedFiles
                    ? loadedFiles.length > 0
                        ? classes.hidden
                        : classes.customTextContainer
                    : classes.customTextContainer,
            }}
        />
    );
}

export default memo(Dropzone);
