import { notFound } from "next/navigation";

/**
 * Todo lo que no sea una página conocida acaba aquí y se resuelve como 404
 * dentro del layout del idioma (así el "no encontrado" sale traducido y con
 * cabecera). Con `dynamicParams = false` en el layout, un idioma desconocido
 * ni siquiera llega: el proxy lo reescribe a `/es/...` y cae aquí.
 */
export function generateStaticParams() {
  return [];
}

export default function NoExiste() {
  notFound();
}
