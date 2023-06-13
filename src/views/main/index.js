import React, {useState} from 'react';
import {
    Alert,
    Box,
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    Slide,
    Snackbar
} from "@mui/material";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import GlassyCard from "../components/glassycard";
import Dropzone from "../components/dropzone";
import MergeIcon from '@mui/icons-material/Merge';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Item from "../components/item";
import PdfViewer from "../components/pdfviewer";
import axios from "axios";
import './style.css';
import {green} from "@mui/material/colors";

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props}/>;
});


export default function Main() {

    const [openDocument, setOpenDocument] = useState(null);
    const [pdfFiles, setPdfFiles] = useState([]);
    const [open, setOpen] = useState(false);
    const [errorAlert, setErrorAlert] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const [loading, setLoading] = React.useState(false);
    const [success, setSuccess] = React.useState(false)

    const buttonSx = {
        ...(success && {
            bgcolor: green[500],
            '&:hover': {
                bgcolor: green[700],
            },
        }),
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
    }

    const handleClose = () => {
        setOpen(false);
    };


    const handleFileUpload = (pdfFile) => {
        const fileReader = new FileReader();

        fileReader.onload = () => {
            const dataUrl = fileReader.result;

            setPdfFiles((prevPdfFiles) => {
                if (prevPdfFiles.length >= 9) {
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
        setPdfFiles((prevPdfFiles) =>
            prevPdfFiles.filter((_, i) => i !== index)
        );
    }

    const handleDocumentPreview = (index) => {
        setOpenDocument(pdfFiles[index]);
        handleClickOpen();
    }

    const handleButtonClick = () => {

        if (!loading) {
            setSuccess(false);
            setLoading(true);
        }


        axios.post("http://localhost:8000/mergefiles", {files: [...pdfFiles]})
            .then(response => {
                console.log(response);
            })
            .catch(err => {
                    console.log(err.response);
                }
            ).
            finally( () => {
                setTimeout(() => {
                    setSuccess(true);
                    setLoading(false);
                },3000);
            });
    };


    return(
        <Box className={'main'}>
            <GlassyCard>
                <Box className={'container'}>
                    <Dropzone handler={handleFileUpload}/>
                    <DragDropContext>
                        <Droppable droppableId="item-list">
                            {(provided) => (
                                <Box ref={provided.innerRef} {...provided.droppableProps}>
                                    {pdfFiles.map((pdfFile, index) => (
                                        <Draggable key={index} draggableId={`item-${index}`} index={index}>
                                            {(provided) => (
                                                <div ref={provided.innerRef} {...provided.draggableProps}>
                                                    <Item
                                                        file={pdfFile}
                                                        index={index}
                                                        deleteHandler={handleFileDelete}
                                                        openFileHandler={handleDocumentPreview}
                                                        dragHandleProps={provided.dragHandleProps}
                                                    />
                                                </div>
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
                        startIcon={ success ? <ArrowBackIcon/> : <MergeIcon />}
                    >
                        {success ? "Go back" : "Merge"}
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
                <DialogContent sx={{ padding: 0}}>
                    { openDocument ?
                        <PdfViewer document={openDocument.document}/>
                        :
                        <></>
                    }
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Close</Button>
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