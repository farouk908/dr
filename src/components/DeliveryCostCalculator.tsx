import React from 'react';
import { Truck, Store, Clock, Sparkles, MapPin, CheckCircle2 } from 'lucide-react';
import { 
  DELIVERY_ZONES, 
  FREE_DELIVERY_THRESHOLD, 
  getDeliveryZoneById, 
  calculateDeliveryFee 
} from '../lib/delivery';
import { formatNairaValue } from '../lib/checkout';

interface DeliveryCostCalculatorProps {
  subtotal: number;
  deliveryMethod: 'delivery' | 'pickup';
  onDeliveryMethodChange: (method: 'delivery' | 'pickup') => void;
  selectedZoneId: string;
  onZoneChange: (zoneId: string) => void;
  deliveryAddress: string;
  onDeliveryAddressChange: (address: string) => void;
}

export const DeliveryCostCalculator: React.FC<DeliveryCostCalculatorProps> = ({
  subtotal,
  deliveryMethod,
  onDeliveryMethodChange,
  selectedZoneId,
  onZoneChange,
  deliveryAddress,
  onDeliveryAddressChange
}) => {
  const currentZone = getDeliveryZoneById(selectedZoneId);
  const calculation = calculateDeliveryFee(deliveryMethod, selectedZoneId, subtotal);
  const grandTotal = subtotal + calculation.fee;
  const amountToFreeShipping = Math.max(0, FREE_DELIVERY_THRESHOLD - subtotal);
  const freeShippingProgress = Math.min(100, Math.round((subtotal / FREE_DELIVERY_THRESHOLD) * 100));

  return (
    <div className="space-y-4 border border-brand-blue-primary/15 bg-brand-cream/40 p-4 sm:p-5">
      {/* Header with Title and Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-brand-blue-primary/10">
        <div>
          <span className="font-mono text-[9px] uppercase tracking-wider text-brand-pink-deep font-bold flex items-center gap-1.5">
            <Truck className="w-3.5 h-3.5 text-brand-pink-primary" /> Delivery Cost Calculator
          </span>
          <h4 className="font-serif text-sm font-bold text-brand-blue-primary">
            Shipping & Dispatch Calculation
          </h4>
        </div>

        {/* Toggle Delivery vs Pickup */}
        <div className="grid grid-cols-2 gap-1.5 p-1 bg-white border border-brand-blue-primary/15 rounded-none self-start sm:self-auto">
          <button
            type="button"
            onClick={() => onDeliveryMethodChange('delivery')}
            className={`flex items-center justify-center gap-1.5 py-1.5 px-3 text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
              deliveryMethod === 'delivery'
                ? 'bg-brand-blue-primary text-white font-bold shadow-xs'
                : 'text-brand-blue-sky hover:text-brand-blue-primary'
            }`}
          >
            <Truck className="w-3 h-3" /> Delivery
          </button>
          <button
            type="button"
            onClick={() => onDeliveryMethodChange('pickup')}
            className={`flex items-center justify-center gap-1.5 py-1.5 px-3 text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
              deliveryMethod === 'pickup'
                ? 'bg-brand-blue-primary text-white font-bold shadow-xs'
                : 'text-brand-blue-sky hover:text-brand-blue-primary'
            }`}
          >
            <Store className="w-3 h-3" /> In-Store Pickup
          </button>
        </div>
      </div>

      {deliveryMethod === 'delivery' ? (
        <div className="space-y-4">
          {/* Free Shipping Progress Alert */}
          {calculation.isFreePromo ? (
            <div className="flex items-center gap-2 p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-bold">
              <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Complimentary Free Nationwide Delivery Unlocked (Order exceeds ₦150,000)!</span>
            </div>
          ) : (
            <div className="space-y-1.5 bg-white p-2.5 border border-brand-blue-primary/10">
              <div className="flex items-center justify-between text-[10px] font-mono">
                <span className="text-brand-blue-sky">Free Delivery Target (₦150,000):</span>
                <span className="font-bold text-brand-pink-deep">
                  Add {formatNairaValue(amountToFreeShipping)} more for FREE Delivery
                </span>
              </div>
              <div className="w-full bg-slate-100 h-1.5 overflow-hidden">
                <div 
                  className="bg-brand-pink-primary h-full transition-all duration-300"
                  style={{ width: `${freeShippingProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Region / Zone Selector */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-mono uppercase text-brand-blue-sky font-bold flex items-center justify-between">
              <span>Select Destination Region / State:</span>
              <span className="text-brand-blue-primary font-bold">
                Fee: {calculation.isFreePromo ? (
                  <span className="text-emerald-700 font-extrabold">FREE <span className="line-through text-slate-400 font-normal text-[9px]">{formatNairaValue(currentZone.fee)}</span></span>
                ) : (
                  formatNairaValue(currentZone.fee)
                )}
              </span>
            </label>

            <select
              value={selectedZoneId}
              onChange={(e) => onZoneChange(e.target.value)}
              className="w-full px-3 py-2 text-xs font-bold rounded-none border border-brand-blue-primary/20 bg-white focus:outline-hidden text-brand-blue-primary cursor-pointer shadow-2xs"
            >
              {DELIVERY_ZONES.map((zone) => (
                <option key={zone.id} value={zone.id}>
                  {zone.name} — {formatNairaValue(zone.fee)} ({zone.transitTime})
                </option>
              ))}
            </select>

            {/* Selected Zone Quick Details */}
            <div className="p-2.5 bg-white/80 border border-brand-blue-primary/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[10.5px]">
              <div className="space-y-0.5">
                <p className="font-bold text-brand-blue-primary">
                  Coverage: <span className="font-normal text-slate-600">{currentZone.coverage}</span>
                </p>
              </div>
              <div className="flex items-center gap-1.5 text-brand-pink-deep font-mono font-bold shrink-0">
                <Clock className="w-3.5 h-3.5 text-brand-pink-primary" />
                <span>Transit: {currentZone.transitTime}</span>
              </div>
            </div>
          </div>

          {/* Detailed Street Address Input */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-mono uppercase text-brand-blue-sky font-bold flex items-center justify-between">
              <span>Delivery Street Address *</span>
              <span className="text-[9px] text-brand-pink-deep lowercase font-normal">(Required for dispatch)</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. 15 Admiralty Way, Lekki Phase 1, Lagos"
              value={deliveryAddress}
              onChange={(e) => onDeliveryAddressChange(e.target.value)}
              className="w-full px-3 py-2 text-xs font-bold rounded-none border border-brand-blue-primary/20 bg-white focus:outline-hidden text-brand-blue-primary placeholder:text-slate-400 placeholder:font-normal"
            />
          </div>
        </div>
      ) : (
        /* In-Store Pickup Details */
        <div className="p-3.5 bg-white border border-brand-pink-medium/30 flex items-start gap-3">
          <MapPin className="w-4 h-4 text-brand-pink-primary shrink-0 mt-0.5" />
          <div className="space-y-1 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-bold uppercase tracking-wider text-[10px] text-brand-pink-deep">
                Complimentary Store Pickup
              </span>
              <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-800 text-[9px] font-mono font-bold">
                ₦0 FREE
              </span>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed font-light">
              Your garments will be neatly packaged and ready at our concierge lounge.
            </p>
            <p className="font-mono text-[10px] font-bold text-brand-blue-primary">
              📍 Faith Plaza beside Dubai Mall, Breadfruit, Lagos, Nigeria.
            </p>
          </div>
        </div>
      )}

      {/* Real-time Delivery Cost & Grand Total Live Summary Card */}
      <div className="p-3.5 bg-brand-blue-primary text-white space-y-2">
        <div className="flex items-center justify-between text-[11px] font-mono text-slate-300">
          <span>Items Subtotal:</span>
          <span className="font-bold text-white">{formatNairaValue(subtotal)}</span>
        </div>

        <div className="flex items-center justify-between text-[11px] font-mono text-slate-300">
          <span className="flex items-center gap-1">
            <span>Delivery Fee:</span>
            {deliveryMethod === 'delivery' && (
              <span className="text-[9px] text-brand-pink-light">({currentZone.name})</span>
            )}
          </span>
          {deliveryMethod === 'pickup' ? (
            <span className="font-bold text-emerald-400">FREE (Store Pickup)</span>
          ) : calculation.isFreePromo ? (
            <span className="font-bold text-emerald-400">
              FREE <span className="line-through text-slate-400 text-[9px]">{formatNairaValue(calculation.originalFee)}</span>
            </span>
          ) : (
            <span className="font-bold text-white">{formatNairaValue(calculation.fee)}</span>
          )}
        </div>

        <div className="border-t border-white/20 pt-2 flex items-center justify-between text-xs sm:text-sm">
          <span className="font-serif font-bold uppercase tracking-wider text-brand-pink-light">
            Calculated Total:
          </span>
          <span className="font-mono font-extrabold text-white text-base">
            {formatNairaValue(grandTotal)}
          </span>
        </div>
      </div>
    </div>
  );
};
