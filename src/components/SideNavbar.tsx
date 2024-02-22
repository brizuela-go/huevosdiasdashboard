/** @format */
"use client";

import { use, useEffect, useState } from "react";
import { Nav } from "./ui/nav";

type Props = {};

import {
  ShoppingCart,
  LayoutDashboard,
  UsersRound,
  CookingPot,
  Table,
  ChevronRight,
  Layers3,
} from "lucide-react";
import { Button } from "./ui/button";

import { useWindowWidth } from "@react-hook/window-size";
import { usePathname } from "next/navigation";

export default function SideNavbar({}: Props) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  const pathname = usePathname();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const onlyWidth = useWindowWidth();
  const mobileWidth = onlyWidth < 768;

  function toggleSidebar() {
    setIsCollapsed(!isCollapsed);
  }

  return (
    <>
      {isMounted && (
        <div
          className={`relative min-w-[80px] border-r px-3  pb-10 pt-24 ${
            pathname === "/sign-in" && "hidden"
          } ${pathname === "/sign-up" && "hidden"} `}
        >
          {!mobileWidth && (
            <div className="absolute right-[-20px] top-7">
              <Button
                onClick={toggleSidebar}
                variant="secondary"
                className=" rounded-full p-2"
              >
                <ChevronRight />
              </Button>
            </div>
          )}
          <Nav
            isCollapsed={mobileWidth ? true : isCollapsed}
            links={[
              {
                title: "Panel de control",
                href: "/",
                icon: LayoutDashboard,
                variant: "default",
              },
              {
                title: "Meseros",
                href: "/waiters",
                icon: UsersRound,
                variant: "ghost",
              },
              {
                title: "Mesas",
                href: "/tables",
                icon: Table,
                variant: "ghost",
              },
              {
                title: "Categorías",
                href: "/categories",
                icon: Layers3,
                variant: "ghost",
              },
              {
                title: "Platillos",
                href: "/items",
                icon: CookingPot,
                variant: "ghost",
              },
              {
                title: "Órdenes",
                href: "/orders",
                icon: ShoppingCart,
                variant: "ghost",
              },
            ]}
          />
        </div>
      )}
    </>
  );
}
