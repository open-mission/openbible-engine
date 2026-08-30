"use client";

import { Toaster as Sonner, type ToasterProps } from "sonner";

export function Toaster(props: ToasterProps) {
  return (
    <Sonner
      position="bottom-right"
      theme="system"
      toastOptions={{
        classNames: { toast: "consumer-toast" },
        ...props.toastOptions,
      }}
      {...props}
    />
  );
}
