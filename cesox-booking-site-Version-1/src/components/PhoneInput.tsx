import { Input } from "@/components/ui/input";
import { ChangeEvent } from "react";

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export const PhoneInput = ({ value, onChange, placeholder = "05XXXXXXXX", className }: PhoneInputProps) => {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    
    // Only allow numbers
    const numericValue = inputValue.replace(/\D/g, '');
    
    // Limit to 10 digits (UAE mobile format: 05XXXXXXXX)
    const limitedValue = numericValue.slice(0, 10);
    
    // Ensure it starts with 05 if user starts typing
    if (limitedValue.length > 0 && !limitedValue.startsWith('0')) {
      return; // Don't update if first digit isn't 0
    }
    if (limitedValue.length > 1 && !limitedValue.startsWith('05')) {
      return; // Don't update if second digit isn't 5
    }
    
    onChange(limitedValue);
  };

  const isValid = value.length === 10 && value.startsWith('05');
  const hasError = value.length > 0 && !value.startsWith('05');

  return (
    <div className="relative">
      <Input
        type="tel"
        inputMode="numeric"
        pattern="[0-9]*"
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        className={`${className} ${hasError ? 'border-red-500' : ''} ${isValid ? 'border-green-500' : ''}`}
      />
      {value.length > 0 && (
        <div className="text-xs mt-1">
          {hasError && (
            <span className="text-red-400">Phone must start with 05</span>
          )}
          {!hasError && value.length < 10 && (
            <span className="text-muted-foreground">{10 - value.length} more digits needed</span>
          )}
          {isValid && (
            <span className="text-green-400">✓ Valid UAE number</span>
          )}
        </div>
      )}
    </div>
  );
};
