import type { Idioma } from "../idioma";

/** Los programas de ejemplo del editor. Cada uno enseña algo distinto. */
export type Ejemplo = { id: string; nombre: Record<Idioma, string>; entradas: string; fuente: string };

export const EJEMPLOS: Ejemplo[] = [
  {
    id: "hola",
    nombre: { es: "Lo mínimo", en: "The basics" },
    entradas: "",
    fuente: `programa
  ent @a;
  ent @b;

  @a = 7;
  @b = 6;
  imp @a * @b;
`,
  },
  {
    id: "tabla",
    nombre: { es: "Tabla de multiplicar", en: "Times table" },
    entradas: "7",
    fuente: `programa
  // Lee un número y escribe su tabla. El dato entra por «Datos de lec».
  ent @n;
  ent @i;

  lec @n;
  @i = 1;
  mientras @i <= 10 hacer
  inicio
    imp @n * @i;
    @i = @i + 1;
  fin
`,
  },
  {
    id: "mayor",
    nombre: { es: "El mayor de dos", en: "Larger of two" },
    entradas: "14\n23",
    fuente: `programa
  ent @a;
  ent @b;

  lec @a;
  lec @b;

  si @a > @b inicio
    imp @a;
  fin sino inicio
    imp @b;
  fin endif
`,
  },
  {
    id: "factorial",
    nombre: { es: "Factorial", en: "Factorial" },
    entradas: "6",
    fuente: `programa
  ent @n;
  ent @resultado;

  lec @n;
  @resultado = 1;

  mientras @n > 1 hacer
  inicio
    @resultado = @resultado * @n;
    @n = @n - 1;
  fin

  imp @resultado;
`,
  },
  {
    id: "decimales",
    nombre: { es: "Decimales y caracteres", en: "Decimals and chars" },
    entradas: "",
    fuente: `programa
  dec @precio;
  dec @iva;
  cart @moneda;

  @moneda = 'M';
  @precio = 149.90;
  @iva = @precio * 0.16;

  imp @moneda;
  imp @precio + @iva;
`,
  },
  {
    id: "error",
    nombre: { es: "Un programa con error", en: "A program with an error" },
    entradas: "",
    fuente: `programa
  ent @a;

  @a = 3;
  @b = @a + 1;   // @b nunca se declaró: el semántico lo caza
  imp @b;
`,
  },
];
