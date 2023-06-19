import React, {forwardRef, useEffect, useState} from 'react';
import {
    Alert,
    Box,
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Slide,
    Snackbar
} from "@mui/material";
import {DragDropContext, Draggable, Droppable} from "react-beautiful-dnd";
import GlassyCard from "../components/glassycard";
import Dropzone from "../components/dropzone";
import MergeIcon from '@mui/icons-material/Merge';
import RefreshIcon from '@mui/icons-material/Refresh';
import DownloadIcon from '@mui/icons-material/Download';
import Item from "../components/item";
import PdfViewer from "../components/pdfviewer";
import axios from "axios";
import './style.css';
import {green} from "@mui/material/colors";
import {configFormat} from "../config";


const Transition = forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props}/>;
});



export default function Main(blob) {

    const [errorDialog, setErrorDialog] = useState(false);
    const [errorStatus, setErrorStatus] = useState(null);
    const [openDocument, setOpenDocument] = useState(null);
    const [pdfFiles, setPdfFiles] = useState([]);
    const [open, setOpen] = useState(false);
    const [errorAlert, setErrorAlert] = useState(false);
    const [errorMsg, setErrorMsg] = useState(null);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [downloaded, setDownloaded] = useState(false);
    const [tag, setTag] = useState(null);

    const buttonSx = {
        ...(success && {
            bgcolor: green[500],
            '&:hover': {
                bgcolor: green[700],
            },
        }),
    };

    const config = {...configFormat};

    useEffect(() => {
        generateTag();
    }, []);


    const handleClickOpenErrorDialog = () => {
        setErrorDialog(true);
    };

    const handleCloseErrorDialog = () => {
        setErrorDialog(false);
    };

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleSnackbarClose = () => {
        setErrorAlert(false);
    };

    const showAlert = (msg) => {
        setErrorMsg(msg);
        setErrorAlert(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handleDragEnd = (param) => {
        const srcI = param.source?.index;
        const destI = param.destination?.index;

        // Check if the drag and drop event has valid source and destination indices
        if (srcI !== undefined && destI !== undefined) {
            // Create a copy of the pdfFiles array
            const updatedPdfFiles = [...pdfFiles];
            // Remove the item from the source index
            const [removedItem] = updatedPdfFiles.splice(srcI, 1);
            // Insert the removed item at the destination index
            updatedPdfFiles.splice(destI, 0, removedItem);
            // Update the state with the new array order
            setPdfFiles(updatedPdfFiles);
        }
    };

    const generateTag = () => {
        const length = 30; // desired length of the tag
        const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let newTag = '';

        for (let i = 0; i < length; i++) {
            const randomIndex = Math.floor(Math.random() * charset.length);
            newTag += charset[randomIndex];
        }
        console.log(newTag);
        setTag(newTag);
    };


    const handleFileUpload = (pdfFile) => {

        const maxSize = 5 * 1024 * 1024; // 5 MB in bytes
        if (pdfFile.size > maxSize) {
            showAlert("File size exceeds the limit of 5MB");
            return;
        }

        const fileReader = new FileReader();

        fileReader.onload = () => {
            const dataUrl = fileReader.result;

            setPdfFiles((prevPdfFiles) => {
                if (prevPdfFiles.length >= 5) {
                    showAlert("You can't select more than 5 files");
                    return [...prevPdfFiles];
                } else if (prevPdfFiles.some((file) => file.document === dataUrl)) {
                    showAlert("The file is already selected");
                    return [...prevPdfFiles];
                } else
                    return [
                        ...prevPdfFiles,
                        {
                            name: pdfFile.name,
                            type: pdfFile.type,
                            document: dataUrl,
                            file: pdfFile
                        },
                    ];
            });
        };
        fileReader.readAsDataURL(pdfFile);
    };


    const handleFileDelete = (index) => {
        setPdfFiles((prevPdfFiles) => prevPdfFiles.filter((_, i) => i !== index));
    };

    const handleDocumentPreview = (index) => {
        setOpenDocument(pdfFiles[index]);
        handleClickOpen();
    };


    const uploadFiles = async () => {
        for (const pdfFile of pdfFiles) {
            const index = pdfFiles.indexOf(pdfFile);
            config.url = `https://pynikv8l73.execute-api.eu-west-1.amazonaws.com/dev/merge-wizard-pdf-preprocess-files/${tag}${index}.${pdfFile.type.split("/")[1]}`;
            config.headers["Content-Type"] = `${pdfFile.type}`;
            config.data = pdfFile.file;
            try {
               await axios.request(config);
            } catch (error) {
                setErrorMsg(error.message);
                setErrorStatus(error.code);
                setSuccess(false);
                setLoading(false);
                handleClickOpenErrorDialog();
            }
        }
    }

    const handleButtonClick = async () => {

        if (downloaded) {
            setDownloaded(false);
            setPdfFiles([]);
        } else if (success && !downloaded) {
            setDownloaded(true);
            setSuccess(false);
            try {
                const response = await axios(`https://pynikv8l73.execute-api.eu-west-1.amazonaws.com/dev/merged-pdf?tag=${tag}`, {headers: {
                        'X-Api-Key': process.env.REACT_APP_SECRET_KEY
                    }});
                const data = response?.data?.body;
                const presignURL = JSON.parse(data).presigned_url;
                const link = document.createElement('a');
                link.href = presignURL;
                link.target = "_blank";
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);

            } catch (error) {
                setErrorMsg(error.message);
                setErrorStatus(error.code);
                setSuccess(false);
                setLoading(false);
                handleClickOpenErrorDialog();
            }
            generateTag();
        } else if (!loading) {
            setSuccess(false);
            setLoading(true);

            if(pdfFiles.length < 2) {
                setTimeout(() => {
                    showAlert("You need to select 2 files or more.");
                    setSuccess(false);
                    setLoading(false);
                }, 400);
                return;
            }
            config.headers.tag = `session_tag=${tag}`;
            await uploadFiles();

            config.url = `https://pynikv8l73.execute-api.eu-west-1.amazonaws.com/dev/merge-wizard-pdf-preprocess-files/${tag}.csv`;
            config.headers["Content-Type"] = 'text/csv';
            const csvContent = `session_tag\n${tag}`;
            const csvBlob = new Blob([csvContent]);
            config.data = new File([csvBlob], `${tag}.csv`, {type: "text/csv"});
            try {
                await axios.request(config);
                setSuccess(true);
                setLoading(false);
            } catch (error) {
                setErrorMsg(error.message);
                setErrorStatus(error.code);
                setSuccess(false);
                setLoading(false);
                handleClickOpenErrorDialog();
            }

        }


    };


    return(
        <Box className={'main'}>
            <GlassyCard>
                <Box className={'container'}>
                    <Dropzone handler={handleFileUpload}/>
                    <DragDropContext onDragEnd={handleDragEnd}>
                        <Droppable droppableId="droppable-files" sx={{ width: "100%" }}>
                            {(provided, _) => (
                                <Box ref={provided.innerRef} {...provided.droppableProps}>
                                    {pdfFiles.map((pdfFile, index) => (
                                        <Draggable
                                            key={index}
                                            draggableId={`item-${index}`}
                                            index={index}
                                        >
                                            {(provided, _) => (
                                                <Box ref={provided.innerRef} {...provided.draggableProps}>
                                                    <Item
                                                        file={pdfFile}
                                                        index={index}
                                                        deleteHandler={handleFileDelete}
                                                        openFileHandler={handleDocumentPreview}
                                                        dragHandleProps={provided.dragHandleProps}
                                                    />
                                                </Box>
                                            )}
                                        </Draggable>
                                    ))}
                                    {provided.placeholder}
                                </Box>
                            )}
                        </Droppable>
                    </DragDropContext>
                </Box>
                <Box sx={{ m: 1, position: 'relative' }}>
                    <Button
                        variant="contained"
                        sx={buttonSx}
                        disabled={loading}
                        onClick={handleButtonClick}
                        startIcon={ success ? <DownloadIcon/> : downloaded ? <RefreshIcon/> : <MergeIcon/>}
                    >
                        {success ? "Download" : downloaded ? "Refresh" : "Merge"}
                    </Button>
                    {loading && (
                        <CircularProgress
                            size={24}
                            sx={{
                                color: green[500],
                                position: 'absolute',
                                top: '50%',
                                left: '50%',
                                marginTop: '-12px',
                                marginLeft: '-12px',
                            }}
                        />
                    )}
                </Box>
            </GlassyCard>
            <Dialog
                open={open}
                TransitionComponent={Transition}
                keepMounted
                onClose={handleClose}
                aria-describedby="alert-dialog-slide-description"
                fullScreen
            >
                <DialogContent sx={{ padding: 0, height: "95vh", position: "relative"}}>
                    { openDocument ?
                        <PdfViewer document={openDocument.document}/>
                        :
                        <></>
                    }
                </DialogContent>
                <DialogActions sx={{ height: "5vh"}}>
                    <Button onClick={handleClose}>Close</Button>
                </DialogActions>
            </Dialog>
            <Dialog
                open={errorDialog}
                onClose={handleCloseErrorDialog}
                aria-labelledby="draggable-dialog-title"
            >
                <DialogTitle style={{ cursor: 'move' , color: 'red'}} id="draggable-dialog-title">
                    {errorStatus}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        {errorMsg}
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseErrorDialog}>Close</Button>
                </DialogActions>
            </Dialog>
            <Snackbar open={errorAlert} autoHideDuration={6000} onClose={handleSnackbarClose}>
                <Alert severity="error" variant="filled" onClose={handleSnackbarClose} sx={{ width: '100%' }}>
                    {errorMsg}
                </Alert>
            </Snackbar>
        </Box>
    );
}