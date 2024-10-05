"use client";

import { FC, useState, useCallback, useEffect } from "react";

interface ResizableDividerProps {
  onResize: (clientY: number) => void;
}

const ResizableDivider: FC<ResizableDividerProps> = ({ onResize }) => {
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const handleMouseDown = useCallback(() => {
    setIsDragging(true);
  }, []);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (isDragging) {
        onResize(e.clientY);
      }
    },
    [isDragging, onResize]
  );

  useEffect(() => {
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  return (
    <div
      className="h-4 bg-gray-300 cursor-ns-resize flex items-center justify-center"
      onMouseDown={handleMouseDown}
    >
      <div className="w-10 h-1 bg-gray-500 rounded-full"></div>
    </div>
  );
};

export default ResizableDivider;
