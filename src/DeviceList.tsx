/* eslint-disable react-native/no-inline-styles */
import { View, Text, TouchableOpacity } from 'react-native';
import React from 'react';
import { styles } from './styles/styles';
import { Peripheral } from 'react-native-ble-manager';

export interface PeripheralItem extends Peripheral {
  connected: boolean;
}

interface DeviceListProps {
  peripheral: PeripheralItem;
  connect: (peripheral: PeripheralItem) => void;
  disconnect: (peripheral: PeripheralItem) => void;
}

export const DeviceList: React.FC<DeviceListProps> = ({ peripheral, connect, disconnect }) => {
  const { name, rssi, connected } = peripheral;

  return (
    <>
      {name && (
        <View style={styles.deviceContainer}>
          <View style={styles.deviceItem}>
            <Text style={styles.deviceName}>{name}</Text>
            <Text style={styles.deviceInfo}>RSSI: {rssi}</Text>
          </View>

          <TouchableOpacity
            onPress={() =>
              connected ? disconnect(peripheral) : connect(peripheral)
            }
            style={styles.deviceButton}>
            <Text
              style={[
                styles.scanButtonText,
                { fontWeight: 'bold', fontSize: 16 },
              ]}>
              {connected ? 'Disconnect' : 'Connect'}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </>
  );
};