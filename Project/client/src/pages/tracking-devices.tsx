import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { Activity, Smartphone, Watch, Heart, TrendingUp, Zap } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import Navigation from "@/components/navigation";
import Footer from "@/components/footer";
// import type { TrackingDevice, ActivityData } from "@shared/schema";

// Mock device data for demo
const mockDevices = [
  {
    id: "device-1",
    deviceType: "fitbit",
    deviceName: "Fitbit Charge 5",
    isConnected: true,
    lastSync: new Date().toISOString(),
    batteryLevel: 85,
    dailyGoal: 10000,
    currentSteps: 7843,
  },
  {
    id: "device-2", 
    deviceType: "apple_watch",
    deviceName: "Apple Watch Series 9",
    isConnected: false,
    lastSync: new Date(Date.now() - 3600000).toISOString(),
    batteryLevel: 45,
    dailyGoal: 8000,
    currentSteps: 3201,
  },
  {
    id: "device-3",
    deviceType: "garmin",
    deviceName: "Garmin Vivoactive 4",
    isConnected: true,
    lastSync: new Date(Date.now() - 300000).toISOString(),
    batteryLevel: 92,
    dailyGoal: 12000,
    currentSteps: 9654,
  }
];

const mockActivityData = [
  { type: "Steps", value: 7843, goal: 10000, unit: "steps", xp: 78, icon: Activity },
  { type: "Distance", value: 5.2, goal: 8.0, unit: "km", xp: 26, icon: TrendingUp },
  { type: "Calories", value: 1842, goal: 2200, unit: "cal", xp: 92, icon: Zap },
  { type: "Heart Rate", value: 72, goal: 80, unit: "bpm", xp: 18, icon: Heart },
];

export default function TrackingDevices() {
  const [autoSync, setAutoSync] = useState(true);
  const { toast } = useToast();

  const { data: auth } = useQuery<{id: string}>({
    queryKey: ["/api/auth/me"],
  });

  const userId = auth?.id || "demo-user";

  const connectDeviceMutation = useMutation({
    mutationFn: async (deviceData: any) => {
      return apiRequest("/api/tracking-devices", "POST", { ...deviceData, userId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tracking-devices"] });
      toast({
        title: "Device Connected",
        description: "Your tracking device has been successfully connected!",
      });
    },
  });

  const syncDataMutation = useMutation({
    mutationFn: async (deviceId: string) => {
      return apiRequest(`/api/tracking-devices/${deviceId}/sync`, "POST");
    },
    onSuccess: () => {
      toast({
        title: "Sync Complete",
        description: "Your activity data has been synced and XP has been awarded!",
      });
    },
  });

  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType) {
      case "fitbit":
        return "🟦";
      case "apple_watch":
        return "⌚";
      case "garmin":
        return "🟩";
      default:
        return "📱";
    }
  };

  const getConnectionColor = (isConnected: boolean) => {
    return isConnected ? "bg-green-500" : "bg-red-500";
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <Navigation />
      
      <section className="py-20 bg-background">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-arcade text-primary mb-4 neon-glow" data-testid="text-tracking-title">
              📱 TRACKING DEVICES
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Connect your fitness trackers and wearables to automatically sync activity data and earn XP for your real-world activities!
            </p>
          </div>

          {/* Auto-sync Settings */}
          <Card className="mb-8 color-shift-bg" data-testid="card-sync-settings">
            <CardHeader>
              <CardTitle className="font-arcade text-primary rainbow-text">⚙️ Sync Settings</CardTitle>
              <CardDescription>Configure how your devices sync activity data</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">Auto-sync Activity Data</h3>
                  <p className="text-sm text-muted-foreground">Automatically sync data every 15 minutes and earn XP</p>
                </div>
                <Switch
                  checked={autoSync}
                  onCheckedChange={setAutoSync}
                  data-testid="switch-auto-sync"
                />
              </div>
            </CardContent>
          </Card>

          {/* Today's Activity Summary */}
          <Card className="mb-8 pulse-border" data-testid="card-activity-summary">
            <CardHeader>
              <CardTitle className="font-arcade text-primary neon-glow">📊 Today's Activity</CardTitle>
              <CardDescription>Real-time data from your connected devices</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                {mockActivityData.map((activity, index) => {
                  const Icon = activity.icon;
                  const progress = (activity.value / activity.goal) * 100;
                  
                  return (
                    <div key={index} className="bg-card p-4 rounded-lg border" data-testid={`activity-${activity.type.toLowerCase()}`}>
                      <div className="flex items-center justify-between mb-2">
                        <Icon className="w-5 h-5 text-primary" />
                        <Badge variant="secondary" className="text-xs">+{activity.xp} XP</Badge>
                      </div>
                      <h4 className="font-semibold text-sm mb-1">{activity.type}</h4>
                      <p className="text-2xl font-bold text-primary">
                        {activity.value.toLocaleString()} <span className="text-sm text-muted-foreground">{activity.unit}</span>
                      </p>
                      <Progress value={progress} className="mt-2" />
                      <p className="text-xs text-muted-foreground mt-1">
                        Goal: {activity.goal.toLocaleString()} {activity.unit}
                      </p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Connected Devices */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {mockDevices.map((device) => (
              <Card key={device.id} className="bg-card hover:glow transition-all arcade-button cursor-pointer" data-testid={`device-${device.deviceType}`}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{getDeviceIcon(device.deviceType)}</span>
                      <div>
                        <CardTitle className="text-sm font-arcade">{device.deviceName}</CardTitle>
                        <CardDescription className="text-xs capitalize">{device.deviceType.replace('_', ' ')}</CardDescription>
                      </div>
                    </div>
                    <div className={`w-3 h-3 rounded-full ${getConnectionColor(device.isConnected)}`}></div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {/* Battery Level */}
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Battery</span>
                        <span>{device.batteryLevel}%</span>
                      </div>
                      <Progress value={device.batteryLevel} className="h-2" />
                    </div>

                    {/* Daily Progress */}
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Steps Today</span>
                        <span>{device.currentSteps.toLocaleString()}</span>
                      </div>
                      <Progress value={(device.currentSteps / device.dailyGoal) * 100} className="h-2" />
                    </div>

                    {/* Last Sync */}
                    <p className="text-xs text-muted-foreground">
                      Last sync: {device.lastSync ? new Date(device.lastSync).toLocaleTimeString() : 'Never'}
                    </p>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      {device.isConnected ? (
                        <Button 
                          size="sm" 
                          className="flex-1 arcade-button"
                          onClick={() => syncDataMutation.mutate(device.id)}
                          disabled={syncDataMutation.isPending}
                          data-testid={`button-sync-${device.deviceType}`}
                        >
                          {syncDataMutation.isPending ? "Syncing..." : "Sync Now"}
                        </Button>
                      ) : (
                        <Button 
                          size="sm" 
                          className="flex-1 arcade-button bg-primary"
                          onClick={() => connectDeviceMutation.mutate(device)}
                          disabled={connectDeviceMutation.isPending}
                          data-testid={`button-connect-${device.deviceType}`}
                        >
                          {connectDeviceMutation.isPending ? "Connecting..." : "Connect"}
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Add New Device */}
          <Card className="mb-8" data-testid="card-add-device">
            <CardHeader>
              <CardTitle className="font-arcade text-secondary rainbow-text">➕ Add New Device</CardTitle>
              <CardDescription>Connect more fitness trackers and wearables</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-4 gap-4">
                {[
                  { type: "fitbit", name: "Fitbit", icon: "🟦", description: "Charge, Versa, Sense series" },
                  { type: "apple_watch", name: "Apple Watch", icon: "⌚", description: "All Apple Watch models" },
                  { type: "garmin", name: "Garmin", icon: "🟩", description: "Vivoactive, Forerunner series" },
                  { type: "terra", name: "Terra API", icon: "🌍", description: "Multi-device aggregator" },
                ].map((deviceType) => (
                  <Button
                    key={deviceType.type}
                    variant="outline"
                    className="h-auto p-4 arcade-button hover:glow flex flex-col items-center gap-2"
                    onClick={() => connectDeviceMutation.mutate({
                      deviceType: deviceType.type,
                      deviceName: deviceType.name,
                      isConnected: false,
                    })}
                    data-testid={`button-add-${deviceType.type}`}
                  >
                    <span className="text-2xl">{deviceType.icon}</span>
                    <div className="text-center">
                      <p className="font-semibold text-sm">{deviceType.name}</p>
                      <p className="text-xs text-muted-foreground">{deviceType.description}</p>
                    </div>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* XP Rewards Info */}
          <Card className="bg-gradient-to-r from-primary/20 to-secondary/20 border-primary/30" data-testid="card-xp-rewards">
            <CardHeader>
              <CardTitle className="font-arcade text-primary neon-glow">🏆 XP Rewards System</CardTitle>
              <CardDescription>Earn experience points for your real-world activities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3">Daily Rewards</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex justify-between">
                      <span>👟 Every 1,000 steps</span>
                      <Badge variant="secondary">+10 XP</Badge>
                    </li>
                    <li className="flex justify-between">
                      <span>🔥 100 calories burned</span>
                      <Badge variant="secondary">+5 XP</Badge>
                    </li>
                    <li className="flex justify-between">
                      <span>📏 1 km distance</span>
                      <Badge variant="secondary">+5 XP</Badge>
                    </li>
                    <li className="flex justify-between">
                      <span>💤 8 hours sleep</span>
                      <Badge variant="secondary">+25 XP</Badge>
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-3">Bonus Multipliers</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex justify-between">
                      <span>📅 Daily goal achieved</span>
                      <Badge variant="outline">2x XP</Badge>
                    </li>
                    <li className="flex justify-between">
                      <span>🔥 7-day streak</span>
                      <Badge variant="outline">1.5x XP</Badge>
                    </li>
                    <li className="flex justify-between">
                      <span>🎯 Weekly challenge</span>
                      <Badge variant="outline">3x XP</Badge>
                    </li>
                    <li className="flex justify-between">
                      <span>⚡ Auto-sync enabled</span>
                      <Badge variant="outline">+10% XP</Badge>
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <Footer />
    </div>
  );
}