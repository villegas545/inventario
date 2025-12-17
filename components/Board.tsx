
import React from 'react';
import { View, StyleSheet } from 'react-native';
import Square from './Square';

type BoardProps = {
    squares: (string | null)[];
    onPlay: (nextSquares: (string | null)[]) => void;
    xIsNext: boolean;
    winningLine: number[] | null;
};

export default function Board({ squares, onPlay, xIsNext, winningLine }: BoardProps) {
    function handleClick(i: number) {
        if (squares[i] || winningLine) {
            return;
        }
        const nextSquares = squares.slice();
        nextSquares[i] = xIsNext ? 'X' : 'O';
        onPlay(nextSquares);
    }

    const renderSquare = (i: number) => {
        const isWinner = winningLine ? winningLine.includes(i) : false;
        return (
            <Square
                value={squares[i]}
                onPress={() => handleClick(i)}
                isWinner={isWinner}
            />
        );
    };

    return (
        <View style={styles.board}>
            <View style={styles.row}>
                {renderSquare(0)}
                {renderSquare(1)}
                {renderSquare(2)}
            </View>
            <View style={styles.row}>
                {renderSquare(3)}
                {renderSquare(4)}
                {renderSquare(5)}
            </View>
            <View style={styles.row}>
                {renderSquare(6)}
                {renderSquare(7)}
                {renderSquare(8)}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    board: {
        flexDirection: 'column',
        padding: 5,
        backgroundColor: '#1a1a2e', // Match bg to avoid gaps showing white
    },
    row: {
        flexDirection: 'row',
    },
});
