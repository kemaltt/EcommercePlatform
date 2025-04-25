import { X, Minus, Plus, ShoppingCart } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/contexts/cart-context";

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartSidebar({ isOpen, onClose }: CartSidebarProps) {
  const { cartItems, subtotal, updateCartItemQuantity, removeCartItem } = useCart();
  const { toast } = useToast();

  const handleCheckout = () => {
    toast({
      title: "Checkout",
      description: "Checkout functionality would be implemented here",
    });
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-md p-0 flex flex-col h-full">
        <SheetHeader className="px-4 py-6 border-b">
          <SheetTitle>Shopping Cart</SheetTitle>
        </SheetHeader>

        {cartItems.length === 0 ? (
          <div className="flex-grow flex flex-col items-center justify-center p-6">
            <div className="text-5xl text-muted mb-4">
              <ShoppingCart size={64} />
            </div>
            <p className="text-muted-foreground text-center">Your cart is empty</p>
            <Button 
              className="mt-4 bg-primary text-white hover:bg-primary/90"
              onClick={onClose}
            >
              Continue Shopping
            </Button>
          </div>
        ) : (
          <>
            <ScrollArea className="flex-grow py-6 px-4">
              <ul role="list" className="divide-y divide-border">
                {cartItems.map((item) => (
                  <li key={item.id} className="py-6 flex">
                    <div className="flex-shrink-0 w-24 h-24 border border-border rounded-md overflow-hidden">
                      <img 
                        src={item.product.imageUrl} 
                        alt={item.product.name} 
                        className="w-full h-full object-center object-cover"
                      />
                    </div>

                    <div className="ml-4 flex-1 flex flex-col">
                      <div>
                        <div className="flex justify-between text-base font-medium text-foreground">
                          <h3>{item.product.name}</h3>
                          <p className="ml-4">${item.product.price.toFixed(2)}</p>
                        </div>
                      </div>
                      <div className="flex-1 flex items-end justify-between text-sm">
                        <div className="flex items-center">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-muted-foreground" 
                            onClick={() => {
                              if (item.quantity > 1) {
                                updateCartItemQuantity(item.id, item.quantity - 1);
                              } else {
                                removeCartItem(item.id);
                              }
                            }}
                          >
                            <Minus size={14} />
                          </Button>
                          <span className="mx-2 text-foreground">{item.quantity}</span>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            className="h-8 w-8 text-muted-foreground" 
                            onClick={() => updateCartItemQuantity(item.id, item.quantity + 1)}
                          >
                            <Plus size={14} />
                          </Button>
                        </div>

                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-primary hover:text-primary/90"
                          onClick={() => removeCartItem(item.id)}
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </ScrollArea>

            <div className="border-t border-border py-6 px-4">
              <div className="flex justify-between text-base font-medium text-foreground">
                <p>Subtotal</p>
                <p>${subtotal.toFixed(2)}</p>
              </div>
              <p className="mt-0.5 text-sm text-muted-foreground">Shipping and taxes calculated at checkout.</p>
              <div className="mt-6">
                <Button 
                  className="w-full bg-primary text-white hover:bg-primary/90"
                  onClick={handleCheckout}
                >
                  Checkout
                </Button>
              </div>
              <div className="mt-6 flex justify-center text-sm text-center text-muted-foreground">
                <p>
                  or{" "}
                  <Button 
                    variant="link" 
                    className="text-primary p-0 hover:text-primary/90"
                    onClick={onClose}
                  >
                    Continue Shopping<span aria-hidden="true"> &rarr;</span>
                  </Button>
                </p>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
