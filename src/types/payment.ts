export type PaymentPointOfInteractionTransactionData = {
  qr_code?: string;
  qr_code_base64?: string;
  ticket_url?: string;
};

export type PaymentPointOfInteraction = {
  transaction_data?: PaymentPointOfInteractionTransactionData;
};

export type LastPaymentSessionData = {
  id: string;
  status: string;
  payment_method_id?: string;
  point_of_interaction?: PaymentPointOfInteraction;
};
