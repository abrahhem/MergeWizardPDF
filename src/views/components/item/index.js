import React, {useEffect, useState} from 'react';
import {Box, IconButton, Typography} from "@mui/material";
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import DeleteIcon from '@mui/icons-material/Delete';
import {useSortable} from "@dnd-kit/sortable";
import './style.css'


export default function Item({ file, index, deleteHandler, openFileHandler, dragHandleProps }) {

    const [fileName, setFileName] = useState('');

    useEffect(() => {
        const name = file.name;
        setFileName(name);
        console.log(`${file.name} - ${index}`);
    }, [file]);


    const handleItemDelete = () => {
        console.log(`item - ${index}`);
        if ( deleteHandler )
            deleteHandler(index);
    }

    const handleClick = () => {
        if (openFileHandler)
            openFileHandler(index);
    }

    return (
        <Box
            sx={{
                display: 'flex',
                width: '100%',
                padding: '5px',
                color: 'white',
                alignItems: 'center',
                justifyContent: 'space-between',
            }}
            {...dragHandleProps}
        >
            <DragIndicatorIcon/>
            <Typography gutterBottom className={'file-name'} onClick={handleClick}>
                {fileName}
            </Typography>
            <IconButton color={'inherit'} aria-label="add to shopping cart" onClick={handleItemDelete}>
                <DeleteIcon />
            </IconButton>
        </Box>
    );
}