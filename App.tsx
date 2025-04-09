import React from 'react';
import { SafeAreaView, StatusBar, StyleSheet } from 'react-native';
import GameScreen from './src/screens/GameScreen';

const App: React.FC = () => {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <GameScreen />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
});

export default App; 