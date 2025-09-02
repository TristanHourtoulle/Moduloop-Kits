import { SimpleFormTest } from "@/components/debug/simple-form-test";

export default function TestFormPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold text-center mb-8">Test Form Debug</h1>
      <SimpleFormTest />
    </div>
  );
}