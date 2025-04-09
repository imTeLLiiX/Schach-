import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { PieceType, PieceColor } from '../models/ChessPiece';

interface ChessPieceProps {
  type: PieceType;
  color: PieceColor;
  size: number;
}

const pieceSymbols: Record<PieceType, string> = {
  king: '♔',
  queen: '♕',
  rook: '♖',
  bishop: '♗',
  knight: '♘',
  pawn: '♙'
};

const ChessPiece: React.FC<ChessPieceProps> = ({ type, color, size }) => {
  const symbol = pieceSymbols[type];

  return (
    <Text
      style={[
        styles.piece,
        { color: color === 'white' ? '#FFFFFF' : '#000000' },
        { fontSize: size }
      ]}
    >
      {symbol}
    </Text>
  );
};

const styles = StyleSheet.create({
  piece: {
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  }
});

export default ChessPiece; 