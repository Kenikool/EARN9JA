# Install jsPDF for PDF Export

To enable PDF export functionality in the Analytics page, you need to install the required packages.

## Installation Steps

Run this command in PowerShell as Administrator or in a terminal with execution policy enabled:

```bash
cd client
npm install jspdf jspdf-autotable
```

## If you get execution policy error:

1. Open PowerShell as Administrator
2. Run: `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser`
3. Then run the npm install command again

## Alternative:

Use Command Prompt (cmd) instead of PowerShell:
```cmd
cd client
npm install jspdf jspdf-autotable
```

After installation, the PDF export button will work properly in the Analytics page.
