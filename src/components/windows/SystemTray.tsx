import React, { useState, forwardRef } from 'react';
import { 
  Wifi, 
  WifiOff,
  Volume2, 
  VolumeX,
  Volume1,
  Battery, 
  BatteryCharging,
  BatteryLow,
  BatteryMedium,
  BatteryFull,
  ChevronUp,
  Bluetooth,
  Plane,
  Moon,
  Sun,
  Cast,
  Settings,
  Lock,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Slider } from '@/components/ui/slider';

interface SystemTrayProps {
  onLock: () => void;
}

export const SystemTray = forwardRef<HTMLDivElement, SystemTrayProps>(
  ({ onLock }, ref) => {
    const [isQuickSettingsOpen, setIsQuickSettingsOpen] = useState(false);
    const [wifiEnabled, setWifiEnabled] = useState(true);
    const [bluetoothEnabled, setBluetoothEnabled] = useState(true);
    const [airplaneMode, setAirplaneMode] = useState(false);
    const [nightLight, setNightLight] = useState(false);
    const [volume, setVolume] = useState([75]);
    const [brightness, setBrightness] = useState([80]);
    const [batteryLevel] = useState(85);
    const [isCharging] = useState(false);

    const getBatteryIcon = () => {
      if (isCharging) return BatteryCharging;
      if (batteryLevel <= 20) return BatteryLow;
      if (batteryLevel <= 50) return BatteryMedium;
      return BatteryFull;
    };

    const getVolumeIcon = () => {
      if (volume[0] === 0) return VolumeX;
      if (volume[0] < 50) return Volume1;
      return Volume2;
    };

    const BatteryIcon = getBatteryIcon();
    const VolumeIcon = getVolumeIcon();

    const quickSettings = [
      { id: 'wifi', icon: wifiEnabled ? Wifi : WifiOff, label: 'Wi-Fi', active: wifiEnabled, onClick: () => setWifiEnabled(!wifiEnabled) },
      { id: 'bluetooth', icon: Bluetooth, label: 'Bluetooth', active: bluetoothEnabled, onClick: () => setBluetoothEnabled(!bluetoothEnabled) },
      { id: 'airplane', icon: Plane, label: 'Airplane mode', active: airplaneMode, onClick: () => setAirplaneMode(!airplaneMode) },
      { id: 'night', icon: nightLight ? Moon : Sun, label: 'Night light', active: nightLight, onClick: () => setNightLight(!nightLight) },
      { id: 'cast', icon: Cast, label: 'Cast', active: false, onClick: () => {} },
      { id: 'lock', icon: Lock, label: 'Lock', active: false, onClick: onLock },
    ];

    return (
      <div ref={ref} className="relative">
        {/* Tray Icons */}
        <button
          onClick={() => setIsQuickSettingsOpen(!isQuickSettingsOpen)}
          className="flex items-center gap-1.5 sm:gap-2 px-1.5 sm:px-2 h-9 sm:h-10 win-hover rounded-md cursor-pointer"
        >
          <Wifi size={12} className={cn("sm:w-3.5 sm:h-3.5", !wifiEnabled && "text-muted-foreground")} />
          <VolumeIcon size={12} className="sm:w-3.5 sm:h-3.5" />
          <div className="flex items-center gap-0.5">
            <BatteryIcon size={12} className={cn("sm:w-3.5 sm:h-3.5", batteryLevel <= 20 && "text-destructive")} />
            <span className="text-[10px] hidden sm:inline">{batteryLevel}%</span>
          </div>
        </button>

        {/* Quick Settings Panel */}
        {isQuickSettingsOpen && (
          <>
            <div 
              className="fixed inset-0 z-[9998]" 
              onClick={() => setIsQuickSettingsOpen(false)} 
            />
            <div className="absolute bottom-12 right-0 w-80 sm:w-96 win-window rounded-xl p-4 z-[9999] animate-in slide-in-from-bottom-2">
              {/* Quick Action Grid */}
              <div className="grid grid-cols-3 gap-2 mb-4">
                {quickSettings.map((setting) => (
                  <button
                    key={setting.id}
                    onClick={setting.onClick}
                    className={cn(
                      "flex flex-col items-center gap-1 p-3 rounded-lg transition-colors",
                      setting.active 
                        ? "bg-primary text-primary-foreground" 
                        : "bg-secondary hover:bg-secondary/80"
                    )}
                  >
                    <setting.icon size={18} />
                    <span className="text-[10px] text-center">{setting.label}</span>
                  </button>
                ))}
              </div>

              {/* Sliders */}
              <div className="space-y-4">
                {/* Brightness */}
                <div className="flex items-center gap-3">
                  <Sun size={16} className="text-muted-foreground" />
                  <Slider
                    value={brightness}
                    onValueChange={setBrightness}
                    max={100}
                    step={1}
                    className="flex-1"
                  />
                </div>

                {/* Volume */}
                <div className="flex items-center gap-3">
                  <VolumeIcon size={16} className="text-muted-foreground" />
                  <Slider
                    value={volume}
                    onValueChange={setVolume}
                    max={100}
                    step={1}
                    className="flex-1"
                  />
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
                <div className="flex items-center gap-2">
                  <BatteryIcon size={16} />
                  <span className="text-sm">{batteryLevel}%</span>
                  {isCharging && <span className="text-xs text-muted-foreground">Charging</span>}
                </div>
                <button className="p-1.5 rounded-md win-hover">
                  <Settings size={16} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    );
  }
);

SystemTray.displayName = 'SystemTray';
