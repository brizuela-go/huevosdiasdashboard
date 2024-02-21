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

import { db } from "@/lib/client";
import { getDocs, collection } from "firebase/firestore";

type Props = {};
type Payment = {
  name: string;
};

const columns: ColumnDef<Payment>[] = [
  {
    accessorKey: "Nombre",
    header: "Nombre",
    cell: ({ row }) => {
      return (
        <div className="flex gap-2 items-center">
          <img
            className="h-10 w-10"
            src={`https://api.dicebear.com/7.x/lorelei/svg?seed=${row.getValue(
              "Nombre"
            )}`}
            alt="user-image"
          />
          <p>{row.getValue("Nombre")} </p>
        </div>
      );
    },
  },
];

export default async function UsersPage({}: Props) {
  const data: Payment[] = [];
  const querySnapshot = await getDocs(collection(db, "waiters"));

  querySnapshot.forEach((doc) => {
    data.push(doc.data() as Payment);
  });

  return (
    <div className="flex flex-col gap-5  w-full">
      <PageTitle title="Meseros" />
      <DataTable columns={columns} data={data} />
    </div>
  );
}
