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
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

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
      : pathname === "/categories"
      ? "categories"
      : "items";

  const add = async (data: any) => {
    try {
      await addDoc(collection(db, collectionReference), data);
    } catch (e) {}
  };

  const removeDocument = async (object: any) => {
    const collectionRef = collection(db, collectionReference);
    const querySnapshot = await getDocs(collectionRef);
    let id = "";

    querySnapshot.forEach((doc) => {
      if (doc.data().uniqueId === object.uniqueId) {
        id = doc.id;
      }
    });

    if (id) {
      try {
        await deleteDoc(doc(db, collectionReference, id));
        toast.success("Registro eliminado");
        router.refresh();
      } catch (e) {
        console.error("Error al eliminar el registro", e);
        toast.error("Error al eliminar el registro");
      }
    } else {
      console.error("No se encontró el registro para eliminar");
      toast.error("Error al eliminar el registro. Intente de nuevo.");
    }
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    await add(formData);
    router.refresh();
    setFormData({});
    setImagePreviewUrl("");
  };

  const inputs = columns.map((column) => {
    return {
      id: column.id,
      type:
        column.header === "Imágen"
          ? "file"
          : column.header === "Precio"
          ? "number"
          : column.header === "Número de mesa"
          ? "number"
          : column.header === "Categoría"
          ? "selector"
          : column.header === "Descripción"
          ? "textarea"
          : "text",
      placeholder: column.header,
      accept: "image/*",
    };
  });

  const [formData, setFormData] = useState({});
  const [imagePreviewUrl, setImagePreviewUrl] = useState("");

  const handleInputChange = (e: any) => {
    // set the key and value of the input to the formData
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
      uniqueId: Math.random().toString(36).substr(2, 9),
    });

    // if the input is a file, we need to upload it and then get the download url
    if (e.target.type === "file") {
      const file = e.target.files[0];
      const storageRef = ref(storage, `images/${file.name}`);

      // First, upload the file
      uploadBytes(storageRef, file)
        .then((snapshot) => {
          // After the file is uploaded, get the download URL
          return getDownloadURL(storageRef);
        })
        .then((url) => {
          // Update formData with the file's download URL
          setFormData({ ...formData, [e.target.name]: url });
          setImagePreviewUrl(url);
        })
        .catch((error) => {
          // Handle any errors here
          console.error("Error uploading file and getting URL", error);
        });
    }
  };

  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      const querySnapshot = await getDocs(collection(db, "categories"));
      const categories: any[] = [];
      querySnapshot.forEach((doc) => {
        categories.push(doc.data());
      });
      setCategories(categories as any);
    };
    fetchCategories();
  }, []);

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
                <div key={input.id}>
                  {input.type !== "selector" && input.type !== "textarea" && (
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
                  )}
                  {input.type === "textarea" && (
                    <textarea
                      key={input.id}
                      name={input.placeholder as any}
                      onChange={handleInputChange}
                      placeholder="Descripción del platillo"
                      className="col-span-3 p-2 rounded-md border w-full"
                    ></textarea>
                  )}
                  {input.type === "selector" && (
                    <select
                      name={input.placeholder as any}
                      onChange={handleInputChange}
                      className="col-span-3 p-2 rounded-md border w-full"
                    >
                      <option value="">Selecciona una categoría</option>
                      {categories.map((category: any) => (
                        <option
                          key={input.id}
                          value={category["Nombre de la Categoría"]}
                        >
                          {category["Nombre de la Categoría"]}
                        </option>
                      ))}
                    </select>
                  )}
                  {input.type === "file" && imagePreviewUrl && (
                    <img src={imagePreviewUrl} alt="Preview" className="mt-2" />
                  )}
                </div>
              ))}
            </div>
            <SheetFooter>
              <SheetClose asChild>
                <Button type="submit">Añadir</Button>
              </SheetClose>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  );
}
