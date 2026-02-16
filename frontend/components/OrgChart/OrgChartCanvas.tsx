'use client';

import React, { useRef, useState, useEffect } from 'react';
import { OrgChartTree } from './OrgChartTree';
import { ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';

interface UserNode {
    id: string;
    name: string | null;
    email: string;
    titleRel?: { name: string } | null;
    roleRel?: { name: string } | null;
    directReports?: UserNode[];
}

interface OrgChartCanvasProps {
    hierarchy: UserNode[];
}

export function OrgChartCanvas({ hierarchy }: OrgChartCanvasProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const [scale, setScale] = useState(1);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

    // Handle wheel zoom
    const handleWheel = (e: React.WheelEvent) => {
        e.preventDefault();

        const delta = e.deltaY * -0.001;
        const newScale = Math.min(Math.max(0.25, scale + delta), 3);

        // Zoom towards cursor position
        if (containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;

            const scaleChange = newScale / scale;
            const newX = mouseX - (mouseX - position.x) * scaleChange;
            const newY = mouseY - (mouseY - position.y) * scaleChange;

            setPosition({ x: newX, y: newY });
        }

        setScale(newScale);
    };

    // Handle mouse drag
    const handleMouseDown = (e: React.MouseEvent) => {
        setIsDragging(true);
        setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (isDragging) {
            setPosition({
                x: e.clientX - dragStart.x,
                y: e.clientY - dragStart.y
            });
        }
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    const handleZoomIn = () => setScale(Math.min(scale + 0.2, 3));
    const handleZoomOut = () => setScale(Math.max(scale - 0.2, 0.25));
    const handleReset = () => {
        setScale(1);
        setPosition({ x: 0, y: 0 });
    };

    // Center content on mount
    useEffect(() => {
        if (containerRef.current && contentRef.current) {
            const container = containerRef.current.getBoundingClientRect();
            const content = contentRef.current.getBoundingClientRect();

            setPosition({
                x: (container.width - content.width) / 2,
                y: 50
            });
        }
    }, [hierarchy]);

    return (
        <div className="relative w-full h-full">
            {/* Zoom Controls */}
            <div className="absolute top-4 right-4 z-10 flex flex-col gap-2 bg-white rounded-lg shadow-lg border border-slate-200 p-2">
                <button
                    onClick={handleZoomIn}
                    className="p-2 hover:bg-slate-100 rounded transition-colors"
                    title="Zoom In"
                >
                    <ZoomIn className="w-5 h-5 text-slate-600" />
                </button>
                <button
                    onClick={handleZoomOut}
                    className="p-2 hover:bg-slate-100 rounded transition-colors"
                    title="Zoom Out"
                >
                    <ZoomOut className="w-5 h-5 text-slate-600" />
                </button>
                <button
                    onClick={handleReset}
                    className="p-2 hover:bg-slate-100 rounded transition-colors"
                    title="Reset View"
                >
                    <Maximize2 className="w-5 h-5 text-slate-600" />
                </button>
                <div className="text-xs text-center text-slate-500 pt-1 border-t border-slate-200">
                    {Math.round(scale * 100)}%
                </div>
            </div>

            {/* Canvas */}
            <div
                ref={containerRef}
                className={`w-full h-full overflow-hidden ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
                onWheel={handleWheel}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
            >
                <div
                    ref={contentRef}
                    style={{
                        transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                        transformOrigin: '0 0',
                        transition: isDragging ? 'none' : 'transform 0.1s',
                    }}
                    className="inline-block"
                >
                    <div className="flex gap-16 p-8">
                        {hierarchy.map(rootNode => (
                            <OrgChartTree key={rootNode.id} data={rootNode} />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
