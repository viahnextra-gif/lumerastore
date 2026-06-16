/**
 * Melhor Envio — interface stub.
 *
 * Architecture is ready for Correios (PAC/SEDEX), Jadlog e Loggi.
 * Real integration requires the `MELHOR_ENVIO_TOKEN` secret and
 * an edge function (`melhor-envio-quote`) that proxies to:
 *   https://api.melhorenvio.com.br/v2/me/shipment/calculate
 *
 * Until the secret is configured, `quoteShipping()` returns a mocked
 * fallback so the checkout still renders end-to-end.
 */

export type CarrierName = 'correios-pac' | 'correios-sedex' | 'jadlog' | 'loggi';

export interface ShippingPackage {
  weight: number; // kg
  height: number; // cm
  width: number;
  length: number;
  insurance_value?: number; // BRL
}

export interface ShippingQuoteInput {
  from_postal_code: string; // origem (loja)
  to_postal_code: string;   // destino (cliente)
  packages: ShippingPackage[];
}

export interface ShippingOption {
  carrier: CarrierName;
  service_name: string;
  price: number;         // BRL
  delivery_days: number; // estimate
}

import { supabase } from '@/integrations/supabase/client';

const CEP_REGEX = /^\d{5}-?\d{3}$/;

export function normalizeCep(cep: string): string {
  return cep.replace(/\D/g, '').padStart(8, '0').slice(0, 8);
}

export function isValidCep(cep: string): boolean {
  return CEP_REGEX.test(cep.trim());
}

export async function lookupCep(cep: string): Promise<{
  cep: string; logradouro: string; bairro: string; localidade: string; uf: string;
} | null> {
  const clean = normalizeCep(cep);
  if (clean.length !== 8) return null;
  try {
    const res = await fetch(`https://viacep.com.br/ws/${clean}/json/`);
    if (!res.ok) return null;
    const data = await res.json();
    if (data?.erro) return null;
    return data;
  } catch {
    return null;
  }
}

export async function quoteShipping(input: ShippingQuoteInput): Promise<ShippingOption[]> {
  try {
    const { data, error } = await supabase.functions.invoke('melhor-envio-quote', { body: input });
    if (error) throw error;
    if (Array.isArray(data) && data.length > 0) return data as ShippingOption[];
  } catch (err) {
    console.warn('[melhorEnvio] falling back to mock quotes:', err);
  }
  // Fallback estático até a edge function/secret estarem configurados.
  return [
    { carrier: 'correios-pac', service_name: 'PAC', price: 24.9, delivery_days: 7 },
    { carrier: 'correios-sedex', service_name: 'SEDEX', price: 39.9, delivery_days: 3 },
    { carrier: 'jadlog', service_name: 'Jadlog Package', price: 29.9, delivery_days: 5 },
  ];
}
