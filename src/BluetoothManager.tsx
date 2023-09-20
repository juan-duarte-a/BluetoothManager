import { useState, useEffect, createContext, useContext } from 'react';
import {
  Alert,
  Platform,
  NativeModules,
  NativeEventEmitter,
  PermissionsAndroid,
} from 'react-native';
import BleManager, { Peripheral } from 'react-native-ble-manager';
import { PeripheralItem } from './Device';

interface AppContextProps {
  isScanning: boolean;
  detectedDevices: PeripheralItem[];
  discoveredDevices: PeripheralItem[];
  connectedDevices: PeripheralItem[];
  setIsScanning: React.Dispatch<React.SetStateAction<boolean>>;
  setDetectedDevices: React.Dispatch<React.SetStateAction<PeripheralItem[]>>;
  setDiscoveredDevices: React.Dispatch<React.SetStateAction<PeripheralItem[]>>;
  setConnectedDevices: React.Dispatch<React.SetStateAction<PeripheralItem[]>>;
}

export const AppContext = createContext<AppContextProps | undefined>(undefined);

interface AppProviderProps {
  children: React.ReactNode;
}

export const AppProvider = ({ children }: AppProviderProps) => {
  const [isScanning, setIsScanning] = useState(false);
  const [detectedDevices, setDetectedDevices] = useState<PeripheralItem[]>([]);
  const [discoveredDevices, setDiscoveredDevices] = useState<PeripheralItem[]>([]);
  const [connectedDevices, setConnectedDevices] = useState<PeripheralItem[]>([]);

  return (
    <AppContext.Provider value={{
      isScanning, setIsScanning,
      detectedDevices, setDetectedDevices,
      discoveredDevices, setDiscoveredDevices,
      connectedDevices, setConnectedDevices
    }}>
      {children}
    </AppContext.Provider>
  );
};
const bleManagerModule = NativeModules.BleManager;
const bleManagerEmitter = new NativeEventEmitter(bleManagerModule);

const peripheralItem: Function = (peripheral: Peripheral) => {
  return { ...peripheral, connected: true };
};

const detectedPeripherals: Map<String, PeripheralItem> = new Map();
const discoveredPeripherals: Map<String, PeripheralItem> = new Map();
const connectedPeripherals: Map<String, PeripheralItem> = new Map();

export const useScan = () => {
  const { isScanning,
    setIsScanning,
    setDetectedDevices }
    = useContext(AppContext)!;

  const scan = () => {
    if (!isScanning) {
      setDetectedDevices(Array.from(detectedPeripherals.values()));
      BleManager.scan([], 5, true)
        .then(() => {
          console.log('Scanning...');
          setIsScanning(true);
        })
        .catch(error => {
          console.error(error);
        });
    }
  };
  return { scan };
};

export const useConnect = () => {
  const { setDiscoveredDevices,
    setConnectedDevices }
    = useContext(AppContext)!;

  const connect = (peripheral: PeripheralItem) => {
    BleManager.createBond(peripheral.id)
      .then(() => {
        peripheral.connected = true;
        connectedPeripherals.set(peripheral.id, peripheral);
        let devices = Array.from(connectedPeripherals.values());
        setConnectedDevices(Array.from(devices));
        setDiscoveredDevices(Array.from(devices));
        console.log('BLE device paired successfully');
      })
      .catch(() => {
        throw Error('failed to bond');
      });
  };
  return { connect };
};

export const useDisconnect = () => {
  const { setDiscoveredDevices,
    setConnectedDevices }
    = useContext(AppContext)!;

  const disconnect = (peripheral: PeripheralItem) => {
    BleManager.removeBond(peripheral.id)
      .then(() => {
        peripheral.connected = false;
        connectedPeripherals.delete(peripheral.id);
        discoveredPeripherals.set(peripheral.id, peripheral);
        let devices = Array.from(discoveredPeripherals.values());
        setConnectedDevices(Array.from(devices));
        setDiscoveredDevices(Array.from(devices));
        Alert.alert(`Disconnected from ${peripheral.name}`);
      })
      .catch(() => {
        throw Error('fail to remove the bond');
      });
  };
  return { disconnect };
};

export const BluetoothManagerInit = () => {
  const { setIsScanning,
    setDetectedDevices,
    setDiscoveredDevices,
    setConnectedDevices }
    = useContext(AppContext)!;

  const handleLocationPermission = () => {
    console.log(`Platform: ${Platform.OS}`);
    console.log(`Platform version: ${Platform.Version}`);

    if (Platform.OS === 'android' && Platform.Version >= 23) {
      PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      ).then((granted) => {
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          console.log('Location permission granted');
        } else {
          console.log('Location permission denied');
        }
      }).catch(error => {
        console.log('Error requesting location permission:', error);
      })
    }
  };

  const handleGetConnectedDevices = () => {
    BleManager.getBondedPeripherals().then(results => {
      for (let i = 0; i < results.length; i++) {
        let peripheral: PeripheralItem = peripheralItem(results[i]);
        connectedPeripherals.set(peripheral.id, peripheral);
        setConnectedDevices(Array.from(connectedPeripherals.values()));
      }
    });
  };

  useEffect(() => {
    console.log("BluetoothManagerInit use!");

    handleLocationPermission();

    BleManager.enableBluetooth().then(() => {
      console.log('Bluetooth is turned on!');
    });

    BleManager.start({ showAlert: false }).then(() => {
      console.log('BleManager initialized');
      handleGetConnectedDevices();
    });

    let discoverListener = bleManagerEmitter.addListener(
      'BleManagerDiscoverPeripheral',
      (peripheral: PeripheralItem) => {
        console.log(`Discover -> Name: ${peripheral.name}, ID: ${peripheral.id}`);
        if (peripheral.name !== null) { // Make condition 'true' to show unindentified devices
          peripheral.connected = false;
          discoveredPeripherals.set(peripheral.id, peripheral);
          setDiscoveredDevices(Array.from(discoveredPeripherals.values()));
        }
      },
    );

    let connectListener = bleManagerEmitter.addListener(
      'BleManagerConnectPeripheral',
      (peripheral: PeripheralItem) => {
        console.log('BleManagerConnectPeripheral:', peripheral);
      },
    );

    let stopScanListener = bleManagerEmitter.addListener(
      'BleManagerStopScan',
      () => {
        setIsScanning(false);
        console.log('scan stopped');
        detectedPeripherals.clear();
        BleManager.getDiscoveredPeripherals().then(
          (discoveredPeripherals: Peripheral[]) => {
            discoveredPeripherals.forEach(peripheral => {
              const discovered: PeripheralItem = peripheralItem(peripheral);
              discovered.connected = false;
              detectedPeripherals.set(discovered.id, discovered);
            })
          }).finally(
            () => setDetectedDevices(Array.from(detectedPeripherals.values()))
          );
      }
    );

    return () => {
      discoverListener.remove();
      connectListener.remove();
      stopScanListener.remove();
    };
  }, []);
};