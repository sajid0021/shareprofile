"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

import { getCurrentUser } from "@/features/auth/services/authApi";

const PUBLIC_ROUTES = new Set(["/login", "/register"]);

function isPublicRoute(pathname: string) {
  return PUBLIC_ROUTES.has(pathname) || pathname.startsWith("/public/");
}

export function AuthRouteGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    let active = true;

    const checkSession = async () => {
      const user = await getCurrentUser();

      if (!active) {
        return;
      }

      const isAuthenticated = Boolean(user);

      if (pathname === "/") {
        router.replace(isAuthenticated ? "/home" : "/login");
        return;
      }

      if (!isAuthenticated && !isPublicRoute(pathname)) {
        router.replace("/login");
        return;
      }

      if (isAuthenticated && PUBLIC_ROUTES.has(pathname)) {
        router.replace("/home");
        return;
      }

      setIsChecking(false);
    };

    checkSession();

    return () => {
      active = false;
    };
  }, [pathname, router]);

  if (isChecking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F3F2EF] text-sm font-medium text-[#666666]">
        Checking your session...
      </div>
    );
  }

  return <>{children}</>;
}
