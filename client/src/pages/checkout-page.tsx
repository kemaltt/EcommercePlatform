import React, { useState, useEffect, useMemo } from "react";
import { useCart } from "@/contexts/cart-context";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import CartSidebar from "@/components/layout/cart-sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { FormattedMessage, useIntl } from "react-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { Loader2 } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { useToast } from "@/hooks/use-toast";
import { PayPalButton } from "@/components/ui/paypal-button";


// Stripe'ı Publishable Key ile yükle (Key'i .env'den almak en iyisidir)
const stripePromise = loadStripe("pk_test_YOUR_PUBLISHABLE_KEY"); // KENDİ KEY'İNİ YAPIŞTIR

export default function CheckoutPage() {
  const stripePromise = loadStripe("pk_test_YOUR_PUBLISHABLE_KEY");

  return (
    <Elements stripe={stripePromise} options={{}}> {/* ClientSecret burada verilmez, iç bileşende yönetilir */}
      <CheckoutPageContent />
    </Elements>
  );
}

// Ödeme yöntemleri için bir enum veya sabit tanımlayalım
const PAYMENT_METHODS = {
  CARD: "card",
  PAYPAL: "paypal",
  KLARNA: "klarna",
} as const;

// Asıl içerik ve mantık burada
const CheckoutPageContent = () => {
  const stripe = useStripe();
  const elements = useElements();
  const { cartItems, subtotal, clearCart } = useCart();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const intl = useIntl();

  const [clientSecret, setClientSecret] = useState<string | null>(null); // clientSecret state'i burada
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [initError, setInitError] = useState<string | null>(null); // Başlatma hatası için state
  const [paymentMethod, setPaymentMethod] = useState<string>(PAYMENT_METHODS.CARD);

  // Sabitleri veya hesaplamaları burada yapalım
  const shippingCost = 5.00; // Örnek kargo ücreti
  const taxRate = 0.08; // Örnek vergi oranı
  const taxes = useMemo(() => subtotal * taxRate, [subtotal, taxRate]); // taxes'ı da memoize edelim

  // total hesaplamasını memoize et (artık shippingCost ve taxes'a erişebilir)
  const calculatedTotal = useMemo(() => {
    return subtotal + shippingCost + taxes;
  }, [subtotal, shippingCost, taxes]); // Bağımlılıkları ekle

  // 2. useEffect'i sadece bir kez çalışacak şekilde düzelt
  useEffect(() => {
    // Eğer clientSecret zaten varsa veya sepet boşsa işlem yapma
    if (clientSecret || calculatedTotal <= 0) {
      return;
    }

    const fetchPaymentIntent = async () => {
      setInitError(null); // Hata mesajını temizle
      try {
        // GERÇEK BACKEND İSTEĞİ BURADA OLMALI
        // const response = await fetch('/api/create-payment-intent', {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify({ amount: Math.round(calculatedTotal * 100) })
        // });
        // const data = await response.json();
        // if (!response.ok) throw new Error(data.message || 'Failed to create payment intent');
        // setClientSecret(data.clientSecret);

        // Şimdilik sahte secret
        console.warn("Using dummy clientSecret. Payment will not actually work.");
        setClientSecret("pi_12345_secret_abcdefg"); // SADECE BİR KEZ ÇAĞRILACAK

      } catch (error) {
        console.error("Failed to fetch payment intent:", error);
        const errorMsg = error instanceof Error ? error.message : "Ödeme başlatılamadı.";
        setInitError(errorMsg); // Başlatma hatasını state'e yaz
        setPaymentError(errorMsg); // Genel ödeme hatasına da yazabiliriz
      }
    };

    fetchPaymentIntent();

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [calculatedTotal, clientSecret]); // Bağımlılık: total (memoized) ve clientSecret (varsa tekrar çalıştırma)
                                      // Sadece bir kez çalışması için [] de kullanılabilir ama total'a bağlı kalmak daha güvenli.

  // 3. Zod şemasını memoize et
  const shippingSchema = useMemo(() => z.object({
    firstName: z.string().min(1, intl.formatMessage({ id: "error.required" })),
    lastName: z.string().min(1, intl.formatMessage({ id: "error.required" })),
    address: z.string().min(1, intl.formatMessage({ id: "error.required" })),
    city: z.string().min(1, intl.formatMessage({ id: "error.required" })),
    state: z.string().min(1, intl.formatMessage({ id: "error.required" })),
    zip: z.string().min(1, intl.formatMessage({ id: "error.required" })),
    country: z.string().min(1, intl.formatMessage({ id: "error.required" })),
  }), [intl]); // Sadece intl değişince yeniden oluştur

  type ShippingFormValues = z.infer<typeof shippingSchema>;
  const form = useForm<ShippingFormValues>({
    resolver: zodResolver(shippingSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      address: "",
      city: "",
      state: "",
      zip: "",
      country: "",
    },
    mode: "onChange",
  });

  // Kart Elementi için stil
  const cardElementOptions = useMemo(() => ({ // Bunu da memoize edebiliriz
    style: {
      base: { fontSize: '16px', color: '#424770', '::placeholder': { color: '#aab7c4' } },
      invalid: { color: '#9e2146' },
    },
  }), []); // Boş bağımlılık, sadece bir kez oluşturulur

  // onMainFormSubmit fonksiyonu (içeriği aynı kalabilir, sadece stripe/elements hooklarını kullanır)
  const onMainFormSubmit = async (data: ShippingFormValues) => {
    setIsPlacingOrder(true);
    setPaymentError(null);

    if (!stripe || !elements || !clientSecret) {
      setPaymentError("Ödeme sistemi hazır değil.");
      setIsPlacingOrder(false);
      return;
    }
    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      setPaymentError("Kart bilgileri alanı bulunamadı.");
      setIsPlacingOrder(false);
      return;
    }

    // 1. Ödemeyi Onayla
    const { error: paymentErrorResponse, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: { name: `${data.firstName} ${data.lastName}` },
        },
    });

    if (paymentErrorResponse) {
       console.error("Stripe Error:", paymentErrorResponse);
       setPaymentError(paymentErrorResponse.message || "Bir ödeme hatası oluştu.");
       setIsPlacingOrder(false);
    } else if (paymentIntent?.status === 'succeeded') {
       // 2. Ödeme Başarılı -> Siparişi Kaydet
       console.log("Payment successful!", paymentIntent);
       try {
          // const response = await fetch('/api/orders', { method: 'POST', ... });
          console.log("Order saved successfully! (Simulated)");
          clearCart();
          // navigate('/order-confirmation/' + paymentIntent.id);
       } catch(error) {
          console.error("Failed to save order:", error);
          setPaymentError(error instanceof Error ? error.message : "Sipariş kaydedilemedi.");
       } finally {
          setIsPlacingOrder(false);
       }
    } else {
       setPaymentError("Ödeme beklenmedik bir durumda: " + paymentIntent?.status);
       setIsPlacingOrder(false);
    }
  };

  const { toast } = useToast();

  const handlePayment = async () => {
    if (!stripe || !elements) return; // Stripe ve Elements başlatılmamışsa işlemi durdur

    if (paymentMethod === PAYMENT_METHODS.CARD) {
      // Stripe ile ödeme işlemi
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/order-success`, // Ödeme başarılıysa yönlendirilecek URL
        },
      });

      if (error) {
        console.error("Ödeme hatası:", error);
        toast({
          title: "Hata",
          description: error.message || "Ödeme işlemi başarısız oldu.",
          variant: "error", // Varsayılan: "default"
        });
      }
    } else if (paymentMethod === PAYMENT_METHODS.PAYPAL) {
      // PayPal ile ödeme işlemi
      window.location.href = "https://paypal.com/checkout?token=...";
    } else if (paymentMethod === PAYMENT_METHODS.KLARNA) {
      // Klarna ile ödeme işlemi
      window.location.href = "https://klarna.com/pay/...";
    }
  };

  const handlePayPalSuccess = () => {
    console.log("Ödeme başarılı!");
    // Siparişi onayla veya yönlendirme yap
  };

  const handleKlarnaRedirect = async () => {
    try {
      // 1. Backend'den Klarna checkout URL'sini al
      const response = await fetch("/api/klarna/create-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: calculatedTotal,
          currency: "USD", // veya projenizin para birimi
        }),
      });

      if (!response.ok) throw new Error("Klarna session oluşturulamadı");

      const { redirect_url } = await response.json();

      // 2. Kullanıcıyı Klarna'nın ödeme sayfasına yönlendir
      window.location.href = redirect_url;
    } catch (error) {
      console.error("Klarna hatası:", error);
      toast.error("Klarna ile ödeme başlatılamadı. Lütfen tekrar deneyin.");
    }
  };

  // --- JSX ---

  // Başlatma hatası varsa göster
  if (initError) {
    return (
       <div className="min-h-screen flex items-center justify-center text-center p-4">
          <p className="text-red-500">
            <FormattedMessage id="checkout.initError" defaultMessage="Could not initialize payment system: {error}" values={{ error: initError }} />
          </p>
       </div>
    );
  }

  // Henüz clientSecret yüklenmediyse (ve hata yoksa) yükleme göstergesi
  if (!clientSecret && calculatedTotal > 0) {
     return (
        <div className="min-h-screen flex items-center justify-center">
           <p><FormattedMessage id="checkout.initializingPayment" defaultMessage="Initializing payment..." /></p> {/* veya spinner */}
        </div>
     );
  }

  // Sepet boşsa (Bu kontrol ana bileşene de taşınabilir)
  if (cartItems.length === 0 && !initError) {
     return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header onCartOpen={() => setIsCartOpen(true)} />
        <main className="flex-grow flex items-center justify-center text-center p-4">
          <p>
            <FormattedMessage id="checkout.cartEmpty" />
          </p>
        </main>
        <Footer />
      </div>
    );
  }

  // Asıl Checkout Formu
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header ve CartSidebar */}
      <Header onCartOpen={() => setIsCartOpen(true)} />
      <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />

      <main className="flex-grow py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-extrabold text-gray-900 mb-8">
            <FormattedMessage id="checkout.title" />
          </h1>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onMainFormSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Shipping Info */}
              <Card>
                <CardHeader><CardTitle><FormattedMessage id="checkout.shippingInfo" /></CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField control={form.control} name="firstName" render={({ field }) => (<FormItem><FormLabel><FormattedMessage id="checkout.firstName" /></FormLabel><FormControl><Input placeholder={intl.formatMessage({id: "checkout.firstName"})} {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="lastName" render={({ field }) => (<FormItem><FormLabel><FormattedMessage id="checkout.lastName" /></FormLabel><FormControl><Input placeholder={intl.formatMessage({id: "checkout.lastName"})} {...field} /></FormControl><FormMessage /></FormItem>)} />
                  </div>
                  <FormField control={form.control} name="address" render={({ field }) => (<FormItem><FormLabel><FormattedMessage id="checkout.address" /></FormLabel><FormControl><Input placeholder={intl.formatMessage({id: "checkout.address"})} {...field} /></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name="city" render={({ field }) => (<FormItem><FormLabel><FormattedMessage id="checkout.city" /></FormLabel><FormControl><Input placeholder={intl.formatMessage({id: "checkout.city"})} {...field} /></FormControl><FormMessage /></FormItem>)} />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField control={form.control} name="state" render={({ field }) => (<FormItem><FormLabel><FormattedMessage id="checkout.state" /></FormLabel><FormControl><Input placeholder={intl.formatMessage({id: "checkout.state"})} {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="zip" render={({ field }) => (<FormItem><FormLabel><FormattedMessage id="checkout.zip" /></FormLabel><FormControl><Input placeholder={intl.formatMessage({id: "checkout.zip"})} {...field} /></FormControl><FormMessage /></FormItem>)} />
                  </div>
                  <FormField control={form.control} name="country" render={({ field }) => (<FormItem><FormLabel><FormattedMessage id="checkout.country" /></FormLabel><FormControl><Input placeholder={intl.formatMessage({id: "checkout.country"})} {...field} /></FormControl><FormMessage /></FormItem>)} />
                </CardContent>
              </Card>
              {/* Order Summary & Payment */}
              <div className="space-y-8">
                {/* Order Summary */}
                <Card>
                  <CardHeader><CardTitle><FormattedMessage id="checkout.orderSummary" /></CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                     {cartItems.map((item) => (
                       <div key={item.id} className="flex justify-between items-center">
                         <div className="flex items-center space-x-3"> <img src={item.product.imageUrl} alt={item.product.name} className="w-12 h-12 rounded object-cover" /> <div> <p className="font-medium">{item.product.name}</p> <p className="text-sm text-gray-500"> <FormattedMessage id="cart.quantity.value" values={{ quantity: item.quantity }} /> </p> </div> </div> <p className="font-medium"> <FormattedMessage id="product.price" values={{ price: (item.product.price * item.quantity).toFixed(2), currency: "$" }} /> </p> </div>
                       ))}
                       <Separator />
                       <div className="flex justify-between"><p className="text-gray-600"><FormattedMessage id="cart.subtotal" /></p><p><FormattedMessage id="product.price" values={{ price: subtotal.toFixed(2), currency: "$" }} /></p></div>
                       <div className="flex justify-between"><p className="text-gray-600"><FormattedMessage id="checkout.shipping" /></p><p><FormattedMessage id="product.price" values={{ price: shippingCost.toFixed(2), currency: "$" }} /></p></div>
                       <div className="flex justify-between"><p className="text-gray-600"><FormattedMessage id="checkout.taxes" /></p><p><FormattedMessage id="product.price" values={{ price: taxes.toFixed(2), currency: "$" }} /></p></div>
                       <Separator />
                       <div className="flex justify-between font-bold text-lg"><p><FormattedMessage id="checkout.total" /></p><p><FormattedMessage id="product.price" values={{ price: calculatedTotal.toFixed(2), currency: "$" }} /></p></div>
                  </CardContent>
                </Card>
                {/* Payment Info */}
                <Card>
                  <CardHeader><CardTitle><FormattedMessage id="checkout.paymentInfo" /></CardTitle></CardHeader>
                  <CardContent>
                    <Label className="mb-2 block"><FormattedMessage id="checkout.cardDetails" /></Label>
                    {paymentMethod === PAYMENT_METHODS.CARD && (
                      <CardElement options={cardElementOptions} />
                    )}
                    {paymentMethod === PAYMENT_METHODS.PAYPAL && (
                      <PayPalButton
                        amount={calculatedTotal}
                        onSuccess={handlePayPalSuccess}
                        onError={() => console.error("PayPal hatası")}
                      />
                    )}
                    {paymentMethod === PAYMENT_METHODS.KLARNA && (
                      <Button onClick={handleKlarnaRedirect}>
                        <FormattedMessage id="checkout.payWithKlarna" />
                      </Button>
                    )}
                    {paymentError && <p className="text-red-500 text-sm mt-2">{paymentError}</p>}
                  </CardContent>
                </Card>
                {/* Payment Methods */}
                <Card>
                  <CardHeader>
                    <CardTitle>
                      <FormattedMessage id="checkout.paymentMethods" />
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <RadioGroup
                      value={paymentMethod}
                      onValueChange={setPaymentMethod}
                      className="space-y-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value={PAYMENT_METHODS.CARD} id="card" />
                        <Label htmlFor="card">
                          <FormattedMessage id="checkout.payWithCard" />
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value={PAYMENT_METHODS.PAYPAL} id="paypal" />
                        <Label htmlFor="paypal">
                          <FormattedMessage id="checkout.payWithPayPal" />
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value={PAYMENT_METHODS.KLARNA} id="klarna" />
                        <Label htmlFor="klarna">
                          <FormattedMessage id="checkout.payWithKlarna" />
                        </Label>
                      </div>
                    </RadioGroup>
                  </CardContent>
                </Card>
                {/* Place Order Button */}
                <Button
                  type="submit"
                  className="w-full bg-primary text-white hover:bg-primary/90 text-lg py-3"
                  disabled={!stripe || !elements || !clientSecret || isPlacingOrder || !form.formState.isValid}
                >
                  {isPlacingOrder ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      <FormattedMessage id="checkout.placingOrder" />
                    </>
                  ) : ( <FormattedMessage id="checkout.placeOrder" /> )}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </main>
      <Footer />
    </div>
  );
}

// Düzeltilmiş Yaklaşım: İç Bileşen ile Stripe Hook Kullanımı
const CheckoutFormWrapper = () => {
  const stripe = useStripe();
  const elements = useElements();

  // Stripe ve Elements instance'larını window'a atayalım (geçici çözüm)
  // Daha iyi çözüm: Context veya state yönetimi ile bu instance'ları
  // onMainFormSubmit fonksiyonuna iletmek.
  React.useEffect(() => {
    if (stripe) (window as any).stripeInstance = stripe;
    if (elements) (window as any).elementsInstance = elements;
  }, [stripe, elements]);

  // Kart Elementi için stil
  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#424770',
        '::placeholder': {
          color: '#aab7c4',
        },
      },
      invalid: {
        color: '#9e2146',
      },
    },
  };

  return (
    <>
      <Label className="mb-2 block"><FormattedMessage id="checkout.cardDetails" defaultMessage="Card Details" /></Label>
      <div className="p-3 border border-gray-300 rounded bg-white mb-4">
        <CardElement options={cardElementOptions} />
      </div>
    </>
  );
}
