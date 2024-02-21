/**
 * eslint-disable @next/next/no-img-element
 *
 * @format
 */

/** @format */
"use client";

import { DataTable } from "@/components/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import React from "react";
import PageTitle from "@/components/PageTitle";
import { CookingPotIcon } from "lucide-react";

import { db } from "@/lib/client";
import { getDocs, collection } from "firebase/firestore";

type Props = {};
type Payment = {
  name: string;
  price: string;
};

const columns: ColumnDef<Payment>[] = [
  {
    accessorKey: "Nombre del Platillo",
    header: "Nombre del Platillo",
    cell: ({ row }) => {
      return (
        <div className="flex gap-2 items-center">
          <CookingPotIcon className="h-4 w-4" />
          <p>{row.getValue("Nombre del Platillo")} </p>
        </div>
      );
    },
  },
  {
    accessorKey: "Imágen",
    header: "Imágen",
    cell: ({ row }) => {
      return (
        <img
          src={row.getValue("Imágen")}
          alt={row.getValue("Nombre del Platillo")}
          className="rounded-md object-cover h-24 w-24"
        />
      );
    },
  },
  {
    accessorKey: "Precio",
    header: "Precio",
    cell: ({ row }) => {
      return <p>${row.getValue("Precio")}</p>;
    },
  },
];

export default async function UsersPage({}: Props) {
  const data: Payment[] = [];
  const querySnapshot = await getDocs(collection(db, "items"));

  querySnapshot.forEach((doc) => {
    data.push(doc.data() as Payment);
  });

  return (
    <div className="flex flex-col gap-5  w-full">
      <PageTitle title="Platillos" />
      <DataTable columns={columns} data={data} />
    </div>
  );
}
