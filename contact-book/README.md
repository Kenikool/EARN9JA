# Contact Book - Big O Demonstration

A simple contact management system that demonstrates different Big O time complexities in action.

## Features

- Add contacts (O(1))
- Search by name using hash table (O(1))
- Search by name using linear search (O(n))
- Search by phone number (O(n))
- Sort contacts alphabetically (O(n log n))
- Find duplicate phone numbers (O(n))
- Delete contacts

## Project Structure

```
contact-book/
├── contact_book.py    # Main application
├── README.md          # This file
└── run.bat           # Windows runner script
```

## How to Run

```bash
python contact_book.py
```

Or on Windows, double-click `run.bat`

## Big O Complexities Demonstrated

### O(1) - Constant Time

- **Add Contact**: Appending to list and adding to dictionary
- **Hash Search**: Looking up contact by name using dictionary

### O(n) - Linear Time

- **Linear Search**: Searching through all contacts
- **Search by Phone**: Must check each contact
- **Find Duplicates**: Single pass through contacts

### O(n log n) - Linearithmic Time

- **Sort Contacts**: Alphabetical sorting using Python's Timsort

## Learning Points

1. **Hash Tables are Fast**: Dictionary lookup is O(1) vs O(n) for list search
2. **Trade-offs**: We use both list and dict - more memory but faster searches
3. **When to Use What**:
   - Use hash tables when you need fast lookups by key
   - Use lists when you need to maintain order or search by non-key fields
   - Use sorting when you need ordered display

## Extending the Project

Try adding:

- Binary search for sorted list (O(log n))
- Export contacts to file
- Import contacts from CSV
- Search with partial name matching
- Group contacts by first letter
