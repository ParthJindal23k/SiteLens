"use client";

import { useEffect } from "react";
import { X } from "lucide-react";

interface CleanToastProps {
  title: string;
  description?: string;
  onClose: () => void;
  duration?: number;
}



export default function CleanToast({
  title,
  description,
  onClose,
  duration = 4000,
}: CleanToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  return (
    <div className="fixed top-6 right-6 z-50 animate-toast-in">
      <div
        className="
          w-[340px]
          rounded-2xl
          border border-border
          bg-background/85
          backdrop-blur-xl
          shadow-xl
          px-4 py-3
        "
      >
        <div className="flex items-start gap-3">
          <div className="flex-1">
            <p className="text-sm font-semibold leading-tight">
              {title}
            </p>

            {description && (
              <p className="mt-1 text-xs text-muted-foreground">
                {description}
              </p>
            )}
          </div>

          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition"
            aria-label="Close notification"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
