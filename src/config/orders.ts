export const orderStatusLabels = {
  PENDING: "Aguardando confirmação",
  CONFIRMED: "Confirmado",
  PREPARING: "Em preparação",
  READY_FOR_PICKUP: "Pronto para retirada",
  COMPLETED: "Concluído",
  CANCELLED: "Cancelado",
} as const;

export type OrderStatusValue = keyof typeof orderStatusLabels;
export const orderStatusList = Object.keys(orderStatusLabels) as OrderStatusValue[];

export const orderStatusTone: Record<OrderStatusValue, "gold" | "neutral" | "danger" | "muted"> = {
  PENDING: "neutral",
  CONFIRMED: "gold",
  PREPARING: "gold",
  READY_FOR_PICKUP: "gold",
  COMPLETED: "muted",
  CANCELLED: "danger",
};

/** Transições permitidas. Concluído e Cancelado são finais. */
export const orderTransitions: Record<OrderStatusValue, OrderStatusValue[]> = {
  PENDING: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["PREPARING", "CANCELLED"],
  PREPARING: ["READY_FOR_PICKUP", "CANCELLED"],
  READY_FOR_PICKUP: ["COMPLETED", "CANCELLED"],
  COMPLETED: [],
  CANCELLED: [],
};
