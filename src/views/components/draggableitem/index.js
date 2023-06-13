import React from 'react';
import {Draggable, useDraggable} from "react-tiny-dnd";

// export default function DraggableItem() {
//
// }

export default function DraggableItem({ index, context, item,})  {
    const { listeners, isDragging} = useDraggable(context, index);

    return (
        <Draggable context={context} key={item.id} index={index}>
            <Item
                item={item}
                handler={(
                    <> className="dnd-icon" {...listeners}>
                    </>
                )}
            />
        </Draggable>
    );
};