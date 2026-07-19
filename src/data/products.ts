import { Product, Review } from '../types';

export const products: Product[] = [
  {
    id: '1',
    sku: 'DBS-SHP-A01',
    name: 'Aria Ultra-Sculpting Full Bodysuit',
    category: 'shapewear',
    categoryLabel: 'Shapewear',
    price: 185000,
    description: 'The crown jewel of our shapewear line. Designed to provide instant and painless 360-degree control, shaping an unparalleled hourglass silhouette. Built from premium moisture-wicking compression fibres that feel like a second skin under high-fashion evening gowns or everyday couture.',
    features: [
      '360° targeted midsection, waist, and hip contouring',
      'Dual-layered medical-grade power-mesh compression paneling',
      'Laser-cut raw hems for an invisible transition under tight garments',
      'Fully adjustable, convertible non-slip shoulder straps',
      'Convenient cotton-lined opening design for seamless all-day wear'
    ],
    images: [
      'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1581338834647-b0fb40704e21?q=80&w=600&auto=format&fit=crop'
    ],
    colors: ['Onyx Black', 'Ebonee Nude', 'Warm Bronze'],
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'],
    rating: 4.9,
    reviewsCount: 148,
    isBestSeller: true,
    isNew: false
  },
  {
    id: '2',
    sku: 'DBS-LUN-E02',
    name: 'Eyo Mulberry Silk Luxury Kimono Robe',
    category: 'loungewear',
    categoryLabel: 'Sleep & Pyjamas',
    price: 220000,
    description: 'Wrap yourself in absolute opulence. Hand-cut from heavy-weight, 22-Momme Mulberry silk, the Eyo Robe offers unmatched luxury and grace. Featuring elaborate, hand-stitched Chantilly lace cuffs and a flowing structural wrap that makes lounge mornings feel like royalty.',
    features: [
      'Crafted from 100% pure Grade 6A 22-Momme Mulberry Silk',
      'French Chantilly lace detailing along sleeves and bottom trim',
      'Internal silk ties for a perfect, secure overlay',
      'Elegant wide sash belt with reinforced belt loops',
      'Naturally hypoallergenic and temperature-regulating'
    ],
    images: [
      'https://images.unsplash.com/photo-1566207274740-0f8cf6b7d5a5?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?q=80&w=600&auto=format&fit=crop'
    ],
    colors: ['Blush Pink', 'Sapphire Indigo', 'Ivory Cream'],
    sizes: ['S', 'M', 'L', 'XL'],
    rating: 4.8,
    reviewsCount: 82,
    isBestSeller: true,
    isNew: true
  },
  {
    id: '3',
    sku: 'DBS-SWM-Z03',
    name: 'Zaria Resort Cut-Out Monokini',
    category: 'swimwear',
    categoryLabel: 'Resort & Swimwear',
    price: 165000,
    description: 'Command the beach club in the Zaria Monokini. Crafted with a dramatic asymmetrical cut-out design connected by 24k gold-plated hardware, this swimwear sculpts the body while providing exquisite aesthetic interest. Double-lined with Italian premium stretch nylon.',
    features: [
      'Asymmetrical side cut-out detailing with high-cut leg line',
      'Beside-the-sea 24k gold-plated rustless accessory rings',
      'Made of premium eco-friendly Econyl® regenerated nylon',
      'Removable padding and premium inner-bust support elastic',
      'Chlorine, oil, sunscreen, and UV protective structure'
    ],
    images: [
      'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1507553138344-304449ec0109?q=80&w=600&auto=format&fit=crop'
    ],
    colors: ['Sunset Coral', 'Deep Ocean Blue', 'Emerald Green'],
    sizes: ['S', 'M', 'L', 'XL'],
    rating: 4.7,
    reviewsCount: 64,
    isBestSeller: false,
    isNew: true
  },
  {
    id: '4',
    sku: 'DBS-UND-A04',
    name: 'Amara Sheer Lace Corset Bralette',
    category: 'underwear',
    categoryLabel: 'Discount Section & Underwear',
    price: 95000,
    originalPrice: 135000,
    discountPercentage: 30,
    description: 'A striking statement of delicate craftsmanship. The Amara Bralette combines delicate French cordonnet lace with structurally sound, satin-wrapped boning. Offering both subtle underwire support and an allure that makes it perfect as high-luxury innerwear or styled under sharp blazers.',
    features: [
      'Delicate French Cordonnet lace with scalloped eyelashes',
      'Structured supportive boning styled in premium silk-satin',
      'Soft cups with hidden underwire lift reinforcement',
      'Four-row back hook-and-eye fastener for bespoke adjustments',
      'Hypoallergenic lining and adjustable satin shoulder straps'
    ],
    images: [
      'https://images.unsplash.com/photo-1616606103915-dea7be788566?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1608748010899-18f300247112?q=80&w=600&auto=format&fit=crop'
    ],
    colors: ['Blush Rose', 'Midnight Noir', 'Ivory Lace'],
    sizes: ['S', 'M', 'L', 'XL'],
    rating: 4.9,
    reviewsCount: 51,
    isBestSeller: true,
    isNew: false
  },
  {
    id: '5',
    sku: 'DBS-SHP-I05',
    name: 'Ife Hourglass Steel-Boned Corset',
    category: 'shapewear',
    categoryLabel: 'Shapewear',
    price: 125000,
    description: 'Achieve red-carpet readiness instantly. The Ife Waist Cincher combines traditional corsetry support with contemporary sports-mesh technology. Armed with 9 flexible, medical-grade spiral steel bones, this corset holds the torso firm, relieving pressure while accentuating high curves.',
    features: [
      '9 integrated, flexible spiral steel bones that prevent rolling',
      'Triple-reinforced front hook-and-eye panels for customized progression',
      'Thick, premium neoprene shell with athletic spandex blend',
      'Lined in 100% natural, breathable moisture-wicking cotton',
      'Perfect for dramatic waist training and posture support'
    ],
    images: [
      'https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=600&auto=format&fit=crop'
    ],
    colors: ['Sand Beige', 'Onyx Black'],
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', '4XL'],
    rating: 4.9,
    reviewsCount: 215,
    isBestSeller: true,
    isNew: false
  },
  {
    id: '6',
    sku: 'DBS-LUN-O06',
    name: 'Odua Silk Pyjama Lounge Set',
    category: 'loungewear',
    categoryLabel: 'Sleep & Pyjamas',
    price: 245000,
    description: 'Reimagine sleepwear with the Odua Set. Tailored to an elegant draped fit, this set comprises a button-down collared shirt with contrasting luxury pipings and relaxed, flowing wide-leg trousers. Pure silk-satin luxury for sweet dreams and exquisite lounging.',
    features: [
      'Double-piece lounge set containing button-down shirt and trousers',
      'Contrast piping borders hand-sewn for classic, crisp definition',
      'Comfort-first elasticated waistband paired with silk drawstring ties',
      'Side slip pockets on trousers for relaxed convenience',
      'Breathable, premium silk threads woven for longevity'
    ],
    images: [
      'https://images.unsplash.com/photo-1618220179428-22790b461013?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1501908731398-48a600290543?q=80&w=600&auto=format&fit=crop'
    ],
    colors: ['Midnight Navy', 'Sakura Pink', 'Champagne Gold'],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    rating: 5.0,
    reviewsCount: 93,
    isBestSeller: false,
    isNew: true
  },
  {
    id: '7',
    sku: 'DBS-SWM-K07',
    name: 'Kemi Luxe Silk Kaftan Resort Cover-Up',
    category: 'swimwear',
    categoryLabel: 'Resort & Swimwear',
    price: 150000,
    description: 'An ethereal addition to your beachside wardrobe. The Kemi Kaftan floats with you, capturing the tropical breeze. Handcrafted from a semi-sheer silk chiffon blend and adorned with delicate gold-threaded embroidery around the plunging V-neckline.',
    features: [
      'Ultra-light semi-sheer silk chiffon blend construction',
      'Plunging V-neckline hand-detailed with shimmering gold threads',
      'Ethereal floor-sweeping dolman-style dramatic sleeves',
      'Internal waist-cinching ties for customized fitting options',
      'Quick-drying fabric that transitions perfectly to oceanside dining'
    ],
    images: [
      'https://images.unsplash.com/photo-1588117260548-94db73cee0d6?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?q=80&w=600&auto=format&fit=crop'
    ],
    colors: ['Gilded Blue', 'Blush Orchid', 'Sunset Amber'],
    sizes: ['One Size Fits All'],
    rating: 4.6,
    reviewsCount: 37,
    isBestSeller: false,
    isNew: false
  },
  {
    id: '8',
    sku: 'DBS-UND-N08',
    name: 'Nneka Seamless Silk Knicker Set (3-Pack)',
    category: 'underwear',
    categoryLabel: 'Discount Section & Underwear',
    price: 55000,
    originalPrice: 75000,
    discountPercentage: 26,
    description: 'Indulge in absolute comfort with zero distractions. The Nneka Panty Pack includes three matching raw-edge stretch knickers that sit flat against the skin, rendering lines completely invisible under tights and shapewear. Complete with pure silk gussets.',
    features: [
      'Valuable 3-pack bundle of premium stretch panties',
      '100% pure Mulberry silk lining at the critical gusset for health',
      'Laser-cut raw edges that offer a 100% line-free guarantee',
      'Subtle, flat lock-stitching that prevents rubbing or irritation',
      'Presented in our signature scented, round ribbon gift box'
    ],
    images: [
      'https://images.unsplash.com/photo-1608748010899-18f300247112?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1616606103915-dea7be788566?q=80&w=600&auto=format&fit=crop'
    ],
    colors: ['Blush Rose Pack', 'Classic Dark Pack'],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    rating: 4.8,
    reviewsCount: 79,
    isBestSeller: true,
    isNew: false
  }
];

export const reviewsDatabase: Record<string, Review[]> = {
  '1': [
    { id: 'rev-1', userName: 'Chioma A.', rating: 5, date: '2026-06-20', comment: 'Honestly the best shapewear I have ever bought in Lagos! Holds me in perfectly for weddings and doesnâ€™t fold down. Bought size L and itâ€™s absolute perfection.', sizePurchased: 'L', verified: true },
    { id: 'rev-2', userName: 'Oluwaseun T.', rating: 5, date: '2026-06-15', comment: 'Dr Bodyshaper does not play! Invisible under my tightest silk dresses. Well worth the price.', sizePurchased: 'M', verified: true },
    { id: 'rev-3', userName: 'Fatima B.', rating: 4, date: '2026-05-29', comment: 'Very high quality compression, holds everything secure. The straps are soft and do not pinch.', sizePurchased: 'XL', verified: true }
  ],
  '2': [
    { id: 'rev-4', userName: 'Amina U.', rating: 5, date: '2026-06-18', comment: 'This robe is the definition of luxury! Sleeping in 100% silk feels so wonderful. The lace is soft, not scratchy at all.', sizePurchased: 'M', verified: true },
    { id: 'rev-5', userName: 'Nneka O.', rating: 5, date: '2026-05-10', comment: 'Got this as a birthday gift for myself and I wear it every single morning. Feels divine.', sizePurchased: 'S', verified: true }
  ],
  '3': [
    { id: 'rev-6', userName: 'Ekemini E.', rating: 5, date: '2026-06-25', comment: 'The gold ring details look so expensive! Got so many compliments at the resort in Ilashe. Fits beautifully.', sizePurchased: 'S', verified: true },
    { id: 'rev-7', userName: 'Bukola S.', rating: 4, date: '2026-06-02', comment: 'Extremely stunning fit. Love how the cuts sculpt my hips. The material is very high quality.', sizePurchased: 'M', verified: true }
  ],
  '4': [
    { id: 'rev-8', userName: 'Zainab Y.', rating: 5, date: '2026-06-12', comment: 'Obsessed with the French lace. It looks gorgeous styled with an oversized blazer and denim.', sizePurchased: 'M', verified: true }
  ],
  '5': [
    { id: 'rev-9', userName: 'Kelechi I.', rating: 5, date: '2026-06-29', comment: '9 steel bones! This waist trainer actually holds you like iron but letâ€™s you breathe. Instant hour glass.', sizePurchased: 'XL', verified: true },
    { id: 'rev-10', userName: 'Tinuola A.', rating: 5, date: '2026-06-21', comment: 'I have used other waist cinchers but this cotton lining is perfect for Nigerian heat. Perfect compression.', sizePurchased: 'M', verified: true }
  ]
};
