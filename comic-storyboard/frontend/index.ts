import { registerRootComponent } from 'expo';
import { Platform } from 'react-native';

import App from './App';

// Web: 禁止页面横向滚动
if (Platform.OS === 'web' && typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = 'html, body, #root { overflow-x: hidden !important; width: 100%; }';
  document.head.appendChild(style);
}

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
