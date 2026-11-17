export const movementLabels: Record<string, string> = {
  INITIAL: "Estoque inicial",
  ENTRY: "Entrada",
  EXIT: "Saída",
  ADJUSTMENT: "Ajuste",
  SALE: "Venda",
  RETURN: "Devolução",
  CANCELLATION: "Cancelamento",
};

export const manualMovementTypes = [
  { value: "ENTRY", label: "Entrada", hint: "Soma ao estoque" },
  { value: "EXIT", label: "Saída", hint: "Subtrai do estoque" },
  { value: "ADJUSTMENT", label: "Ajuste", hint: "Define o saldo correto" },
] as const;
