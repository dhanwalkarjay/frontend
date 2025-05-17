
"use client";

import { ZinePage } from '@/components/zine/ZinePage';

export default function ZineViewerPage() {
  const pages = [
    { number: 1, bgColor: 'bg-sky-100 dark:bg-sky-900' },
    { number: 2, bgColor: 'bg-rose-100 dark:bg-rose-900' },
    { number: 3, bgColor: 'bg-teal-100 dark:bg-teal-900' },
    { number: 4, bgColor: 'bg-amber-100 dark:bg-amber-900' },
  ];

  return (
    <main className="flex flex-col min-h-screen w-full bg-background scroll-smooth">
      {/* 
        For snap scrolling, the parent container needs 'snap-y snap-mandatory' 
        and children 'snap-start'. The h-screen on ZinePage helps with full page snap.
        The 'overflow-y-scroll' is implicit if content exceeds screen height.
      */}
      <div className="snap-y snap-mandatory h-screen overflow-y-scroll">
        {pages.map((page) => (
          <ZinePage key={page.number} pageNumber={page.number} bgColor={page.bgColor}>
            {/* You can customize content per page here */}
            {page.number === 1 && (
              <div>
                <h1 className="text-5xl font-bold text-foreground mb-6">Welcome to the Zine!</h1>
                <p className="text-xl text-muted-foreground">Scroll down to explore.</p>
                <div 
                  data-ai-hint="abstract geometric"
                  className="mt-8 w-64 h-64 md:w-96 md:h-96 mx-auto rounded-lg shadow-xl"
                  style={{ backgroundImage: 'url(https://placehold.co/400x400.png)', backgroundSize: 'cover' }} 
                />
              </div>
            )}
          </ZinePage>
        ))}
      </div>
    </main>
  );
}
