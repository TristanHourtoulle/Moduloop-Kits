import { AlertCircle } from "lucide-react";

interface FormErrorProps {
  error?: string;
  className?: string;
}

export function FormError({ error, className = "" }: FormErrorProps) {
  if (!error) return null;

  return (
    <div className={`flex items-center gap-2 text-sm text-red-600 ${className}`}>
      <AlertCircle className="h-4 w-4 flex-shrink-0" />
      <span>{error}</span>
    </div>
  );
}

// Version plus simple pour juste le texte
export function FormErrorText({ error, className = "" }: FormErrorProps) {
  if (!error) return null;

  return (
    <p className={`text-sm text-red-500 ${className}`}>
      {error}
    </p>
  );
}