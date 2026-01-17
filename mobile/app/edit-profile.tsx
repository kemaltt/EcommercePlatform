import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Image, Modal } from "react-native";
import { useAuth } from "../hooks/use-auth";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { ChevronLeft, User, Mail, AtSign, Camera, Trash2, X, Image as ImageIcon } from "lucide-react-native";
import { useRouter } from "expo-router";
import { useIntl } from "react-intl";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import React, { useState } from 'react';
import { useTheme } from "../contexts/theme-context";
import { api } from "../lib/api";
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';

export default function EditProfileScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const intl = useIntl();
  const { isDark } = useTheme();
  const queryClient = useQueryClient();

  const [fullName, setFullName] = useState(user?.fullName || "");
  const [username, setUsername] = useState(user?.username || "");
  const [email, setEmail] = useState(user?.email || "");
  const [loading, setLoading] = useState(false);
  const [avatarUri, setAvatarUri] = useState<string | null>(user?.avatarUrl || null);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const pickImage = async (useCamera: boolean = false) => {
    try {
      const permissionResult = useCamera 
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        Alert.alert(
          intl.formatMessage({ id: 'common.error' }),
          intl.formatMessage({ id: 'profile.avatar.permissionDenied' })
        );
        return;
      }

      const result = useCamera
        ? await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
          })
        : await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
          });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        const uri = asset.uri;
        const filename = uri.split('/').pop()?.toLowerCase() || '';
        const allowedExtensions = /\.(jpeg|jpg|png|gif|webp)$/;
        
        if (!allowedExtensions.test(filename)) {
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          Alert.alert(
            intl.formatMessage({ id: 'common.error' }),
            intl.formatMessage({ id: 'profile.avatar.invalidType' })
          );
          return;
        }

        setShowAvatarModal(false);
        await uploadAvatar(uri);
      }
    } catch (error) {
      console.error("Pick image error:", error);
      Alert.alert(
        intl.formatMessage({ id: 'common.error' }),
        intl.formatMessage({ id: 'profile.avatar.pickError' })
      );
    }
  };

  const uploadAvatar = async (uri: string) => {
    setUploadingAvatar(true);
    try {
      const formData = new FormData();
      const filename = uri.split('/').pop() || 'avatar.jpg';
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image/jpeg';

      formData.append('avatar', {
        uri,
        name: filename,
        type,
      } as any);

      const response = await api.post('/user/avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setAvatarUri(response.data.avatarUrl);
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert(
        intl.formatMessage({ id: 'common.success' }),
        intl.formatMessage({ id: 'profile.avatar.uploadSuccess' })
      );
    } catch (error: any) {
      console.error("Upload avatar error:", error);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert(
        intl.formatMessage({ id: 'common.error' }),
        error.response?.data?.message || intl.formatMessage({ id: 'profile.avatar.uploadError' })
      );
    } finally {
      setUploadingAvatar(false);
    }
  };

  const deleteAvatar = async () => {
    Alert.alert(
      intl.formatMessage({ id: 'common.confirm' }),
      intl.formatMessage({ id: 'profile.avatar.deleteConfirm' }),
      [
        { text: intl.formatMessage({ id: 'common.cancel' }), style: 'cancel' },
        {
          text: intl.formatMessage({ id: 'common.delete' }),
          style: 'destructive',
          onPress: async () => {
            setUploadingAvatar(true);
            try {
              await api.delete('/user/avatar');
              setAvatarUri(null);
              queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
              await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              Alert.alert(
                intl.formatMessage({ id: 'common.success' }),
                intl.formatMessage({ id: 'profile.avatar.deleteSuccess' })
              );
            } catch (error: any) {
              console.error("Delete avatar error:", error);
              await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
              Alert.alert(
                intl.formatMessage({ id: 'common.error' }),
                error.response?.data?.message || intl.formatMessage({ id: 'profile.avatar.deleteError' })
              );
            } finally {
              setUploadingAvatar(false);
            }
          },
        },
      ]
    );
  };

  const handleSave = async () => {
    if (!fullName || !username || !email) {
      Alert.alert(intl.formatMessage({ id: 'common.error' }), intl.formatMessage({ id: 'auth.error.required' }));
      return;
    }

      setLoading(true);
      try {
        await api.put("/user/profile", { fullName, username, email });
        queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert(
          intl.formatMessage({ id: 'common.success' }), 
          intl.formatMessage({ id: 'profile.updateSuccess' }),
          [{ text: intl.formatMessage({ id: 'common.ok' }), onPress: () => router.back() }]
        );
      } catch (error: any) {
        console.error("Update profile error:", error);
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        const message = error.response?.data?.message || intl.formatMessage({ id: 'profile.updateError' });
        Alert.alert(intl.formatMessage({ id: 'common.error' }), message);
      } finally {
      setLoading(false);
    }
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
           
           <Text className="text-lg font-bold text-foreground">{intl.formatMessage({ id: 'profile.editProfile' })}</Text>
           
           <View className="w-10" />
        </View>

        <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
          
          {/* Avatar Section */}
          <View className="items-center mt-6 mb-8">
            <View className="relative">
              <View className="w-32 h-32 rounded-full bg-card items-center justify-center border-4 border-border shadow-xl overflow-hidden">
                {uploadingAvatar ? (
                  <ActivityIndicator size="large" color="#6366f1" />
                ) : avatarUri ? (
                  <Image 
                    source={{ uri: avatarUri }} 
                    className="w-full h-full"
                    resizeMode="cover"
                  />
                ) : (
                  <User size={56} color={isDark ? "#94a3b8" : "#64748b"} />
                )}
              </View>
              
              {!uploadingAvatar && (
                <TouchableOpacity 
                  className="absolute bottom-0 right-0 bg-primary w-10 h-10 rounded-full items-center justify-center border-4 border-background shadow-lg"
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setShowAvatarModal(true);
                  }}
                  activeOpacity={0.7}
                >
                  <Camera size={18} color="white" />
                </TouchableOpacity>
              )}
            </View>
            
            {avatarUri && !uploadingAvatar && (
              <TouchableOpacity 
                className="mt-4 flex-row items-center gap-2 bg-red-500/10 px-4 py-2 rounded-full"
                onPress={deleteAvatar}
                activeOpacity={0.7}
              >
                <Trash2 size={14} color="#ef4444" />
                <Text className="text-red-500 text-xs font-bold">
                  {intl.formatMessage({ id: 'profile.avatar.delete' })}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          <View className="mt-6 bg-card rounded-3xl p-6 border border-border shadow-sm">
            <View className="mb-6">
              <Text className="text-sm font-bold text-muted-foreground mb-2 ml-1">
                {intl.formatMessage({ id: 'profile.fullName' })}
              </Text>
              <Input
                value={fullName}
                onChangeText={setFullName}
                placeholder={intl.formatMessage({ id: 'profile.fullName' })}
                icon={<User size={20} color={isDark ? "#94a3b8" : "#64748b"} />}
              />
            </View>

            <View className="mb-6">
              <Text className="text-sm font-bold text-muted-foreground mb-2 ml-1">
                {intl.formatMessage({ id: 'profile.username' })}
              </Text>
              <Input
                value={username}
                onChangeText={setUsername}
                placeholder={intl.formatMessage({ id: 'profile.username' })}
                icon={<AtSign size={20} color={isDark ? "#94a3b8" : "#64748b"} />}
                autoCapitalize="none"
              />
            </View>

            <View className="mb-8">
              <Text className="text-sm font-bold text-muted-foreground mb-2 ml-1">
                {intl.formatMessage({ id: 'profile.email' })}
              </Text>
              <Input
                value={email}
                onChangeText={setEmail}
                placeholder={intl.formatMessage({ id: 'profile.email' })}
                icon={<Mail size={20} color={isDark ? "#94a3b8" : "#64748b"} />}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>

            <Button
              title={intl.formatMessage({ id: 'profile.saveChanges' })}
              onPress={handleSave}
              loading={loading}
              className="mt-2"
            />

          </View>
        </ScrollView>

        {/* Avatar Selection Modal */}
        <Modal
          visible={showAvatarModal}
          transparent
          animationType="slide"
          onRequestClose={() => setShowAvatarModal(false)}
        >
          <View className="flex-1 bg-black/50 justify-end">
            <View className="bg-background rounded-t-[32px] p-6 pb-12 border-t border-border/10">
              <View className="flex-row justify-between items-center mb-6">
                <Text className="text-xl font-bold text-foreground">
                  {intl.formatMessage({ id: 'profile.avatar.select' })}
                </Text>
                <TouchableOpacity onPress={() => setShowAvatarModal(false)}>
                  <X size={24} color={isDark ? "white" : "black"} />
                </TouchableOpacity>
              </View>
              
              <TouchableOpacity 
                onPress={() => pickImage(true)}
                className="flex-row items-center gap-4 p-4 rounded-2xl mb-3 bg-card border border-border"
                activeOpacity={0.7}
              >
                <View className="w-12 h-12 rounded-full bg-primary/10 items-center justify-center">
                  <Camera size={24} color={isDark ? "#818cf8" : "#4f46e5"} />
                </View>
                <View className="flex-1">
                  <Text className="text-foreground font-bold text-base">
                    {intl.formatMessage({ id: 'profile.avatar.camera' })}
                  </Text>
                  <Text className="text-muted-foreground text-xs mt-0.5">
                    {intl.formatMessage({ id: 'profile.avatar.camera.sub' })}
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity 
                onPress={() => pickImage(false)}
                className="flex-row items-center gap-4 p-4 rounded-2xl bg-card border border-border"
                activeOpacity={0.7}
              >
                <View className="w-12 h-12 rounded-full bg-primary/10 items-center justify-center">
                  <ImageIcon size={24} color={isDark ? "#818cf8" : "#4f46e5"} />
                </View>
                <View className="flex-1">
                  <Text className="text-foreground font-bold text-base">
                    {intl.formatMessage({ id: 'profile.avatar.gallery' })}
                  </Text>
                  <Text className="text-muted-foreground text-xs mt-0.5">
                    {intl.formatMessage({ id: 'profile.avatar.gallery.sub' })}
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </View>
  );
}
