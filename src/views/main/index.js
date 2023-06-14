import React, {forwardRef, useState} from 'react';
import {
    Alert,
    Box,
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent, DialogContentText, DialogTitle, Paper,
    Slide,
    Snackbar
} from "@mui/material";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
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
import {payload} from "../payload";



const Transition = forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props}/>;
});



export default function Main() {

    const [errorDialog, setErrorDialog] = useState(false);
    const [errorStatus, setErrorStatus] = useState(null);
    const [openDocument, setOpenDocument] = useState(null);
    const [pdfFiles, setPdfFiles] = useState([]);
    const [open, setOpen] = useState(false);
    const [errorAlert, setErrorAlert] = useState(false);
    const [errorMsg, setErrorMsg] = useState(null);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [download, setDownload] = useState(false);
    const [mergedFile, setMergedFile] = useState(null);

    const buttonSx = {
        ...(success && {
            bgcolor: green[500],
            '&:hover': {
                bgcolor: green[700],
            },
        }),
    };

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


    const handleFileUpload = (pdfFile) => {
        const fileReader = new FileReader();

        fileReader.onload = () => {
            const dataUrl = fileReader.result;

            setPdfFiles((prevPdfFiles) => {
                if (prevPdfFiles.length >= 5) {
                    showAlert("You can't select more than 5 files");
                    return [...prevPdfFiles];
                }
                else if(prevPdfFiles.some((file) => file.document === dataUrl)) {
                    showAlert("The file is already selected");
                    return [...prevPdfFiles];
                }
                else
                    return [...prevPdfFiles, {
                        name: pdfFile.name,
                        document: dataUrl
                    }];
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

    const handleButtonClick = () => {

        if (download) {
            setDownload(false);
            setPdfFiles([]);
        }
        else if (success && !download) {
            setDownload(true);
            setSuccess(false);
            // Download the merged_file as a PDF file
            const link = document.createElement('a');
            link.href = `data:application/pdf;base64,${mergedFile}`;
            link.download = 'merged_file.pdf';
            document.body.appendChild(link);
            link.click();
            console.log(link);
            document.body.removeChild(link);
            setMergedFile(null);
        }
        else if (!loading) {
            setSuccess(false);
            setLoading(true);
            payload.files = [...pdfFiles]
            axios.post("http://localhost:8000/mergefiles", payload)
                .then(response => {
                    console.log(response);
                    setMergedFile(response.data?.merged_file);
                    setTimeout(() => {
                        setSuccess(true);
                        setLoading(false);
                    },3000);
                })
                .catch(err => {
                    console.log(err.response);
                    setErrorMsg(err.response.data.message);
                    setErrorStatus(err.response.status);
                    setTimeout(() => {
                        setSuccess(false);
                        setLoading(false);
                        handleClickOpenErrorDialog();
                    },1000);

                });
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
                        startIcon={ success ? <DownloadIcon/> : download ? <RefreshIcon/> : <MergeIcon/>}
                    >
                        {success ? "Download" : download ? "Refresh" : "Merge"}
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