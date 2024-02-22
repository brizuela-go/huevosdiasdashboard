import { DataTable } from "@/components/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import React from "react";
import PageTitle from "@/components/PageTitle";

import { db } from "@/lib/client";
import { getDocs, collection } from "firebase/firestore";

type Props = {};
type Payment = {
  Categoría: string;
};

const columns: ColumnDef<Payment>[] = [
  {
    accessorKey: "Nombre de la Categoría",
    header: "Nombre de la Categoría",
  },
];

export default async function UsersPage({}: Props) {
  const data: Payment[] = [];

  const querySnapshot = await getDocs(collection(db, "categories"));

  querySnapshot.forEach((doc) => {
    data.push(doc.data() as Payment);
  });

  return (
    <div className="flex flex-col gap-5  w-full">
      <PageTitle title="Categorías de Platillos" />
      <DataTable columns={columns} data={data} />
    </div>
  );
}
