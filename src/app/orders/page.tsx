"use client";

import { DataTable } from "@/components/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import React, { use, useEffect, useState } from "react";
import PageTitle from "@/components/PageTitle";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DialogTrigger } from "@radix-ui/react-dialog";
import { Button } from "@/components/ui/button";

import { db } from "@/lib/client";
import { collection, onSnapshot } from "firebase/firestore";

type Props = {};
type Payment = {
  id: string;
  table: string;
  waiter: string;
  items: string[];
  orderedAt: string;
  method: string;
  total: string;
  isActive: boolean;
};

const columns: ColumnDef<Payment>[] = [
  {
    accessorKey: "id",
    header: "Número de orden",
  },
  {
    accessorKey: "table",
    header: "Mesa",
  },
  {
    accessorKey: "waiter",
    header: "Tomado por el mesero",
  },
  {
    accessorKey: "items",
    header: "Platillos",
    cell: ({ row }) => {
      return (
        <div className="flex gap-2 items-center">
          <Dialog>
            <DialogTrigger>
              <Button variant="outline" className="text-xs">
                Ver
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Estos platillos se pidieron</DialogTitle>
                <DialogDescription>
                  <ul>
                    {Object.entries(
                      row.getValue("items") as Record<string, number>
                    ).map(([item, quantity], index) => (
                      <li key={index}>{`${item} x${quantity}`}</li>
                    ))}
                  </ul>
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>{/* get notes from the order */}</DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      );
    },
  },
  {
    accessorKey: "notes",
    header: "Notas",
    cell: ({ row }) => {
      return (
        <div className="flex gap-2 items-center">
          <Dialog>
            <DialogTrigger>
              <Button variant="outline" className="text-xs">
                Ver
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Notas</DialogTitle>
                <DialogDescription>
                  <p>{row.getValue("notes")}</p>
                </DialogDescription>
              </DialogHeader>
            </DialogContent>
          </Dialog>
        </div>
      );
    },
  },
  {
    accessorKey: "orderedAt",
    header: "Pedido el",
  },
  {
    accessorKey: "paymentMethod",
    header: "Método de pago",
  },
  {
    accessorKey: "total",
    header: "Total",
    cell: ({ row }) => {
      return <p>{`$${row.getValue("total")}`}</p>;
    },
  },
  {
    accessorKey: "isActive",
    header: "Estado",
    cell: ({ row }) => {
      return (
        <p
          className={`${
            row.getValue("isActive") ? "text-red-500" : "text-green-500"
          }`}
        >
          {row.getValue("isActive") ? "Pendiente" : "Pagado"}
        </p>
      );
    },
  },
];

export default function OrdersPage({}: Props) {
  const [data, setData] = useState<Payment[]>([]);

  useEffect(() => {
    onSnapshot(collection(db, "orders"), (snapshot) => {
      const data: Payment[] = [];
      snapshot.forEach((doc) => {
        data.push(doc.data() as Payment);
      });
      // sort data by number of order
      data.sort((a, b) => {
        return parseInt(b.id) - parseInt(a.id);
      });
      setData(data);
    });
  }, []);

  return (
    <div className="flex flex-col gap-5  w-full">
      <PageTitle title="Órdenes" />
      <DataTable columns={columns} data={data} />
    </div>
  );
}
