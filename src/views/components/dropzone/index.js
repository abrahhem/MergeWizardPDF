import React, {useCallback} from 'react'
import {useDropzone} from 'react-dropzone'
import {Box} from "@mui/material";
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

const style = {
    color: 'white',
    border: '2px dashed white',
    padding: '30px',
    textAlign: 'center',
    borderRadius: '20px',
    '&:hover' : {
        opacity: 0.8,
        cursor: "pointer"
    }

}

export default function Dropzone({ handler }) {
    const onDrop = useCallback((acceptedFiles) => {
        acceptedFiles.forEach((file) => {
            if ( handler )
                handler(file);
        });

    }, []);
    const { getRootProps, getInputProps } = useDropzone({
        onDrop,
        maxFiles: 5,
        accept: {
            'application/pdf': ['.pdf']
        },
        multiple: true,
    });

    return (
        <Box {...getRootProps()} sx={style}>
            <input {...getInputProps()} />
            <CloudUploadIcon sx={{fontSize: '80px'}}/>
            <h3>Drag 'n' drop some files here, or click to select files</h3>
        </Box>
    );
}