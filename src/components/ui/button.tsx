import type { ButtonRootProps } from "@kobalte/core/button";
import { Button as ButtonPrimitive } from "@kobalte/core/button";
import type { PolymorphicProps } from "@kobalte/core/polymorphic";
import type { VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";
import type { ValidComponent } from "solid-js";
import { splitProps } from "solid-js";
import { cn } from "@/lib/cn";

export const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-[color,background-color,box-shadow] focus-visible:outline-none focus-visible:ring-[1.5px] focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:cursor-pointer select-none",
  {
    variants: {
      variant: {
        default: "bg-accent text-primary-foreground shadow hover:bg-accent/90",
        destructive:
          "border border-input bg-background shadow-sm text-destructive shadow-sm hover:bg-destructive/90 hover:text-destructive-foreground",
        outline:
          "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
        ghost: "hover:bg-muted hover:text-muted-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-3 py-2 gap-2",
        sm: "h-8 rounded-md px-3 text-xs gap-2",
        lg: "h-10 rounded-md px-8 gap-2",
        icon: "h-9 w-9",
        tile: "h-32 w-32",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

type buttonProps<T extends ValidComponent = "button"> = ButtonRootProps<T> &
  VariantProps<typeof buttonVariants> & {
    class?: string;
  };

export const Button = <T extends ValidComponent = "button">(
  props: PolymorphicProps<T, buttonProps<T>>,
) => {
  const [local, rest] = splitProps(props as buttonProps, [
    "class",
    "variant",
    "size",
  ]);

  return (
    <ButtonPrimitive
      class={cn(
        buttonVariants({
          size: local.size,
          variant: local.variant,
        }),
        local.class,
      )}
      {...rest}
    />
  );
};
