import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog";

export function AlertDialog({ children, ...props }) {
  return <AlertDialogPrimitive.Root {...props}>{children}</AlertDialogPrimitive.Root>;
}

export function AlertDialogTrigger({ children, ...props }) {
  return <AlertDialogPrimitive.Trigger {...props}>{children}</AlertDialogPrimitive.Trigger>;
}

export function AlertDialogPortal({ children, ...props }) {
  return <AlertDialogPrimitive.Portal {...props}>{children}</AlertDialogPrimitive.Portal>;
}

export function AlertDialogOverlay({ className, ...props }) {
  return (
    <AlertDialogPrimitive.Overlay
      className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
      {...props}
    />
  );
}

export function AlertDialogContent({ className, children, ...props }) {
  return (
    <AlertDialogPortal>
      <AlertDialogOverlay />
      <AlertDialogPrimitive.Content
        className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 bg-[#2c2c2c] rounded-xl shadow-xl p-6 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
        {...props}
      >
        {children}
      </AlertDialogPrimitive.Content>
    </AlertDialogPortal>
  );
}

export function AlertDialogHeader({ className, children, ...props }) {
  return <div className="flex flex-col gap-1 mb-4" {...props}>{children}</div>;
}

export function AlertDialogTitle({ className, ...props }) {
  return <AlertDialogPrimitive.Title className="text-base font-semibold text-[#f4f3ee]" {...props} />;
}

export function AlertDialogDescription({ className, ...props }) {
  return <AlertDialogPrimitive.Description className="text-sm text-[#b1ada1] leading-relaxed" {...props} />;
}

export function AlertDialogFooter({ className, children, ...props }) {
  return <div className="flex justify-end gap-2 mt-4" {...props}>{children}</div>;
}

export function AlertDialogAction({ className, children, ...props }) {
  return (
    <AlertDialogPrimitive.Action
      className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-lg bg-[#c15f3c] text-white hover:bg-[#a84e2e] transition-colors cursor-pointer"
      {...props}
    >
      {children}
    </AlertDialogPrimitive.Action>
  );
}

export function AlertDialogCancel({ className, children, ...props }) {
  return (
    <AlertDialogPrimitive.Cancel
      className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-lg border border-[#3d3d3d] bg-[#2c2c2c] text-[#f4f3ee] hover:bg-[#3d3d3d] transition-colors cursor-pointer"
      {...props}
    >
      {children}
    </AlertDialogPrimitive.Cancel>
  );
}
