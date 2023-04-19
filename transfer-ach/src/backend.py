# Imports ======================================================================
import datetime
import json
import os
import pandas as pd
import random

# Global Variables =============================================================
# ROOT_DIR = "/content/drive/MyDrive/Classes/CSCE 5552 Cybersecurity Essentials/"
ROOT_DIR = ""
MAKE_TABLES = False
ACCOUNTS_TABLE_DIR = ROOT_DIR + "accounts.csv"
TRANSACTIONS_TABLE_DIR = ROOT_DIR + "transactions.csv"
SESSION_KEYS_TABLE_DIR = ROOT_DIR + "sessions.csv"

# Database Handling ============================================================

# Create data if it doesn't exist ----------------------------------------------

# Accounts table
if not os.path.exists(ACCOUNTS_TABLE_DIR) and MAKE_TABLES:
    df = []
    for i in range(20):
        df.append([i, 
                   "user%d"%i, 
                   "password%d"%i, 
                   "hash%d"%i, 
                   "fname%d"%i, 
                   "lname%d"%i, 
                   "address%d"%i, 
                   "city%d"%i, 
                   "ST", 
                   10000 + i, 
                   100000000 + i, 
                   "eamil@end%d.tag"%i, 
                   "bankname%d"%i, 
                   100000000 + i, 
                   10000000000000000000 + i, 
                   random.randrange(1, 1000000000) / 100.0
                   ])
    cols = ["user_id", "username", "password", "security_hash", "first_name", "last_name", 
            "address", "city", "state", "zip_code", "phone_number", "email", "bank_name", 
            "bank_routing_number", "bank_account_number", "bank_account_balance"
            ]
    df = pd.DataFrame(df, columns=cols)
    df.set_index("user_id", drop=True, inplace=True)
    df.to_csv(ACCOUNTS_TABLE_DIR, header=True, index=True)

# Transactions table
if not os.path.exists(TRANSACTIONS_TABLE_DIR) and MAKE_TABLES:
    df = []
    for i in range(100):
        random_datetime = datetime.datetime(year=random.randrange(2000, 2024), 
                                            month=random.randrange(1, 12), 
                                            day=random.randrange(1, 27), 
                                            hour=random.randrange(0, 23), 
                                            minute=random.randrange(0, 58), 
                                            second=random.randrange(0, 58)
                                            )
        df.append([i,
                   random.randrange(0, 20), 
                   random.randrange(0, 20), 
                   random_datetime.strftime("%Y-%m-%d %H:%M:%S"), 
                   random.randrange(1, 1000000000) / 100.0
                   ])
    cols = ["transaction_id", "to_user_id", "from_user_id", "date_time", "ammount"]
    df = pd.DataFrame(df, columns=cols)
    df.set_index("transaction_id", drop=True, inplace=True)
    df.to_csv(TRANSACTIONS_TABLE_DIR, header=True, index=True)

# Session keys table
if not os.path.exists(SESSION_KEYS_TABLE_DIR) and MAKE_TABLES:
    df = []
    for i in range(20):
        random_datetime = datetime.datetime(year=random.randrange(2000, 2024), 
                                            month=random.randrange(1, 12), 
                                            day=random.randrange(1, 27), 
                                            hour=random.randrange(0, 23), 
                                            minute=random.randrange(0, 58), 
                                            second=random.randrange(0, 58)
                                            )
        df.append([i, 
                   "userid%d"%random.randrange(0, 20), 
                   "hash%d"%i, 
                   random_datetime.strftime("%Y-%m-%d %H:%M:%S")
                   ])
    cols = ["session_key_id", "user_id", "hash", "date_time_created"]
    df = pd.DataFrame(df, columns=cols)
    df.set_index("session_key_id", drop=True, inplace=True)
    df.to_csv(SESSION_KEYS_TABLE_DIR, header=True, index=True)

# Query functions --------------------------------------------------------------

# Get account balance
def getAccountBalance():
    df = pd.read_csv(ACCOUNTS_TABLE_DIR, index_col="user_id")
    return df["bank_account_balance"].iloc[0]

# Check if an account exists
def checkAccountExists(user_id):
    df = pd.read_csv(ACCOUNTS_TABLE_DIR, index_col="user_id")
    if user_id in list(df.index):
        return True
    else:
        return False

# Update account ammount
def updateAccountBalance(user_id, new_balance):
    df = pd.read_csv(ACCOUNTS_TABLE_DIR, index_col="user_id")
    df.at[user_id, "bank_account_balance"] = new_balance
    df.to_csv(ACCOUNTS_TABLE_DIR, header=True, index=True)



# Security =====================================================================

# 2-factor authentication for login
def twoFactorLogin():
    return True

# 2-factor authentication for transfer
def twoFactorTransfer(ammount):
    return True

# Login Page ===================================================================

def verifyUsernamePassword(username, password):
    df = pd.read_csv(ACCOUNTS_TABLE_DIR, index_col="user_id")
    df = df.loc[(df["username"] == username) & (df["password"] == password)]
    if df.shape[0] == 1 and df.index[0] == 0:
        return True
    else:
        return False

# Login
def login(username, password):
    user_id = verifyUsernamePassword(username, password)
    if user_id != False:
        authenticated = twoFactorLogin()
        # if authenticated:
        #     load_dashboard()
        # else:
        #     load_login()

# Dashboard Page ===============================================================

# Get all transfers for an account
def getTransfers(user_id):
    df = pd.read_csv(TRANSACTIONS_TABLE_DIR, index_col="transaction_id")
    df = df.loc[(df["to_user_id"] == user_id) | (df["from_user_id"] == user_id)]
    json_dict = {}
    c = 0
    dir = None
    if 
    for i, row in df.iterrows():
        if to_user_id == 0:
            dir = 
        json_dict.update({c: 
                          {"to_user_id": row["to_user_id"], 
                           "from_user_id": row["from_user_id"], 
                           "date_time": row["date_time"], 
                           "ammount": row["ammount"]
                           }
                          })
        c += 1

    json_dict = json.dumps(json_dict)
    return json_dict

# Transfer button
def transfer(to_user_id, from_user_id, ammount):

    # Check that recipient exists
    if checkAccountExists(to_user_id) and checkAccountExists(from_user_id) and to_user_id != from_user_id:

        # Check that ammount >= from_user's balance
        from_bal = getAccountBalance(from_user_id)
        from_bal -= ammount
        if from_bal >= 0:
            
            # 2-factor to approve transfer
            if twoFactorTransfer(to_user_id, ammount):

                # Transfer money
                to_bal = get_account_balance(to_user_id)
                to_bal += ammount
                updateAccountBalance(to_user_id, to_bal)
                updateAccountBalance(from_user_id, from_bal)

                # Check that transaction went through
                if to_bal == getAccount_balance(to_user_id) and from_bal == get_account_balance(from_user_id):

                    # Update dashboard page via get_transfers()
                    return getTransfers(from_user_id)
    
    # Return false if any condition fails
    return False

# Logout button
def logout():

    # Go to login page

    # Close session

    return False