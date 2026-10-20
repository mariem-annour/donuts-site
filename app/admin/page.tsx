
"use client";
import { useState, useEffect, ChangeEvent } from 'react';
import { supabase } from '@/lib/supabase';
import toast, { Toaster } from 'react-hot-toast';

interface Donut {
  id: number;
  name: string;
  price: number;
  sale_price: number | null;
  image_url: string | null;
  is_active: boolean;
  created_at: string;
}

interface Order {
  id: number;
  customer_name: string;
  phone: string;
  address: string;
  items: string;
  total_price: number;
  payment_method: string;
  status: string;
  created_at: string;
}

interface Message {
  id: number;
  name: string;
  email: string;
  message: string;
  created_at: string;
}

export default function AdminPanel() {
  const [session, setSession] = useState<any>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  const [activeSubTab, setActiveSubTab] = useState<'donuts' | 'orders' | 'messages'>('donuts');
  const [donuts, setDonuts] = useState<Donut[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [sendingOrderIds, setSendingOrderIds] = useState<number[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [orderToDelete, setOrderToDelete] = useState<number | null>(null);
  const [deletingOrder, setDeletingOrder] = useState(false);

  const [messageToDelete, setMessageToDelete] = useState<number | null>(null);
  const [deletingMessage, setDeletingMessage] = useState(false);

  const [soundEnabled, setSoundEnabled] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    price: '',
    sale_price: '',
    is_active: true
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        fetchDonuts();
        fetchOrders();
        fetchMessages();
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        fetchDonuts();
        fetchOrders();
        fetchMessages();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session) return;

    const channelOrders = supabase
      .channel('realtime-orders')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'orders' },
        (payload) => {
          const newOrder = payload.new as Order;
          playNotificationSound();
          toast.success(`🚨 New Order from ${newOrder.customer_name}!`, { duration: 6000 });
          fetchOrders();
        }
      )
      .subscribe();

    const channelMessages = supabase
      .channel('realtime-messages')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload) => {
          const newMsg = payload.new as Message;
          playNotificationSound();
          toast.success(`💬 New Message from ${newMsg.name}!`, { duration: 6000 });
          fetchMessages();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channelOrders);
      supabase.removeChannel(channelMessages);
    };
  }, [session]);

  const playNotificationSound = () => {
    try {
      const audio = new Audio('/notify.mp3');
      audio.volume = 1.0;
      audio.play().catch((e) => {
        console.log("Audio play blocked by browser policy:", e);
      });
    } catch (e) {
      console.error("Audio error:", e);
    }
  };

  const enableSound = () => {
    try {
      const audio = new Audio('/notify.mp3');
      audio.volume = 1.0;
      audio.play().then(() => {
        setSoundEnabled(true);
        toast.success("🔊 Sound notifications enabled successfully!");
      }).catch((e) => {
        setSoundEnabled(true);
      });
    } catch (e) {
      console.error("Error enabling sound:", e);
    }
  };

  async function fetchDonuts() {
    setLoading(true);
    const { data, error } = await supabase
      .from('donuts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) toast.error("Failed to load donuts");
    else setDonuts(data || []);
    setLoading(false);
  }

  async function fetchOrders() {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error) setOrders(data || []);
  }

  async function fetchMessages() {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error) setMessages(data || []);
  }

  const markAsSent = async (orderId: number) => {
    const orderToUpdate = orders.find((order) => order.id === orderId);

    if (
      !orderToUpdate ||
      orderToUpdate.status === 'Sent with Driver' ||
      sendingOrderIds.includes(orderId)
    ) {
      return;
    }

    const previousStatus = orderToUpdate.status;

    setSendingOrderIds((current) => [...current, orderId]);

    setOrders((current) =>
      current.map((order) =>
        order.id === orderId
          ? { ...order, status: 'Sent with Driver' }
          : order
      )
    );

    const { error } = await supabase
      .from('orders')
      .update({ status: 'Sent with Driver' })
      .eq('id', orderId);

    if (error) {
      setOrders((current) =>
        current.map((order) =>
          order.id === orderId
            ? { ...order, status: previousStatus }
            : order
        )
      );

      toast.error("Failed to update order status");
    } else {
      toast.success("🚀 Sent to Driver Successfully");
    }

    setSendingOrderIds((current) =>
      current.filter((id) => id !== orderId)
    );
  };

  const confirmDeleteOrder = async () => {
    if (!orderToDelete) return;

    setDeletingOrder(true);

    const { error } = await supabase
      .from('orders')
      .delete()
      .eq('id', orderToDelete);

    if (error) {
      toast.error("Failed to delete order");
    } else {
      toast.success("Order deleted successfully!");
      fetchOrders();
    }

    setDeletingOrder(false);
    setOrderToDelete(null);
  };

  const confirmDeleteMessage = async () => {
    if (!messageToDelete) return;

    setDeletingMessage(true);

    const { error } = await supabase
      .from('messages')
      .delete()
      .eq('id', messageToDelete);

    if (error) {
      toast.error("Failed to delete message");
    } else {
      toast.success("Message deleted successfully!");
      fetchMessages();
    }

    setDeletingMessage(false);
    setMessageToDelete(null);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) toast.error("Invalid credentials");
    else toast.success("Welcome back!");

    setAuthLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSession(null);
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.price) {
      toast.error("Please fill required fields");
      return;
    }

    setSaving(true);
    let imageUrl = null;

    try {
      if (selectedFile) {
        const fileName = `${Date.now()}-${selectedFile.name}`;

        const { error: uploadError } = await supabase.storage
          .from('donuts-images')
          .upload(fileName, selectedFile);

        if (uploadError) throw uploadError;

        const { data } = supabase.storage
          .from('donuts-images')
          .getPublicUrl(fileName);

        imageUrl = data?.publicUrl || null;
      }

      const payload: any = {
        name: formData.name,
        price: parseFloat(formData.price),
        sale_price: formData.sale_price
          ? parseFloat(formData.sale_price)
          : null,
        is_active: formData.is_active
      };

      if (imageUrl) payload.image_url = imageUrl;

      if (editingId) {
        const { error } = await supabase
          .from('donuts')
          .update(payload)
          .eq('id', editingId);

        if (error) throw error;

        toast.success("Donut updated successfully!");
      } else {
        const { error } = await supabase
          .from('donuts')
          .insert([payload]);

        if (error) throw error;

        toast.success("Donut added successfully!");
      }

      setFormData({
        name: '',
        price: '',
        sale_price: '',
        is_active: true
      });

      setSelectedFile(null);
      setEditingId(null);
      fetchDonuts();
    } catch (error: any) {
      toast.error("Error: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (donut: Donut) => {
    setEditingId(donut.id);

    setFormData({
      name: donut.name,
      price: donut.price.toString(),
      sale_price: donut.sale_price?.toString() || '',
      is_active: donut.is_active
    });

    setSelectedFile(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const removeSale = async (id: number) => {
    const { error } = await supabase
      .from('donuts')
      .update({ sale_price: null })
      .eq('id', id);

    if (error) {
      toast.error("Could not remove sale");
    } else {
      toast.success("Sale removed!");
      fetchDonuts();
    }
  };

  const deleteDonut = async (id: number) => {
    if (!confirm('Are you sure?')) return;

    const { error } = await supabase
      .from('donuts')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error("Error deleting donut");
    } else {
      toast.success("Donut deleted");
      fetchDonuts();
    }
  };

  const toggleActive = async (id: number, currentStatus: boolean) => {
    const { error } = await supabase
      .from('donuts')
      .update({ is_active: !currentStatus })
      .eq('id', id);

    if (error) toast.error("Error updating status");
    else fetchDonuts();
  };

  if (!session) {
    return (
      <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <video autoPlay loop muted playsInline className="w-full h-full object-cover">
            <source src="/backp.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-black/70 backdrop-blur-md"></div>
        </div>

        <Toaster position="top-center" />

        <div className="w-full max-w-md relative z-15">
          <div className="bg-white/5 backdrop-blur-2xl p-6 sm:p-10 rounded-[2.5rem] border border-white/10 shadow-2xl">
            <div className="text-center mb-8">
              <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-4 rounded-full overflow-hidden border-2 border-[#00FFCC] shadow-lg shadow-[#00FFCC]/30 bg-white/10">
                <img
                  src="/logop.jpeg"
                  alt="Logo"
                  className="w-full h-full object-cover"
                />
              </div>

              <h1 className="text-3xl sm:text-4xl font-black text-white mb-2 tracking-tighter">
                ADMIN <span className="text-[#00FFCC]">LOGIN</span>
              </h1>

              <p className="text-white/60 text-xs sm:text-sm">
                Donuts Factory Dashboard
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4 sm:space-y-5">
              <div>
                <label className="block text-xs font-bold text-white/60 uppercase tracking-wider mb-2">
                  Email
                </label>
                <input 
                  type="email"
                  placeholder="admin@donutsfactory.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-black/30 border border-white/10 p-3.5 sm:p-4 rounded-xl text-white outline-none focus:border-[#00FFCC] transition-all text-xs sm:text-sm"
                  required 
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-white/60 uppercase tracking-wider mb-2">
                  Password
                </label>
                <input 
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-black/30 border border-white/10 p-3.5 sm:p-4 rounded-xl text-white outline-none focus:border-[#00FFCC] transition-all text-xs sm:text-sm"
                  required 
                />
              </div>

              <button
                disabled={authLoading}
                className="w-full bg-gradient-to-r from-[#00FFCC] to-[#00ccff] p-3.5 sm:p-4 rounded-xl font-black uppercase tracking-widest hover:scale-[1.02] transition-all disabled:opacity-50 shadow-lg shadow-[#00FFCC]/25 text-black text-xs sm:text-sm"
              >
                {authLoading ? 'Signing in...' : 'Enter Dashboard'}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-x-hidden text-white">
      <div className="fixed inset-0 z-0">
        <video autoPlay loop muted playsInline className="w-full h-full object-cover">
          <source src="/backp.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
      </div>

      <Toaster position="top-center" />

      {/* Delete Order Modal */}
      {orderToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-[#121212]/95 border border-red-500/30 p-6 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] max-w-md w-full text-center shadow-2xl space-y-6">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-red-500/10 border border-red-500/20 text-red-400 rounded-full flex items-center justify-center mx-auto text-2xl sm:text-3xl">
              ⚠️
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white">
              Delete Order?
            </h3>
            <div className="flex gap-4 pt-2">
              <button
                onClick={() => setOrderToDelete(null)}
                className="flex-1 bg-white/10 py-3.5 sm:py-4 rounded-xl font-bold uppercase text-xs"
              >
                NO
              </button>
              <button
                onClick={confirmDeleteOrder}
                disabled={deletingOrder}
                className="flex-1 bg-red-500 text-white py-3.5 sm:py-4 rounded-xl font-black uppercase text-xs"
              >
                YES
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Message Modal */}
      {messageToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-[#121212]/95 border border-red-500/30 p-6 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] max-w-md w-full text-center shadow-2xl space-y-6">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-red-500/10 border border-red-500/20 text-red-400 rounded-full flex items-center justify-center mx-auto text-2xl sm:text-3xl">
              ⚠️
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white">
              Delete Message?
            </h3>
            <div className="flex gap-4 pt-2">
              <button
                onClick={() => setMessageToDelete(null)}
                className="flex-1 bg-white/10 py-3.5 sm:py-4 rounded-xl font-bold uppercase text-xs"
              >
                NO
              </button>
              <button
                onClick={confirmDeleteMessage}
                disabled={deletingMessage}
                className="flex-1 bg-red-500 text-white py-3.5 sm:py-4 rounded-xl font-black uppercase text-xs"
              >
                YES
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto p-4 sm:p-6 md:p-12 relative z-10">

        {!soundEnabled && (
          <div className="mb-6 bg-[#00FFCC]/10 border border-[#00FFCC]/30 p-4 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4 animate-bounce">
            <div className="flex items-center gap-3 text-center md:text-right">
              <span className="text-2xl">🔔</span>
              <p className="text-xs sm:text-sm font-bold text-[#00FFCC]">
               You must click the enable sound button first to activate order notifications!
              </p>
            </div>
            <button
              onClick={enableSound}
              className="bg-[#00FFCC] text-black px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-white transition-all shadow-lg whitespace-nowrap"
            >
              turn on sound now🔊
            </button>
          </div>
        )}

        <div className="flex flex-col lg:flex-row justify-between items-center gap-6 mb-8 sm:mb-12 pb-6 border-b border-white/10">
          <div className="flex items-center gap-4 text-center sm:text-left flex-col sm:flex-row">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl overflow-hidden border-2 border-[#00FFCC] shadow-lg shadow-[#00FFCC]/30 bg-white/10 flex-shrink-0">
              <img
                src="/logop.jpeg"
                alt="Logo"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-black tracking-tighter">
                DONUT <span className="text-[#00FFCC]">FACTORY.</span>
              </h1>
              <p className="text-white/40 text-xs sm:text-sm">
                Admin Dashboard
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap justify-center">
            <div className="flex bg-white/5 p-1 rounded-full border border-white/10 gap-1 overflow-x-auto max-w-full">
              <button 
                onClick={() => setActiveSubTab('donuts')} 
                className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-[11px] sm:text-xs font-bold uppercase transition-all whitespace-nowrap ${
                  activeSubTab === 'donuts'
                    ? 'bg-[#00FFCC] text-black shadow'
                    : 'text-white/70 hover:text-white'
                }`}
              >
                 Donuts
              </button>

              <button 
                onClick={() => setActiveSubTab('orders')} 
                className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-[11px] sm:text-xs font-bold uppercase transition-all relative whitespace-nowrap ${
                  activeSubTab === 'orders'
                    ? 'bg-[#00FFCC] text-black shadow'
                    : 'text-white/70 hover:text-white'
                }`}
              >
                 Orders ({orders.filter(o => o.status !== 'Sent with Driver').length})
              </button>

              <button 
                onClick={() => setActiveSubTab('messages')} 
                className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-[11px] sm:text-xs font-bold uppercase transition-all relative whitespace-nowrap ${
                  activeSubTab === 'messages'
                    ? 'bg-[#00FFCC] text-black shadow'
                    : 'text-white/70 hover:text-white'
                }`}
              >
                 Messages ({messages.length})
              </button>
            </div>

            <button
              onClick={handleLogout}
              className="bg-white/5 hover:bg-red-500/20 px-5 sm:px-6 py-2.5 sm:py-3 rounded-full border border-white/10 transition-all text-xs sm:text-sm font-bold hover:border-red-500/30 flex items-center gap-2"
            >
              <span></span> Sign Out
            </button>
          </div>
        </div>

        {/* MESSAGES TAB */}
        {activeSubTab === 'messages' && (
          <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-teal-950/40 via-black/40 to-black/60 p-6 sm:p-8 rounded-[25px] sm:rounded-[30px] border border-[#00FFCC]/25 backdrop-blur-2xl shadow-2xl">
              <div>
                <span className="text-[#00FFCC] font-black text-[10px] tracking-[0.25em] uppercase block mb-1">
                   Client Feedback & Inquiries
                </span>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-black italic uppercase tracking-tight text-white flex items-center gap-3">
                  <span>Client Messages</span>
                </h2>
              </div>
              <div className="flex items-center gap-3">
                <span className="px-4 sm:px-5 py-2 sm:py-2.5 rounded-2xl bg-black/60 border border-white/10 text-white text-xs font-black uppercase tracking-widest shadow-inner">
                  Total Inbox: <span className="text-[#00FFCC]">{messages.length}</span>
                </span>
              </div>
            </div>

            {messages.length === 0 ? (
              <div className="bg-black/40 backdrop-blur-2xl border border-white/10 p-12 sm:p-16 rounded-[30px] sm:rounded-[35px] text-center shadow-2xl">
                <div className="text-5xl sm:text-6xl mb-4 animate-bounce">📭</div>
                <h3 className="text-base sm:text-lg font-black uppercase text-white tracking-wider mb-1">
                  Inbox is clean!
                </h3>
                <p className="text-white/40 font-bold uppercase tracking-widest text-[10px] sm:text-xs">
                  No client messages have arrived yet.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className="relative bg-gradient-to-b from-white/[0.06] to-white/[0.02] backdrop-blur-2xl border border-white/10 hover:border-[#00FFCC]/50 transition-all duration-500 p-6 sm:p-8 rounded-[30px] sm:rounded-[35px] flex flex-col justify-between shadow-2xl group overflow-hidden"
                  >
                    <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#00FFCC] via-teal-400 to-emerald-400 opacity-70 group-hover:opacity-100 transition-opacity" />

                    <div className="space-y-4 sm:space-y-5">
                      <div className="flex justify-between items-center gap-2 flex-wrap">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-[#00FFCC] animate-pulse" />
                          <span className="text-[10px] font-black uppercase tracking-widest text-[#00FFCC]/80">
                            New Message
                          </span>
                        </div>

                        {msg.created_at && (
                          <span className="text-[10px] text-white/50 font-bold bg-black/40 px-3 py-1 rounded-xl border border-white/10 flex items-center gap-1.5">
                            <span>🕒</span>{' '}
                            {new Date(msg.created_at).toLocaleString('fr-FR', {
                              day: '2-digit',
                              month: '2-digit',
                              year: '2-digit',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        )}
                      </div>

                      <div className="bg-black/30 border border-white/5 p-4 rounded-2xl space-y-2">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-[#00FFCC]/20 border border-[#00FFCC]/40 flex items-center justify-center text-xs text-[#00FFCC] font-black flex-shrink-0">
                            👤
                          </div>
                          <h3 className="text-xs sm:text-sm font-black uppercase text-white tracking-wide truncate">
                            {msg.name}
                          </h3>
                        </div>

                        <div className="flex items-center gap-2.5 pl-9 sm:pl-10">
                          <p className="text-[11px] sm:text-xs font-bold text-[#00FFCC] tracking-wide truncate">
                            📧 {msg.email}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between items-center px-1">
                          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">
                            Message Details
                          </span>
                          <span className="text-[9px] font-bold text-white/30 uppercase">
                            Secure Note
                          </span>
                        </div>
                        <div className="bg-black/60 border border-white/10 p-4 sm:p-5 rounded-2xl max-h-48 overflow-y-auto custom-scrollbar shadow-inner relative">
                          <p className="text-xs font-medium text-white/95 leading-relaxed whitespace-pre-wrap break-words">
                            {msg.message}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 sm:mt-8 pt-4 border-t border-white/10 flex gap-3">
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(msg.email);
                          toast.success(`Copied ${msg.email}! Opening Gmail...`, { duration: 3000 });
                          window.open(
                            `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(msg.email)}&su=${encodeURIComponent("Reply from Donuts Factory")}&body=${encodeURIComponent(`Hello ${msg.name},\n\nRegarding your message: "${msg.message}"\n\n`)}`,
                            '_blank'
                          );
                        }}
                        className="flex-1 bg-[#00FFCC] hover:bg-white text-black py-3 sm:py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all text-center flex items-center justify-center gap-2 shadow-lg active:scale-95 cursor-pointer"
                      >
                        <span></span> Reply
                      </button>

                      <button
                        onClick={() => setMessageToDelete(msg.id)}
                        className="flex-1 bg-red-500/10 text-red-400 py-3 sm:py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-red-500/20 hover:bg-red-500 hover:text-white transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2"
                      >
                        <span></span> Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}







        {/* ORDERS TAB */}
        {activeSubTab === 'orders' && (
          <div className="space-y-6 animate-in fade-in duration-500">
            <h2 className="text-xl sm:text-2xl font-bold mb-6 flex items-center gap-3">
              <span className="text-2xl sm:text-3xl"></span>
              <span>Customer Orders ({orders.length})</span>
            </h2>

            {orders.length === 0 ? (
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-10 sm:p-12 rounded-[2rem] text-center">
                <p className="text-white/40 font-bold uppercase tracking-widest text-xs sm:text-sm">
                  No orders received yet.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {orders.map((order) => (
                  <div
                    key={order.id}
                    className="bg-white/5 backdrop-blur-xl border border-white/10 p-5 sm:p-6 rounded-[2rem] flex flex-col justify-between shadow-xl"
                  >
                    <div className="space-y-3">
                      <div className="flex justify-between items-start gap-2 flex-wrap">
                        <span
                          className={`text-[9px] sm:text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${
                            order.status === 'Sent with Driver'
                              ? 'bg-white text-black font-black'
                              : 'bg-red-500/20 text-red-400'
                          }`}
                        >
                          {order.status === 'Sent with Driver'
                            ? '✅ SENT WITH DRIVER'
                            : 'NOT YET'}
                        </span>
                      </div>

                      {order.created_at && (
                        <div className="text-[10px] sm:text-[11px] text-white/50 font-bold bg-black/20 px-3 py-1.5 rounded-lg">
                          🕒 {new Date(order.created_at).toLocaleString('fr-FR')}
                        </div>
                      )}

                      <div className="border-t border-white/10 pt-3 space-y-1">
                        <p className="text-xs sm:text-sm font-black uppercase text-white truncate">
                          👤 {order.customer_name}
                        </p>
                        <p className="text-[11px] sm:text-xs font-bold text-[#00FFCC]">
                          📞 {order.phone}
                        </p>
                        <p className="text-[11px] sm:text-xs font-medium text-white/70 leading-relaxed">
                          📍 {order.address}
                        </p>
                      </div>

                      <div className="border-t border-white/10 pt-3">
                        <p className="text-[10px] font-black uppercase text-white/40 mb-1">
                          Items Ordered:
                        </p>
                        <p className="text-xs font-bold text-white whitespace-pre-line bg-black/30 p-3 rounded-xl">
                          {order.items}
                        </p>
                      </div>

                      <div className="flex justify-between items-center pt-2 flex-wrap gap-2">
                        <span className="text-[11px] text-white/50 font-bold">
                          Payment:{' '}
                          <span className="text-white uppercase">
                            {order.payment_method}
                          </span>
                        </span>
                        <span className="text-base sm:text-lg font-black text-[#00FFCC]">
                          {order.total_price.toFixed(2)} DH
                        </span>
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-white/10 space-y-2">
                      {order.status !== 'Sent with Driver' ? (
                        <button
                          onClick={() => markAsSent(order.id)}
                          disabled={sendingOrderIds.includes(order.id)}
                          className="w-full bg-[#00FFCC] text-black py-3 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-white transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75"
                        >
                          {sendingOrderIds.includes(order.id) ? (
                            <><span>⏳</span> Sending...</>
                          ) : (
                            <><span>🚀</span> Send with Driver</>
                          )}
                        </button>
                      ) : (
                        <div className="w-full bg-white text-black py-3 rounded-xl text-center text-xs font-black uppercase tracking-widest shadow-lg flex items-center justify-center gap-2">
                          <span>🚀</span> Sent to Driver Successfully
                        </div>
                      )}

                      <button
                        onClick={() => setOrderToDelete(order.id)}
                        className="w-full bg-red-500/20 text-red-400 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest border border-red-500/30 hover:bg-red-500 hover:text-white transition-all"
                      >
                         Delete Order
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}







        {/* DONUTS TAB */}
        {activeSubTab === 'donuts' && (
          <div className="space-y-10 sm:space-y-12 animate-in fade-in duration-500">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 sm:p-8 md:p-10 rounded-[2rem] sm:rounded-[2.5rem] shadow-2xl">
              <h2 className="text-xl sm:text-2xl font-bold mb-6 sm:mb-8 flex items-center gap-3">
                <span className="text-2xl sm:text-3xl"></span>
                {editingId ? 'Edit Donut' : 'Add New Donut'}
              </h2>

              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <label className="block text-xs font-bold text-white/60 uppercase tracking-wider mb-2">
                    Donut Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Chocolate Glazed"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full bg-black/30 border border-white/10 p-3.5 sm:p-4 rounded-xl outline-none focus:border-[#00FFCC] transition-all text-white text-xs sm:text-sm"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-white/60 uppercase tracking-wider mb-2">
                    Regular Price (DH)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="e.g. 15.00"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                    className="w-full bg-black/30 border border-white/10 p-3.5 sm:p-4 rounded-xl outline-none focus:border-[#00FFCC] transition-all text-white text-xs sm:text-sm"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-white/60 uppercase tracking-wider mb-2">
                    Sale Price (Optional)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="e.g. 12.00"
                    value={formData.sale_price}
                    onChange={(e) => setFormData({...formData, sale_price: e.target.value})}
                    className="w-full bg-black/30 border border-white/10 p-3.5 sm:p-4 rounded-xl outline-none focus:border-[#00FFCC] transition-all text-white text-xs sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-white/60 uppercase tracking-wider mb-2">
                    Upload Image
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="w-full bg-black/30 border border-white/10 p-3 sm:p-4 rounded-xl text-xs text-gray-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-[#00FFCC] file:text-black hover:file:bg-white transition-all"
                  />
                  {selectedFile && (
                    <p className="text-[#00FFCC] text-xs mt-2 truncate">
                      ✅ Selected: {selectedFile.name}
                    </p>
                  )}
                </div>

                <div className="md:col-span-2 flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="active"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                    className="w-5 h-5 accent-[#00FFCC]"
                  />
                  <label htmlFor="active" className="text-xs sm:text-sm font-medium cursor-pointer">
                    Visible on website (Active)
                  </label>
                </div>

                <div className="md:col-span-2 flex gap-3 flex-col sm:flex-row">
                  <button
                    disabled={saving}
                    className="flex-1 bg-gradient-to-r from-[#00FFCC] to-[#00ccff] text-black p-4 sm:p-5 rounded-xl font-bold hover:scale-[1.02] transition-all disabled:opacity-50 shadow-lg shadow-[#00FFCC]/25 text-xs sm:text-sm uppercase tracking-widest"
                  >
                    {saving
                      ? '⏳ Saving...'
                      : editingId
                        ? ' Update Donut'
                        : ' Add to Menu'}
                  </button>

                  {editingId && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingId(null);
                        setFormData({
                          name: '',
                          price: '',
                          sale_price: '',
                          is_active: true
                        });
                        setSelectedFile(null);
                      }}
                      className="px-6 sm:px-8 bg-white/10 p-4 sm:p-5 rounded-xl font-bold hover:bg-white/20 transition-all text-xs sm:text-sm uppercase tracking-widest"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>

            <div>
              <h2 className="text-xl sm:text-2xl font-bold mb-6 flex items-center gap-3">
                <span className="text-2xl sm:text-3xl"></span>
                <span>Current Donuts ({donuts.length})</span>
              </h2>

              {loading ? (
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-12 rounded-[2rem] text-center">
                  <div className="animate-pulse text-[#00FFCC] text-base sm:text-lg">
                    Loading donuts...
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {donuts.map((donut) => (
                    <div
                      key={donut.id}
                      className="bg-white/5 backdrop-blur-xl border border-white/10 p-5 sm:p-6 rounded-[2rem] flex flex-col gap-4 group hover:border-[#00FFCC]/30 transition-all shadow-lg"
                    >
                      <div className="w-full h-44 sm:h-48 bg-white/10 rounded-2xl overflow-hidden mb-1">
                        {donut.image_url ? (
                          <img
                            src={donut.image_url}
                            alt={donut.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-5xl sm:text-6xl">
                            🍩
                          </div>
                        )}
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-2 gap-2">
                          <h3 className="text-lg sm:text-xl font-bold truncate">
                            {donut.name}
                          </h3>
                          <span
                            className={`text-[9px] sm:text-[10px] px-2.5 py-1 rounded-full font-bold uppercase whitespace-nowrap ${
                              donut.is_active
                                ? 'bg-green-500/20 text-green-400'
                                : 'bg-gray-500/20 text-gray-400'
                            }`}
                          >
                            {donut.is_active ? 'Active' : 'Hidden'}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 sm:gap-3 mb-4 flex-wrap">
                          <span className="text-xl sm:text-2xl font-black text-[#00FFCC]">
                            {donut.price} DH
                          </span>
                          {donut.sale_price && (
                            <>
                              <span className="text-sm sm:text-lg line-through text-gray-500">
                                {donut.price} DH
                              </span>
                              <span className="text-lg sm:text-xl font-black text-green-400">
                                {donut.sale_price} DH
                              </span>
                              <span className="text-[10px] bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full font-bold">
                                SALE
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 mt-auto pt-4 border-t border-white/10">
                        <button
                          onClick={() => handleEdit(donut)}
                          className="bg-[#00FFCC]/20 text-[#00FFCC] px-3 py-2.5 rounded-xl text-xs font-bold border border-[#00FFCC]/30 hover:bg-[#00FFCC] hover:text-black transition-all"
                        >
                          ✏️ Edit
                        </button>
                        <button
                          onClick={() => toggleActive(donut.id, donut.is_active)}
                          className={`px-3 py-2.5 rounded-xl text-xs font-bold border transition-all ${
                            donut.is_active
                              ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30 hover:bg-yellow-500 hover:text-black'
                              : 'bg-green-500/20 text-green-400 border-green-500/30 hover:bg-green-500 hover:text-black'
                          }`}
                        >
                          {donut.is_active ? '👁️ Hide' : '✅ Show'}
                        </button>
                        {donut.sale_price && (
                          <button
                            onClick={() => removeSale(donut.id)}
                            className="bg-red-500/20 text-red-400 px-3 py-2.5 rounded-xl text-xs font-bold border border-red-500/30 hover:bg-red-500 hover:text-black transition-all"
                          >
                            💰 Remove
                          </button>
                        )}
                        <button
                          onClick={() => deleteDonut(donut.id)}
                          className="bg-red-500/20 text-red-400 px-3 py-2.5 rounded-xl text-xs font-bold border border-red-500/30 hover:bg-red-500 hover:text-white transition-all"
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}