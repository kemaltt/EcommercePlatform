import { Input } from "@/components/ui/input";
import { Eye, EyeOff } from 'lucide-react';
import { ControllerRenderProps, FieldValues } from "react-hook-form";
import { ComponentProps } from "react";

interface AuthPasswordInputProps {
  field: ControllerRenderProps<FieldValues, any>;
  showPassword: boolean;
  onTogglePassword: () => void;
  placeholder: string;
  isLoading?: boolean;
  inputProps?: ComponentProps<typeof Input>; // Ekstra input propları için
}

export const AuthPasswordInput = ({
  field,
  showPassword,
  onTogglePassword,
  placeholder,
  isLoading = false,
  inputProps
}: AuthPasswordInputProps) => (
  <div className="relative">
    <Input
      type={showPassword ? "text" : "password"}
      placeholder={placeholder}
      {...field}
      disabled={isLoading}
      className="pr-10" // Göz ikonu için padding
      {...inputProps}
    />
    <button
      type="button"
      onClick={onTogglePassword}
      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
      tabIndex={-1}
      aria-label={showPassword ? "Hide password" : "Show password"}
    >
      {showPassword ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
    </button>
  </div>
); 