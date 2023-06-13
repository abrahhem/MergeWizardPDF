import React from 'react';
import Box from '@mui/material/Box';
import './style.css'

export default function GlassyCard({ children }) {
    return (
        <Box className={'glass'}>
            {children}
        </Box>

    );
}

