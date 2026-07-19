import { CartItem } from '../types';

/**
 * Formats a number to Nigerian Naira ₦
 */
export const formatNairaValue = (amount: number) => {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0
  }).format(amount);
};

interface CompileCheckoutParams {
  cartItems: CartItem[];
  userEmail?: string;
  deliveryMethod?: 'delivery' | 'pickup';
  deliveryLocation?: string;
  deliveryAddress?: string;
}

/**
 * Compiles selected cart items into a highly formatted, polite WhatsApp inquiry block.
 * Encodes it as a URI and returns the direct WhatsApp URL.
 */
export function compileWhatsAppCheckoutUrl({ 
  cartItems, 
  userEmail,
  deliveryMethod = 'delivery',
  deliveryLocation = 'Lagos Island',
  deliveryAddress = ''
}: CompileCheckoutParams): string {
  const subtotal = cartItems.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const freeShippingThreshold = 150000;
  const isFreeShipping = deliveryMethod === 'pickup' || subtotal >= freeShippingThreshold;
  const deliveryCharge = isFreeShipping ? 0 : 5000;
  const grandTotal = subtotal + deliveryCharge;

  let message = `✦ DR BODYSHAPER BOUTIQUE LUXURY ORDER ✦\n`;
  message += `===================================\n\n`;
  message += `Hello Dr Bodyshaper Concierge,\n\n`;
  message += `I would like to place an order for the following luxury garments:\n\n`;

  cartItems.forEach((item, index) => {
    const itemSub = item.product.price * item.quantity;
    const primaryMedia = item.product.images?.[0] || '';
    message += `${index + 1}. ${item.product.name.toUpperCase()}\n`;
    message += `   • SKU: ${item.product.sku}\n`;
    message += `   • Selected Color: ${item.selectedColor}\n`;
    message += `   • Selected Size: ${item.selectedSize}\n`;
    message += `   • Quantity: ${item.quantity}\n`;
    message += `   • Unit Price: ${formatNairaValue(item.product.price)}\n`;
    message += `   • Item Subtotal: ${formatNairaValue(itemSub)}\n`;
    if (primaryMedia) {
      message += `   • Product Photo: ${primaryMedia}\n`;
    }
    message += `\n`;
  });

  message += `===================================\n`;
  message += `Order Subtotal: ${formatNairaValue(subtotal)}\n`;
  message += `Delivery Option: ${deliveryMethod === 'pickup' ? 'PICKUP IN SHOP (Complimentary)' : 'DELIVERY TO ADDRESS'}\n`;
  
  if (deliveryMethod === 'delivery') {
    message += `Delivery Region: ${deliveryLocation}\n`;
    message += `Delivery Address: ${deliveryAddress || 'No address specified'}\n`;
    message += `Delivery Fee: ${isFreeShipping ? 'FREE (COMPLIMENTARY PROMO)' : formatNairaValue(deliveryCharge)}\n`;
  } else {
    message += `Pickup Location: Dr Bodyshaper Flagship Store, Lagos, Nigeria\n`;
    message += `Delivery Fee: FREE (SHOP PICKUP)\n`;
  }
  
  message += `-----------------------------------\n`;
  message += `ESTIMATED GRAND TOTAL: ${formatNairaValue(grandTotal)}\n`;
  message += `===================================\n\n`;

  if (userEmail) {
    message += `Customer Email/Info: ${userEmail}\n`;
  }
  
  message += `Session Timestamp: ${new Date().toLocaleString('en-NG', { timeZone: 'Africa/Lagos' })} (Lagos Time)\n\n`;
  message += `Please confirm item availability, bespoke fitting options, and dispatch window. Thank you!`;

  const phone = '2348066398259'; // Brand Concierge number
  const encodedMessage = encodeURIComponent(message);
  
  return `https://wa.me/${phone}?text=${encodedMessage}`;
}
