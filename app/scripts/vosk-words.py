#!/usr/bin/env python3
import os
import struct
import sys

FST_MAGIC = 2125659606
SYMBOL_TABLE_MAGIC = 2125658996
HAS_ISYMBOLS = 1
SPECIAL_PREFIXES = ("<", "#", "[", "!")
GRAPH = os.path.join(
    os.path.dirname(os.path.abspath(__file__)), "..", "assets", "model-es", "graph", "Gr.fst"
)


def read_int(f, fmt):
    size = struct.calcsize(fmt)
    data = f.read(size)
    if len(data) != size:
        raise EOFError("Gr.fst termina antes de lo esperado")
    return struct.unpack(fmt, data)[0]


def read_string(f):
    length = read_int(f, "<i")
    return f.read(length).decode("utf-8")


def read_vocabulary(path):
    with open(path, "rb") as f:
        if read_int(f, "<i") != FST_MAGIC:
            raise ValueError("Gr.fst no es un FST de OpenFst")
        read_string(f)
        read_string(f)
        read_int(f, "<i")
        flags = read_int(f, "<i")
        for _ in range(4):
            read_int(f, "<q")
        if not flags & HAS_ISYMBOLS:
            raise ValueError("Gr.fst no trae tabla de símbolos")
        if read_int(f, "<i") != SYMBOL_TABLE_MAGIC:
            raise ValueError("La tabla de símbolos no tiene el formato esperado")
        read_string(f)
        read_int(f, "<q")
        count = read_int(f, "<q")
        words = []
        for _ in range(count):
            symbol = read_string(f)
            read_int(f, "<q")
            if not symbol.startswith(SPECIAL_PREFIXES):
                words.append(symbol)
        return set(words)


def main(args):
    vocabulary = read_vocabulary(GRAPH)
    if not args:
        for word in sorted(vocabulary):
            print(word)
        return 0
    missing = False
    for word in args:
        if word.lower() in vocabulary:
            print(f"{word}: está")
        else:
            print(f"{word}: NO está")
            missing = True
    return 1 if missing else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
