import random

def display_board(board):
    """
    Prints the Tic-Tac-Toe board to the console.
    The board is a list of 10 strings, where index 0 is unused
    and indices 1-9 correspond to the numbers on a telephone keypad.
    """
    print('\n' * 10) # Clear screen for better display
    print(' ' + board[7] + ' | ' + board[8] + ' | ' + board[9])
    print('-----------')
    print(' ' + board[4] + ' | ' + board[5] + ' | ' + board[6])
    print('-----------')
    print(' ' + board[1] + ' | ' + board[2] + ' | ' + board[3])

def player_input():
    """
    Allows players to choose their marker (X or O).
    Returns a tuple where the first element is the player 1's marker
    and the second is player 2's marker.
    """
    marker = ''
    while not (marker == 'X' or marker == 'O'):
        marker = input('Player 1: Do you want to be X or O? ').upper()

    if marker == 'X':
        return ('X', 'O')
    else:
        return ('O', 'X')

def place_marker(board, marker, position):
    """
    Places a player's marker on the board at the given position.
    """
    board[position] = marker

def win_check(board, mark):
    """
    Checks if the given player (mark) has won the game.
    Returns True if mark has won, False otherwise.
    """
    return ((board[7] == mark and board[8] == mark and board[9] == mark) or # across the top
            (board[4] == mark and board[5] == mark and board[6] == mark) or # across the middle
            (board[1] == mark and board[2] == mark and board[3] == mark) or # across the bottom
            (board[7] == mark and board[4] == mark and board[1] == mark) or # down the left
            (board[8] == mark and board[5] == mark and board[2] == mark) or # down the middle
            (board[9] == mark and board[6] == mark and board[3] == mark) or # down the right
            (board[7] == mark and board[5] == mark and board[3] == mark) or # diagonal
            (board[9] == mark and board[5] == mark and board[1] == mark))   # diagonal

def choose_first():
    """
    Randomly decides which player goes first.
    Returns 'Player 1' or 'Player 2'.
    """
    if random.randint(0, 1) == 0:
        return 'Player 2'
    else:
        return 'Player 1'

def space_check(board, position):
    """
    Checks if a position on the board is freely available.
    Returns True if the space is empty, False otherwise.
    """
    return board[position] == ' '

def full_board_check(board):
    """
    Checks if the board is full.
    Returns True if the board is full (a draw), False otherwise.
    """
    for i in range(1, 10):
        if space_check(board, i):
            return False
    return True

def player_choice(board):
    """
    Asks for a player's next position (1-9) and validates it.
    Returns the chosen position as an integer.
    """
    position = 0
    while position not in range(1, 10) or not space_check(board, position):
        try:
            position = int(input('Choose your next position: (1-9) '))
        except ValueError:
            print('Invalid input! Please enter a number between 1 and 9.')
            continue

        if position not in range(1, 10):
            print('Invalid position! Please choose a number between 1 and 9.')
        elif not space_check(board, position):
            print('This space is already taken! Choose another.')
    return position

def replay():
    """
    Asks the players if they want to play again.
    Returns True if they do, False otherwise.
    """
    return input('Do you want to play again? Enter Yes or No: ').lower().startswith('y')

# Main game loop
print('Welcome to Tic Tac Toe!')

while True:
    # Reset the board
    the_board = [' '] * 10
    player1_marker, player2_marker = player_input()
    turn = choose_first()
    print(turn + ' will go first.')

    game_on = True

    while game_on:
        if turn == 'Player 1':
            # Player 1's turn
            display_board(the_board)
            position = player_choice(the_board)
            place_marker(the_board, player1_marker, position)

            if win_check(the_board, player1_marker):
                display_board(the_board)
                print('Congratulations! Player 1 has won the game!')
                game_on = False
            else:
                if full_board_check(the_board):
                    display_board(the_board)
                    print('The game is a draw!')
                    game_on = False
                else:
                    turn = 'Player 2'

        else:
            # Player 2's turn
            display_board(the_board)
            position = player_choice(the_board)
            place_marker(the_board, player2_marker, position)

            if win_check(the_board, player2_marker):
                display_board(the_board)
                print('Congratulations! Player 2 has won the game!')
                game_on = False
            else:
                if full_board_check(the_board):
                    display_board(the_board)
                    print('The game is a draw!')
                    game_on = False
                else:
                    turn = 'Player 1'

    if not replay():
        break
