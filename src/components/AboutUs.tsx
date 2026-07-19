import { motion } from 'motion/react';
import { Sparkles, Tag, Truck, Store, Package, Droplet, Ruler, HeartHandshake, Lock, Users } from 'lucide-react';

export default function AboutUs() {
  const reasons = [
    { icon: <Sparkles className="w-5 h-5" />, text: "Premium-quality pajamas, activewear, beachwear, and lingerie." },
    { icon: <Tag className="w-5 h-5" />, text: "Competitive prices for both retail and wholesale buyers." },
    { icon: <Truck className="w-5 h-5" />, text: "Fast and reliable nationwide and international delivery." },
    { icon: <Store className="w-5 h-5" />, text: "A physical walk-in store for a trusted shopping experience." },
    { icon: <Package className="w-5 h-5" />, text: "Bulk orders and dropshipping support available." },
    { icon: <Droplet className="w-5 h-5" />, text: "Trendy collections updated regularly." },
    { icon: <Ruler className="w-5 h-5" />, text: "Multiple sizes and styles to suit every body type." },
    { icon: <HeartHandshake className="w-5 h-5" />, text: "Friendly customer service dedicated to helping you shop with confidence." },
    { icon: <Lock className="w-5 h-5" />, text: "Secure shopping and dependable order fulfillment." },
    { icon: <Users className="w-5 h-5" />, text: "Thousands of happy customers trust us for quality, value, and excellent service." },
  ];

  return (
    <div className="bg-brand-cream min-h-screen py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white p-8 md:p-12 shadow-sm border border-brand-blue-primary/10"
        >
          <div className="text-center mb-10">
            <h1 className="font-serif text-4xl md:text-5xl font-bold text-brand-blue-primary mb-4">
              About Us
            </h1>
            <p className="text-brand-blue-sky max-w-2xl mx-auto text-sm leading-relaxed">
              At our store, we believe great fashion should be stylish, comfortable, and affordable. Whether you're shopping for yourself or growing your own business, we're committed to providing products you'll love and a shopping experience you can rely on.
            </p>
          </div>

          <div className="mt-12">
            <h2 className="font-serif text-2xl font-bold text-brand-pink-primary border-b border-brand-pink-soft pb-4 mb-8">
              Why Buy From Us?
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {reasons.map((reason, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="flex items-start gap-4 p-4 bg-brand-pink-light/30 border border-brand-pink-soft/50 hover:bg-brand-pink-soft/20 transition-colors"
                >
                  <div className="text-brand-pink-deep mt-1 shrink-0">
                    {reason.icon}
                  </div>
                  <p className="text-sm text-brand-blue-primary font-medium">
                    {reason.text}
                  </p>
                </motion.div>
              ))}
            </div>
            
            <div className="mt-12 p-6 bg-brand-blue-primary text-white text-center rounded-none shadow-md">
              <h3 className="font-serif text-xl font-bold mb-2 text-brand-pink-soft">Wholesale & Dropshipping</h3>
              <p className="text-sm text-white/90 font-light max-w-xl mx-auto">
                If you primarily target wholesalers and dropshippers, we are equipped to help you grow your business with dedicated support, bulk pricing, and seamless fulfillment.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
