import requests
import sys
import json

BASE_URL = "http://localhost:5000/api"

def print_menu():
    print("\n--- Vortex System Handler ---")
    print("0. Exit")
    print("1. Create Common Account (User/Creator)")
    print("2. Create Test Account (Bot/Developer)")
    print("3. Bot: Auto-Post")
    print("4. Developer: Manage Badges")
    print("5. View All Posts")

def create_account(role_type):
    print(f"\nCreating {role_type} Account...")
    username = input("Username: ")
    email = input("Email: ")
    password = input("Password: ")
    
    if role_type == "test":
        print("Choose Sub-Role: 1. Bot, 2. Developer")
        choice = input("Choice: ")
        user_type = "Bot" if choice == "1" else "Developer"
        is_bot = (choice == "1")
        is_admin = (choice == "2")
    else:
        print("Choose Role: 1. User, 2. Creator")
        choice = input("Choice: ")
        user_type = "User" if choice == "1" else "Creator"
        is_bot = False
        is_admin = False

    data = {
        "username": username,
        "email": email,
        "password": password,
        "userType": user_type,
        "subType": "Personal",
        "isBot": is_bot,
        "isAdmin": is_admin
    }

    try:
        response = requests.post(f"{BASE_URL}/auth/signup", json=data)
        print(f"Status: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
    except Exception as e:
        print(f"Error: {e}")

def bot_auto_post():
    bot_id = input("Enter Bot User ID: ")
    content = input("Post Content: ")
    data = {"authorId": bot_id, "content": content}
    try:
        response = requests.post(f"{BASE_URL}/posts", json=data)
        print(f"Bot Posted: {response.status_code}")
    except Exception as e:
        print(f"Error: {e}")

def manage_badges():
    dev_id = input("Enter Developer User ID: ")
    target_id = input("Enter Target User ID to modify: ")
    badges_str = input("Enter badges (comma separated, e.g. Staff,Verified,EarlyBird): ")
    badges = [b.strip() for b in badges_str.split(",") if b.strip()]
    
    data = {"devId": dev_id, "badges": badges}
    try:
        response = requests.put(f"{BASE_URL}/users/{target_id}/badges", json=data)
        print(f"Status: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
    except Exception as e:
        print(f"Error: {e}")

def main():
    while True:
        print_menu()
        choice = input("Select an option: ")
        
        if choice == "1":
            create_account("common")
        elif choice == "2":
            create_account("test")
        elif choice == "3":
            bot_auto_post()
        elif choice == "4":
            manage_badges()
        elif choice == "5":
            try:
                r = requests.get(f"{BASE_URL}/posts")
                print(json.dumps(r.json(), indent=2))
            except:
                print("Error fetching posts.")
        elif choice == "0":
            break
        else:
            print("Invalid option.")

if __name__ == "__main__":
    main()
