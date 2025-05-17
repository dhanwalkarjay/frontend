
"use client";

import type { FC, HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface ZinePageProps extends HTMLAttributes<HTMLDivElement> {
  pageNumber: number;
  bgColor?: string; // e.g., 'bg-blue-100'
}

export const ZinePage: FC<ZinePageProps> = ({
  pageNumber,
  bgColor = 'bg-card',
  className,
  children,
  ...props
}) => {
  return (
    <section
      id={`zine-page-${pageNumber}`}
      className={cn(
        'h-screen w-full flex flex-col items-center justify-center p-4 md:p-8 snap-start',
        bgColor,
        className
      )}
      {...props}
    >
      <div className="text-center">
        {children || (
          <>
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Page {pageNumber}
            </h2>
            <p className="text-lg text-muted-foreground">
              This is content for page {pageNumber} of the zine.
            </p>
          </>
        )}
      </div>
    </section>
  );
};
