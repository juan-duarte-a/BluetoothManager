import {StyleSheet, Dimensions} from 'react-native';

const windowHeight = Dimensions.get('window').height;
export const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: windowHeight,
    paddingHorizontal: 10,
  },
  scrollContainer: {
    padding: 0,
    top: 0,
    marginBottom: 170,
  },
  title: {
    fontSize: 30,
    textAlign: 'center',
    marginBottom: 20,
    marginTop: 20,
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 26,
    marginBottom: 20,
    marginTop: 20,
    fontWeight: '600',
  },
  scanButton: {
    backgroundColor: '#2196F3',
    padding: 10,
    borderRadius: 5,
    marginBottom: 20,
  },
  scanButtonScanning: {
    backgroundColor: '#5bbf5f',
    padding: 10,
    borderRadius: 5,
    marginBottom: 20,
  },

  scanButtonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 22,
    fontWeight: '700',
    justifyContent: 'center',
  },
  noDevicesText: {
    textAlign: 'center',
    marginTop: 0,
    marginBottom: 10,
    fontStyle: 'italic',
  },
  deviceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  deviceItem: {
    marginBottom: 10,
  },
  deviceName: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  deviceInfo: {
    fontSize: 14,
  },
  deviceButton: {
    backgroundColor: '#2196F3',
    padding: 8,
    borderRadius: 5,
    marginBottom: 20,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
});