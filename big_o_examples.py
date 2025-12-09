"""
Big O Notation Examples in Python
Demonstrates time complexity of common data structure operations
"""

import time
from typing import List


# ============================================================================
# O(1) - CONSTANT TIME
# ============================================================================

def constant_time_example(data: List[int]) -> int:
    """
    O(1) - Accessing an element by index
    Time doesn't change regardless of list size
    """
    return data[0]  # Always takes same time


def dict_lookup_example(data: dict, key: str):
    """
    O(1) - Dictionary lookup by key
    Hash table provides constant time access
    """
    return data.get(key)


# ============================================================================
# O(n) - LINEAR TIME
# ============================================================================

def linear_search(data: List[int], target: int) -> int:
    """
    O(n) - Linear search through list
    Worst case: check every element
    """
    for i, value in enumerate(data):
        if value == target:
            return i
    return -1


def sum_list(data: List[int]) -> int:
    """
    O(n) - Sum all elements
    Must visit each element once
    """
    total = 0
    for num in data:
        total += num
    return total


# ============================================================================
# O(n²) - QUADRATIC TIME
# ============================================================================

def bubble_sort(data: List[int]) -> List[int]:
    """
    O(n²) - Bubble sort algorithm
    Nested loops: for each element, compare with all others
    """
    arr = data.copy()
    n = len(arr)
    
    for i in range(n):
        for j in range(0, n - i - 1):
            if arr[j] > arr[j + 1]:
                arr[j], arr[j + 1] = arr[j + 1], arr[j]
    
    return arr


def find_duplicates(data: List[int]) -> List[int]:
    """
    O(n²) - Find duplicates using nested loops
    For each element, check against all others
    """
    duplicates = []
    for i in range(len(data)):
        for j in range(i + 1, len(data)):
            if data[i] == data[j] and data[i] not in duplicates:
                duplicates.append(data[i])
    return duplicates


# ============================================================================
# O(log n) - LOGARITHMIC TIME
# ============================================================================

def binary_search(data: List[int], target: int) -> int:
    """
    O(log n) - Binary search on sorted list
    Divides search space in half each iteration
    """
    left, right = 0, len(data) - 1
    
    while left <= right:
        mid = (left + right) // 2
        
        if data[mid] == target:
            return mid
        elif data[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    
    return -1


# ============================================================================
# O(n log n) - LINEARITHMIC TIME
# ============================================================================

def merge_sort(data: List[int]) -> List[int]:
    """
    O(n log n) - Merge sort algorithm
    Divides list (log n) and merges (n) at each level
    """
    if len(data) <= 1:
        return data
    
    mid = len(data) // 2
    left = merge_sort(data[:mid])
    right = merge_sort(data[mid:])
    
    return merge(left, right)


def merge(left: List[int], right: List[int]) -> List[int]:
    """Helper function for merge sort"""
    result = []
    i = j = 0
    
    while i < len(left) and j < len(right):
        if left[i] <= right[j]:
            result.append(left[i])
            i += 1
        else:
            result.append(right[j])
            j += 1
    
    result.extend(left[i:])
    result.extend(right[j:])
    return result


# ============================================================================
# PYTHON DATA STRUCTURE OPERATIONS - TIME COMPLEXITY
# ============================================================================

def data_structure_operations():
    """
    Common Python data structure operations and their Big O
    """
    
    # LIST OPERATIONS
    my_list = [1, 2, 3, 4, 5]
    
    # O(1) operations
    my_list[0]           # Access by index
    my_list.append(6)    # Append to end
    my_list.pop()        # Remove from end
    
    # O(n) operations
    my_list.insert(0, 0) # Insert at beginning
    my_list.pop(0)       # Remove from beginning
    3 in my_list         # Search for element
    my_list.remove(3)    # Remove specific element
    
    # DICTIONARY OPERATIONS
    my_dict = {'a': 1, 'b': 2, 'c': 3}
    
    # O(1) operations
    my_dict['a']         # Access by key
    my_dict['d'] = 4     # Insert/update
    del my_dict['d']     # Delete by key
    'a' in my_dict       # Check if key exists
    
    # SET OPERATIONS
    my_set = {1, 2, 3, 4, 5}
    
    # O(1) operations
    my_set.add(6)        # Add element
    my_set.remove(6)     # Remove element
    3 in my_set          # Check membership
    
    # O(n) operations
    len(my_set)          # Get size (actually O(1) in Python)
    
    print("Data structure operations completed!")


# ============================================================================
# PERFORMANCE COMPARISON
# ============================================================================

def compare_search_performance():
    """
    Compare linear vs binary search performance
    """
    # Create sorted list
    data = list(range(1, 100001))
    target = 99999
    
    # Linear search
    start = time.time()
    linear_search(data, target)
    linear_time = time.time() - start
    
    # Binary search
    start = time.time()
    binary_search(data, target)
    binary_time = time.time() - start
    
    print(f"\nSearch Performance (100,000 elements):")
    print(f"Linear Search O(n): {linear_time:.6f} seconds")
    print(f"Binary Search O(log n): {binary_time:.6f} seconds")
    print(f"Binary search is {linear_time/binary_time:.2f}x faster!")


def compare_sort_performance():
    """
    Compare bubble sort vs merge sort performance
    """
    import random
    
    # Create random list
    data = [random.randint(1, 1000) for _ in range(1000)]
    
    # Bubble sort O(n²)
    start = time.time()
    bubble_sort(data)
    bubble_time = time.time() - start
    
    # Merge sort O(n log n)
    start = time.time()
    merge_sort(data)
    merge_time = time.time() - start
    
    # Python's built-in sort O(n log n)
    start = time.time()
    sorted(data)
    builtin_time = time.time() - start
    
    print(f"\nSort Performance (1,000 elements):")
    print(f"Bubble Sort O(n²): {bubble_time:.6f} seconds")
    print(f"Merge Sort O(n log n): {merge_time:.6f} seconds")
    print(f"Python sorted() O(n log n): {builtin_time:.6f} seconds")


# ============================================================================
# MAIN DEMO
# ============================================================================

if __name__ == "__main__":
    print("=" * 60)
    print("BIG O NOTATION EXAMPLES IN PYTHON")
    print("=" * 60)
    
    # Test data
    test_list = [64, 34, 25, 12, 22, 11, 90]
    
    print("\n1. O(1) - Constant Time")
    print(f"   First element: {constant_time_example(test_list)}")
    
    print("\n2. O(n) - Linear Time")
    print(f"   Linear search for 22: index {linear_search(test_list, 22)}")
    print(f"   Sum of list: {sum_list(test_list)}")
    
    print("\n3. O(n²) - Quadratic Time")
    print(f"   Bubble sorted: {bubble_sort(test_list)}")
    
    print("\n4. O(log n) - Logarithmic Time")
    sorted_list = [11, 12, 22, 25, 34, 64, 90]
    print(f"   Binary search for 25: index {binary_search(sorted_list, 25)}")
    
    print("\n5. O(n log n) - Linearithmic Time")
    print(f"   Merge sorted: {merge_sort(test_list)}")
    
    # Performance comparisons
    compare_search_performance()
    compare_sort_performance()
    
    print("\n" + "=" * 60)
    print("SUMMARY OF COMMON TIME COMPLEXITIES")
    print("=" * 60)
    print("O(1)       - Constant     - Dict/Set lookup, list index access")
    print("O(log n)   - Logarithmic  - Binary search")
    print("O(n)       - Linear       - Linear search, iterate list")
    print("O(n log n) - Linearithmic - Merge sort, Python sorted()")
    print("O(n²)      - Quadratic    - Bubble sort, nested loops")
    print("O(2ⁿ)      - Exponential  - Recursive fibonacci (naive)")
    print("=" * 60)
