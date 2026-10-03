import { SupplierForm } from "@/components/forms/supplier-form";

export default function NewSupplierPage() {
  return (
    <main className="p-4 md:p-6">
      <h1 className="mb-4 text-xl font-semibold">New supplier</h1>
      <SupplierForm />
    </main>
  );
}
