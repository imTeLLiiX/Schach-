import React from 'react';
import { View, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { useGameStore } from '../store/gameStore';
import { Position } from '../models/ChessPiece';
import ChessPieceComponent from './ChessPiece';

const { width } = Dimensions.get('window');
const BOARD_SIZE = Math.min(width - 32, 400);
const CELL_SIZE = BOARD_SIZE / 8;

export const ChessBoard: React.FC = () => {
  const { pieces, selectedPiece, currentPlayer, selectPiece, movePiece } = useGameStore();

  const handleCellPress = (position: Position) => {
    const pieceAtPosition = pieces.find(
      p => p.position.x === position.x && p.position.y === position.y
    );

    if (selectedPiece) {
      if (pieceAtPosition?.color === selectedPiece.color) {
        selectPiece(pieceAtPosition);
      } else {
        movePiece(selectedPiece.position, position);
      }
    } else if (pieceAtPosition?.color === currentPlayer) {
      selectPiece(pieceAtPosition);
    }
  };

  const renderCell = (row: number, col: number) => {
    const isBlack = (row + col) % 2 === 1;
    const position: Position = { x: col, y: row };
    const piece = pieces.find(p => p.position.x === col && p.position.y === row);
    const isSelected = selectedPiece?.id === piece?.id;

    return (
      <TouchableOpacity
        key={`${row}-${col}`}
        style={[
          styles.cell,
          isBlack ? styles.blackCell : styles.whiteCell,
          isSelected && styles.selectedCell
        ]}
        onPress={() => handleCellPress(position)}
      >
        {piece && (
          <ChessPieceComponent
            type={piece.type}
            color={piece.color}
            size={CELL_SIZE * 0.8}
          />
        )}
      </TouchableOpacity>
    );
  };

  const renderBoard = () => {
    const rows = [];
    for (let i = 0; i < 8; i++) {
      const cells = [];
      for (let j = 0; j < 8; j++) {
        cells.push(renderCell(i, j));
      }
      rows.push(
        <View key={i} style={styles.row}>
          {cells}
        </View>
      );
    }
    return rows;
  };

  return (
    <View style={styles.container}>
      <View style={styles.board}>{renderBoard()}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  board: {
    width: BOARD_SIZE,
    height: BOARD_SIZE,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#000',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  row: {
    flexDirection: 'row',
  },
  cell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  whiteCell: {
    backgroundColor: '#E8EDF9',
  },
  blackCell: {
    backgroundColor: '#B7C0D8',
  },
  selectedCell: {
    backgroundColor: '#FFE4B5',
  },
});

export default ChessBoard; 