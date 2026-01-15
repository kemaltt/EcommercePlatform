import React, { useEffect } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { CheckCircle2, XCircle, X } from 'lucide-react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  FadeIn, 
  FadeOut, 
  ZoomIn, 
  ZoomOut 
} from 'react-native-reanimated';
import { useTheme } from '../contexts/theme-context';

interface SuccessModalProps {
  visible: boolean;
  type?: 'success' | 'error';
  title?: string;
  message: string;
  onClose: () => void;
  buttonText?: string;
}

const { width } = Dimensions.get('window');

export function SuccessModal({ 
  visible, 
  type = 'success',
  title, 
  message, 
  onClose, 
  buttonText = "OK" 
}: SuccessModalProps) {
  const { isDark } = useTheme();
  const isError = type === 'error';
  
  const defaultTitle = isError ? "Error" : "Success";
  const themeColor = isError ? "#ef4444" : "#10b981";
  const bgColor = isError ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)';

  if (!visible) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Animated.View 
          entering={FadeIn} 
          exiting={FadeOut}
          style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.45)' }]}
        >
          <TouchableOpacity 
            style={{ flex: 1 }} 
            activeOpacity={1} 
            onPress={onClose} 
          />
        </Animated.View>

        <Animated.View 
          entering={ZoomIn.springify().damping(28).stiffness(300)}
          exiting={ZoomOut}
          style={[
            styles.modalContainer,
            { backgroundColor: isDark ? '#1e293b' : '#ffffff' }
          ]}
        >
          {/* Header Icon */}
          <View style={styles.iconContainer}>
            <Animated.View
              entering={ZoomIn.delay(100).springify().damping(28).stiffness(300)}
              style={[styles.iconCircle, { backgroundColor: bgColor }]}
            >
              {isError ? (
                <XCircle size={48} color={themeColor} strokeWidth={2.5} />
              ) : (
                <CheckCircle2 size={48} color={themeColor} strokeWidth={2.5} />
              )}
            </Animated.View>
          </View>

          {/* Text Content */}
          <View style={styles.content}>
            <Text style={[styles.title, { color: isDark ? '#f8fafc' : '#0f172a' }]}>
              {title || defaultTitle}
            </Text>
            <Text style={[styles.message, { color: isDark ? '#94a3b8' : '#64748b' }]}>
              {message}
            </Text>
          </View>

          {/* Action Button */}
          <TouchableOpacity 
            onPress={onClose}
            activeOpacity={0.8}
            style={[styles.button, { backgroundColor: isError ? '#ef4444' : '#6366f1', shadowColor: isError ? '#ef4444' : '#6366f1' }]}
          >
            <Text style={styles.buttonText}>{buttonText}</Text>
          </TouchableOpacity>

          {/* Close Button (Icon) */}
          <TouchableOpacity 
            onPress={onClose}
            style={styles.closeIconButton}
          >
            <X size={20} color={isDark ? '#64748b' : '#94a3b8'} />
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 340,
    borderRadius: 32,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.2,
    shadowRadius: 40,
    elevation: 10,
  },
  iconContainer: {
    marginBottom: 20,
    marginTop: 8,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    marginBottom: 28,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 10,
    textAlign: 'center',
  },
  message: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    paddingHorizontal: 12,
  },
  button: {
    backgroundColor: '#6366f1',
    width: '100%',
    height: 56,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 15,
    elevation: 8,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  closeIconButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  }
});
