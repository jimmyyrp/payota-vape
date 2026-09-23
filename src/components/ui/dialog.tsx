
"use client"

import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { X } from "lucide-react"

import { cn } from "@/lib/utils"

const Dialog = DialogPrimitive.Root

const DialogTrigger = DialogPrimitive.Trigger

const DialogPortal = DialogPrimitive.Portal

const DialogClose = DialogPrimitive.Close

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-[280] bg-black/85 backdrop-blur-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    )}
    {...props}
  />
))
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName

type DialogContentProps = React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & {
  hideCloseButton?: boolean;
  overlayClassName?: string;
  /** Posisi modal di layar mobile (< md): 'bottom' = bottom-sheet, 'center' = kartu di tengah (default), 'full' = layar penuh. */
  mobilePosition?: "bottom" | "center" | "full";
};

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  DialogContentProps
>(({ className, children, hideCloseButton, overlayClassName, mobilePosition = "center", onOpenAutoFocus, ...props }, ref) => {
  const isBottomSheet = mobilePosition === "bottom";

  const handleOpenAutoFocus = React.useCallback(
    (event: Event) => {
      const active = document.activeElement;
      if (active && active instanceof HTMLElement) active.blur();
      onOpenAutoFocus?.(event);
    },
    [onOpenAutoFocus]
  );

  return (
    <DialogPortal>
      <DialogOverlay className={overlayClassName} />
      <DialogPrimitive.Content
        ref={ref}
        onOpenAutoFocus={handleOpenAutoFocus}
        className={cn(
          /* Shared base */
          "fixed z-[300] flex flex-col w-full gap-4 border-none bg-background duration-300 outline-none focus:ring-0",
          /* Mobile: bottom-sheet style — slides up, full width, rounded top only */
          isBottomSheet &&
            "inset-x-0 bottom-0 max-h-[92dvh] overflow-hidden p-0 rounded-t-[2rem]",
          isBottomSheet &&
            "data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom",
          /* Mobile: centered card */
          mobilePosition === "center" &&
            "left-1/2 top-1/2 w-[calc(100%-2rem)] max-h-[min(90dvh,560px)] -translate-x-1/2 -translate-y-1/2 overflow-y-auto overflow-x-hidden overscroll-contain rounded-2xl",
          mobilePosition === "center" &&
            "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
          /* Mobile: full screen — fills the whole area */
          mobilePosition === "full" &&
            "inset-0 h-[100dvh] max-h-[100dvh] w-full overflow-hidden p-0 rounded-none",
          /* Shared open/close animation */
          "data-[state=open]:animate-in data-[state=closed]:animate-out",
          "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
          /* Desktop: use a single centered transform strategy instead of conflicting inset-based positioning */
          "md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-[92vw] md:max-w-lg md:max-h-[90vh] md:h-fit",
          "md:rounded-[3.5rem]",
          "md:data-[state=closed]:fade-out-0 md:data-[state=open]:fade-in-0",
          className
        )}
        {...props}
      >
        {/* Mobile drag handle indicator — bottom-sheet only */}
        {isBottomSheet && (
          <div className="flex md:hidden justify-center pt-3 pb-1">
            <div className="w-10 h-1 rounded-full bg-black/10" />
          </div>
        )}
        {children}
        {!hideCloseButton && (
          <DialogPrimitive.Close className="absolute right-5 top-5 md:right-8 md:top-8 rounded-full p-3 bg-black/20 hover:bg-black/40 hover:scale-105 backdrop-blur-2xl opacity-100 ring-offset-background transition-all duration-200 focus:outline-none focus:ring-0 disabled:pointer-events-none z-[310] border border-white/10 shadow-2xl group">
            <X className="h-5 w-5 text-white stroke-[3px] group-hover:rotate-90 transition-transform duration-200" />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Content>
    </DialogPortal>
  );
});
DialogContent.displayName = DialogPrimitive.Content.displayName

const DialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col space-y-1.5 text-center sm:text-left",
      className
    )}
    {...props}
  />
)
DialogHeader.displayName = "DialogHeader"

const DialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
      className
    )}
    {...props}
  />
)
DialogFooter.displayName = "DialogFooter"

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(
      "text-lg font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
))
DialogTitle.displayName = DialogPrimitive.Title.displayName

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
DialogDescription.displayName =
  DialogPrimitive.Description.displayName

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
}
