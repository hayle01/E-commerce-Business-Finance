import { getSale } from "@/lib/services/sales";
import { notFound } from "next/navigation";
import { SaleEditForm } from "@/components/forms/sale-edit-form";
import { getSessionUser } from "@/lib/api";

export default async function EditSalePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = (await getSessionUser())!;
  const sale = await getSale(user.id, id);
  if (!sale) notFound();
  return (
    <main className="p-4 md:p-6">
      <h1 className="mb-4 text-xl font-semibold">Edit {sale.orderNumber}</h1>
      <SaleEditForm
        saleId={sale.id}
        status={sale.status}
        saleDate={sale.saleDate.toISOString().slice(0, 10)}
        deliveryCharge={sale.deliveryCharge ? sale.deliveryCharge.toString() : ""}
        notes={sale.notes ?? ""}
      />
    </main>
  );
}
