"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

/**
 * Recarga los datos del panel cada minuto mientras la pestaña esté a la
 * vista. Sin esto, dejar el panel abierto enseña la foto del momento en que
 * se abrió, que es justo lo que confunde cuando estás esperando a ver si
 * alguien jugó.
 *
 * Se para al ocultar la pestaña: nadie necesita refrescar un panel que no
 * está mirando, y cada refresco cruza y consulta la base.
 */
export function Refrescar({ segundos = 60 }: { segundos?: number }) {
  const router = useRouter();
  useEffect(() => {
    const id = setInterval(() => {
      if (document.visibilityState === "visible") router.refresh();
    }, segundos * 1000);
    return () => clearInterval(id);
  }, [router, segundos]);
  return null;
}
