export interface DeliveryZone {
  id: string;
  name: string;
  coverage: string;
  fee: number;
  transitTime: string;
}

export const DELIVERY_ZONES: DeliveryZone[] = [
  {
    id: 'lagos-island',
    name: 'Lagos Island',
    coverage: 'Ikoyi, Victoria Island, Lekki Phase 1, Oniru, Chevron, Ajah',
    fee: 3500,
    transitTime: 'Same Day / Next Day'
  },
  {
    id: 'lagos-mainland',
    name: 'Lagos Mainland',
    coverage: 'Ikeja, Surulere, Yaba, Gbagada, Maryland, Magodo, Ilupeju, Anthony',
    fee: 4500,
    transitTime: '1 - 2 Business Days'
  },
  {
    id: 'lagos-outskirts',
    name: 'Lagos Outskirts & Extended',
    coverage: 'Ikorodu, Epe, Badagry, Alimosho, Festac, Trade Fair, Ojodu',
    fee: 5500,
    transitTime: '1 - 2 Business Days'
  },
  {
    id: 'abuja-fct',
    name: 'Abuja FCT',
    coverage: 'Maitama, Wuse 2, Garki, Jabi, Asokoro, Guzape, Central Business District',
    fee: 7000,
    transitTime: '2 - 3 Business Days'
  },
  {
    id: 'port-harcourt',
    name: 'Port Harcourt / Rivers State',
    coverage: 'Old & New GRA, Peter Odili, Trans Amadi, Ada George, Woji, Rumuola',
    fee: 7500,
    transitTime: '2 - 3 Business Days'
  },
  {
    id: 'south-west',
    name: 'South-West States',
    coverage: 'Oyo (Ibadan), Ogun (Abeokuta, Sagamu), Osun, Ondo, Ekiti',
    fee: 6000,
    transitTime: '2 - 3 Business Days'
  },
  {
    id: 'south-east-south',
    name: 'South-East & South-South',
    coverage: 'Enugu, Anambra (Onitsha, Awka), Delta (Asaba, Warri), Edo (Benin), Imo, Calabar',
    fee: 7500,
    transitTime: '2 - 4 Business Days'
  },
  {
    id: 'northern-states',
    name: 'North Central & Northern States',
    coverage: 'Kano, Kaduna, Jos, Kwara (Ilorin), Niger, Benue, Nassarawa',
    fee: 8500,
    transitTime: '3 - 5 Business Days'
  },
  {
    id: 'international',
    name: 'International Express (DHL / FedEx)',
    coverage: 'United Kingdom, United States, Canada, Europe, UAE & Global Diaspora',
    fee: 45000,
    transitTime: '3 - 7 Business Days'
  }
];

export const FREE_DELIVERY_THRESHOLD = 150000;

export function getDeliveryZoneById(id: string): DeliveryZone {
  return DELIVERY_ZONES.find((z) => z.id === id) || DELIVERY_ZONES[0];
}

export function calculateDeliveryFee(
  method: 'delivery' | 'pickup',
  zoneId: string,
  subtotal: number
): { fee: number; isFreePromo: boolean; originalFee: number } {
  if (method === 'pickup') {
    return { fee: 0, isFreePromo: false, originalFee: 0 };
  }

  const zone = getDeliveryZoneById(zoneId);
  const isFreePromo = subtotal >= FREE_DELIVERY_THRESHOLD;

  return {
    fee: isFreePromo ? 0 : zone.fee,
    isFreePromo,
    originalFee: zone.fee
  };
}
