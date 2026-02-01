'use client';

import { useState, useRef, useCallback, ReactNode } from 'react';

interface DraggableItem {
    id: string;
    [key: string]: any;
}

interface DraggableListProps<T extends DraggableItem> {
    items: T[];
    onReorder: (items: T[]) => void;
    renderItem: (item: T, index: number, isDragging: boolean) => ReactNode;
    keyExtractor?: (item: T) => string;
    disabled?: boolean;
}

/**
 * Drag & Drop sortable list component for mobile
 * Uses touch events for mobile support
 */
export function DraggableList<T extends DraggableItem>({
    items,
    onReorder,
    renderItem,
    keyExtractor = (item) => item.id,
    disabled = false,
}: DraggableListProps<T>) {
    const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
    const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const dragStartY = useRef(0);
    const dragCurrentY = useRef(0);
    const itemHeights = useRef<number[]>([]);

    // Calculate which index we're dragging over based on Y position
    const calculateDragOverIndex = useCallback((clientY: number): number => {
        if (!containerRef.current || draggingIndex === null) return draggingIndex || 0;

        const containerRect = containerRef.current.getBoundingClientRect();
        const relativeY = clientY - containerRect.top + containerRef.current.scrollTop;

        let accumulatedHeight = 0;
        for (let i = 0; i < itemHeights.current.length; i++) {
            const itemCenter = accumulatedHeight + itemHeights.current[i] / 2;
            if (relativeY < itemCenter) {
                return i;
            }
            accumulatedHeight += itemHeights.current[i];
        }
        return items.length - 1;
    }, [draggingIndex, items.length]);

    // Touch handlers for mobile
    const handleTouchStart = useCallback((e: React.TouchEvent, index: number) => {
        if (disabled) return;

        // Store item heights for position calculation
        if (containerRef.current) {
            const children = containerRef.current.children;
            itemHeights.current = Array.from(children).map(child =>
                (child as HTMLElement).getBoundingClientRect().height
            );
        }

        dragStartY.current = e.touches[0].clientY;
        dragCurrentY.current = e.touches[0].clientY;
        setDraggingIndex(index);
        setDragOverIndex(index);

        // Haptic feedback
        if (navigator.vibrate) {
            navigator.vibrate(50);
        }
    }, [disabled]);

    const handleTouchMove = useCallback((e: React.TouchEvent) => {
        if (draggingIndex === null || disabled) return;

        e.preventDefault();
        dragCurrentY.current = e.touches[0].clientY;

        const newDragOverIndex = calculateDragOverIndex(e.touches[0].clientY);
        if (newDragOverIndex !== dragOverIndex) {
            setDragOverIndex(newDragOverIndex);
            if (navigator.vibrate) {
                navigator.vibrate(10);
            }
        }
    }, [draggingIndex, dragOverIndex, calculateDragOverIndex, disabled]);

    const handleTouchEnd = useCallback(() => {
        if (draggingIndex === null || dragOverIndex === null || disabled) {
            setDraggingIndex(null);
            setDragOverIndex(null);
            return;
        }

        if (draggingIndex !== dragOverIndex) {
            const newItems = [...items];
            const [removed] = newItems.splice(draggingIndex, 1);
            newItems.splice(dragOverIndex, 0, removed);
            onReorder(newItems);

            if (navigator.vibrate) {
                navigator.vibrate(30);
            }
        }

        setDraggingIndex(null);
        setDragOverIndex(null);
    }, [draggingIndex, dragOverIndex, items, onReorder, disabled]);

    // Mouse handlers for desktop
    const handleDragStart = useCallback((e: React.DragEvent, index: number) => {
        if (disabled) return;

        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', index.toString());

        // Store item heights
        if (containerRef.current) {
            const children = containerRef.current.children;
            itemHeights.current = Array.from(children).map(child =>
                (child as HTMLElement).getBoundingClientRect().height
            );
        }

        setDraggingIndex(index);
        setDragOverIndex(index);
    }, [disabled]);

    const handleDragOver = useCallback((e: React.DragEvent, index: number) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';

        if (dragOverIndex !== index) {
            setDragOverIndex(index);
        }
    }, [dragOverIndex]);

    const handleDrop = useCallback((e: React.DragEvent, targetIndex: number) => {
        e.preventDefault();

        const sourceIndex = parseInt(e.dataTransfer.getData('text/plain'), 10);

        if (sourceIndex !== targetIndex && !isNaN(sourceIndex)) {
            const newItems = [...items];
            const [removed] = newItems.splice(sourceIndex, 1);
            newItems.splice(targetIndex, 0, removed);
            onReorder(newItems);
        }

        setDraggingIndex(null);
        setDragOverIndex(null);
    }, [items, onReorder]);

    const handleDragEnd = useCallback(() => {
        setDraggingIndex(null);
        setDragOverIndex(null);
    }, []);

    return (
        <div
            ref={containerRef}
            className="space-y-2"
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
        >
            {items.map((item, index) => {
                const isDragging = draggingIndex === index;
                const isOver = dragOverIndex === index && draggingIndex !== null && draggingIndex !== index;

                return (
                    <div
                        key={keyExtractor(item)}
                        draggable={!disabled}
                        onDragStart={(e) => handleDragStart(e, index)}
                        onDragOver={(e) => handleDragOver(e, index)}
                        onDrop={(e) => handleDrop(e, index)}
                        onDragEnd={handleDragEnd}
                        onTouchStart={(e) => handleTouchStart(e, index)}
                        className={`
                            transition-all duration-150
                            ${isDragging ? 'opacity-50 scale-[1.02] z-50' : ''}
                            ${isOver ? 'translate-y-2' : ''}
                            ${!disabled ? 'cursor-grab active:cursor-grabbing' : ''}
                        `}
                    >
                        {/* Drop indicator */}
                        {isOver && (
                            <div className="h-1 bg-accent rounded-full mb-2 animate-pulse" />
                        )}

                        {renderItem(item, index, isDragging)}
                    </div>
                );
            })}
        </div>
    );
}

/**
 * Drag handle component for use within list items
 */
export function DragHandle({ className = '' }: { className?: string }) {
    return (
        <div className={`flex flex-col gap-0.5 p-2 cursor-grab active:cursor-grabbing ${className}`}>
            <div className="w-4 h-0.5 bg-muted-foreground/40 rounded" />
            <div className="w-4 h-0.5 bg-muted-foreground/40 rounded" />
            <div className="w-4 h-0.5 bg-muted-foreground/40 rounded" />
        </div>
    );
}
