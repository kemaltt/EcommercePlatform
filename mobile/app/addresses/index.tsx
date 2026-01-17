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
      <View className="flex-row justify-between items-start mb-3">
        <View className="flex-row items-center gap-2">
          <View className="bg-secondary p-2 rounded-xl">
             <MapPin size={20} color="#6366f1" />
          </View>
          <View>
             <Text className="text-foreground font-bold text-base">{item.fullName}</Text>
             <Text className="text-muted-foreground text-xs">
                {intl.formatMessage({ id: `address.type.${item.type}` })}
             </Text>
          </View>
        </View>
        {item.isDefault && (
          <View className="bg-green-500/10 px-2 py-1 rounded-lg flex-row items-center gap-1">
             <CheckCircle2 size={12} color="#22c55e" />
              <Text className="text-green-500 text-[10px] font-bold">
                {intl.formatMessage({ id: 'common.default' })}
              </Text>
          </View>
        )}
      </View>

      <Text className="text-foreground text-sm leading-5 mb-1">
        {item.addressLine1}{item.addressLine2 ? `, ${item.addressLine2}` : ''}
      </Text>
      <Text className="text-muted-foreground text-sm mb-4">
        {item.zipCode} {item.city}, {item.country}
      </Text>

      <View className="h-px bg-border/50 mb-4" />

      <View className="flex-row justify-between items-center">
        <View className="flex-row gap-4">
          <TouchableOpacity 
            onPress={() => router.push({ pathname: "/addresses/manage" as any, params: { id: item.id } })}
          >
            <View className="flex-row items-center gap-1">
              <Edit3 size={16} color={isDark ? "#94a3b8" : "#64748b"} />
              <Text className="text-muted-foreground text-xs font-medium">{intl.formatMessage({ id: 'common.edit' })}</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleDelete(item.id)}>
            <View className="flex-row items-center gap-1">
              <Trash2 size={16} color="#ef4444" />
              <Text className="text-red-500 text-xs font-medium">{intl.formatMessage({ id: 'common.delete' })}</Text>
            </View>
          </TouchableOpacity>
        </View>

        {!item.isDefault && (
          <TouchableOpacity onPress={() => setDefaultMutation.mutate(item.id)}>
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
