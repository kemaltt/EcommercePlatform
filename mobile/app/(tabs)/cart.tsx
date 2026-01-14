import { View, Text, FlatList, TouchableOpacity, Image, Alert } from "react-native";
import { useCart } from "../../hooks/use-cart";
import { Button } from "../../components/ui/Button";
import { Trash2, Plus, Minus, ShoppingCart as CartIcon } from "lucide-react-native";
import { useRouter } from "expo-router";
import { FormattedMessage, useIntl } from "react-intl";

export default function CartScreen() {
  const { cartItems, subtotal, updateQuantity, removeFromCart, isLoading } = useCart();
  const router = useRouter();
  const intl = useIntl();

  if (cartItems.length === 0) {
    return (
      <View className="flex-1 justify-center items-center bg-background px-6">
        <View className="bg-primary/10 p-8 rounded-full mb-6">
          <CartIcon size={64} color="#3b82f6" />
        </View>
        <Text className="text-2xl font-bold text-foreground mb-2">
          <FormattedMessage id="cart.empty.title" />
        </Text>
        <Text className="text-muted-foreground text-center mb-8">
          <FormattedMessage id="cart.empty.subtitle" />
        </Text>
        <Button 
          title={intl.formatMessage({ id: "cart.startShopping" })} 
          onPress={() => router.push("/(tabs)")} 
        />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      <FlatList
        data={cartItems}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
        renderItem={({ item }) => (
          <View className="flex-row bg-card rounded-2xl p-4 mb-4 border border-border shadow-sm">
            <Image
              source={{ uri: item.product.imageUrl }}
              className="w-24 h-24 rounded-xl mr-4"
              resizeMode="cover"
            />
            <View className="flex-1 justify-between">
              <View>
                <View className="flex-row justify-between items-start">
                  <Text className="text-base font-bold text-foreground flex-1 mr-2" numberOfLines={2}>
                    {item.product.name}
                  </Text>
                  <TouchableOpacity onPress={() => removeFromCart(item.id)}>
                    <Trash2 size={20} color="#ef4444" />
                  </TouchableOpacity>
                </View>
                <Text className="text-primary font-bold text-lg mt-1">
                  ${item.product.price.toFixed(2)}
                </Text>
              </View>

              <View className="flex-row items-center justify-between mt-2">
                <View className="flex-row items-center bg-secondary rounded-lg px-2 py-1">
                  <TouchableOpacity
                    onPress={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                    className="p-1"
                  >
                    <Minus size={16} color="#4b5563" />
                  </TouchableOpacity>
                  <Text className="mx-3 font-bold text-foreground">{item.quantity}</Text>
                  <TouchableOpacity
                    onPress={() => updateQuantity(item.id, item.quantity + 1)}
                    className="p-1"
                  >
                    <Plus size={16} color="#4b5563" />
                  </TouchableOpacity>
                </View>
                <Text className="font-bold text-foreground">
                  <FormattedMessage id="cart.total" />: ${(item.product.price * item.quantity).toFixed(2)}
                </Text>
              </View>
            </View>
          </View>
        )}
      />

      <View className="absolute bottom-0 left-0 right-0 p-6 bg-background/95 border-t border-border">
        <View className="flex-row justify-between items-center mb-6">
          <Text className="text-muted-foreground text-lg">
            <FormattedMessage id="cart.subtotal" />
          </Text>
          <Text className="text-2xl font-black text-foreground">${subtotal.toFixed(2)}</Text>
        </View>
        <Button
          title={intl.formatMessage({ id: "cart.checkout" })}
          onPress={() => Alert.alert(intl.formatMessage({ id: "cart.checkout" }), "Checkout process will start soon!")}
        />
      </View>
    </View>
  );
}
