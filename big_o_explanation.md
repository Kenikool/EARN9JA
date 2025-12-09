# Big O Examples - Line by Line Explanation

## Imports Section

```python
import time
```

- Imports Python's `time` module
- Used to measure how long code takes to run
- We'll use `time.time()` to get current timestamp

```python
from typing import List
```

- Imports `List` type hint from typing module
- Helps document that functions expect lists as parameters
- Example: `data: List[int]` means "data is a list of integers"

---

## O(1) - CONSTANT TIME

### Function 1: constant_time_example

```python
def constant_time_example(data: List[int]) -> int:
```

- `def` = define a function
- `constant_time_example` = function name
- `data: List[int]` = parameter named "data", expects a list of integers
- `-> int` = this function returns an integer

```python
    """
    O(1) - Accessing an element by index
    Time doesn't change regardless of list size
    """
```

- Triple quotes = docstring (documentation)
- Explains what the function does

```python
    return data[0]
```

- `data[0]` = get first element (index 0) from the list
- This is O(1) because accessing by index always takes same time
- Doesn't matter if list has 10 or 10 million items

**Why O(1)?** Python stores list items in memory sequentially. It knows exactly where index 0 is, so it jumps directly there.

### Function 2: dict_lookup_example

```python
def dict_lookup_example(data: dict, key: str):
```

- Takes a dictionary and a string key as parameters

```python
    return data.get(key)
```

- `.get(key)` = look up value for this key in dictionary
- O(1) because dictionaries use hash tables
- Hash function calculates exact location of key instantly

**Why O(1)?** Dictionaries use hashing - they convert the key to a number that points directly to the value's location.

---

## O(n) - LINEAR TIME

### Function 3: linear_search

```python
def linear_search(data: List[int], target: int) -> int:
```

- Takes a list and a target number to find
- Returns the index where target is found

```python
    for i, value in enumerate(data):
```

- `enumerate(data)` = loop through list, getting both index (i) and value
- Example: for list [10, 20, 30], gives (0, 10), (1, 20), (2, 30)

```python
        if value == target:
```

- Check if current value equals what we're looking for

```python
            return i
```

- If found, return the index position

```python
    return -1
```

- If we finish loop without finding it, return -1 (common convention for "not found")

**Why O(n)?** Worst case: target is at end or not in list. We check every single element. If list has n items, we do n comparisons.

### Function 4: sum_list

```python
def sum_list(data: List[int]) -> int:
```

- Takes a list of integers, returns their sum

```python
    total = 0
```

- Create variable to store running total, start at 0

```python
    for num in data:
```

- Loop through each number in the list

```python
        total += num
```

- `+=` means "add to itself"
- `total += num` is same as `total = total + num`

```python
    return total
```

- Return the final sum

**Why O(n)?** Must visit every element once to add them all up. n elements = n additions.

---

## O(n²) - QUADRATIC TIME

### Function 5: bubble_sort

```python
def bubble_sort(data: List[int]) -> List[int]:
```

- Takes a list, returns a sorted version

```python
    arr = data.copy()
```

- `.copy()` creates a duplicate of the list
- We don't want to modify the original list

```python
    n = len(arr)
```

- `len(arr)` = get number of elements in list
- Store it in variable `n` for convenience

```python
    for i in range(n):
```

- Outer loop: runs n times
- `range(n)` generates numbers 0, 1, 2, ... n-1

```python
        for j in range(0, n - i - 1):
```

- Inner loop: runs for each iteration of outer loop
- `n - i - 1` because largest elements "bubble" to end, so we check fewer each time

```python
            if arr[j] > arr[j + 1]:
```

- Compare current element with next element
- If current is bigger, they're in wrong order

```python
                arr[j], arr[j + 1] = arr[j + 1], arr[j]
```

- Python's swap syntax
- Swaps the two elements
- Example: if arr[j]=5 and arr[j+1]=3, after swap: arr[j]=3 and arr[j+1]=5

```python
    return arr
```

- Return the sorted list

**Why O(n²)?** Two nested loops. Outer loop runs n times, inner loop runs ~n times for each outer iteration. n × n = n²

### Function 6: find_duplicates

```python
def find_duplicates(data: List[int]) -> List[int]:
```

- Finds duplicate numbers in a list

```python
    duplicates = []
```

- Create empty list to store duplicates we find

```python
    for i in range(len(data)):
```

- Outer loop: go through each element by index

```python
        for j in range(i + 1, len(data)):
```

- Inner loop: compare current element with all elements after it
- `i + 1` means start from next element (don't compare element with itself)

```python
            if data[i] == data[j] and data[i] not in duplicates:
```

- Two conditions:
  1. `data[i] == data[j]` = found matching elements
  2. `data[i] not in duplicates` = haven't already added this duplicate

```python
                duplicates.append(data[i])
```

- `.append()` = add element to end of list

```python
    return duplicates
```

**Why O(n²)?** Nested loops comparing each element with every other element.

---

## O(log n) - LOGARITHMIC TIME

### Function 7: binary_search

```python
def binary_search(data: List[int], target: int) -> int:
```

- Searches sorted list efficiently
- **Important:** Only works on sorted lists!

```python
    left, right = 0, len(data) - 1
```

- Set up two pointers
- `left` = start of search range (index 0)
- `right` = end of search range (last index)

```python
    while left <= right:
```

- Keep searching as long as there's a valid range
- When left > right, we've exhausted all possibilities

```python
        mid = (left + right) // 2
```

- `//` = integer division (rounds down)
- Calculate middle index between left and right
- Example: left=0, right=10 → mid=5

```python
        if data[mid] == target:
```

- Check if middle element is what we're looking for

```python
            return mid
```

- Found it! Return the index

```python
        elif data[mid] < target:
```

- Middle value is too small
- Target must be in right half

```python
            left = mid + 1
```

- Move left pointer to eliminate left half
- New search range: from mid+1 to right

```python
        else:
```

- Middle value is too large
- Target must be in left half

```python
            right = mid - 1
```

- Move right pointer to eliminate right half
- New search range: from left to mid-1

```python
    return -1
```

- If loop ends without finding target, return -1

**Why O(log n)?** Each iteration cuts search space in half:

- Start: 1000 elements
- After 1 check: 500 elements
- After 2 checks: 250 elements
- After 3 checks: 125 elements
- After 10 checks: ~1 element

With 1 million elements, only need ~20 checks!

---

## O(n log n) - LINEARITHMIC TIME

### Function 8: merge_sort

```python
def merge_sort(data: List[int]) -> List[int]:
```

- Efficient sorting algorithm

```python
    if len(data) <= 1:
```

- Base case for recursion
- If list has 0 or 1 elements, it's already sorted

```python
        return data
```

- Return as-is

```python
    mid = len(data) // 2
```

- Find middle point to split list

```python
    left = merge_sort(data[:mid])
```

- `data[:mid]` = slice from start to middle
- Recursively sort left half
- **Recursion** = function calling itself

```python
    right = merge_sort(data[mid:])
```

- `data[mid:]` = slice from middle to end
- Recursively sort right half

```python
    return merge(left, right)
```

- Merge the two sorted halves

**Why O(n log n)?**

- Dividing list in half repeatedly = log n levels
- At each level, we merge n elements
- log n levels × n work per level = n log n

### Function 9: merge (helper)

```python
def merge(left: List[int], right: List[int]) -> List[int]:
```

- Combines two sorted lists into one sorted list

```python
    result = []
```

- Empty list to build result

```python
    i = j = 0
```

- Two pointers: i for left list, j for right list
- Both start at 0

```python
    while i < len(left) and j < len(right):
```

- Continue while both lists have elements remaining

```python
        if left[i] <= right[j]:
```

- Compare current elements from both lists

```python
            result.append(left[i])
```

- Left element is smaller, add it to result

```python
            i += 1
```

- Move left pointer forward

```python
        else:
            result.append(right[j])
            j += 1
```

- Right element is smaller, add it and move right pointer

```python
    result.extend(left[i:])
    result.extend(right[j:])
```

- `.extend()` = add all remaining elements
- One list will be empty, one might have leftovers
- Add whatever's left from both lists

```python
    return result
```

---

## Performance Comparison Functions

### compare_search_performance

```python
def compare_search_performance():
```

```python
    data = list(range(1, 100001))
```

- `range(1, 100001)` = numbers from 1 to 100,000
- `list()` converts range to actual list
- Creates: [1, 2, 3, 4, ..., 100000]

```python
    target = 99999
```

- Search for number near the end (worst case for linear search)

```python
    start = time.time()
```

- `time.time()` = current time in seconds since 1970
- Save start time

```python
    linear_search(data, target)
```

- Run the search (we don't care about result, just timing)

```python
    linear_time = time.time() - start
```

- Get current time and subtract start time
- Result = how many seconds elapsed

```python
    print(f"Linear Search O(n): {linear_time:.6f} seconds")
```

- `f"..."` = f-string (formatted string)
- `{linear_time:.6f}` = insert variable, show 6 decimal places

### compare_sort_performance

```python
import random
```

- Import inside function (could be at top too)

```python
data = [random.randint(1, 1000) for _ in range(1000)]
```

- **List comprehension** = compact way to create lists
- `random.randint(1, 1000)` = random number between 1 and 1000
- `for _ in range(1000)` = do this 1000 times
- `_` = throwaway variable (we don't use the loop counter)
- Creates list of 1000 random numbers

---

## Main Demo Section

```python
if __name__ == "__main__":
```

- Special Python syntax
- This code only runs if file is executed directly
- Doesn't run if file is imported as a module

```python
    print("=" * 60)
```

- `"=" * 60` = repeat "=" character 60 times
- Creates a line separator

```python
    test_list = [64, 34, 25, 12, 22, 11, 90]
```

- Create sample data for testing

```python
    print(f"   First element: {constant_time_example(test_list)}")
```

- Call function and print result in formatted string

---

## Key Concepts Summary

1. **O(1)** - Same speed regardless of data size

   - Array index access, dictionary lookup

2. **O(log n)** - Halves the problem each step

   - Binary search on sorted data

3. **O(n)** - Checks each element once

   - Linear search, summing elements

4. **O(n log n)** - Efficient sorting

   - Merge sort, Python's sorted()

5. **O(n²)** - Nested loops
   - Bubble sort, comparing all pairs

The bigger the O(), the slower it gets with large data!
