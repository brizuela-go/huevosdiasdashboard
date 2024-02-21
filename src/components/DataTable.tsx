/** @format */

"use client";

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "./ui/button";

import { db } from "@/lib/client";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
} from "firebase/firestore";

import { storage } from "@/lib/client";
import { getDownloadURL, ref, uploadBytes, getBlob } from "firebase/storage";

import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";
import { Input } from "./ui/input";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

export function DataTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const pathname = usePathname();
  const router = useRouter();

  // depending on the pathname, we can add different logic
  const collectionReference =
    pathname === "/waiters"
      ? "waiters"
      : pathname === "/tables"
      ? "tables"
      : "items";

  const add = async (data: any) => {
    try {
      console.log(data);
      await addDoc(collection(db, collectionReference), data);
    } catch (e) {
      console.error(e);
    }
  };

  const removeDocument = async (object: any) => {
    console.log(object);

    const collectionRef = collection(db, collectionReference);
    const querySnapshot = await getDocs(collectionRef);
    let id: string = "";

    querySnapshot.forEach((doc) => {
      if (JSON.stringify(doc.data()) === JSON.stringify(object)) {
        id = doc.id;
      }
    });

    console.log(id);

    if (id) {
      try {
        await deleteDoc(doc(db, collectionReference, id)); // Correct use of deleteDoc
        // Assuming you're using Next.js' router to refresh the page
        router.refresh();
      } catch (e) {
        console.error(e);
      }
    } else {
      console.log("Document not found or already deleted");
    }
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    await add(formData);
    router.refresh();
  };

  const inputs = columns.map((column) => {
    return {
      id: column.id,
      type: column.header === "Imágen" ? "file" : "text",
      placeholder: column.header,
      accept: "image/*",
    };
  });

  const [formData, setFormData] = useState({});

  const handleInputChange = (e: any) => {
    // set the key and value of the input to the formData
    setFormData({ ...formData, [e.target.name]: e.target.value });

    // if the input is a file, we need to upload it to firebase storage
    if (e.target.type === "file") {
      const file = e.target.files[0];
      const storageRef = ref(storage, `images/${file.name}`);
      uploadBytes(storageRef, file).then((snapshot) => {
        console.log("Uploaded a blob or file!", snapshot);
      });
    }

    // if the input is a file, we need to get the download url
    if (e.target.type === "file") {
      const file = e.target.files[0];
      const storageRef = ref(storage, `images/${file.name}`);
      getDownloadURL(storageRef).then((url) => {
        console.log(url);
        setFormData({ ...formData, [e.target.name]: url });
      });
    }
  };

  return (
    <div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <>
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    </>
                  ))}
                  <TableCell
                    className={`${pathname === "/orders" && "hidden"}`}
                  >
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        removeDocument(row.original as Object);
                      }}
                    >
                      Eliminar
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  Sin resultados
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Anterior
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Siguiente
        </Button>
      </div>
      <Sheet>
        <SheetTrigger
          className={`fixed bottom-4 right-4 ${
            pathname === "/orders" && "hidden"
          }`}
          asChild
        >
          <Button>Añadir</Button>
        </SheetTrigger>
        <SheetContent>
          <form onSubmit={handleSubmit}>
            <SheetHeader>
              <SheetTitle>Añadir</SheetTitle>
              <SheetDescription>
                Agrega un nuevo registro a la tabla
              </SheetDescription>
            </SheetHeader>
            <div className="grid gap-4 py-4">
              {inputs.map((input) => (
                <Input
                  key={input.id}
                  id={input.id}
                  name={input.placeholder as any}
                  type={input.type}
                  placeholder={input.placeholder as any}
                  onChange={handleInputChange}
                  className="col-span-3"
                  accept={input.accept}
                />
              ))}
            </div>
            <SheetFooter>
              <SheetClose asChild>
                <Button onClick={handleSubmit} type="submit">
                  Añadir
                </Button>
              </SheetClose>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  );
}
