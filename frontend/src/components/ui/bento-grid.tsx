import { cn } from "@/lib/utils";
import React from "react";

export const BentoGrid = ({
  className,
  children,
}: {
  className?: string;
  children?: React.ReactNode;
}) => {
  return (
    <div
      className={cn(
        "grid md:auto-rows-[18rem] grid-cols-1 md:grid-cols-3 gap-4 max-w-7xl mx-auto",
        className
      )}
    >
      {children}
    </div>
  );
};

export const BentoGridItem = ({
  className,
  title,
  description,
  header,
  icon,
}: {
  className?: string;
  title?: string | React.ReactNode;
  description?: string | React.ReactNode;
  header?: React.ReactNode;
  icon?: React.ReactNode;
}) => {
  return (
    <div
      className={cn(
        "row-span-1 rounded-2xl group/bento hover:shadow-2xl transition-all duration-300 shadow-lg p-4 border-0 justify-between flex flex-col space-y-4 relative overflow-hidden",
        className
      )}
    >
      {header}
      <div className="group-hover/bento:translate-x-1 transition duration-200 relative z-10 px-2 pb-2">
        <div className="flex items-start gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-white/90 flex items-center justify-center text-[#004737] shadow-md flex-shrink-0">
            {icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-bold text-[#004737] text-base mb-1 leading-tight" style={{ fontFamily: 'Georgia, serif' }}>
              {title}
            </div>
            <div className="font-light text-[#2d5f4f]/80 text-xs leading-relaxed">
              {description}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
