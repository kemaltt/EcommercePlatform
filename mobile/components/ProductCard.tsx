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
          <Text className="text-lg font-extrabold text-primary mb-1">
            ${product.price.toFixed(2)}
          </Text>
          <View className="flex-row items-center gap-2 mb-2">
              <View className={`w-1.5 h-1.5 rounded-full ${product.stock > 5 ? 'bg-green-500' : product.stock > 0 ? 'bg-orange-500' : 'bg-red-500'}`} />
              <Text className={`text-[10px] font-bold ${product.stock > 0 ? 'text-muted-foreground/60' : 'text-red-500'}`}>
                {product.stock > 0 ? (
                  <FormattedMessage id="product.stock.available" values={{ count: product.stock }} />
                ) : (
                  <FormattedMessage id="product.details.outOfStock" />
                )}
              </Text>
          </View>
        </View>
      </TouchableOpacity>
    </Link>
  );
}
