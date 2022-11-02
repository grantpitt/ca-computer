# ANTS

Computer programs are executed in a centralized way. But complex systems in the word (e.g. an ant colony) achive computation in a decentralized way. In an attempt to explore decentralized computation (and an excuse to play with genetic algorithms and cellular automata) I want to make a cellular automata where the initial state encodes something (a list of numbers for example) and the rules evolve to emulate a given program on that input.

For example, maybe the program you want to emulate is to compute the mode:
```python
def mode(ns):
    counts = {}
    for n in ns:
        if n not in counts:
            counts[n] = 0
        counts[n] += 1
    mode_val = max(counts, key=counts.__getitem__)
    return [mode_val] * len(ns)
```
Thinking in terms of the cellular automata, the initial state would represent a list of numbers and the output would have each cell with the value most common in the initial state.

Another example would be to sort the inital state:
```python
def sort(ns):
    return sorted(ns)
```

A genetic algorithm could be used to evolve rules that emulate these programs. Once the setup is in place, the world's your oyster! You can write any program that takes a list of 0's and 1's and outputs another list of 0's and 1's. It would be interesting to see if there's an identifiable charictaristic beween programs that can be achived in a decentralized way and those that can't. In theory, CA's are capable of universal computation.
