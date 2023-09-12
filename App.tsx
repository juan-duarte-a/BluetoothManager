/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-native/no-inline-styles */

import React, { useState, useEffect } from 'react';
import {
  Text,
  Alert,
  View,
  Platform,
  StatusBar,
  SafeAreaView,
  NativeModules,
  useColorScheme,
  TouchableOpacity,
  NativeEventEmitter,
  PermissionsAndroid,
  ScrollView,
} from 'react-native';
import { styles } from './src/styles/styles';
import { DeviceList } from './src/DeviceList';
import BleManager, { Peripheral } from 'react-native-ble-manager';
import { Colors } from 'react-native/Libraries/NewAppScreen';
import { PeripheralItem } from './src/DeviceList';

const BleManagerModule = NativeModules.BleManager;
const BleManagerEmitter = new NativeEventEmitter(BleManagerModule);

const peripheralItem: Function = (peripheral: Peripheral) => {
  return { ...peripheral, connected: true };
};

const App = () => {
  const peripherals: Map<String, PeripheralItem> = new Map();
  const [isScanning, setIsScanning] = useState(false);
  const [connectedDevices, setConnectedDevices] = useState<PeripheralItem[]>([]);
  const [discoveredDevices, setDiscoveredDevices] = useState<PeripheralItem[]>([]);

  const handleLocationPermission = async () => {
    if (Platform.OS === 'android' && Platform.Version >= 23) {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        );

        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          console.log('Location permission granted');
        } else {
          console.log('Location permission denied');
        }
      } catch (error) {
        console.log('Error requesting location permission:', error);
      }
    }
  };

  const handleGetConnectedDevices = () => {
    BleManager.getBondedPeripherals().then((results) => {
      for (let i = 0; i < results.length; i++) {
        let peripheral: PeripheralItem = peripheralItem(results[i]);
        peripherals.set(peripheral.id, peripheral);
        setConnectedDevices(Array.from(peripherals.values()));
      }
    });
  };

  useEffect(() => {
    handleLocationPermission();

    BleManager.enableBluetooth().then(() => {
      console.log('Bluetooth is turned on!');
    });

    BleManager.start({ showAlert: false }).then(() => {
      console.log('BleManager initialized');
      handleGetConnectedDevices();
    });

    let stopDiscoverListener = BleManagerEmitter.addListener(
      'BleManagerDiscoverPeripheral',
      (peripheral: PeripheralItem) => {
        peripheral.connected = false;
        peripherals.set(peripheral.id, peripheral);
        setDiscoveredDevices(Array.from(peripherals.values()));
      },
    );

    let stopConnectListener = BleManagerEmitter.addListener(
      'BleManagerConnectPeripheral',
      (peripheral: PeripheralItem) => {
        console.log('BleManagerConnectPeripheral:', peripheral);
      },
    );

    let stopScanListener = BleManagerEmitter.addListener(
      'BleManagerStopScan',
      () => {
        setIsScanning(false);
        console.log('scan stopped');
      },
    );

    return () => {
      stopDiscoverListener.remove();
      stopConnectListener.remove();
      stopScanListener.remove();
    };
  }, []);

  const scan = () => {
    if (!isScanning) {
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

  const connect = (peripheral: PeripheralItem) => {
    BleManager.createBond(peripheral.id)
      .then(() => {
        peripheral.connected = true;
        peripherals.set(peripheral.id, peripheral);
        let devices = Array.from(peripherals.values());
        setConnectedDevices(Array.from(devices));
        setDiscoveredDevices(Array.from(devices));
        console.log('BLE device paired successfully');
      })
      .catch(() => {
        throw Error('failed to bond');
      });
  };

  const disconnect = (peripheral: PeripheralItem) => {
    BleManager.removeBond(peripheral.id)
      .then(() => {
        peripheral.connected = false;
        peripherals.set(peripheral.id, peripheral);
        let devices = Array.from(peripherals.values());
        setConnectedDevices(Array.from(devices));
        setDiscoveredDevices(Array.from(devices));
        Alert.alert(`Disconnected from ${peripheral.name}`);
      })
      .catch(() => {
        throw Error('fail to remove the bond');
      });
  };

  const isDarkMode = useColorScheme() === 'dark';
  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  return (
    <SafeAreaView style={[backgroundStyle, styles.container]}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundStyle.backgroundColor}
      />
      <View style={{ paddingHorizontal: 10 }}>
        <Text
          style={[
            styles.title,
            { color: isDarkMode ? Colors.white : Colors.black },
          ]}>
          React Native BLE
        </Text>
        <TouchableOpacity
          onPress={scan}
          activeOpacity={0.5}
          style={styles.scanButton}>
          <Text style={styles.scanButtonText}>
            {isScanning ? 'Scanning...' : 'Scan Bluetooth Devices'}
          </Text>
        </TouchableOpacity>
        <ScrollView contentInsetAdjustmentBehavior="automatic"
          style={styles.scrollContainer}>
          <Text
            style={[
              styles.subtitle,
              { color: isDarkMode ? Colors.white : Colors.black },
            ]}>
            Discovered Devices:
          </Text>
          {discoveredDevices.length > 0 ? (
            discoveredDevices.map((item, index) => (
              <View key={index}>
                <DeviceList
                  peripheral={item}
                  connect={connect}
                  disconnect={disconnect}
                />
              </View>
            ))
          ) : (
            <Text style={styles.noDevicesText}>No Bluetooth devices found</Text>
          )}

          <Text
            style={[
              styles.subtitle,
              { color: isDarkMode ? Colors.white : Colors.black },
            ]}>
            Connected Devices:
          </Text>
          {connectedDevices.length > 0 ? (
            connectedDevices.map((item, index) => (
              <View key={index}>
                <DeviceList
                  peripheral={item}
                  connect={connect}
                  disconnect={disconnect}
                />
              </View>
            ))
          ) : (
            <Text style={styles.noDevicesText}>No connected devices</Text>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default App;