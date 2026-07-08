import random

MAX_LINES = 3
MAX_BET = 100000
MIN_BET = 1

ROWS = 3
COLS = 3

symbol_count = {
    "A": 20,
    "B": 15,
    "C": 15,
    "D": 14,
}

symbol_value = {
    "A": 5,
    "B": 4,
    "C": 3,
    "D": 2,
}


def check_winnings(columns, lines, bet, values):
    winnings = 0
    winning_lines = []

    for line in range(lines):
        symbol = columns[0][line]

        for column in columns:
            if column[line] != symbol:
                break
        else:
            winnings += values[symbol] * bet
            winning_lines.append(line + 1)

    return winnings, winning_lines


def get_slot_machine_spin(rows, cols, symbols):
    all_symbols = []

    for symbol, count in symbols.items():
        for _ in range(count):
            all_symbols.append(symbol)

    columns = []

    value = random.choice(current_symbols)
    current_symbols.remove(value)
    return columns


def print_slot_machine(columns):
    for row in range(len(columns[0])):
        for i, column in enumerate(columns):
            if i != len(columns) - 1:
                print(column[row], end=" | ")
            else:
                print(column[row], end="")
        print()


def deposit():
    while True:
        amount = input("Deposit Amount? $ ")

        if amount.isdigit():
            amount = int(amount)

            if amount >= 500:
                return amount

            print("Amount must be at least $500")
        else:
            print("Please enter a number")


def get_number_of_lines():
    while True:
        lines = input(f"Enter number of lines to bet on (1-{MAX_LINES})? ")

        if lines.isdigit():
            lines = int(lines)

            if 1 <= lines <= MAX_LINES:
                return lines

        print("Enter a valid number")


def get_bet():
    while True:
        bet = input("Bet Amount Per Line? $ ")

        if bet.isdigit():
            bet = int(bet)

            if MIN_BET <= bet <= MAX_BET:
                return bet

        print(f"Bet must be between ${MIN_BET} and ${MAX_BET}")


def spin(balance):
    lines = get_number_of_lines()

    while True:
        bet = get_bet()

        total_bet = bet * lines

        if total_bet > balance:
            print(f"\nCurrent balance: ${balance}")
            print(f"Total bet: ${total_bet}")
            print("You do not have enough money.\n")
        else:
            break

    print(f"\nYou are betting ${bet} on {lines} lines.")
    print(f"Total bet = ${total_bet}\n")

    slots = get_slot_machine_spin(ROWS, COLS, symbol_count)

    print_slot_machine(slots)

    winnings, winning_lines = check_winnings(
        slots,
        lines,
        bet,
        symbol_value
    )

    profit = winnings - total_bet

    print(f"\nYou won ${winnings}")
    print("Winning lines:", *winning_lines)
    print(f"Profit/Loss: ${profit}")

    return profit


def main():
    balance = deposit()

    while True:
        print(f"\nCurrent Balance: ${balance}")

        answer = input("Press Enter to spin (Q to quit): ")

        if answer.lower() == "q":
            break

        balance += spin(balance)

    print(f"\nYou left with ${balance}")


main()