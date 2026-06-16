/**
 * Mercado Pago — interface stub.
 *
 * Architecture is ready for PIX, Cartão de Crédito e Boleto.
 * Real integration requires the `MERCADO_PAGO_ACCESS_TOKEN` secret and
 * an edge function (`create-payment`) that proxies to the MP API:
 *   https://api.mercadopago.com/v1/payments
 *
 * Front-end calls `createPayment()` which invokes the edge function.
 * The edge function builds the payload from this typed contract.
 */

export type MercadoPagoMethod = 'pix' | 'credit_card' | 'boleto';

export interface MercadoPagoPayer {
  email: string;
  first_name: string;
  last_name?: string;
  identification: { type: 'CPF'; number: string };
}

export interface MercadoPagoCreatePaymentInput {
  method: MercadoPagoMethod;
  amount: number; // BRL, decimal (e.g. 199.90)
  description: string;
  external_reference: string; // our order_number
  payer: MercadoPagoPayer;
  // Cartão only
  card_token?: string;
  installments?: number;
}

export interface MercadoPagoPaymentResult {
  id: string;
  status: 'pending' | 'approved' | 'in_process' | 'rejected' | 'refunded' | 'cancelled';
  status_detail?: string;
  // PIX
  qr_code?: string;
  qr_code_base64?: string;
  // Boleto
  boleto_url?: string;
  boleto_barcode?: string;
}

import { supabase } from '@/integrations/supabase/client';

export async function createPayment(input: MercadoPagoCreatePaymentInput): Promise<MercadoPagoPaymentResult> {
  const { data, error } = await supabase.functions.invoke('create-payment', { body: input });
  if (error) throw error;
  return data as MercadoPagoPaymentResult;
}
