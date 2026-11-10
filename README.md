# Money

A calm, responsive personal finance tracker built with HTML, CSS and JavaScript. Track income, expenses, balances and spending patterns with thoughtfully designed light, dark and system themes.

## Features

- Dashboard with balance, monthly income, expenses and net savings
- Add, edit and delete income and expense transactions
- Search and filter by month, type and category
- Monthly cash-flow chart and spending-category breakdown
- Personal profile
- CSV export and full JSON backup / restore
- Import transaction CSV files exported by the original MyFinance app
- Light, dark and system appearance modes
- Responsive layout for phones, tablets and desktops
- Local-first storage using browser localStorage; no account or server required

## Run locally

Open `index.html` in a modern browser, or serve this folder with any static file server.

## Publish with GitHub Pages

1. Open the repository's **Settings**.
2. Select **Pages**.
3. Under **Build and deployment**, choose **Deploy from a branch**.
4. Select **main** and **/(root)**, then save.
5. Wait for GitHub Pages to publish the site.

## Moving data from MyFinance

The original MyFinance app and this redesigned app are separate websites. Browser localStorage is isolated by website origin, so records do not appear automatically in the new app.

1. Open the original MyFinance website.
2. Go to **Settings → Export Transactions** and download the CSV.
3. Open Money and go to **Settings → Backup your data → Import backup**.
4. Select the CSV file and confirm the import.

Money also supports JSON backups created by this app. Import replaces the current transaction list, so download a backup first if you want to keep a copy.

## Privacy and storage

Your records are stored in this browser on this device. Clearing browser site data or changing browsers/devices can remove access to those records. Use the JSON backup regularly to keep a portable copy. This project does not sync data to a cloud account.

## Categories

Expenses: Food & Dining, Transportation, Shopping, Education, Bills & Utilities, Health, Entertainment, Other.

Income: Salary, Freelance, Pocket Money, Investment, Gift, Other Income.
