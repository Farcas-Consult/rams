/* eslint-disable @typescript-eslint/no-unused-vars */

import React, { useState } from "react";

import { cn } from "@/lib/utils";

import { Eye, EyeOff } from "lucide-react";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>

const PasswordInput = React.forwardRef<HTMLInputElement, InputProps>(

  ({ className, type, ...props }, ref) => {

    const [showPassword, setShowPassword] = useState(false);

    return (

      <div className="relative">

        <input

          type={`${showPassword ? "text" : "password"}`}

          className={cn(
            "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
            "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
            "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
            className
          )}

          ref={ref}

          {...props}

        />

        <button

          type="button"

          onClick={() => setShowPassword(!showPassword)}

          title={`${showPassword ? "Hide password" : "Show password"}`}

          className="absolute right-3 top-1/2 -translate-y-1/2 transform text-muted-foreground"

        >

            {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}

        </button>

      </div>

    );

  },

);

PasswordInput.displayName = "PasswordInput";

export { PasswordInput };

