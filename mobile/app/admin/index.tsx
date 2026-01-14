
import { View, Text, ScrollView, TouchableOpacity, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useRouter, Stack } from "expo-router";
import { 
  ChevronLeft, 
  Bell, 
  User, 
  Package, 
  Users, 
  ChevronRight,
  Plus,
  Box
} from "lucide-react-native";
import { useAuth } from "../../hooks/use-auth";
import { LineChart } from "react-native-chart-kit";

const { width } = Dimensions.get("window");

export default function AdminConsoleScreen() {
  const router = useRouter();
  const { user } = useAuth();
  
  // Mock Data for Chart
  const lineChartData = {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    datasets: [
      {
        data: [20, 45, 28, 80, 40, 95, 10],
        strokeWidth: 2, // optional
      },
    ],
  };

  const ManagementCard = ({ title, count, subtitle, icon, onPress }: any) => (
    <TouchableOpacity 
      onPress={onPress}
      className="bg-[#2A2C39] p-5 rounded-3xl flex-1 border border-white/5"
    >
      <View className="w-10 h-10 bg-[#6366f1]/20 rounded-xl items-center justify-center mb-4">
        {icon}
      </View>
      <Text className="text-white font-bold text-lg mb-1">{title}</Text>
      <Text className="text-slate-400 text-xs font-bold mb-4">{count} {subtitle}</Text>
      
      <View className="flex-row items-center">
         <Text className="text-[#6366f1] text-xs font-bold mr-1">Manage</Text>
         <ChevronRight size={12} color="#6366f1" />
      </View>
    </TouchableOpacity>
  );

  const ActiveInventoryItem = ({ image, title, stock, price }: any) => (
     <View className="bg-[#2A2C39] p-3 rounded-[30px] mb-3 flex-row items-center border border-white/5">
        <View className="w-16 h-16 bg-white rounded-2xl mr-4 overflow-hidden items-center justify-center p-1">
           {/* Placeholder for image - using Box icon since we don't have actual asset here easily */}
           <Package size={30} color="#6366f1" />
        </View>
        <View className="flex-1">
           <Text className="text-white font-bold text-base mb-1">{title}</Text>
           <Text className="text-slate-400 text-xs">Stock: {stock} • Ref: #7721</Text>
           <Text className="text-[#6366f1] font-bold mt-1">${price}</Text>
        </View>
        <View className="flex-row gap-4 mr-1">
            <TouchableOpacity hitSlop={10}>
              <Plus size={20} color="#94a3b8" />
            </TouchableOpacity>
            <TouchableOpacity hitSlop={10}>
              <Box size={20} color="#94a3b8" />
            </TouchableOpacity>
        </View>
     </View>
  );

  return (
    <View className="flex-1 bg-[#1e2029]">
      <StatusBar style="light" />
      <SafeAreaView className="flex-1" edges={['top']}>
        {/* Header */}
        <View className="px-6 py-4 flex-row justify-between items-center bg-[#1e2029]">
          <View className="flex-row items-center">
             <TouchableOpacity 
               onPress={() => router.back()}
               className="w-10 h-10 bg-[#2A2C39] rounded-full items-center justify-center border border-white/10 mr-4"
             >
                <ChevronLeft size={20} color="white" />
             </TouchableOpacity>
             <View>
               <Text className="text-white text-lg font-bold">Admin Console</Text>
               <Text className="text-slate-400 text-xs text-indigo-400">Store Overview • Live</Text>
             </View>
          </View>
          
          <View className="flex-row gap-3">
            <TouchableOpacity className="w-10 h-10 items-center justify-center relative">
               <Bell size={20} color="#e2e8f0" />
               <View className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-[#1e2029]" />
            </TouchableOpacity>
            <TouchableOpacity className="w-10 h-10 bg-[#fbbf24] rounded-full items-center justify-center" onPress={() => router.back()}>
               <User size={20} color="#1e2029" />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView className="flex-1 px-6 pt-4" showsVerticalScrollIndicator={false}>
          
          <Text className="text-white font-bold text-lg mb-4">Management</Text>
          <View className="flex-row mb-8">
             <View className="flex-1 mr-4">
               <ManagementCard 
                 title="Products" 
                 count="1,240" 
                 subtitle="TOTAL" 
                 icon={<Package size={20} color="#6366f1" />} 
                 onPress={() => router.push("/admin/products")}
               />
             </View>
             <View className="flex-1">
               <ManagementCard 
                 title="Users" 
                 count="850" 
                 subtitle="USERS" 
                 icon={<Users size={20} color="#6366f1" />} 
                 onPress={() => router.push("/admin/users")}
               />
             </View>
          </View>

          <View className="flex-row justify-between items-center mb-4">
             <Text className="text-white font-bold text-lg">Sales Velocity</Text>
             <View className="flex-row bg-[#2A2C39] rounded-lg p-0.5">
                <TouchableOpacity className="px-3 py-1 bg-[#2A2C39] rounded-md">
                   <Text className="text-white text-xs font-bold">WEEK</Text>
                </TouchableOpacity>
                <TouchableOpacity className="px-3 py-1">
                   <Text className="text-slate-400 text-xs font-bold">MONTH</Text>
                </TouchableOpacity>
             </View>
          </View>

          <View className="bg-[#2A2C39] rounded-3xl p-4 mb-8 border border-white/5 items-center">
             <LineChart
                data={lineChartData}
                width={width - 80}
                height={180}
                yAxisLabel=""
                yAxisSuffix=""
                chartConfig={{
                  backgroundColor: "#2A2C39",
                  backgroundGradientFrom: "#2A2C39",
                  backgroundGradientTo: "#2A2C39",
                  decimalPlaces: 0,
                  color: (opacity = 1) => `rgba(99, 102, 241, ${opacity})`,
                  labelColor: (opacity = 1) => `rgba(148, 163, 184, ${opacity})`,
                  style: {
                    borderRadius: 16,
                  },
                  propsForDots: {
                    r: "0",
                  },
                  propsForBackgroundLines: {
                    strokeDasharray: "", // solid lines
                    stroke: "#334155",
                    strokeWidth: 1
                  }
                }}
                bezier
                style={{
                  marginVertical: 8,
                  borderRadius: 16,
                }}
                withVerticalLines={false}
                withHorizontalLines={false}
              />
              <View className="flex-row justify-between w-full px-4 mt-2">
                 {["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"].map((day, i) => (
                    <Text key={i} className="text-slate-500 text-[10px] font-bold">{day}</Text>
                 ))}
              </View>
          </View>

          <View className="flex-row justify-between items-center mb-4">
             <Text className="text-white font-bold text-lg">Active Inventory</Text>
             <TouchableOpacity>
                <Text className="text-slate-400 text-xs flex-row items-center">See All <ChevronRight size={10} /></Text>
             </TouchableOpacity>
          </View>

          <ActiveInventoryItem 
             title="Leather Weekend Bag" 
             stock={12}
             price="320.00"
          />
           <ActiveInventoryItem 
             title="Indigo Denim Jacket" 
             stock={48} 
             price="185.00"
          />

          <View className="h-20" />
          
        </ScrollView>
        
        {/* Floating Add Button */}
        <TouchableOpacity 
          className="absolute bottom-8 right-6 w-14 h-14 bg-[#6366f1] rounded-full items-center justify-center shadow-lg shadow-indigo-500/50 z-50"
          onPress={() => router.push("/admin/products/new")}
        >
           <Plus size={24} color="white" />
        </TouchableOpacity>

      </SafeAreaView>
    </View>
  );
}
