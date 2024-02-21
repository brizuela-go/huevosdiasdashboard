/** @format */
"use client";

import PageTitle from "@/components/PageTitle";
import Image from "next/image";
import { DollarSign, Users, CreditCard, Activity } from "lucide-react";
import Card, { CardContent, CardProps } from "@/components/Card";
import BarChart from "@/components/BarChart";
import SalesCard, { SalesProps } from "@/components/SalesCard";

import { use, useEffect, useState } from "react";

import { db } from "@/lib/client";
import { collection, getDocs } from "firebase/firestore";

export default function Home() {
  const [totalRevenue, setTotalRevenue] = useState<number>(0);
  const [totalSales, setTotalSales] = useState<number>(0);
  const [totalActiveOrders, setTotalActiveOrders] = useState<number>(0);
  const [userSalesData, setUserSalesData] = useState<SalesProps[]>([]);

  useEffect(() => {
    const fetchTotalRevenue = async () => {
      const querySnapshot = await getDocs(collection(db, "orders"));
      let total = 0;
      querySnapshot.forEach((doc) => {
        if (doc.data().isActive) {
          return;
        }
        total += doc.data().total;
      });
      setTotalRevenue(total);
    };
    fetchTotalRevenue();
  }, []);

  useEffect(() => {
    const fetchTotalSales = async () => {
      const querySnapshot = await getDocs(collection(db, "orders"));
      let total = 0;
      // get length
      querySnapshot.forEach((doc) => {
        if (doc.data().isActive) {
          return;
        }
        total += 1;
      });
      setTotalSales(total);
    };
    fetchTotalSales();
  }, []);

  useEffect(() => {
    const fetchTotalActiveOrders = async () => {
      const querySnapshot = await getDocs(collection(db, "orders"));
      let total = 0;
      querySnapshot.forEach((doc) => {
        if (doc.data().isActive) {
          total += 1;
        }
      });
      setTotalActiveOrders(total);
    };
    fetchTotalActiveOrders();
  }, []);

  const cardData: CardProps[] = [
    {
      label: "Ingresos Totales",
      amount: `$${totalRevenue}`,
      icon: DollarSign,
    },
    {
      label: "Ventas",
      amount: `${totalSales}`,
      icon: CreditCard,
    },
    {
      label: "Pedidos Activos",
      amount: `${totalActiveOrders}`,
      icon: Activity,
    },
  ];

  useEffect(() => {
    const fetchUserSalesData = async () => {
      const querySnapshot = await getDocs(collection(db, "orders"));
      let data: SalesProps[] = [];
      // get the last 7 sales
      querySnapshot.forEach((doc) => {
        if (data.length < 6) {
          if (doc.data().isActive) {
            return;
          }
          data.push({
            name: doc.data().waiter,
            saleAmount: `$${doc.data().total}`,
          });
        }
      });
      setUserSalesData(data);
    };
    fetchUserSalesData();
  }, []);

  return (
    <div className="flex flex-col gap-5  w-full">
      <PageTitle title="Panel de Control" />
      <section className="grid w-full grid-cols-1 gap-4 gap-x-8 transition-all sm:grid-cols-2 xl:grid-cols-4">
        {cardData.map((d, i) => (
          <Card key={i} amount={d.amount} icon={d.icon} label={d.label} />
        ))}
      </section>
      <section className="grid grid-cols-1  gap-4 transition-all lg:grid-cols-2">
        <CardContent>
          <p className="p-4 font-semibold">Overview</p>

          <BarChart />
        </CardContent>
        <CardContent className="flex justify-between gap-4">
          <section>
            <p>Ventas Recientes</p>
          </section>
          {userSalesData.map((d, i) => (
            <SalesCard key={i} name={d.name} saleAmount={d.saleAmount} />
          ))}
        </CardContent>

        {/*  */}
      </section>
    </div>
  );
}
