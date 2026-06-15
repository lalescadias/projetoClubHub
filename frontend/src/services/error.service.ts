import axios from "axios";
import type { ApiErrorResponse } from "../types/api";

export function getErrorMessage(error: unknown) {
  if (axios.isAxiosError<ApiErrorResponse>(error)) {
    return error.response?.data?.message ?? "Não foi possível contactar o servidor.";
  }

  return error instanceof Error ? error.message : "Ocorreu um erro inesperado.";
}
