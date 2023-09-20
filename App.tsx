/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-native/no-inline-styles */

import { useContext } from 'react';
import {
  Text,
  View,
  StatusBar,
  SafeAreaView,
  useColorScheme,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { styles } from './src/styles/styles';
import { Colors } from 'react-native/Libraries/NewAppScreen';
import { DeviceList } from './src/DeviceList';
import { AppContext, AppProvider, BluetoothManagerInit, useConnect, useDisconnect, useScan } from './src/BluetoothManager';

const App = () => {
  const { isScanning,
    detectedDevices,
    discoveredDevices,
    connectedDevices }
    = useContext(AppContext)!;

  const { scan } = useScan();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();

  BluetoothManagerInit.call([]);

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
          style={isScanning ? styles.scanButtonScanning : styles.scanButton}>
          <Text style={styles.scanButtonText}>
            {isScanning ? 'Scanning...' : 'Scan Bluetooth Devices'}
          </Text>
        </TouchableOpacity>
        <ScrollView contentInsetAdjustmentBehavior="automatic"
          style={styles.scrollContainer}>
          <DeviceList
            isDarkMode={isDarkMode}
            title='Detected Devices:'
            devicesArray={detectedDevices}
            connect={connect}
            disconnect={disconnect}
            noDevicesText={isScanning ? "Scanning..." : "No Bluetooth devices detected"}
          />
          <DeviceList
            isDarkMode={isDarkMode}
            title='Discovered Devices:'
            devicesArray={discoveredDevices}
            connect={connect}
            disconnect={disconnect}
            noDevicesText='No Bluetooth devices found'
          />
          <DeviceList
            isDarkMode={isDarkMode}
            title='Connected Devices:'
            devicesArray={connectedDevices}
            connect={connect}
            disconnect={disconnect}
            noDevicesText='No connected devices'
          />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default () => (
  <AppProvider>
    <App />
  </AppProvider>
);