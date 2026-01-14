import { View, Text, TouchableOpacity } from "react-native";
import { Image } from "expo-image";
import { Link } from "expo-router";
import { Product } from "@shared/schema";
import { Heart } from "lucide-react-native";
import { FormattedMessage } from "react-intl";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <Link href={`/product/${product.id}`} asChild>
      <TouchableOpacity className="bg-card rounded-2xl overflow-hidden shadow-sm border border-border mb-4 w-[48%]">
        <Image
          source={product.imageUrl}
          contentFit="cover"
          className="w-full aspect-square"
          transition={200}
        />
        <TouchableOpacity className="absolute top-2 right-2 bg-white/80 p-1.5 rounded-full">
          <Heart size={18} color="#ef4444" />
        </TouchableOpacity>
        <View className="p-3">
          <Text className="text-sm text-muted-foreground mb-1 uppercase tracking-tighter" numberOfLines={1}>
            {product.category}
          </Text>
          <Text className="text-base font-bold text-foreground mb-2" numberOfLines={1}>
            {product.name}
          </Text>
          <View className="flex-row items-center justify-between">
            <Text className="text-lg font-extrabold text-primary">
              ${product.price.toFixed(2)}
            </Text>
            {product.stock === 0 && (
              <Text className="text-[10px] text-red-500 font-bold uppercase">
                <FormattedMessage id="product.details.outOfStock" />
              </Text>
            )}
          </View>
        </View>
      </TouchableOpacity>
    </Link>
  );
}
