# InvoiceFlow — Premium Invoice Generator SaaS

A modern, responsive, production-grade SaaS web application built with React, TypeScript, and Tailwind CSS. Designed for freelancers, agencies, consultants, developers, and small businesses to generate compliant commercial invoices, manage clients, track payments, customize 6 original templates, and export vector A4 PDFs in under two minutes.

---

## 🚀 Key Highlights & Capabilities

### 1. Two-Column Live Invoice Generator
- **Split Workspace:** Left editable form synchronized in real time with an authentic A4 paper preview on the right.
- **Dynamic Items:** Fractional quantities, inline rate & discount inputs, reordering up/down, duplicating items, and 1-click insertion from the saved Product/Service Catalog.
- **Sequential Invoicing:** Configurable prefix (`INV-2026-001`), uniqueness enforcement, and automatic sequential incrementing upon saving.

### 2. Rigorous Financial & Tax Calculation Engine
- **Decimal-Safe Arithmetic:** Zero floating-point rounding bugs, standard 2-decimal monetary rounding.
- **Tax Modes:** Full support for both **Tax-Exclusive** (`+ Tax`) and **Tax-Inclusive** (`Extract Tax`) pricing.
- **GST Compliance (India):** Built-in statutory GST mode with automatic 50/50 CGST & SGST splitting for intra-state supplies, or IGST for inter-state supplies, with HSN/SAC codes and amount-in-words spelling.
- **Multi-Level Discounts & Charges:** Item-level discounts (% or fixed), invoice-level discounts, additional shipping/freight charges, and withholding/retention (TDS) calculations.

### 3. 6 Original Invoice Template Styles
1. **Modern Business:** Indigo accents, structured metadata cards, highlighted totals card, and zebra striping.
2. **Minimal Professional:** Ultra-clean Scandinavian minimalism with delicate hairline borders and typography focus.
3. **Elegant Freelancer:** Artisanal warm stone/copper tones, serif headings, and refined client showcase blocks.
4. **Creative Agency:** Bold dark header banner, high contrast visual hierarchy, and Plus Jakarta Sans typography.
5. **Corporate Classic:** Formal dual-column header, structured grid lines, executive terms, and bank remittance instructions.
6. **GST Tax Invoice:** Statutory layout compliant with Section 31 of CGST/SGST Act, state codes, place of supply, reverse charge, and declaration.

### 4. Vector PDF Generation & Clean Browser Print
- **Authentic A4 Format:** Generates vector PDFs scaled to standard A4 dimensions (`210mm × 297mm`) using `html2canvas` and `jsPDF`.
- **Dedicated Print Stylesheet:** `@media print` rules strip away the sidebar, buttons, and navigation, printing the exact invoice document cleanly.

### 5. Client & Catalog Management
- **Clients Directory:** Real-time financial balances (`Total Invoiced`, `Total Paid`, `Outstanding Balance`) calculated directly from invoice records.
- **Protected Deletion:** Clients with historical invoices are safely archived instead of silently cascading deletion.
- **Products & Services Catalog:** Library of reusable deliverables, SKUs, and standard rates with inline override support.

### 6. Payments & Ledger
- Record manual, partial, or full payments with date, payment method, transaction reference, and notes.
- Automatic balance reconciliation and status transitions (`Draft` → `Sent` → `Partially Paid` → `Paid` / `Overdue`).
- Confetti celebration upon full invoice settlement.
- Integrated payment gateway placeholder for Stripe / Razorpay checkout.

### 7. Quotes & Estimates
- Create proposals and estimates using the same calculation engine.
- One-click **Convert to Invoice** that preserves all line items, clients, and pricing while generating a new unique invoice number and preventing duplicate conversion.

---

## 🛠 Tech Stack

- **Framework:** React 18 with TypeScript
- **Bundler:** Vite 5
- **Styling:** Tailwind CSS with custom SaaS design tokens
- **Icons:** Lucide Icons
- **Charts:** Recharts
- **PDF Generation:** jsPDF & html2canvas
- **Date Management:** date-fns
- **Persistence:** High-reliability LocalStorage service pre-seeded with rich demo records

---

## 💻 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm run dev
```

### 3. Run Test Suite
```bash
npm test
```

### 4. Build for Production
```bash
npm run build
```
