# Fix Git History - Remove Secrets

The secret is still in your git history. You have two options:

## Option 1: Use GitHub's Bypass (QUICKEST)

GitHub provided a link to allow the secret temporarily:
https://github.com/Kenikool/Earn9ja/security/secret-scanning/unblock-secret/36BPgiuFZzIA55OiQBsA8oSsM55

1. Click the link above
2. Follow GitHub's instructions to bypass the protection
3. Push again: `git push -u origin main`
4. **IMMEDIATELY** rotate your Firebase credentials after pushing

## Option 2: Rewrite Git History (RECOMMENDED for security)

This completely removes the secret from all commits:

```bash
# Install git-filter-repo if you don't have it
# Download from: https://github.com/newren/git-filter-repo

# Or use BFG Repo-Cleaner (easier)
# Download from: https://rtyley.github.io/bfg-repo-cleaner/

# Using BFG (recommended):
# 1. Download bfg.jar
# 2. Run this command:
java -jar bfg.jar --delete-files earn9ja-21ae7-firebase-adminsdk-fbsvc-2e0945804a.json

# 3. Clean up
git reflog expire --expire=now --all
git gc --prune=now --aggressive

# 4. Force push
git push --force origin main
```

## Option 3: Start Fresh (NUCLEAR OPTION)

If the above doesn't work, create a new repository:

```bash
# 1. Backup your current code
cp -r . ../Earn9ja-backup

# 2. Delete .git folder
rm -rf .git

# 3. Initialize new repo
git init
git add .
git commit -m "Initial commit with security fixes"

# 4. Create new GitHub repo and push
git remote add origin https://github.com/Kenikool/Earn9ja-New.git
git push -u origin main
```

## After Any Option - ROTATE CREDENTIALS

1. Go to https://console.firebase.google.com/
2. Select "earn9ja-21ae7" project
3. Go to Project Settings → Service Accounts
4. Click "Generate New Private Key"
5. Download new JSON
6. Replace local files (they're gitignored now)
7. Delete the old service account key

## Recommended: Use Option 1 Now, Then Rotate

For speed:

1. Use the GitHub bypass link
2. Push successfully
3. Immediately rotate Firebase credentials
4. The old credentials in history become useless

This is the fastest path forward!
