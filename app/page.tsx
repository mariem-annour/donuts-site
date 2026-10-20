"use client";
import React, { useState, useEffect } from 'react';
import { supabase, getDonutImageUrl } from '@/lib/supabase';
import Link from 'next/link';

interface Donut {
  id: number;
  name: string;
  price: number;
  sale_price?: number;
  image_url?: string;
  image_name?: string;
  image_number?: number;
  is_active: boolean;
}

const COUNTRY_CODES = [
  { code: '+212', label: '🇲🇦 +212', minLen: 9, maxLen: 9 }, // Morocco (9 digits)
  { code: '+1', label: '🇺🇸 +1', minLen: 10, maxLen: 10 },   // USA / Canada
  { code: '+33', label: '🇫🇷 +33', minLen: 9, maxLen: 9 },   // France
  { code: '+34', label: '🇪🇸 +34', minLen: 9, maxLen: 9 },   // Spain
  { code: '+213', label: '🇩🇿 +213', minLen: 9, maxLen: 9 }, // Algeria
  { code: '+216', label: '🇹🇳 +216', minLen: 8, maxLen: 8 }, // Tunisia
  { code: '+966', label: '🇸🇦 +966', minLen: 9, maxLen: 9 }, // Saudi Arabia
  { code: '+971', label: '🇦🇪 +971', minLen: 9, maxLen: 9 }, // UAE
  { code: '+44', label: '🇬🇧 +44', minLen: 10, maxLen: 10 }, // UK
  { code: '+93', label: '🇦🇫 +93', minLen: 9, maxLen: 9 },
  { code: '+355', label: '🇦🇱 +355', minLen: 8, maxLen: 9 },
  { code: '+376', label: '🇦🇩 +376', minLen: 6, maxLen: 6 },
  { code: '+244', label: '🇦🇴 +244', minLen: 9, maxLen: 9 },
  { code: '+54', label: '🇦🇷 +54', minLen: 10, maxLen: 10 },
  { code: '+374', label: '🇦🇲 +374', minLen: 8, maxLen: 8 },
  { code: '+61', label: '🇦🇺 +61', minLen: 9, maxLen: 9 },
  { code: '+43', label: '🇦🇹 +43', minLen: 10, maxLen: 11 },
  { code: '+994', label: '🇦🇿 +994', minLen: 9, maxLen: 9 },
  { code: '+973', label: '🇧🇭 +973', minLen: 8, maxLen: 8 },
  { code: '+880', label: '🇧🇩 +880', minLen: 10, maxLen: 10 },
  { code: '+375', label: '🇧🇾 +375', minLen: 9, maxLen: 9 },
  { code: '+32', label: '🇧🇪 +32', minLen: 9, maxLen: 9 },
  { code: '+501', label: '🇧🇿 +501', minLen: 7, maxLen: 7 },
  { code: '+229', label: '🇧🇯 +229', minLen: 8, maxLen: 8 },
  { code: '+975', label: '🇧🇹 +975', minLen: 8, maxLen: 8 },
  { code: '+591', label: '🇧🇴 +591', minLen: 8, maxLen: 8 },
  { code: '+387', label: '🇧🇦 +387', minLen: 8, maxLen: 8 },
  { code: '+267', label: '🇧🇼 +267', minLen: 7, maxLen: 8 },
  { code: '+55', label: '🇧🇷 +55', minLen: 10, maxLen: 11 },
  { code: '+673', label: '🇧🇳 +673', minLen: 7, maxLen: 7 },
  { code: '+359', label: '🇧🇬 +359', minLen: 8, maxLen: 9 },
  { code: '+226', label: '🇧🇫 +226', minLen: 8, maxLen: 8 },
  { code: '+257', label: '🇧🇮 +257', minLen: 8, maxLen: 8 },
  { code: '+855', label: '🇰🇭 +855', minLen: 8, maxLen: 9 },
  { code: '+237', label: '🇨🇲 +237', minLen: 9, maxLen: 9 },
  { code: '+238', label: '🇨🇻 +238', minLen: 7, maxLen: 7 },
  { code: '+236', label: '🇨🇫 +236', minLen: 8, maxLen: 8 },
  { code: '+235', label: '🇹🇩 +235', minLen: 8, maxLen: 8 },
  { code: '+56', label: '🇨🇱 +56', minLen: 9, maxLen: 9 },
  { code: '+86', label: '🇨🇳 +86', minLen: 11, maxLen: 11 },
  { code: '+57', label: '🇨🇴 +57', minLen: 10, maxLen: 10 },
  { code: '+269', label: '🇰🇲 +269', minLen: 7, maxLen: 7 },
  { code: '+242', label: '🇨🇬 +242', minLen: 9, maxLen: 9 },
  { code: '+506', label: '🇨🇷 +506', minLen: 8, maxLen: 8 },
  { code: '+385', label: '🇭🇷 +385', minLen: 9, maxLen: 9 },
  { code: '+53', label: '🇨🇺 +53', minLen: 8, maxLen: 8 },
  { code: '+357', label: '🇨🇾 +357', minLen: 8, maxLen: 8 },
  { code: '+420', label: '🇨🇿 +420', minLen: 9, maxLen: 9 },
  { code: '+45', label: '🇩🇰 +45', minLen: 8, maxLen: 8 },
  { code: '+253', label: '🇩🇯 +253', minLen: 8, maxLen: 8 },
  { code: '+1767', label: '🇩🇲 +1767', minLen: 7, maxLen: 7 },
  { code: '+1809', label: '🇩🇴 +1809', minLen: 7, maxLen: 7 },
  { code: '+593', label: '🇪🇨 +593', minLen: 9, maxLen: 9 },
  { code: '+20', label: '🇪🇬 +20', minLen: 10, maxLen: 10 },
  { code: '+503', label: '🇸🇻 +503', minLen: 8, maxLen: 8 },
  { code: '+240', label: '🇬🇶 +240', minLen: 9, maxLen: 9 },
  { code: '+291', label: '🇪🇷 +291', minLen: 7, maxLen: 7 },
  { code: '+372', label: '🇪🇪 +372', minLen: 7, maxLen: 8 },
  { code: '+251', label: '🇪🇹 +251', minLen: 9, maxLen: 9 },
  { code: '+679', label: '🇫🇯 +679', minLen: 7, maxLen: 7 },
  { code: '+358', label: '🇫🇮 +358', minLen: 9, maxLen: 10 },
  { code: '+241', label: '🇬🇦 +241', minLen: 7, maxLen: 7 },
  { code: '+220', label: '🇬🇲 +220', minLen: 7, maxLen: 7 },
  { code: '+995', label: '🇬🇪 +995', minLen: 9, maxLen: 9 },
  { code: '+49', label: '🇩🇪 +49', minLen: 10, maxLen: 11 },
  { code: '+233', label: '🇬🇭 +233', minLen: 9, maxLen: 9 },
  { code: '+30', label: '🇬🇷 +30', minLen: 10, maxLen: 10 },
  { code: '+502', label: '🇬🇹 +502', minLen: 8, maxLen: 8 },
  { code: '+224', label: '🇬🇳 +224', minLen: 9, maxLen: 9 },
  { code: '+245', label: '🇬🇼 +245', minLen: 7, maxLen: 7 },
  { code: '+592', label: '🇬🇾 +592', minLen: 7, maxLen: 7 },
  { code: '+509', label: '🇭🇹 +509', minLen: 8, maxLen: 8 },
  { code: '+504', label: '🇭🇳 +504', minLen: 8, maxLen: 8 },
  { code: '+36', label: '🇭🇺 +36', minLen: 9, maxLen: 9 },
  { code: '+354', label: '🇮🇸 +354', minLen: 7, maxLen: 7 },
  { code: '+91', label: '🇮🇳 +91', minLen: 10, maxLen: 10 },
  { code: '+62', label: '🇮🇩 +62', minLen: 9, maxLen: 12 },
  { code: '+98', label: '🇮🇷 +98', minLen: 10, maxLen: 10 },
  { code: '+964', label: '🇮🇶 +964', minLen: 10, maxLen: 10 },
  { code: '+353', label: '🇮🇪 +353', minLen: 9, maxLen: 9 },
  { code: '+972', label: '🇮🇱 +972', minLen: 9, maxLen: 9 },
  { code: '+39', label: '🇮🇹 +39', minLen: 9, maxLen: 10 },
  { code: '+1876', label: '🇯🇲 +1876', minLen: 7, maxLen: 7 },
  { code: '+81', label: '🇯🇵 +81', minLen: 10, maxLen: 10 },
  { code: '+962', label: '🇯🇴 +962', minLen: 9, maxLen: 9 },
  { code: '+7', label: '🇰🇿 +7', minLen: 10, maxLen: 10 },
  { code: '+254', label: '🇰🇪 +254', minLen: 9, maxLen: 9 },
  { code: '+965', label: '🇰🇼 +965', minLen: 8, maxLen: 8 },
  { code: '+996', label: '🇰🇬 +996', minLen: 9, maxLen: 9 },
  { code: '+856', label: '🇱🇦 +856', minLen: 9, maxLen: 10 },
  { code: '+371', label: '🇱🇻 +371', minLen: 8, maxLen: 8 },
  { code: '+961', label: '🇱🇧 +961', minLen: 7, maxLen: 8 },
  { code: '+266', label: '🇱🇸 +266', minLen: 8, maxLen: 8 },
  { code: '+231', label: '🇱🇷 +231', minLen: 7, maxLen: 8 },
  { code: '+218', label: '🇱🇾 +218', minLen: 9, maxLen: 9 },
  { code: '+423', label: '🇱🇮 +423', minLen: 7, maxLen: 7 },
  { code: '+370', label: '🇱🇹 +370', minLen: 8, maxLen: 8 },
  { code: '+352', label: '🇱🇺 +352', minLen: 9, maxLen: 9 },
  { code: '+261', label: '🇲🇬 +261', minLen: 9, maxLen: 9 },
  { code: '+265', label: '🇲🇼 +265', minLen: 8, maxLen: 9 },
  { code: '+60', label: '🇲🇾 +60', minLen: 9, maxLen: 10 },
  { code: '+960', label: '🇲🇻 +960', minLen: 7, maxLen: 7 },
  { code: '+223', label: '🇲🇱 +223', minLen: 8, maxLen: 8 },
  { code: '+356', label: '🇲🇹 +356', minLen: 8, maxLen: 8 },
  { code: '+222', label: '🇲🇷 +222', minLen: 8, maxLen: 8 },
  { code: '+230', label: '🇲🇺 +230', minLen: 7, maxLen: 8 },
  { code: '+52', label: '🇲🇽 +52', minLen: 10, maxLen: 10 },
  { code: '+373', label: '🇲🇩 +373', minLen: 8, maxLen: 8 },
  { code: '+377', label: '🇲🇨 +377', minLen: 8, maxLen: 9 },
  { code: '+976', label: '🇲🇳 +976', minLen: 8, maxLen: 8 },
  { code: '+382', label: '🇲🇪 +382', minLen: 8, maxLen: 8 },
  { code: '+258', label: '🇲🇿 +258', minLen: 9, maxLen: 9 },
  { code: '+95', label: '🇲🇲 +95', minLen: 7, maxLen: 9 },
  { code: '+264', label: '🇳🇦 +264', minLen: 9, maxLen: 9 },
  { code: '+977', label: '🇳🇵 +977', minLen: 10, maxLen: 10 },
  { code: '+31', label: '🇳🇱 +31', minLen: 9, maxLen: 9 },
  { code: '+64', label: '🇳🇿 +64', minLen: 8, maxLen: 9 },
  { code: '+505', label: '🇳🇮 +505', minLen: 8, maxLen: 8 },
  { code: '+227', label: '🇳🇪 +227', minLen: 8, maxLen: 8 },
  { code: '+234', label: '🇳🇬 +234', minLen: 10, maxLen: 10 },
  { code: '+850', label: '🇰🇵 +850', minLen: 9, maxLen: 10 },
  { code: '+389', label: '🇲🇰 +389', minLen: 8, maxLen: 8 },
  { code: '+47', label: '🇳🇴 +47', minLen: 8, maxLen: 8 },
  { code: '+968', label: '🇴🇲 +968', minLen: 8, maxLen: 8 },
  { code: '+92', label: '🇵🇰 +92', minLen: 10, maxLen: 10 },
  { code: '+970', label: '🇵🇸 +970', minLen: 9, maxLen: 9 },
  { code: '+507', label: '🇵🇦 +507', minLen: 7, maxLen: 8 },
  { code: '+675', label: '🇵🇬 +675', minLen: 7, maxLen: 8 },
  { code: '+595', label: '🇵🇾 +595', minLen: 9, maxLen: 9 },
  { code: '+51', label: '🇵🇪 +51', minLen: 9, maxLen: 9 },
  { code: '+63', label: '🇵🇭 +63', minLen: 10, maxLen: 10 },
  { code: '+48', label: '🇵🇱 +48', minLen: 9, maxLen: 9 },
  { code: '+351', label: '🇵🇹 +351', minLen: 9, maxLen: 9 },
  { code: '+974', label: '🇶🇦 +974', minLen: 8, maxLen: 8 },
  { code: '+40', label: '🇷🇴 +40', minLen: 9, maxLen: 9 },
  { code: '+250', label: '🇷🇼 +250', minLen: 9, maxLen: 9 },
  { code: '+221', label: '🇸🇳 +221', minLen: 9, maxLen: 9 },
  { code: '+381', label: '🇷🇸 +381', minLen: 8, maxLen: 9 },
  { code: '+248', label: '🇸🇨 +248', minLen: 7, maxLen: 7 },
  { code: '+232', label: '🇸🇱 +232', minLen: 8, maxLen: 8 },
  { code: '+65', label: '🇸🇬 +65', minLen: 8, maxLen: 8 },
  { code: '+421', label: '🇸🇰 +421', minLen: 9, maxLen: 9 },
  { code: '+386', label: '🇸🇮 +386', minLen: 8, maxLen: 8 },
  { code: '+252', label: '🇸🇴 +252', minLen: 8, maxLen: 9 },
  { code: '+27', label: '🇿🇦 +27', minLen: 9, maxLen: 9 },
  { code: '+82', label: '🇰🇷 +82', minLen: 9, maxLen: 10 },
  { code: '+211', label: '🇸🇸 +211', minLen: 9, maxLen: 9 },
  { code: '+94', label: '🇱🇰 +94', minLen: 9, maxLen: 9 },
  { code: '+249', label: '🇸🇩 +249', minLen: 9, maxLen: 9 },
  { code: '+597', label: '🇸🇷 +597', minLen: 6, maxLen: 7 },
  { code: '+46', label: '🇸🇪 +46', minLen: 9, maxLen: 9 },
  { code: '+41', label: '🇨🇭 +41', minLen: 9, maxLen: 9 },
  { code: '+963', label: '🇸🇾 +963', minLen: 9, maxLen: 9 },
  { code: '+886', label: '🇹🇼 +886', minLen: 9, maxLen: 9 },
  { code: '+992', label: '🇹🇯 +992', minLen: 9, maxLen: 9 },
  { code: '+255', label: '🇹🇿 +255', minLen: 9, maxLen: 9 },
  { code: '+66', label: '🇹🇭 +66', minLen: 9, maxLen: 9 },
  { code: '+228', label: '🇹🇬 +228', minLen: 8, maxLen: 8 },
  { code: '+90', label: '🇹🇷 +90', minLen: 10, maxLen: 10 },
  { code: '+993', label: '🇹🇲 +993', minLen: 8, maxLen: 8 },
  { code: '+256', label: '🇺🇬 +256', minLen: 9, maxLen: 9 },
  { code: '+380', label: '🇺🇦 +380', minLen: 9, maxLen: 9 },
  { code: '+598', label: '🇺🇾 +598', minLen: 8, maxLen: 8 },
  { code: '+998', label: '🇺🇿 +998', minLen: 9, maxLen: 9 },
  { code: '+58', label: '🇻🇪 +58', minLen: 10, maxLen: 10 },
  { code: '+84', label: '🇻🇳 +84', minLen: 9, maxLen: 10 },
  { code: '+967', label: '🇾🇪 +967', minLen: 9, maxLen: 9 },
  { code: '+260', label: '🇿🇲 +260', minLen: 9, maxLen: 9 },
  { code: '+263', label: '🇿🇼 +263', minLen: 9, maxLen: 9 }
];

export default function DonutsFactoryFinal() {
  const [activeTab, setActiveTab] = useState('home');
  const [donuts, setDonuts] = useState<Donut[]>([]);
  const [loading, setLoading] = useState(true);
  const [cartItems, setCartItems] = useState<{id: number, name: string, price: number, quantity: number, imgSrc: string}[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartStep, setCartStep] = useState(1);
  const [showSuccess, setShowSuccess] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{[key: string]: boolean}>({});
  const [errorMessage, setErrorMessage] = useState("");
  const [customerInfo, setCustomerInfo] = useState({ name: '', phone: '', address: '' });
  const [countryCode, setCountryCode] = useState('+212');
  
  // States for Contact Form
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });
  const [isSendingMessage, setIsSendingMessage] = useState(false);

  // State for Payment Method & Card Info
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'cod'>('card');
  const [paymentInfo, setPaymentInfo] = useState({ cardType: '', cardNumber: '', expiry: '', cvv: '' });

  // State for "Ur Lucky Flavor" feature
  const [luckyDonut, setLuckyDonut] = useState<Donut | null>(null);
  const [isPickingLucky, setIsPickingLucky] = useState(false);

  // State for Mobile Navigation Menu Toggle
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    fetchDonuts();
  }, []);

  const fetchDonuts = async () => {
    try {
      const { data, error } = await supabase
        .from('donuts')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setDonuts(data || []);
    } catch (error) {
      console.error('Error fetching donuts:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDonutImage = (d: Donut) => {
    if (d.image_url) return d.image_url;
    if (d.image_name) return getDonutImageUrl(d.image_name);
    if (d.image_number) return `https://pngimg.com/uploads/donut/donut_PNG${d.image_number}.png`;
    return 'https://pngimg.com/uploads/donut/donut_PNG10.png';
  };

  const pickLuckyDonut = () => {
    if (donuts.length === 0) return;
    setIsPickingLucky(true);
    setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * donuts.length);
      setLuckyDonut(donuts[randomIndex]);
      setIsPickingLucky(false);
    }, 500);
  };

  const isValidCardNumber = (num: string) => {
    let sum = 0;
    let shouldDouble = false;
    const digits = num.replace(/\s+/g, '').split('').reverse();
    for (let i = 0; i < digits.length; i++) {
      let digit = parseInt(digits[i]);
      if (shouldDouble) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }
      sum += digit;
      shouldDouble = !shouldDouble;
    }
    return (sum % 10) === 0 && num.length >= 13;
  };

  const detectCardType = (num: string) => {
    if (num.startsWith('4')) return 'Visa';
    if (/^5[1-5]/.test(num)) return 'MasterCard';
    if (/^6011|65/.test(num)) return 'CMI';
    return '';
  };

  const totalItems = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const totalPrice = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  const addToCart = (donut: Donut, qty: number) => {
    const finalPrice = donut.sale_price && donut.sale_price > 0 && donut.sale_price < donut.price
      ? donut.sale_price
      : donut.price;
    setCartItems(prev => {
      const existing = prev.find(item => item.id === donut.id);
      if (existing) return prev.map(item => item.id === donut.id ? { ...item, quantity: item.quantity + qty } : item);
      return [...prev, {
        id: donut.id,
        name: donut.name,
        price: finalPrice,
        quantity: qty,
        imgSrc: getDonutImage(donut)
      }];
    });
  };

  const updateCartQuantity = (id: number, delta: number) => {
    setCartItems(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = item.quantity + delta;
        return newQty > 0 ? { ...item, quantity: newQty } : null;
      }
      return item;
    }).filter(Boolean) as typeof cartItems);
  };

  const removeFromCart = (id: number) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
  };

  const saveOrderToDatabase = async (method: string) => {
    try {
      const itemsString = cartItems.map(i => `${i.name} (x${i.quantity}) - ${(i.price * i.quantity).toFixed(2)} DH`).join('\n');
      
      const orderPayload = {
        customer_name: customerInfo.name,
        phone: `${countryCode} ${customerInfo.phone}`,
        address: customerInfo.address,
        items: itemsString,
        total_price: totalPrice,
        payment_method: method,
        status: 'Pending'
      };

      const { error } = await supabase.from('orders').insert([orderPayload]);
      if (error) throw error;

      try {
        const audio = new Audio('/notify.mp3');
        audio.volume = 1.0;
        audio.play().catch(e => console.log("Audio play blocked:", e));
      } catch (err) {
        console.error("Audio error:", err);
      }

      setShowSuccess(true);
      setIsCartOpen(false);
      setCartItems([]);
      setCartStep(1);
      setCustomerInfo({ name: '', phone: '', address: '' });
      setPaymentInfo({ cardType: '', cardNumber: '', expiry: '', cvv: '' });
      setErrorMessage("");
    } catch (error: any) {
      console.error('Error saving order:', error);
      setErrorMessage("Failed to submit order: " + (error.message || "Please try again."));
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactForm.name || !contactForm.email || !contactForm.message) {
      alert("Please fill all fields!");
      return;
    }

    setIsSendingMessage(true);
    try {
      const { error } = await supabase.from('messages').insert([
        {
          name: contactForm.name,
          email: contactForm.email,
          message: contactForm.message
        }
      ]);

      if (error) throw error;

      alert("🚀 Message sent successfully to Admin Dashboard!");
      setContactForm({ name: '', email: '', message: '' });
    } catch (error: any) {
      alert("Failed to send message: " + (error.message || "Please try again."));
    } finally {
      setIsSendingMessage(false);
    }
  };

  return (
    <main className="min-h-screen bg-black text-white relative overflow-x-hidden">
      <div className="fixed inset-0 w-full h-full z-0">
        <video autoPlay loop muted playsInline className="w-full h-full object-cover">
          <source src="/donut-bg.mp4" type="video/mp4" />
          <source src="/donut-bg.webm" type="video/webm" />
        </video>
        <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"></div>
      </div>

      <nav className="fixed top-0 w-full z-50 bg-black/40 backdrop-blur-xl py-4 px-6 md:px-12 border-b border-white/10">
        <div className="max-w-[1800px] mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('home')}>
            <img src="/logo.jpeg" alt="Donuts Factory Logo" className="w-12 h-12 md:w-16 md:h-16 object-contain rounded-full" />
            <h1 className="text-xl md:text-3xl font-black italic tracking-tighter">
              <span className="text-[#00FFCC]">DONUTS </span> FACTORY.
            </h1>
          </div>
          
          {/* Desktop Nav Links */}
          <div className="hidden lg:flex gap-10 items-center font-black uppercase text-[13px] tracking-[0.2em]">
            {['home', 'menu', 'about us', 'locations', 'contact us'].map((tab) => (
              <button 
                key={tab} 
                onClick={() => setActiveTab(tab)} 
                className={`transition-all duration-300 hover:scale-110 ${activeTab === tab ? 'text-[#00FFCC] border-b-2 border-[#00FFCC] pb-1' : 'text-white/60 hover:text-white'}`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <div onClick={() => { setIsCartOpen(true); setCartStep(1); }} className="relative cursor-pointer bg-[#00FFCC] p-2.5 md:p-3 rounded-2xl active:scale-90 transition-all shadow-lg shadow-[#00FFCC]/25 text-black">
              <span className="text-lg md:text-xl">🛍️</span>
              <span className="absolute -top-1 -right-1 bg-white text-black text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full shadow">{totalItems}</span>
            </div>

            {/* Mobile Burger Button */}
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
              className="lg:hidden bg-white/10 p-2.5 rounded-2xl text-white border border-white/10 relative z-50 cursor-pointer"
            >
              <span className="text-xl">{isMobileMenuOpen ? '✕' : '☰'}</span>
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden absolute top-full left-0 w-full bg-black/95 backdrop-blur-2xl border-b border-white/10 py-6 px-8 flex flex-col gap-4 animate-in slide-in-from-top duration-300 z-[150]">
            {['home', 'menu', 'about us', 'locations', 'contact us'].map((tab) => (
              <button 
                key={tab} 
                onClick={() => { setActiveTab(tab); setIsMobileMenuOpen(false); }} 
                className={`text-left text-sm font-black uppercase tracking-widest py-2 transition-colors ${activeTab === tab ? 'text-[#00FFCC]' : 'text-white/70'}`}
              >
                {tab}
              </button>
            ))}
          </div>
        )}
      </nav>

      <div className={`fixed right-0 top-0 h-full w-full sm:w-[450px] bg-black/95 backdrop-blur-3xl z-[100] transition-transform duration-500 border-l border-white/10 ${isCartOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="p-6 sm:p-10 h-full flex flex-col">
          <div className="flex justify-between items-center mb-6 sm:mb-10">
            <h2 className="text-lg sm:text-xl font-black italic text-[#00FFCC] uppercase tracking-tighter">
              {cartStep === 1 ? 'MY BOX' : cartStep === 2 ? 'DELIVERY' : 'PAYMENT'}
            </h2>
            <button onClick={() => setIsCartOpen(false)} className="text-white/40 text-[9px] font-black tracking-widest uppercase hover:text-white transition-all">Close</button>
          </div>
          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
            {cartStep === 1 && (
              <div className="space-y-4 sm:space-y-6">
                {cartItems.length === 0 ? <p className="opacity-20 italic text-center mt-20 text-sm tracking-widest font-black">BOX IS EMPTY...</p> : 
                  cartItems.map(item => (
                    <div key={item.id} className="flex items-center gap-3 sm:gap-4 bg-white/5 p-3 sm:p-4 rounded-[25px] border border-white/5">
                      <img src={item.imgSrc} className="w-10 h-10 sm:w-12 sm:h-12 object-contain" alt="" />
                      <div className="flex-1">
                        <h3 className="text-[10px] font-black uppercase tracking-widest mb-1 text-white">{item.name}</h3>
                        <p className="text-[#00FFCC] font-black text-xs">{(item.price * item.quantity).toFixed(2)} DH</p>
                      </div>

                      <div className="flex items-center gap-2 bg-black/40 px-2.5 py-1.5 rounded-xl border border-white/10">
                        <button 
                          onClick={() => updateCartQuantity(item.id, -1)} 
                          className="text-[#00FFCC] text-sm font-black hover:scale-125 transition-transform"
                        >
                          -
                        </button>
                        <span className="text-xs font-black text-white w-4 text-center">{item.quantity}</span>
                        <button 
                          onClick={() => updateCartQuantity(item.id, 1)} 
                          className="text-[#00FFCC] text-sm font-black hover:scale-125 transition-transform"
                        >
                          +
                        </button>
                      </div>

                      <button 
                        onClick={() => removeFromCart(item.id)} 
                        className="text-red-500 hover:bg-red-500/10 p-2 rounded-xl transition-all active:scale-90"
                        title="Remove item"
                      >
                        🗑️
                      </button>
                    </div>
                  ))
                }
              </div>
            )}
            {cartStep === 2 && (
              <div className="space-y-4 sm:space-y-6 animate-in slide-in-from-right-5">
                <input type="text" placeholder="FULL NAME" value={customerInfo.name} className={`w-full bg-white/5 border p-4 sm:p-5 rounded-2xl outline-none text-xs font-black uppercase ${fieldErrors.name ? 'border-red-500' : 'border-white/10 focus:border-[#00FFCC]'}`} onChange={(e) => {setCustomerInfo({...customerInfo, name: e.target.value}); setFieldErrors({...fieldErrors, name: false});}} />
                
                <div className="flex gap-2">
                  <select 
                    value={countryCode} 
                    onChange={(e) => {
                      setCountryCode(e.target.value);
                      setFieldErrors({...fieldErrors, phone: false});
                    }}
                    className="bg-white/5 border border-white/10 p-4 sm:p-5 rounded-2xl outline-none text-xs font-black text-[#00FFCC] bg-black cursor-pointer focus:border-[#00FFCC] w-[110px]"
                  >
                    {COUNTRY_CODES.map((item, idx) => (
                      <option key={idx} value={item.code} className="bg-black text-white">
                        {item.label}
                      </option>
                    ))}
                  </select>
                  <input 
                    type="tel" 
                    placeholder="PHONE NUMBER" 
                    value={customerInfo.phone} 
                    className={`flex-1 bg-white/5 border p-4 sm:p-5 rounded-2xl outline-none text-xs font-black uppercase transition-all duration-300 ${
                      fieldErrors.phone 
                        ? 'border-red-500 bg-red-500/10 text-red-400 animate-bounce' 
                        : 'border-white/10 focus:border-[#00FFCC]'
                    }`} 
                    onChange={(e) => {
                      setCustomerInfo({...customerInfo, phone: e.target.value}); 
                      setFieldErrors({...fieldErrors, phone: false});
                    }} 
                  />
                </div>

                <textarea placeholder="FULL DELIVERY ADDRESS" value={customerInfo.address} className={`w-full bg-white/5 border p-4 sm:p-5 rounded-2xl outline-none text-xs font-black uppercase h-28 sm:h-32 ${fieldErrors.address ? 'border-red-500' : 'border-white/10 focus:border-[#00FFCC]'}`} onChange={(e) => {setCustomerInfo({...customerInfo, address: e.target.value}); setFieldErrors({...fieldErrors, address: false});}} />
                {errorMessage && <p className="text-red-500 text-[10px] font-black uppercase tracking-widest animate-pulse">⚠️ {errorMessage}</p>}
              </div>
            )}
            {cartStep === 3 && (
              <div className="space-y-4 sm:space-y-6 animate-in slide-in-from-right-5">
                <div className="flex gap-2 p-1 bg-white/5 rounded-2xl border border-white/10">
                  <button
                    onClick={() => { setPaymentMethod('card'); setErrorMessage(""); }}
                    className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${paymentMethod === 'card' ? 'bg-[#00FFCC] text-black shadow-lg' : 'text-white/40 hover:text-white'}`}
                  >
                     Card Payment
                  </button>
                  <button
                    onClick={() => { setPaymentMethod('cod'); setErrorMessage(""); }}
                    className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${paymentMethod === 'cod' ? 'bg-[#00FFCC] text-black shadow-lg' : 'text-white/40 hover:text-white'}`}
                  >
                    Cash on Delivery
                  </button>
                </div>

                {paymentMethod === 'card' && (
                  <div className="space-y-4 sm:space-y-6 animate-in fade-in duration-300">
                    <div className={`flex gap-2 p-2 rounded-2xl border transition-all ${fieldErrors.cardType ? 'border-red-500 bg-red-500/5' : 'border-transparent'}`}>
                      {['Visa', 'MasterCard', 'CMI'].map(type => (
                        <button key={type} onClick={() => {setPaymentInfo({...paymentInfo, cardType: type}); setFieldErrors({...fieldErrors, cardType: false});}} className={`flex-1 py-3 rounded-xl border text-[10px] font-black tracking-widest transition-all ${paymentInfo.cardType === type ? 'bg-[#00FFCC] text-black border-[#00FFCC]' : 'bg-white/5 text-white/40 border-white/10'}`}>{type}</button>
                      ))}
                    </div>
                    <div className="relative">
                      <input type="text" placeholder="CARD NUMBER" value={paymentInfo.cardNumber} className={`w-full bg-white/5 border p-4 sm:p-5 rounded-2xl outline-none text-xs font-black ${fieldErrors.cardNumber ? 'border-red-500' : 'border-white/10 focus:border-[#00FFCC]'}`} onChange={(e) => {const val = e.target.value; setPaymentInfo({...paymentInfo, cardNumber: val}); const detected = detectCardType(val); if (detected) setPaymentInfo(prev => ({...prev, cardType: detected})); setFieldErrors({...fieldErrors, cardNumber: false});}} />
                      {paymentInfo.cardType && <span className="absolute right-5 top-5 text-[8px] font-black text-[#00FFCC]">{paymentInfo.cardType}</span>}
                    </div>
                    <div className="flex gap-4">
                      <input type="text" placeholder="MM/YY" value={paymentInfo.expiry} className={`w-full bg-white/5 border p-4 sm:p-5 rounded-2xl outline-none text-xs font-black ${fieldErrors.expiry ? 'border-red-500' : 'border-white/10 focus:border-[#00FFCC]'}`} onChange={(e) => {setPaymentInfo({...paymentInfo, expiry: e.target.value}); setFieldErrors({...fieldErrors, expiry: false});}} />
                      <input type="text" placeholder="CVV" value={paymentInfo.cvv} className={`w-full bg-white/5 border p-4 sm:p-5 rounded-2xl outline-none text-xs font-black ${fieldErrors.cvv ? 'border-red-500' : 'border-white/10 focus:border-[#00FFCC]'}`} onChange={(e) => {setPaymentInfo({...paymentInfo, cvv: e.target.value}); setFieldErrors({...fieldErrors, cvv: false});}} />
                    </div>
                  </div>
                )}

                {paymentMethod === 'cod' && (
                  <div className="p-6 sm:p-8 rounded-3xl bg-white/5 border border-[#00FFCC]/30 text-center space-y-4 animate-in fade-in duration-300">
                    <div className="text-4xl">🛵</div>
                    <h3 className="text-sm font-black uppercase text-[#00FFCC] tracking-wider">Pay Cash Upon Delivery</h3>
                    <p className="text-white/60 text-[11px] font-medium leading-relaxed uppercase">
                      You will pay directly in cash to the delivery agent when your fresh donuts arrive at your address.
                    </p>
                  </div>
                )}

                {errorMessage && <p className="text-red-500 text-[10px] font-black uppercase tracking-widest animate-pulse">⚠️ {errorMessage}</p>}
              </div>
            )}
          </div>
          <div className="mt-6 sm:mt-8 pt-6 sm:pt-8 border-t border-white/10">
            <div className="flex justify-between mb-6 sm:mb-8">
              <span className="text-white/40 uppercase text-[9px] font-black tracking-widest">Total</span>
              <span className="text-xl sm:text-2xl font-black text-[#00FFCC]">{totalPrice.toFixed(2)} DH</span>
            </div>
            <div className="flex gap-2">
              {cartStep > 1 && <button onClick={() => {setCartStep(cartStep - 1); setErrorMessage(""); setFieldErrors({});}} className="flex-1 bg-white/5 py-4 sm:py-5 rounded-2xl text-[9px] font-black uppercase tracking-widest border border-white/10">Back</button>}
              <button onClick={() => {
                if (cartStep === 1) { 
                  if (cartItems.length > 0) { setCartStep(2); setErrorMessage(""); } else { setErrorMessage("Box is empty!"); } 
                } 
                else if (cartStep === 2) { 
                  const errors: any = {}; 
                  const cleanPhone = customerInfo.phone.replace(/\D/g, '');
                  const selectedCountry = COUNTRY_CODES.find(c => c.code === countryCode) || COUNTRY_CODES[0];
                  const phoneLength = cleanPhone.length;
                  const isPhoneValid = phoneLength >= selectedCountry.minLen && phoneLength <= selectedCountry.maxLen;

                  if (!customerInfo.name.trim()) errors.name = true; 
                  if (!customerInfo.phone.trim() || !isPhoneValid) errors.phone = true; 
                  if (!customerInfo.address.trim()) errors.address = true; 

                  if (Object.keys(errors).length === 0) { 
                    setCartStep(3); setErrorMessage(""); setFieldErrors({}); 
                  } else { 
                    setFieldErrors(errors); 
                    if (errors.phone) {
                      setErrorMessage(`Invalid phone number for ${countryCode}! Must be ${selectedCountry.minLen === selectedCountry.maxLen ? selectedCountry.minLen : selectedCountry.minLen + '-' + selectedCountry.maxLen} digits.`);
                    } else {
                      setErrorMessage("Please fill all required fields!"); 
                    }
                  } 
                } 
                else if (cartStep === 3) { 
                  if (paymentMethod === 'card') {
                    const payErrors: any = {}; 
                    if (!paymentInfo.cardType) payErrors.cardType = true; 
                    if (!isValidCardNumber(paymentInfo.cardNumber)) payErrors.cardNumber = true; 
                    if (!/^\d{2}\/\d{2}$/.test(paymentInfo.expiry)) payErrors.expiry = true; 
                    if (paymentInfo.cvv.length < 3) payErrors.cvv = true; 
                    if (Object.keys(payErrors).length === 0) { 
                      saveOrderToDatabase('Card Payment (' + paymentInfo.cardType + ')');
                    } else { 
                      setFieldErrors(payErrors); setErrorMessage("Invalid card details!"); 
                    } 
                  } else {
                    saveOrderToDatabase('Cash on Delivery');
                  }
                }
              }} className="flex-[2] bg-[#00FFCC] text-black py-4 sm:py-5 rounded-2xl text-[9px] font-black uppercase tracking-widest shadow-xl active:scale-95 transition-all">
                {cartStep === 3 ? (paymentMethod === 'cod' ? 'CONFIRM ORDER' : 'PAY & CONFIRM') : 'NEXT STEP'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {showSuccess && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/90 backdrop-blur-md">
          <div className="glass-card p-8 sm:p-12 rounded-[40px] sm:rounded-[50px] text-center max-w-sm w-full border border-[#00FFCC]/25 shadow-2xl bg-black/80">
            <div className="text-4xl sm:text-5xl mb-4 sm:mb-6">💎</div>
            <h2 className="text-xl sm:text-2xl font-black italic text-[#00FFCC] uppercase mb-2 sm:mb-4 tracking-tighter">ORDER PLACED!</h2>
            <p className="text-white/50 text-[10px] uppercase font-black tracking-[0.2em] mb-6 sm:mb-8">Success! Your order has been processed.</p>
            <button onClick={() => setShowSuccess(false)} className="w-full bg-[#00FFCC] text-black py-4 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-white transition-all font-black">Done</button>
          </div>
        </div>
      )}

      <div className="relative z-10 pt-28 sm:pt-40 pb-20 px-4 sm:px-6 md:px-12 max-w-[1800px] mx-auto">

        {activeTab === 'home' && (
          <div className="space-y-12 sm:space-y-16 animate-in fade-in duration-700">
            <section className="relative pt-10 pb-12 sm:pt-12 sm:pb-16 px-4 sm:px-6 md:px-12 lg:px-24 flex flex-col items-center text-center overflow-hidden rounded-[30px] sm:rounded-[40px] bg-black/40 backdrop-blur-xl border border-white/10 shadow-2xl">
              <div className="absolute top-10 left-1/2 -translate-x-1/2 w-72 h-72 sm:w-96 sm:h-96 bg-[#00FFCC]/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute top-40 left-10 w-56 h-56 sm:w-72 sm:h-72 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10 max-w-3xl space-y-4 sm:space-y-6">
                <span className="inline-block py-1 px-3 sm:py-1.5 sm:px-4 rounded-full bg-[#00FFCC]/10 text-[#00FFCC] font-black text-[10px] sm:text-xs tracking-widest uppercase shadow-sm border border-[#00FFCC]/30">
                   Handcrafted Daily with Love
                </span>
                
                <h1 className="text-3xl sm:text-6xl lg:text-7xl font-black italic tracking-tight text-white leading-tight uppercase">
                  Where Every Bite Feels Like <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00FFCC] to-emerald-400">Magic</span>
                </h1>
                
                <p className="text-xs sm:text-sm lg:text-lg text-white/70 max-w-2xl mx-auto leading-relaxed font-medium">
                  Discover handcrafted, melt-in-your-mouth gourmet donuts baked fresh every single morning.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2 sm:pt-4">
                  <button 
                    onClick={() => setActiveTab('menu')}
                    className="w-full sm:w-auto px-8 py-4 rounded-full bg-[#00FFCC] text-black font-black uppercase text-xs tracking-widest shadow-lg shadow-[#00FFCC]/20 hover:bg-white hover:scale-105 transition-all duration-200 text-center"
                  >
                    Order Now 
                  </button>
                  
                  <a 
                    href="#flavors-grid"
                    className="w-full sm:w-auto px-8 py-4 rounded-full bg-white/10 backdrop-blur-md text-white font-black uppercase text-xs tracking-widest border border-white/20 shadow-sm hover:bg-white/20 hover:scale-105 transition-all duration-200 text-center"
                  >
                    Explore Flavors
                  </a>
                </div>
              </div>
            </section>

            <section className="py-10 sm:py-12 px-4 sm:px-6 md:px-12 lg:px-24 flex flex-col items-center rounded-[30px] sm:rounded-[40px] bg-black/40 backdrop-blur-xl border border-white/10 shadow-2xl">
              <div className="text-center max-w-xl mb-8 sm:mb-10 space-y-2">
                <h2 className="text-2xl sm:text-4xl font-black italic uppercase text-white">Watch the <span className="text-[#00FFCC]">Magic Happen</span></h2>
                <p className="text-white/60 text-[11px] sm:text-xs font-bold uppercase tracking-widest">Take a sneak peek behind the scenes at how our master bakers craft your favorite sweet treats.</p>
              </div>

              <div className="relative w-full max-w-4xl rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl border-2 sm:border-4 border-white/10 bg-black/5 group">
                <video 
                  src="/vid.mp4" 
                  autoPlay 
                  loop 
                  muted 
                  playsInline 
                  className="w-full h-auto object-cover max-h-[350px] sm:max-h-[500px]"
                />
              </div>
            </section>

            <section id="flavors-grid" className="py-10 sm:py-12 px-4 sm:px-6 md:px-12 lg:px-24 rounded-[30px] sm:rounded-[40px] bg-black/40 backdrop-blur-xl border border-white/10 shadow-2xl">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 sm:mb-12 gap-4">
                <div>
                  <span className="text-[#00FFCC] font-black text-xs tracking-widest uppercase">Our Specials</span>
                  <h2 className="text-2xl sm:text-4xl font-black italic uppercase text-white mt-1">Featured Donut Masterpieces</h2>
                </div>
                <button onClick={() => setActiveTab('menu')} className="inline-flex items-center text-[#00FFCC] font-black text-xs uppercase tracking-widest hover:text-white transition-colors">
                  View Full Menu &rarr;
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 items-stretch">
                {loading ? (
                  <p className="col-span-full text-center text-[#00FFCC] animate-pulse font-black text-lg">
                    Loading Featured Donuts...
                  </p>
                ) : (
                  donuts.slice(0, 3).map((d) => (
                    <DonutItem 
                      key={d.id} 
                      d={d} 
                      onAdd={addToCart} 
                      imgSrc={getDonutImage(d)} 
                    />
                  ))
                )}
              </div>
            </section>

            <section className="py-8 sm:py-12 max-w-7xl mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 items-stretch">
                <div className="relative rounded-[30px] sm:rounded-[40px] bg-gradient-to-r from-emerald-950/60 via-black to-teal-950/60 p-6 sm:p-12 text-white shadow-2xl overflow-hidden text-center lg:text-left border border-[#00FFCC]/30 backdrop-blur-xl flex flex-col justify-center">
                  <div className="relative z-10 space-y-4 sm:space-y-6">
                    <h3 className="text-xl sm:text-4xl font-black italic uppercase tracking-wider text-[#00FFCC]">
                      &quot;LIFE IS SHORT. EAT THE DONUT.&quot;
                    </h3>
                    
                    <p className="text-white/70 text-xs sm:text-sm font-bold uppercase tracking-widest leading-relaxed">
                      Can't decide what to pick? Click below to reveal your lucky donut of the day from our fresh menu!
                    </p>
                    
                    <div className="pt-2">
                      <button 
                        onClick={pickLuckyDonut}
                        disabled={isPickingLucky}
                        className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-[#00FFCC] text-black font-black uppercase text-xs tracking-widest hover:bg-white transition-all shadow-lg active:scale-95 disabled:opacity-50"
                      >
                        {isPickingLucky ? '✨ Picking Your Lucky Donut...' : ' Ur Lucky Flavor'}
                      </button>
                    </div>

                    {luckyDonut && !isPickingLucky && (
                      <div className="mt-4 sm:mt-6 p-4 sm:p-6 rounded-3xl bg-black/60 border border-[#00FFCC]/40 backdrop-blur-md flex flex-col sm:flex-row items-center gap-4 sm:gap-6 animate-in fade-in zoom-in duration-300 text-left">
                        <img 
                          src={getDonutImage(luckyDonut)} 
                          alt={luckyDonut.name} 
                          className="w-16 h-16 sm:w-20 sm:h-20 object-contain rounded-2xl bg-white/5 p-2 border border-white/10" 
                        />
                        <div className="flex-1 text-center sm:text-left">
                          <span className="text-[10px] font-black text-[#00FFCC] uppercase tracking-widest block mb-1">⭐ Your Lucky Pick Today</span>
                          <h4 className="text-base sm:text-lg font-black uppercase tracking-wide text-white mb-1">{luckyDonut.name}</h4>
                          <span className="text-sm sm:text-base font-black text-[#00FFCC]">
                            {luckyDonut.sale_price && luckyDonut.sale_price > 0 && luckyDonut.sale_price < luckyDonut.price
                              ? `${luckyDonut.sale_price.toFixed(2)} DH`
                              : `${luckyDonut.price.toFixed(2)} DH`
                            }
                          </span>
                        </div>
                        <button 
                          onClick={() => addToCart(luckyDonut, 1)}
                          className="px-4 py-2.5 rounded-xl bg-[#00FFCC] text-black font-black text-xs uppercase tracking-widest hover:bg-white transition-all shadow"
                        >
                          Add to Box
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="relative rounded-[30px] sm:rounded-[40px] overflow-hidden border border-[#00FFCC]/30 bg-black/40 backdrop-blur-xl shadow-2xl group min-h-[300px] sm:min-h-[380px] flex flex-col justify-between p-6 sm:p-8">
                  <img 
                    src="/howr.jpeg" 
                    alt="Donuts Factory Opening Hours" 
                    className="absolute inset-0 w-full h-full object-cover rounded-[30px] sm:rounded-[40px] group-hover:scale-105 transition-transform duration-700 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/60 z-10 rounded-[30px] sm:rounded-[40px] pointer-events-none" />

                  <div className="relative z-20">
                    <span className="inline-block px-4 sm:px-5 py-1.5 sm:py-2 rounded-2xl bg-black/60 backdrop-blur-md border border-white/10 text-[#00FFCC] font-black text-xs uppercase tracking-[0.25em]">
                       HOURS
                    </span>
                  </div>

                  <div className="relative z-20 bg-black/70 backdrop-blur-md p-4 sm:p-6 rounded-3xl border border-white/10 text-center">
                    <span className="text-[#00FFCC] font-black text-[10px] uppercase tracking-widest block mb-1">
                      OPEN DAILY
                    </span>
                    <p className="text-white font-black text-xs sm:text-lg uppercase tracking-wider">
                      Monday – Sunday <span className="text-[#00FFCC] mx-1 sm:mx-2">|</span> 9:00 AM – 1:00 AM
                    </p>
                  </div>
                </div>

              </div>
            </section>
          </div>
        )}

        {activeTab === 'menu' && (
          <div className="space-y-8 sm:space-y-12 animate-in slide-in-from-bottom-5 duration-700">
            <div className="text-center space-y-3 sm:space-y-4 py-6 sm:py-8">
              <span className="inline-block py-1.5 sm:py-2 px-4 sm:px-6 rounded-full bg-[#00FFCC]/10 border border-[#00FFCC]/30 text-[#00FFCC] font-black text-[10px] sm:text-xs uppercase tracking-[0.3em] shadow-lg">
                Freshly Baked For You
              </span>
              <h2 className="text-3xl sm:text-6xl font-black italic uppercase tracking-tight text-white">
                Our Donuts Are Happy <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00FFCC] via-teal-300 to-emerald-400">
                  To See You!
                </span>
              </h2>
              <p className="text-white/60 text-xs sm:text-sm font-bold uppercase tracking-widest max-w-xl mx-auto px-4">
                Explore our delicious daily selection and pick your favorite sweet masterpieces.
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-6 items-stretch">
              {loading ? (
                <p className="col-span-full text-center text-[#00FFCC] animate-pulse font-black text-xl">Loading Donuts...</p>
              ) : donuts.length === 0 ? (
                <p className="col-span-full text-center text-white/40 font-black text-sm tracking-widest">No donuts available. Check Supabase Dashboard.</p>
              ) : (
                donuts.map(d => (
                  <DonutItem key={d.id} d={d} onAdd={addToCart} imgSrc={getDonutImage(d)} />
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'about us' && (
          <div className="animate-in fade-in slide-in-from-bottom-10 duration-700 space-y-12 sm:space-y-20 py-8 sm:py-12 max-w-7xl mx-auto">
            <div className="relative text-center space-y-4 sm:space-y-6">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-60 h-60 sm:w-80 sm:h-80 bg-[#00FFCC]/10 rounded-full blur-3xl pointer-events-none"></div>
              
              <span className="inline-block py-1.5 px-4 sm:py-2 sm:px-5 rounded-full bg-[#00FFCC]/10 text-[#00FFCC] font-black text-[10px] sm:text-xs tracking-[0.25em] uppercase shadow-inner border border-[#00FFCC]/30">
                Our Sweet Heritage
              </span>
              
              <h2 className="text-3xl sm:text-6xl md:text-7xl font-black italic uppercase tracking-tight text-white leading-tight">
                Crafted with Passion. <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00FFCC] via-teal-300 to-emerald-400 drop-shadow-[0_0_20px_rgba(0,255,204,0.3)]">
                  Sweetening Your Every Moment.
                </span>
              </h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-10 items-start">
              <div className="relative rounded-[30px] sm:rounded-[45px] bg-gradient-to-b from-white/[0.08] to-white/[0.02] p-6 sm:p-10 border border-white/10 backdrop-blur-2xl shadow-2xl space-y-4 sm:space-y-5 h-auto self-start">
                <p className="text-white/90 text-sm sm:text-lg font-light leading-relaxed tracking-wide">
                  Welcome to our world, where every single doughnut is not just a treat, but a <span className="text-[#00FFCC] font-bold">daily labor of love</span>.
                </p>
                
                <div className="h-px w-full bg-gradient-to-r from-transparent via-white/20 to-transparent my-2 sm:my-3"></div>
                
                <p className="text-white/70 text-xs sm:text-sm font-normal leading-relaxed">
                  Our journey began with a simple yet ambitious vision: to create an exceptional experience that awakens the senses. We believe that true magic lies in the details—from selecting the finest, purest ingredients to kneading each batch fresh every morning, right down to the artisanal finishing touches that make every bite unforgettable.
                </p>
                
                <p className="text-white/70 text-xs sm:text-sm font-normal leading-relaxed">
                  We are here to offer you more than just a favorite dessert; we are here to craft a moment of pure bliss for you to share with loved ones or savor all by yourself.
                </p>
              </div>

              <div className="relative rounded-[30px] sm:rounded-[45px] overflow-hidden border border-[#00FFCC]/30 bg-black/40 backdrop-blur-xl shadow-2xl group h-[320px] sm:h-[480px] flex items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10 pointer-events-none"></div>
                <img 
                  src="/r1.jpeg" 
                  alt="Donuts Factory Artisanal Selection" 
                  className="w-full h-full object-cover rounded-[30px] sm:rounded-[45px] group-hover:scale-105 transition-transform duration-700 ease-out"
                />
                <div className="absolute bottom-6 left-6 z-20 bg-black/60 backdrop-blur-md px-4 sm:px-5 py-2 sm:py-2.5 rounded-2xl border border-white/10">
                  <span className="text-[#00FFCC] font-black text-[10px] sm:text-xs uppercase tracking-widest block"> Handcrafted Perfection</span>
                </div>
              </div>
            </div>

            <div className="space-y-6 sm:space-y-8">
              <div className="text-center">
                <h3 className="text-2xl sm:text-4xl font-black italic uppercase text-white tracking-wider">
                  Our Core <span className="text-[#00FFCC]">Values</span>
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
                <div className="relative rounded-[30px] sm:rounded-[35px] p-6 sm:p-8 bg-black/50 border border-white/10 hover:border-[#00FFCC]/60 transition-all duration-500 hover:-translate-y-2 group shadow-xl overflow-hidden">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-[#00FFCC]/10 border border-[#00FFCC]/30 flex items-center justify-center text-2xl sm:text-3xl mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300">
                    ☀️
                  </div>
                  <h4 className="text-lg sm:text-xl font-black italic uppercase text-white mb-2 sm:mb-3">Freshly Baked Daily</h4>
                  <p className="text-white/60 text-xs sm:text-sm font-medium leading-relaxed italic">
                    &quot;We bake our passion fresh every day to guarantee that irresistible melt-in-your-mouth perfection.&quot;
                  </p>
                </div>

                <div className="relative rounded-[30px] sm:rounded-[35px] p-6 sm:p-8 bg-black/50 border border-white/10 hover:border-[#00FFCC]/60 transition-all duration-500 hover:-translate-y-2 group shadow-xl overflow-hidden">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-[#00FFCC]/10 border border-[#00FFCC]/30 flex items-center justify-center text-2xl sm:text-3xl mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300">
                    🍫
                  </div>
                  <h4 className="text-lg sm:text-xl font-black italic uppercase text-white mb-2 sm:mb-3">Premium Ingredients</h4>
                  <p className="text-white/60 text-xs sm:text-sm font-medium leading-relaxed italic">
                    &quot;We source only the finest chocolates, fruits, and global ingredients to elevate your taste experience.&quot;
                  </p>
                </div>

                <div className="relative rounded-[30px] sm:rounded-[35px] p-6 sm:p-8 bg-black/50 border border-white/10 hover:border-[#00FFCC]/60 transition-all duration-500 hover:-translate-y-2 group shadow-xl overflow-hidden">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-[#00FFCC]/10 border border-[#00FFCC]/30 flex items-center justify-center text-2xl sm:text-3xl mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300">
                    ❤️
                  </div>
                  <h4 className="text-lg sm:text-xl font-black italic uppercase text-white mb-2 sm:mb-3">Endless Passion</h4>
                  <p className="text-white/60 text-xs sm:text-sm font-medium leading-relaxed italic">
                    &quot;Every piece we create carries the touch of creativity and a team dedicated to your happiness.&quot;
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 items-center">
              <div className="relative rounded-[30px] sm:rounded-[40px] overflow-hidden border border-[#00FFCC]/30 bg-black/40 backdrop-blur-xl shadow-2xl group h-[280px] sm:h-[400px]">
                <img 
                  src="/r2.jpeg" 
                  alt="Donuts Factory Store Interior" 
                  className="w-full h-full object-cover rounded-[30px] sm:rounded-[40px] group-hover:scale-105 transition-transform duration-700 ease-out"
                />
                <div className="absolute bottom-6 left-6 z-20 bg-black/60 backdrop-blur-md px-4 sm:px-5 py-2 sm:py-2.5 rounded-2xl border border-white/10">
                  <span className="text-[#00FFCC] font-black text-[10px] sm:text-xs uppercase tracking-widest block">📍 Visit Our Store</span>
                </div>
              </div>

              <div className="flex items-center justify-center">
                <div className="w-full relative rounded-[30px] sm:rounded-[35px] bg-gradient-to-r from-emerald-950/60 via-black to-teal-950/60 p-6 sm:p-8 text-center lg:text-left border border-[#00FFCC]/40 backdrop-blur-xl shadow-2xl overflow-hidden self-center">
                  <div className="relative z-10 space-y-2 sm:space-y-3">
                    <span className="text-[#00FFCC] text-[10px] sm:text-xs font-black uppercase tracking-[0.3em] block">
                      Come Join Us
                    </span>
                    <h3 className="text-lg sm:text-2xl md:text-3xl font-black italic uppercase tracking-wider text-white leading-tight">
                      &quot;Visit one of our stores today and let the sweetness begin!&quot;
                    </h3>
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}

        {activeTab === 'contact us' && (
          <div className="animate-in fade-in slide-in-from-bottom-10 duration-700 space-y-12 sm:space-y-16 py-8 sm:py-12 max-w-6xl mx-auto">
            <div className="text-center">
              <h2 className="text-4xl sm:text-6xl font-black italic uppercase tracking-tighter text-white">
                Get In <span className="text-[#00FFCC]">Touch.</span>
              </h2>
              <p className="text-white/40 font-black uppercase tracking-widest text-[10px] mt-2 sm:mt-4">
                Connect with us on social media
              </p>
            </div>

            <div className="flex flex-col md:flex-row gap-6 sm:gap-8 justify-center items-center">
              <a 
                href="https://linktr.ee/donutsfactory" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="glass-card p-6 sm:p-8 rounded-[30px] sm:rounded-[40px] border border-white/10 shadow-2xl w-full max-w-sm group hover:border-[#E1306C] transition-all duration-500 hover:shadow-[#E1306C]/20 bg-black/40 backdrop-blur-xl"
              >
                <div className="text-6xl sm:text-7xl mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-500 flex justify-center">
                  <svg width="70" height="70" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="group-hover:rotate-6 transition-transform duration-500">
                    <rect x="2" y="2" width="20" height="20" rx="5" stroke="url(#instagram-gradient)" strokeWidth="2"/>
                    <circle cx="12" cy="12" r="4" stroke="url(#instagram-gradient)" strokeWidth="2"/>
                    <circle cx="18" cy="6" r="1" fill="url(#instagram-gradient)"/>
                    <defs>
                      <linearGradient id="instagram-gradient" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#F58529"/>
                        <stop offset="0.5" stopColor="#DD2A7B"/>
                        <stop offset="1" stopColor="#8134AF"/>
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
                <h3 className="text-xl sm:text-2xl font-black italic uppercase tracking-tighter mb-1 sm:mb-2 text-center text-white">Instagram</h3>
                <p className="text-white/40 text-[10px] font-black uppercase tracking-widest mb-4 sm:mb-6 text-center">@donutsfactory</p>
                <div className="bg-gradient-to-r from-[#F58529] via-[#DD2A7B] to-[#8134AF] text-white py-3.5 sm:py-4 rounded-2xl text-[9px] font-black uppercase tracking-widest text-center group-hover:opacity-90 transition-all shadow-lg">
                  Follow Us
                </div>
              </a>

              <a 
                href="https://wa.me/212618785535" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="glass-card p-6 sm:p-8 rounded-[30px] sm:rounded-[40px] border border-white/10 shadow-2xl w-full max-w-sm group hover:border-[#25D366] transition-all duration-500 hover:shadow-[#25D366]/20 bg-black/40 backdrop-blur-xl"
              >
                <div className="text-6xl sm:text-7xl mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-500 flex justify-center">
                  <svg width="70" height="70" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="group-hover:rotate-6 transition-transform duration-500">
                    <rect width="24" height="24" rx="6" fill="#25D366"/>
                    <path d="M12 4.5C7.86 4.5 4.5 7.86 4.5 12c0 1.41.39 2.73 1.07 3.86L4.5 19.5l3.75-1.04C9.35 19.1 10.63 19.5 12 19.5c4.14 0 7.5-3.36 7.5-7.5S16.14 4.5 12 4.5zm0 13.6c-1.19 0-2.34-.33-3.33-.95l-.24-.15-2.22.62.63-2.16-.16-.25A6.08 6.08 0 015.9 12c0-3.36 2.74-6.1 6.1-6.1s6.1 2.74 6.1 6.1-2.74 6.1-6.1 6.1zm3.35-4.57c-.18-.09-1.08-.53-1.25-.6-.17-.06-.29-.09-.41.09-.12.18-.47.6-.58.72-.11.12-.21.13-.39.04-.18-.09-.77-.28-1.47-.9-.55-.49-.91-1.1-1.02-1.29-.11-.18-.01-.28.08-.37.08-.08.18-.21.27-.32.09-.11.12-.18.18-.3.06-.12.03-.23-.01-.32-.05-.09-.41-1-.57-1.37-.15-.36-.31-.31-.41-.31h-.35c-.12 0-.32.05-.49.23-.17.18-.65.64-.65 1.56s.67 1.81.76 1.93c.09.12 1.32 2.02 3.2 2.83.45.19.8.31 1.07.4.45.14.86.12 1.18.07.36-.05 1.08-.44 1.23-.87.15-.43.15-.8.11-.87-.04-.08-.16-.12-.34-.21z" fill="white"/>
                  </svg>
                </div>
                <h3 className="text-xl sm:text-2xl font-black italic uppercase tracking-tighter mb-1 sm:mb-2 text-center text-white">WhatsApp</h3>
                <p className="text-white/40 text-[10px] font-black uppercase tracking-widest mb-4 sm:mb-6 text-center">+212 618-785535</p>
                <div className="bg-[#25D366] text-black py-3.5 sm:py-4 rounded-2xl text-[9px] font-black uppercase tracking-widest text-center group-hover:opacity-90 transition-all shadow-lg">
                  Chat Now
                </div>
              </a>
            </div>

            <div className="glass-card p-6 sm:p-12 rounded-[30px] sm:rounded-[40px] border border-white/10 shadow-2xl bg-black/40 backdrop-blur-xl max-w-3xl mx-auto">
              <div className="text-center mb-6 sm:mb-8">
                <h3 className="text-xl sm:text-2xl font-black italic uppercase text-white tracking-wider mb-1 sm:mb-2">
                  Send Us a Note
                </h3>
                <p className="text-white/40 text-[10px] sm:text-xs uppercase tracking-widest font-black">
                  Drop your message and we'll get back to you
                </p>
              </div>

              <form onSubmit={handleSendMessage} className="space-y-4 sm:space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <input 
                    type="text" 
                    placeholder="YOUR NAME" 
                    value={contactForm.name}
                    onChange={(e) => setContactForm({...contactForm, name: e.target.value})}
                    className="w-full bg-black/50 border border-white/10 p-3.5 sm:p-4 rounded-2xl text-white placeholder-white/30 text-xs font-black uppercase outline-none focus:border-[#00FFCC] transition-colors"
                    required
                  />
                  <input 
                    type="email" 
                    placeholder="YOUR EMAIL" 
                    value={contactForm.email}
                    onChange={(e) => setContactForm({...contactForm, email: e.target.value})}
                    className="w-full bg-black/50 border border-white/10 p-3.5 sm:p-4 rounded-2xl text-white placeholder-white/30 text-xs font-black uppercase outline-none focus:border-[#00FFCC] transition-colors"
                    required
                  />
                </div>
                <textarea 
                  rows={4} 
                  placeholder="YOUR MESSAGE..." 
                  value={contactForm.message}
                  onChange={(e) => setContactForm({...contactForm, message: e.target.value})}
                  className="w-full bg-black/50 border border-white/10 p-3.5 sm:p-4 rounded-2xl text-white placeholder-white/30 text-xs font-black uppercase outline-none focus:border-[#00FFCC] transition-colors resize-none"
                  required
                ></textarea>
                <button 
                  type="submit" 
                  disabled={isSendingMessage}
                  className="w-full py-3.5 sm:py-4 rounded-2xl bg-[#00FFCC] text-black font-black text-xs uppercase tracking-widest hover:bg-white transition-all shadow-lg active:scale-95 disabled:opacity-50"
                >
                  {isSendingMessage ? 'SENDING...' : 'Send Message 🚀'}
                </button>
              </form>
            </div>

            <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6 pt-4">
              <div className="text-center">
                <h3 className="text-xl sm:text-2xl font-black italic uppercase text-white tracking-wider mb-1 sm:mb-2">
                  Frequently Asked Questions
                </h3>
                <p className="text-white/40 text-[10px] sm:text-xs uppercase tracking-widest font-black">
                  Quick answers to common questions
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <div className="glass-card p-5 sm:p-6 rounded-[25px] sm:rounded-[30px] bg-black/40 border border-white/10 backdrop-blur-xl space-y-2">
                  <h4 className="text-[#00FFCC] font-black text-xs uppercase tracking-wide">
                    Do you offer home delivery?
                  </h4>
                  <p className="text-white/60 text-xs font-medium leading-relaxed">
                    Yes! You can order directly through our website or contact us via WhatsApp for fast local delivery.
                  </p>
                </div>

                <div className="glass-card p-5 sm:p-6 rounded-[25px] sm:rounded-[30px] bg-black/40 border border-white/10 backdrop-blur-xl space-y-2">
                  <h4 className="text-[#00FFCC] font-black text-xs uppercase tracking-wide">
                    Are donuts baked fresh daily?
                  </h4>
                  <p className="text-white/60 text-xs font-medium leading-relaxed">
                    100% fresh! Our master bakers prepare every single batch every morning using premium ingredients.
                  </p>
                </div>
              </div>
            </div>

          </div>
        )}

        {activeTab === 'locations' && (
          <div className="animate-in fade-in slide-in-from-bottom-10 duration-700 space-y-8 sm:space-y-12">
            <div className="text-center">
              <h2 className="text-4xl sm:text-6xl font-black italic uppercase tracking-tighter">Visit Our <span className="text-[#00FFCC]">Factory.</span></h2>
              <p className="text-white/40 font-black uppercase tracking-widest text-[10px] mt-2 sm:mt-4">Find us at our main location</p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 items-stretch">
              <div className="glass-card p-6 sm:p-8 rounded-[30px] sm:rounded-[40px] flex flex-col justify-between shadow-2xl border border-white/10 bg-black/40 backdrop-blur-xl">
                <div className="w-full h-[320px] sm:h-[450px] rounded-[25px] sm:rounded-[30px] overflow-hidden border border-white/10 shadow-lg mb-6 group">
                  <iframe 
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3324.1847828780756!2d-7.6511066252084285!3d33.57455124280437!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xda7d336702e3d5d!2sDonuts%20Factory!5e0!3m2!1sfr!2sma!4v1776453120404!5m2!1sfr!2sma" 
                    className="w-full h-full grayscale invert contrast-[1.2] opacity-80 group-hover:grayscale-0 group-hover:invert-0 group-hover:opacity-100 transition-all duration-1000" 
                    style={{ border: 0 }} 
                    allowFullScreen={true} 
                    loading="lazy" 
                    referrerPolicy="no-referrer-when-downgrade" 
                    title="Donuts Factory Location"
                  ></iframe>
                </div>
                <a 
                  href="https://maps.app.goo.gl/Ez4VU7rpHc8UQyMv7" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="w-full text-center bg-[#00FFCC] text-black font-black uppercase tracking-widest py-3.5 sm:py-4 px-6 rounded-2xl hover:bg-white transition-all shadow-lg block text-[9px]"
                >
                   Open in Google Maps
                </a>
              </div>

              <div className="glass-card p-6 sm:p-8 rounded-[30px] sm:rounded-[40px] flex flex-col justify-between shadow-2xl border border-white/10 bg-black/40 backdrop-blur-xl">
                <div className="w-full h-[320px] sm:h-[450px] rounded-[25px] sm:rounded-[30px] overflow-hidden border border-white/10 shadow-lg mb-6 relative group">
                  <img 
                    src="/donut1.jpeg" 
                    alt="Donuts Factory Storefront" 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="bg-black/30 border border-white/10 p-4 sm:p-5 rounded-2xl text-center">
                  <span className="text-[#00FFCC] font-bold text-[9px] uppercase tracking-widest block mb-1">
                    Factory Address
                  </span>
                  <p className="text-white font-black text-xs sm:text-base leading-relaxed tracking-wider">
                    18 bis, résidence Celia, Rue Ibnou Katir, Casablanca
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </main>
  );
}

function DonutItem({ d, onAdd, imgSrc }: { d: Donut, onAdd: (d: Donut, q: number) => void, imgSrc: string }) {
  const [qty, setQty] = useState(0);
  const hasDiscount = d.sale_price && d.sale_price > 0 && d.sale_price < d.price;
  return (
    <div className="glass-card p-4 sm:p-6 rounded-[25px] sm:rounded-[30px] border border-white/10 group hover:border-[#00FFCC]/50 transition-all duration-500 flex flex-col items-center justify-between h-full bg-black/40 backdrop-blur-xl">
      <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden bg-white/5 mb-3 sm:mb-4 flex items-center justify-center border border-white/10">
        <img src={imgSrc} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={d.name} />
      </div>
      <div className="text-center w-full">
        <h3 className="text-xs sm:text-sm font-semibold text-white/90 tracking-wide mb-2 sm:mb-3 truncate">{d.name}</h3>
        
        <div className="flex flex-col items-center mb-3 sm:mb-4 min-h-[40px] sm:min-h-[50px]">
          {hasDiscount ? (
            <>
              <span className="text-red-500 line-through text-xs sm:text-sm font-medium opacity-70">{d.price.toFixed(2)} DH</span>
              <span className="text-[#00FFCC] font-black text-base sm:text-xl drop-shadow-[0_0_5px_rgba(0,255,204,0.5)]">{d.sale_price.toFixed(2)} DH</span>
            </>
          ) : (
            <span className="text-[#00FFCC] font-black text-base sm:text-lg">{d.price.toFixed(2)} DH</span>
          )}
        </div>
        
        <div className="flex items-center justify-center gap-3 sm:gap-4 mb-3 sm:mb-4 bg-white/5 rounded-2xl px-3 py-1 border border-white/10">
          <button onClick={() => setQty(q => Math.max(0, q - 1))} className="text-[#00FFCC] text-lg sm:text-xl font-black">-</button>
          <span className="text-xs sm:text-sm font-black w-4 text-center">{qty}</span>
          <button onClick={() => setQty(q => q + 1)} className="text-[#00FFCC] text-lg sm:text-xl font-black">+</button>
        </div>

        <div className="flex w-full gap-2">
          <button onClick={() => { if(qty > 0) { onAdd(d, qty); setQty(0); } }} className="flex-[2] text-[8px] sm:text-[9px] font-black bg-[#00FFCC] text-black py-2.5 sm:py-3 rounded-xl sm:rounded-2xl hover:bg-white uppercase transition-all shadow-lg active:scale-95">Add to Box</button>
          <button onClick={() => setQty(0)} className="flex-1 text-[8px] font-black bg-red-500/10 text-red-500 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl hover:bg-red-500 hover:text-white uppercase transition-all border border-red-500/20 active:scale-95">Delete</button>
        </div>
      </div>
    </div>
  );
}