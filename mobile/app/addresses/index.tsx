import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert, FlatList } from "react-native";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ChevronLeft, Plus, MapPin, Trash2, Edit3, CheckCircle2 } from "lucide-react-native";
import { useRouter } from "expo-router";
import { useIntl, FormattedMessage } from "react-intl";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import React from 'react';
import { useTheme } from "../../contexts/theme-context";
import { api } from "../../lib/api";
import { Address } from "@shared/schema";

export default function AddressListScreen() {
  const router = useRouter();
  const intl = useIntl();
  const { isDark } = useTheme();
  const queryClient = useQueryClient();

  const { data: addresses, isLoading } = useQuery<Address[]>({
    queryKey: ["/api/addresses"],
    queryFn: async () => {
      const res = await api.get("/addresses");
      return res.data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/addresses/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/addresses"] });
    },
  });

  const setDefaultMutation = useMutation({
    mutationFn: async (id: number) => {
      await api.patch(`/addresses/${id}`, { isDefault: true });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/addresses"] });
    },
  });

  const handleDelete = (id: number) => {
    Alert.alert(
      intl.formatMessage({ id: 'common.confirm' }),
      intl.formatMessage({ id: 'address.delete.confirm' }),
      [
        { text: intl.formatMessage({ id: 'common.cancel' }), style: "cancel" },
        { 
          text: intl.formatMessage({ id: 'common.delete' }), 
          style: "destructive",
          onPress: () => deleteMutation.mutate(id)
        }
      ]
    );
  };

  const renderAddressItem = ({ item }: { item: Address }) => (
    <View className="bg-card rounded-3xl p-5 mb-4 border border-border shadow-sm">
      <View className="flex-row justify-between items-start mb-4">
        <View className="flex-row items-center gap-3 flex-1">
          <View className="bg-primary/10 p-2.5 rounded-2xl">
             <MapPin size={22} color={isDark ? "#818cf8" : "#4f46e5"} />
          </View>
          <View className="flex-1">
             <Text className="text-foreground font-bold text-lg" numberOfLines={1}>{item.fullName}</Text>
             <View className="flex-row items-center gap-2 mt-0.5">
               <Text className="text-muted-foreground text-xs font-medium uppercase tracking-wider">
                  {intl.formatMessage({ id: `address.type.${item.type}` })}
               </Text>
               {item.isDefault && (
                 <View className="bg-green-500/10 px-2 py-0.5 rounded-md flex-row items-center gap-1">
                    <CheckCircle2 size={10} color="#22c55e" />
                    <Text className="text-green-500 text-[9px] font-bold uppercase">
                      {intl.formatMessage({ id: 'common.default' })}
                    </Text>
                 </View>
               )}
             </View>
          </View>
        </View>
        
        <TouchableOpacity 
          onPress={() => router.push({ pathname: "/addresses/manage" as any, params: { id: item.id } })}
          className="w-10 h-10 rounded-full bg-secondary items-center justify-center -mt-1 -mr-1"
        >
          <Edit3 size={18} color={isDark ? "#94a3b8" : "#64748b"} />
        </TouchableOpacity>
      </View>

      <View className="px-1 mb-5">
        <Text className="text-foreground text-base font-medium leading-6">
          {item.addressLine1}
        </Text>
        {item.addressLine2 && (
          <Text className="text-muted-foreground text-sm leading-5 mt-0.5 italic">
            {item.addressLine2}
          </Text>
        )}
        <Text className="text-muted-foreground text-sm mt-1 font-medium">
          {item.zipCode} {item.city}, {item.country}
        </Text>
      </View>

      <View className="h-[1px] bg-border/40 mb-4" />

      <View className="flex-row justify-between items-center">
        <TouchableOpacity 
          onPress={() => handleDelete(item.id)}
          className="flex-row items-center gap-2 py-1 pe-4"
        >
          <Trash2 size={16} color="#ef4444" />
          <Text className="text-red-500 text-xs font-semibold">{intl.formatMessage({ id: 'common.delete' })}</Text>
        </TouchableOpacity>

        {!item.isDefault && (
          <TouchableOpacity 
            onPress={() => setDefaultMutation.mutate(item.id)}
            className="bg-primary/5 px-4 py-2 rounded-xl"
          >
            <Text className="text-primary text-xs font-bold">{intl.formatMessage({ id: 'address.setAsDefault' })}</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <View className="flex-1 bg-background">
      <StatusBar style={isDark ? "light" : "dark"} />
      <SafeAreaView className="flex-1" edges={['top']}>
        
        {/* Header */}
        <View className="flex-row justify-between items-center px-6 py-4">
           <TouchableOpacity 
             className="w-10 h-10 rounded-full bg-card items-center justify-center border border-border"
             onPress={() => router.back()}
           >
             <ChevronLeft size={20} color={isDark ? "white" : "black"} />
           </TouchableOpacity>
           
           <Text className="text-lg font-bold text-foreground">{intl.formatMessage({ id: 'profile.myAddresses' })}</Text>
           
           <TouchableOpacity 
             className="w-10 h-10 rounded-full bg-primary items-center justify-center shadow-lg"
             onPress={() => router.push("/addresses/manage" as any)}
           >
             <Plus size={20} color="white" />
           </TouchableOpacity>
        </View>

        {isLoading ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#6366f1" />
          </View>
        ) : (
          <FlatList
             data={addresses}
             keyExtractor={(item) => item.id.toString()}
             renderItem={renderAddressItem}
             contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 20, paddingBottom: 40 }}
             ListEmptyComponent={
               <View className="flex-1 justify-center items-center mt-20">
                 <View className="w-20 h-20 bg-secondary rounded-full items-center justify-center mb-4">
                   <MapPin size={40} color="#94a3b8" />
                 </View>
                 <Text className="text-muted-foreground text-center">
                   {intl.formatMessage({ id: 'profile.noAddresses' })}
                 </Text>
                 <TouchableOpacity 
                   className="mt-6 bg-primary px-8 py-3 rounded-full shadow-lg"
                   onPress={() => router.push("/addresses/manage" as any)}
                 >
                   <Text className="text-white font-bold">{intl.formatMessage({ id: 'address.add' })}</Text>
                 </TouchableOpacity>
               </View>
             }
          />
        )}
      </SafeAreaView>
    </View>
  );
}
