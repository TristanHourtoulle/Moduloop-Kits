import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useZodForm<T extends z.ZodType<any>>(
  schema: T,
  options?: Parameters<typeof useForm<z.infer<T>>>[0]
) {
  return useForm<z.infer<T>>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(schema as any) as any,
    ...options,
  });
}
