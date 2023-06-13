import React, {useState} from 'react';
import {moveItems, useDraggableContext} from "react-tiny-dnd";
import DraggableItem from "../draggableitem";

const [items, setItems] = useState([]);

const onDrop = (dragIndex, overIndex) => {
    const nextItems = moveItems(items, dragIndex, overIndex);
    setItems(nextItems);
};

const context = useDraggableContext({
    onDrop,
});

export default function DraggableList() {
    return (
        <>
            {items.map((item, i) => {
                return (
                    <DraggableItem context={context} key={i} index={i} item={item} />
                );
            })}
        </>
    );
}