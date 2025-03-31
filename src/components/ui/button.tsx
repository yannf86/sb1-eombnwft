import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-700 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 dark:ring-offset-charcoal-900 dark:focus-visible:ring-brand-500",
  {
    variants: {
      variant: {
        default: "bg-brand-500 text-white hover:bg-brand-600 dark:bg-brand-500 dark:text-white dark:hover:bg-brand-600",
        destructive: "bg-red-500 text-white hover:bg-red-600 dark:bg-red-700 dark:text-white dark:hover:bg-red-800",
        outline: "border border-charcoal-200 bg-white hover:bg-cream-100 hover:text-brand-600 dark:border-charcoal-700 dark:bg-charcoal-900 dark:hover:bg-charcoal-800 dark:hover:text-brand-400",
        secondary: "bg-cream-200 text-charcoal-700 hover:bg-cream-300 dark:bg-charcoal-800 dark:text-cream-100 dark:hover:bg-charcoal-700",
        ghost: "hover:bg-cream-100 hover:text-brand-600 dark:hover:bg-charcoal-800 dark:hover:text-brand-400",
        link: "text-brand-600 underline-offset-4 hover:underline dark:text-brand-400",
        primary: "bg-brand-500 text-white hover:bg-brand-600",
        success: "bg-green-600 text-white hover:bg-green-700",
        warning: "bg-amber-500 text-white hover:bg-amber-600"
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };