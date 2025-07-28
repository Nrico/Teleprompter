import argparse
import time


def teleprompt(text: str, wpm: int = 150) -> None:
    """Display text word by word at a given speed."""
    words = text.split()
    delay = 60.0 / wpm
    for word in words:
        print(word, end=' ', flush=True)
        time.sleep(delay)
    print()


def main() -> None:
    parser = argparse.ArgumentParser(description="Simple CLI teleprompter")
    parser.add_argument("file", help="Path to text file to display")
    parser.add_argument("--wpm", type=int, default=150, help="Words per minute speed")
    args = parser.parse_args()

    with open(args.file, "r", encoding="utf-8") as f:
        text = f.read()
    teleprompt(text, args.wpm)


if __name__ == "__main__":
    main()
