"use client";

import { cn } from "@/lib/utils";
import { IconLayoutNavbarCollapse } from "@tabler/icons-react";
import {
  AnimatePresence,
  MotionValue,
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import React, { useRef, useState, type ReactNode } from "react";

export interface DockItem {
  title: string;
  icon: React.ReactNode;
  href?: string;
  onClick?: (
    event: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>
  ) => void;
  component?: React.ReactNode;
}

export const FloatingDock = ({
  items,
  desktopClassName,
  mobileClassName,
}: {
  items: DockItem[];
  desktopClassName?: string;
  mobileClassName?: string;
}) => {
  return (
    <>
      <FloatingDockDesktop items={items} className={desktopClassName} />
      <FloatingDockMobile items={items} className={mobileClassName} />
    </>
  );
};

const FloatingDockMobile = ({
  items,
  className,
}: {
  items: DockItem[];
  className?: string;
}) => {
  const [open, setOpen] = useState(false);
  return (
    <div
      className={cn("fixed bottom-4 right-4 z-[60] block md:hidden", className)}
    >
      <AnimatePresence>
        {open && (
          <motion.div
            layoutId="nav-mobile"
            className="absolute inset-x-0 bottom-full mb-2 flex flex-col-reverse items-end gap-2"
          >
            {items.map((item, idx) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 10 }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                exit={{
                  opacity: 0,
                  y: 10,
                  transition: {
                    delay: idx * 0.05,
                  },
                }}
                transition={{ delay: (items.length - 1 - idx) * 0.05 }}
              >
                {item.component ? (
                  item.component
                ) : (
                  <button
                    onClick={(e) => {
                      if (item.onClick) {
                        item.onClick(e);
                      } else if (item.href) {
                        window.location.href = item.href;
                      }
                    }}
                    title={item.title}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-card text-card-foreground border border-border shadow-md"
                  >
                    <div className="h-5 w-5">{item.icon}</div>
                  </button>
                )}
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
      <button
        onClick={() => setOpen(!open)}
        className="flex h-12 w-12 items-center justify-center rounded-full bg-card text-card-foreground border border-border shadow-lg"
        aria-label="Toggle tools menu"
      >
        <IconLayoutNavbarCollapse className="h-6 w-6" />
      </button>
    </div>
  );
};

const FloatingDockDesktop = ({
  items,
  className,
}: {
  items: DockItem[];
  className?: string;
}) => {
  let mouseX = useMotionValue(Infinity);
  return (
    <motion.div
      onMouseMove={(e) => mouseX.set(e.pageX)}
      onMouseLeave={() => mouseX.set(Infinity)}
      className={cn(
        "fixed bottom-4 left-1/2 -translate-x-1/2 z-[60]",
        "mx-auto hidden h-16 items-end gap-3 rounded-xl bg-card/80 backdrop-blur-md border border-border px-3 pb-2.5 shadow-xl md:flex",
        className
      )}
    >
      {items.map((item) =>
        item.component ? (
          React.cloneElement(item.component as React.ReactElement<any>, {
            key: item.title,
          })
        ) : (
          <IconContainer mouseX={mouseX} key={item.title} {...item} />
        )
      )}
    </motion.div>
  );
};

function IconContainer({
  mouseX,
  title,
  icon,
  href,
  onClick,
}: {
  mouseX: MotionValue;
  title: string;
  icon: React.ReactNode;
  href?: string;
  onClick?: (
    event: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>
  ) => void;
}) {
  const ref = useRef<HTMLButtonElement | HTMLAnchorElement>(null);

  let distance = useTransform(mouseX, (val) => {
    let bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
    return val - bounds.x - bounds.width / 2;
  });

  let widthTransform = useTransform(distance, [-120, 0, 120], [40, 70, 40]);
  let heightTransform = useTransform(distance, [-120, 0, 120], [40, 70, 40]);

  let widthTransformIcon = useTransform(distance, [-120, 0, 120], [20, 30, 20]);
  let heightTransformIcon = useTransform(
    distance,
    [-120, 0, 120],
    [20, 30, 20]
  );

  let width = useSpring(widthTransform, {
    mass: 0.1,
    stiffness: 150,
    damping: 12,
  });
  let height = useSpring(heightTransform, {
    mass: 0.1,
    stiffness: 150,
    damping: 12,
  });

  let widthIcon = useSpring(widthTransformIcon, {
    mass: 0.1,
    stiffness: 150,
    damping: 12,
  });
  let heightIcon = useSpring(heightTransformIcon, {
    mass: 0.1,
    stiffness: 150,
    damping: 12,
  });

  const [hovered, setHovered] = useState(false);

  const commonProps = {
    onMouseEnter: () => setHovered(true),
    onMouseLeave: () => setHovered(false),
    title: title,
    className:
      "relative flex aspect-square items-center justify-center rounded-full bg-secondary/30 hover:bg-secondary/50 text-secondary-foreground border border-transparent cursor-default",
  };

  const content = (
    <>
      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{ opacity: 0, y: 10, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: 2, x: "-50%" }}
            className="absolute -top-8 left-1/2 w-fit rounded-md border bg-popover px-2 py-0.5 text-xs whitespace-pre text-popover-foreground shadow-lg"
          >
            {title}
          </motion.div>
        )}
      </AnimatePresence>
      <motion.div
        style={{ width: widthIcon, height: heightIcon }}
        className="flex items-center justify-center"
      >
        {icon}
      </motion.div>
    </>
  );

  if (onClick) {
    return (
      <motion.button
        ref={ref as React.Ref<HTMLButtonElement>}
        style={{ width, height }}
        onClick={onClick}
        {...commonProps}
      >
        {content}
      </motion.button>
    );
  }

  return (
    <motion.a
      ref={ref as React.Ref<HTMLAnchorElement>}
      style={{ width, height }}
      href={href || "#"}
      {...commonProps}
    >
      {content}
    </motion.a>
  );
}
