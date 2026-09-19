# 🕌 SBA Fund Manager

**Interest-Free Community Fund Management System**

A production-ready web application for managing a community mutual support fund — member registration, monthly contributions, interest-free loans, EMI tracking, and transparent fund management.

🔗 **Live App:** https://sba-fund-manager.vercel.app/

---

## ✨ Features

- 🔐 **Role-based access** — Super Admin, Admin, Member
- 👥 **Member registration** with admin approval workflow
- 💰 **Monthly contribution tracking** (₹500/month)
- 🧾 **Digital receipts** with auto-generated receipt numbers
- 📊 **Live fund dashboard** — real-time balances and statistics
- 💵 **Interest-free loans** — with 10% reserve enforcement
- 📅 **EMI tracking** — flexible schedules, no interest
- 🔍 **Member directory** — searchable, filterable
- 📱 **Mobile-responsive** — works on phone, tablet, desktop

## 🏦 Fund Rules

| Rule | Value |
|------|-------|
| Monthly contribution | ₹500 per member |
| Collection window | 1st–10th of every month |
| Loan lock-in | 1 year minimum |
| Reserve requirement | 10% always retained |
| Interest | **0%** (Shariah-compliant) |
| Loans available to | Members only |

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 (App Router) |
| Styling | Custom CSS design system |
| Database | PostgreSQL (Supabase) |
| Auth | Custom JWT + bcrypt |
| Hosting | Vercel |
| Backend Logic | Next.js API Routes |

## 📊 Database Schema

- **members** — user accounts with roles (super_admin, admin, member)
- **contributions** — monthly ₹500 collections
- **loans** — interest-free loans with EMI schedules
- **emi_payments** — repayment tracking
- **audit_log** — action tracking for accountability
- **fund_summary** — live view of total fund, loans, EMI received

## 🚀 How It Works

1. **Member registers** through the app (mobile + password)
2. **Admin approves** the registration
3. **Member pays ₹500** monthly contribution
4. **Admin records** the payment → digital receipt generated
5. **After 1 year**, members in need can request **interest-free loans**
6. **Admin disburses** the loan (always keeping 10% reserve)
7. **Member repays** through flexible EMIs (no interest)
8. **Everyone sees** the live fund status — full transparency

## 👤 User Roles

| Role | Capabilities |
|------|-------------|
| **Super Admin** | Full system control |
| **Admin** | Collect payments, give loans, manage members |
| **Member** | View own account + fund status (read-only) |

## 📈 Live Stats

The app automatically calculates and displays:
- Total fund balance
- Total contributions collected
- Loans currently outstanding
- Total EMI received
- Active member count
- Pending registrations

## 🔗 Links

- **Live Demo:** https://sba-fund-manager.vercel.app/
- **GitHub Repo:** https://github.com/shaikh-aleem/sba-fund-manager

## 👨‍💻 Author

**Shaikh Aleem** — Founder & Developer

## 📝 License

Built for community use. Contact author for licensing.

---

⭐ **Star this repo if you find it useful!**