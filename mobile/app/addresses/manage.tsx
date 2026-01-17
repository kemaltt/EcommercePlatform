import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Switch, Modal } from "react-native";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ChevronLeft, MapPin, User, Home, Building2, Globe, Phone, Mail, X, ChevronRight } from "lucide-react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useIntl } from "react-intl";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import React, { useState, useEffect } from 'react';
import { useTheme } from "../../contexts/theme-context";
import { api } from "../../lib/api";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Address, InsertAddress } from "@shared/schema";

export default function ManageAddressScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const intl = useIntl();
  const { isDark } = useTheme();
  const queryClient = useQueryClient();
  const [showCountryModal, setShowCountryModal] = useState(false);

  const countries = [
    { code: 'TR', nameId: 'country.TR' },
    { code: 'DE', nameId: 'country.DE' },
    { code: 'AT', nameId: 'country.AT' },
    { code: 'BE', nameId: 'country.BE' },
    { code: 'FR', nameId: 'country.FR' },
    { code: 'IT', nameId: 'country.IT' },
    { code: 'ES', nameId: 'country.ES' },
    { code: 'NL', nameId: 'country.NL' },
    { code: 'SE', nameId: 'country.SE' },
    { code: 'PL', nameId: 'country.PL' },
    { code: 'GR', nameId: 'country.GR' },
    { code: 'PT', nameId: 'country.PT' },
    { code: 'IE', nameId: 'country.IE' },
    { code: 'CH', nameId: 'country.CH' },
    { code: 'GB', nameId: 'country.GB' },
    { code: 'FI', nameId: 'country.FI' },
    { code: 'DK', nameId: 'country.DK' },
    { code: 'NO', nameId: 'country.NO' },
    { code: 'US', nameId: 'country.US' },
    { code: 'CA', nameId: 'country.CA' },
    { code: 'MX', nameId: 'country.MX' },
    { code: 'BR', nameId: 'country.BR' },
    { code: 'AR', nameId: 'country.AR' },
  ];

  const [form, setForm] = useState<Partial<InsertAddress>>({
    type: "delivery",
    fullName: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    zipCode: "",
    country: "",
    phoneNumber: "",
    isDefault: false,
  });

  const { data: address, isLoading } = useQuery<Address>({
    queryKey: ["/api/addresses", id],
    queryFn: async () => {
      const res = await api.get(`/addresses/${id}`);
      return res.data;
    },
    enabled: !!id,
  });

  useEffect(() => {
    if (address) {
      setForm({
        type: address.type,
        fullName: address.fullName,
        addressLine1: address.addressLine1,
        addressLine2: address.addressLine2 || "",
        city: address.city,
        zipCode: address.zipCode,
        country: address.country,
        phoneNumber: address.phoneNumber || "",
        isDefault: address.isDefault,
      });
    }
  }, [address]);

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      if (id) {
        return await api.patch(`/addresses/${id}`, data);
      } else {
        return await api.post("/addresses", data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/addresses"] });
      Alert.alert(
        intl.formatMessage({ id: 'common.success' }),
        id ? intl.formatMessage({ id: 'profile.updateSuccess' }) : intl.formatMessage({ id: 'common.success' }),
        [{ text: "OK", onPress: () => router.back() }]
      );
    },
    onError: (error: any) => {
      console.error("Save address error:", error);
      Alert.alert(intl.formatMessage({ id: 'common.error' }), intl.formatMessage({ id: 'profile.updateError' }));
    }
  });

  const handleSave = () => {
    if (!form.fullName || !form.addressLine1 || !form.city || !form.zipCode || !form.country) {
      Alert.alert(intl.formatMessage({ id: 'common.error' }), intl.formatMessage({ id: 'auth.error.required' }));
      return;
    }
    mutation.mutate(form);
  };

  const updateForm = (key: keyof InsertAddress, value: any) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

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
           
           <Text className="text-lg font-bold text-foreground">
             {id ? intl.formatMessage({ id: 'address.edit' }) : intl.formatMessage({ id: 'address.add' })}
           </Text>
           
           <View className="w-10" />
        </View>

        {isLoading && id ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#6366f1" />
          </View>
        ) : (
          <ScrollView className="flex-1 px-6 pb-10" showsVerticalScrollIndicator={false}>
            <View className="mt-6 bg-card rounded-3xl p-6 border border-border shadow-sm mb-10">
              
              {/* Type Switcher */}
              <View className="flex-row bg-secondary/50 p-1 rounded-2xl mb-6">
                <TouchableOpacity 
                  className={`flex-1 py-3 rounded-xl items-center ${form.type === 'delivery' ? 'bg-primary shadow-sm' : ''}`}
                  onPress={() => updateForm('type', 'delivery')}
                >
                  <Text className={`font-bold ${form.type === 'delivery' ? 'text-white' : 'text-muted-foreground'}`}>
                    {intl.formatMessage({ id: 'address.type.delivery' })}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  className={`flex-1 py-3 rounded-xl items-center ${form.type === 'invoice' ? 'bg-primary shadow-sm' : ''}`}
                  onPress={() => updateForm('type', 'invoice')}
                >
                  <Text className={`font-bold ${form.type === 'invoice' ? 'text-white' : 'text-muted-foreground'}`}>
                    {intl.formatMessage({ id: 'address.type.invoice' })}
                  </Text>
                </TouchableOpacity>
              </View>

              <View className="mb-4">
                <Input
                  label={intl.formatMessage({ id: 'address.fullName' })}
                  value={form.fullName || ""}
                  onChangeText={(val) => updateForm('fullName', val)}
                  placeholder={intl.formatMessage({ id: 'address.fullName' })}
                  icon={<User size={18} color={isDark ? "#94a3b8" : "#64748b"} />}
                />
              </View>

              <View className="mb-4">
                <Input
                  label={intl.formatMessage({ id: 'address.line1' })}
                  value={form.addressLine1 || ""}
                  onChangeText={(val) => updateForm('addressLine1', val)}
                  placeholder={intl.formatMessage({ id: 'address.line1' })}
                  icon={<Home size={18} color={isDark ? "#94a3b8" : "#64748b"} />}
                />
              </View>

              <View className="mb-4">
                <Input
                  label={intl.formatMessage({ id: 'address.line2' })}
                  value={form.addressLine2 || ""}
                  onChangeText={(val) => updateForm('addressLine2', val)}
                  placeholder={intl.formatMessage({ id: 'address.line2' })}
                  icon={<Home size={18} color={isDark ? "#94a3b8" : "#64748b"} />}
                />
              </View>

              <View className="flex-row gap-4 mb-4">
                <View className="flex-1">
                  <Input
                    label={intl.formatMessage({ id: 'address.city' })}
                    value={form.city || ""}
                    onChangeText={(val) => updateForm('city', val)}
                    placeholder={intl.formatMessage({ id: 'address.city' })}
                    icon={<Building2 size={18} color={isDark ? "#94a3b8" : "#64748b"} />}
                  />
                </View>
                <View className="flex-1">
                  <Input
                    label={intl.formatMessage({ id: 'address.zipCode' })}
                    value={form.zipCode || ""}
                    onChangeText={(val) => updateForm('zipCode', val)}
                    placeholder={intl.formatMessage({ id: 'address.zipCode' })}
                    keyboardType="numeric"
                  />
                </View>
              </View>

              <View className="mb-4">
                <Text className="text-sm font-bold text-muted-foreground mb-2 ml-1">
                  {intl.formatMessage({ id: 'address.country' })}
                </Text>
                <TouchableOpacity 
                  onPress={() => setShowCountryModal(true)}
                  activeOpacity={0.7}
                  className="bg-secondary/30 border border-border/50 rounded-2xl p-4 flex-row items-center justify-between"
                >
                  <View className="flex-row items-center">
                    <Globe size={18} color={isDark ? "#94a3b8" : "#64748b"} />
                    <Text className="text-foreground ml-3 font-medium">
                      {form.country ? intl.formatMessage({ id: `country.${form.country}` }) : intl.formatMessage({ id: 'address.country.select' })}
                    </Text>
                  </View>
                  <ChevronRight size={18} color={isDark ? "#94a3b8" : "#64748b"} />
                </TouchableOpacity>
              </View>

              <View className="mb-4">
                <Input
                  label={intl.formatMessage({ id: 'address.phone' })}
                  value={form.phoneNumber || ""}
                  onChangeText={(val) => updateForm('phoneNumber', val)}
                  placeholder={intl.formatMessage({ id: 'address.phone' })}
                  icon={<Phone size={18} color={isDark ? "#94a3b8" : "#64748b"} />}
                  keyboardType="phone-pad"
                />
              </View>

              <View className="flex-row justify-between items-center py-4 border-t border-border mt-2">
                <View>
                  <Text className="text-foreground font-bold">
                    {intl.formatMessage({ id: 'address.setAsDefault' })}
                  </Text>
                </View>
                <Switch
                  value={form.isDefault}
                  onValueChange={(val) => updateForm('isDefault', val)}
                  trackColor={{ false: "#94a3b8", true: "#6366f1" }}
                  thumbColor="white"
                />
              </View>

              <Button
                title={intl.formatMessage({ id: 'address.save' })}
                onPress={handleSave}
                loading={mutation.isPending}
                className="mt-6"
              />
            </View>
          </ScrollView>
        )}

        {/* Country Selection Modal */}
        <Modal
          visible={showCountryModal}
          transparent
          animationType="slide"
          onRequestClose={() => setShowCountryModal(false)}
        >
          <View className="flex-1 bg-black/50 justify-end">
            <View className="bg-background rounded-t-[32px] p-6 pb-12 border-t border-border/10 max-h-[80%]">
              <View className="flex-row justify-between items-center mb-6">
                <Text className="text-xl font-bold text-foreground">{intl.formatMessage({ id: 'address.country.select' })}</Text>
                <TouchableOpacity onPress={() => setShowCountryModal(false)}>
                  <X size={24} color={isDark ? "white" : "black"} />
                </TouchableOpacity>
              </View>
              
              <ScrollView showsVerticalScrollIndicator={false}>
                {countries.map((country) => (
                  <TouchableOpacity 
                    key={country.code}
                    onPress={() => {
                      updateForm('country', country.code);
                      setShowCountryModal(false);
                    }}
                    className={`flex-row items-center justify-between p-4 rounded-2xl mb-2 ${
                      form.country === country.code ? 'bg-primary/10 border border-primary/30' : 'bg-card'
                    }`}
                  >
                    <Text className={`text-[16px] font-semibold ${form.country === country.code ? 'text-primary' : 'text-foreground'}`}>
                      {intl.formatMessage({ id: country.nameId })}
                    </Text>
                    {form.country === country.code && (
                       <View className="w-6 h-6 rounded-full bg-primary items-center justify-center">
                          <Text className="text-white text-[10px]">✓</Text>
                       </View>
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </View>
  );
}
