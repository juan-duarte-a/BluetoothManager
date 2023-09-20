/* eslint-disable react-native/no-inline-styles */
import { View, Text, TouchableOpacity } from 'react-native';
import React, { FC } from 'react';
import { styles } from './styles/styles';
import { Peripheral } from 'react-native-ble-manager';

export interface PeripheralItem extends Peripheral {
  connected: boolean;
}

interface DeviceProps {
  peripheral: PeripheralItem;
  connect: (peripheral: PeripheralItem) => void;
  disconnect: (peripheral: PeripheralItem) => void;
}

export const Device: FC<DeviceProps> = ({ peripheral, connect, disconnect }) => {
  const { name, id, rssi, connected } = peripheral;

  return (
    <>
      <View style={styles.deviceContainer}>
        <View style={styles.deviceItem}>
          <Text style={styles.deviceName}>{name === null ? "<No name>" : name}</Text>
          <Text style={styles.deviceInfo}>ID: {id}</Text>
          <Text style={styles.deviceInfo}>RSSI: {rssi}</Text>
        </View>
        <TouchableOpacity
          disabled={name === null}
          onPress={() =>
            connected ? disconnect(peripheral) : connect(peripheral)
          }
          style={
            name === null ?
              [styles.deviceButton,
              { backgroundColor: '#7B7B7B' }]
              : styles.deviceButton}>
          <Text
            style={[
              styles.scanButtonText,
              { fontWeight: 'bold', fontSize: 16 },
            ]}>
            {connected ? 'Disconnect' : 'Connect'}
          </Text>
        </TouchableOpacity>
      </View>
    </>
  );
};