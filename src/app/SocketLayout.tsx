"use client";

import { useAtom } from "jotai";

import { onlineCountAtom } from "@/lib/store";
import { useEffect } from "react";
import { socket } from "@/config/socket";

export default function SocketLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [, setOnlineCount] = useAtom(onlineCountAtom);

  useEffect(() => {
    socket.on("online-count", (count: number) => {
      setOnlineCount(count);
    });

    socket.connect();
    return () => {
      socket.off("online-count");
      socket.disconnect();
    };
  }, [setOnlineCount]);

  return <>{children}</>;
}
