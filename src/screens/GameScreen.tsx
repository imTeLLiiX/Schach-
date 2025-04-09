import React, { useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import ChessBoard from '../components/ChessBoard';
import { useGameStore } from '../store/gameStore';

export const GameScreen: React.FC = () => {
  const { initializeGame, currentPlayer, undoLastMove, saveGame, loadGame } = useGameStore();

  useEffect(() => {
    initializeGame();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.playerText}>
          Spieler am Zug: {currentPlayer === 'white' ? 'Weiß' : 'Schwarz'}
        </Text>
      </View>

      <ChessBoard />

      <View style={styles.controls}>
        <TouchableOpacity style={styles.button} onPress={undoLastMove}>
          <Text style={styles.buttonText}>Zug zurück</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={saveGame}>
          <Text style={styles.buttonText}>Spiel speichern</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={loadGame}>
          <Text style={styles.buttonText}>Spiel laden</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    padding: 16,
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  playerText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  button: {
    backgroundColor: '#4A90E2',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default GameScreen; 