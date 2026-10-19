export type FormState = {
  ok?: boolean;
  message?: string;
  error?: string;
  fieldErrors?: Record<string, string[] | undefined>;
};

export type StudentDTO = {
  id: number;
  nombres: string;
  apellidos: string;
  edad: number;
  sexo: string;
  condicion: string;
  activo: boolean;
};
