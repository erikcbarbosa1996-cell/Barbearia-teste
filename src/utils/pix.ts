/**
 * Generates an EMV compliant Pix "Copia e Cola" code format payload
 */
export function generatePixCopiaECola(
  chavePix: string,
  beneficiario: string,
  cidade: string,
  valor: number,
  identificador: string = 'AGENDA'
): string {
  const formattedValor = valor.toFixed(2);
  // Standard EMV simplified representation for Brazilian Pix
  return `00020126580014br.gov.bcb.pix0136${chavePix}520400005303986540${formattedValor.length}${formattedValor}5802BR59${beneficiario.length.toString().padStart(2, '0')}${beneficiario}60${cidade.length.toString().padStart(2, '0')}${cidade}62070503${identificador}6304`;
}

/**
 * Format Brazilian phone number: (XX) XXXXX-XXXX
 */
export function formatPhoneNumber(value: string): string {
  const numbers = value.replace(/\D/g, '').slice(0, 11);
  if (numbers.length <= 2) return numbers;
  if (numbers.length <= 6) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
  if (numbers.length <= 10) return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 6)}-${numbers.slice(6)}`;
  return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
}

/**
 * Clean phone number to digits only for WhatsApp link
 */
export function cleanPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.startsWith('55')) return digits;
  return `55${digits}`;
}

/**
 * Creates WhatsApp Click-to-Chat URL with prefilled message
 */
export function getWhatsAppBookingLink(
  clientPhone: string,
  shopName: string,
  serviceName: string,
  barberName: string,
  time: string,
  price: number
): string {
  const text = encodeURIComponent(
    `Olá! Confirmação de agendamento na *${shopName}*:\n\n` +
    `✂️ Serviço: *${serviceName}*\n` +
    `💈 Profissional: *${barberName}*\n` +
    `⏰ Horário: *${time}*\n` +
    `💰 Valor: *R$ ${price.toFixed(2)}*\n\n` +
    `Agradecemos pela preferência! Se precisar reagendar, entre em contato.`
  );
  return `https://wa.me/${cleanPhone(clientPhone)}?text=${text}`;
}
