import { Text, View } from "react-native"
import { styles } from "./styles/styles"
import { Colors } from "react-native/Libraries/NewAppScreen"
import { Device, PeripheralItem } from "./Device"
import { FC } from "react"

interface DeviceListProps {
  isDarkMode: boolean,
  title: string,
  devicesArray: PeripheralItem[],
  connect: (peripheral: PeripheralItem) => void,
  disconnect: (peripheral: PeripheralItem) => void,
  noDevicesText: string
}

export const DeviceList: FC<DeviceListProps> = ({
  isDarkMode,
  title,
  devicesArray,
  connect,
  disconnect,
  noDevicesText
}) => {
  return (
    <>
      <Text
        style={[
          styles.subtitle,
          { color: isDarkMode ? Colors.white : Colors.black },
        ]}>
        {title}
      </Text>
      {devicesArray.length > 0 ? (
        devicesArray.map((item, index) => (
          <View key={index}>
            <Device
              peripheral={item}
              connect={connect}
              disconnect={disconnect} />
          </View>
        ))
      ) : (
        <Text style={styles.noDevicesText}>
          {noDevicesText}
        </Text>
      )}
    </>
  );
}