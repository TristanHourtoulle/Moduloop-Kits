"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Schéma Zod simple pour test
const testSchema = z.object({
  nom: z.string().min(1, "Le nom est requis"),
  price: z.number().min(0, "Le prix doit être positif"),
});

type TestFormData = z.infer<typeof testSchema>;

export function SimpleFormTest() {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isValid, isDirty },
    getValues,
  } = useForm<TestFormData>({
    resolver: zodResolver(testSchema),
    defaultValues: {
      nom: "",
      price: 0,
    },
    mode: "onChange",
  });

  const watchedValues = watch();

  const onSubmit = (data: TestFormData) => {
    console.log("✅ Form submitted successfully:", data);
    alert("Form valid! Check console for data.");
  };

  const onError = (errors: any) => {
    console.log("❌ Form errors:", errors);
  };

  console.log("🔍 Form Debug Info:", {
    errors,
    isValid,
    isDirty,
    watchedValues,
    allValues: getValues(),
  });

  return (
    <div className="max-w-md mx-auto p-6 bg-white border rounded-lg shadow">
      <h2 className="text-lg font-bold mb-4">Test Formulaire Zod + RHF</h2>
      
      <form onSubmit={handleSubmit(onSubmit, onError)} className="space-y-4">
        <div>
          <Label htmlFor="nom">Nom *</Label>
          <Input
            id="nom"
            {...register("nom")}
            placeholder="Entrez un nom"
            className={errors.nom ? "border-red-500" : ""}
          />
          {errors.nom && (
            <p className="text-sm text-red-500 mt-1">{errors.nom.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="price">Prix *</Label>
          <Input
            id="price"
            type="number"
            step="0.01"
            {...register("price", { valueAsNumber: true })}
            placeholder="0.00"
            className={errors.price ? "border-red-500" : ""}
          />
          {errors.price && (
            <p className="text-sm text-red-500 mt-1">{errors.price.message}</p>
          )}
        </div>

        <div className="pt-4">
          <Button type="submit" className="w-full">
            Soumettre
          </Button>
        </div>

        <div className="p-3 bg-gray-100 rounded text-xs">
          <strong>Debug:</strong>
          <pre>{JSON.stringify({ errors, isValid, watchedValues }, null, 2)}</pre>
        </div>
      </form>
    </div>
  );
}