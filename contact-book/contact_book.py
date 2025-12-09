"""
Contact Book Application
Demonstrates Big O notation with practical examples
"""


class Contact:
    """Represents a single contact"""
    
    def __init__(self, name, phone, email=""):
        self.name = name
        self.phone = phone
        self.email = email
    
    def __str__(self):
        return f"{self.name} - {self.phone}" + (f" ({self.email})" if self.email else "")
    
    def __repr__(self):
        return f"Contact('{self.name}', '{self.phone}', '{self.email}')"


class ContactBook:
    """
    Contact management system demonstrating different Big O complexities
    """
    
    def __init__(self):
        self.contacts_list = []  # For O(n) operations
        self.contacts_dict = {}  # For O(1) operations
    
    def add_contact(self, name, phone, email=""):
        """
        Add a contact - O(1)
        Uses both list and dictionary for different search methods
        """
        contact = Contact(name, phone, email)
        self.contacts_list.append(contact)  # O(1)
        self.contacts_dict[name.lower()] = contact  # O(1)
        print(f"✓ Added: {contact}")
    
    def search_by_name_linear(self, name):
        """
        Linear search - O(n)
        Searches through entire list
        """
        name_lower = name.lower()
        for contact in self.contacts_list:
            if contact.name.lower() == name_lower:
                return contact
        return None
    
    def search_by_name_hash(self, name):
        """
        Hash table lookup - O(1)
        Direct access using dictionary
        """
        return self.contacts_dict.get(name.lower())
    
    def search_by_phone(self, phone):
        """
        Search by phone - O(n)
        Must check each contact
        """
        for contact in self.contacts_list:
            if contact.phone == phone:
                return contact
        return None
    
    def get_all_sorted(self):
        """
        Get sorted contacts - O(n log n)
        Python's sort uses Timsort algorithm
        """
        return sorted(self.contacts_list, key=lambda c: c.name.lower())
    
    def find_duplicates(self):
        """
        Find duplicate phone numbers - O(n)
        Uses set for efficient duplicate detection
        """
        seen = set()
        duplicates = []
        
        for contact in self.contacts_list:
            if contact.phone in seen:
                duplicates.append(contact)
            else:
                seen.add(contact.phone)
        
        return duplicates
    
    def display_all(self):
        """Display all contacts"""
        if not self.contacts_list:
            print("No contacts found.")
            return
        
        print(f"\n{'='*50}")
        print(f"Total Contacts: {len(self.contacts_list)}")
        print(f"{'='*50}")
        for i, contact in enumerate(self.get_all_sorted(), 1):
            print(f"{i}. {contact}")
        print(f"{'='*50}\n")
    
    def delete_contact(self, name):
        """
        Delete a contact - O(n) for list, O(1) for dict
        """
        name_lower = name.lower()
        
        # Remove from dictionary - O(1)
        if name_lower in self.contacts_dict:
            contact = self.contacts_dict.pop(name_lower)
            
            # Remove from list - O(n)
            self.contacts_list.remove(contact)
            print(f"✓ Deleted: {contact}")
            return True
        
        print(f"✗ Contact '{name}' not found")
        return False


def demo():
    """Demonstrate the contact book with Big O examples"""
    
    print("=" * 60)
    print("CONTACT BOOK - BIG O DEMONSTRATION")
    print("=" * 60)
    
    # Create contact book
    book = ContactBook()
    
    # Add contacts - O(1) each
    print("\n1. Adding Contacts (O(1) per contact)")
    print("-" * 60)
    book.add_contact("Alice Johnson", "08012345678", "alice@email.com")
    book.add_contact("Bob Smith", "08098765432", "bob@email.com")
    book.add_contact("Charlie Brown", "07011111111")
    book.add_contact("Diana Prince", "08022222222", "diana@email.com")
    book.add_contact("Eve Adams", "09033333333")
    
    # Display all
    book.display_all()
    
    # Linear search - O(n)
    print("\n2. Linear Search (O(n))")
    print("-" * 60)
    result = book.search_by_name_linear("Bob Smith")
    print(f"Found: {result}")
    
    # Hash search - O(1)
    print("\n3. Hash Table Search (O(1))")
    print("-" * 60)
    result = book.search_by_name_hash("Bob Smith")
    print(f"Found: {result}")
    
    # Search by phone - O(n)
    print("\n4. Search by Phone (O(n))")
    print("-" * 60)
    result = book.search_by_phone("08012345678")
    print(f"Found: {result}")
    
    # Add duplicate for testing
    book.add_contact("Frank Miller", "08012345678")  # Duplicate phone
    
    # Find duplicates - O(n)
    print("\n5. Find Duplicates (O(n))")
    print("-" * 60)
    duplicates = book.find_duplicates()
    if duplicates:
        print("Duplicate phone numbers found:")
        for contact in duplicates:
            print(f"  - {contact}")
    else:
        print("No duplicates found")
    
    # Delete contact
    print("\n6. Delete Contact")
    print("-" * 60)
    book.delete_contact("Frank Miller")
    
    # Final display
    book.display_all()
    
    print("\n" + "=" * 60)
    print("BIG O SUMMARY")
    print("=" * 60)
    print("Add Contact:           O(1) - Constant time")
    print("Hash Search (name):    O(1) - Instant lookup")
    print("Linear Search:         O(n) - Check each contact")
    print("Search by Phone:       O(n) - Check each contact")
    print("Sort Contacts:         O(n log n) - Efficient sorting")
    print("Find Duplicates:       O(n) - Single pass with set")
    print("=" * 60)


if __name__ == "__main__":
    demo()
