import type { KhataCustomer, KhataTransaction } from '../types';

export const INITIAL_KHATA_CUSTOMERS: KhataCustomer[] = [
  {
    id: 'khata-cust-01',
    customerName: 'Haji Rasheed',
    urduName: 'حاجی رشید کریانہ اسٹور',
    shopName: 'Rasheed Kiryana & General Store',
    phone: '0300-7654321',
    address: 'Shop #14, Mandi Stop, Sheikhupura Road',
    creditLimit: 100000,
    totalDebit: 14500,
    totalCredit: 9000,
    currentBalance: 5500,
    status: 'ACTIVE',
    createdAt: '15 Oct 2024',
    lastTransactionDate: '28 Oct 2024',
    notes: 'Regular mandi wholesale buyer. Pays weekly.'
  },
  {
    id: 'khata-cust-02',
    customerName: 'Muhammad Tariq',
    urduName: 'مدینہ ہوٹل باورچی خانہ',
    shopName: 'Madina Hotel & Catering',
    phone: '0321-4455667',
    address: 'Meezan Chowk, Main Bazaar',
    creditLimit: 150000,
    totalDebit: 35000,
    totalCredit: 35000,
    currentBalance: 0,
    status: 'SETTLED',
    createdAt: '10 Oct 2024',
    lastTransactionDate: '22 Oct 2024',
    notes: 'Hotel catering bulk supply. Fully cleared account.'
  },
  {
    id: 'khata-cust-03',
    customerName: 'Ustad Aslam',
    urduName: 'بسم اللہ بریانی سینٹر',
    shopName: 'Bismillah Biryani & Pulao Centre',
    phone: '0302-8899112',
    address: 'Circular Road, Near Mandi Gate #2',
    creditLimit: 80000,
    totalDebit: 18500,
    totalCredit: 10000,
    currentBalance: 8500,
    status: 'ACTIVE',
    createdAt: '12 Oct 2024',
    lastTransactionDate: '25 Oct 2024',
    notes: 'Daily biryani rice order. Partial payments.'
  },
  {
    id: 'khata-cust-04',
    customerName: 'Chaudhry Tariq Gujjar',
    urduName: 'چوہدری طارق گجر دکان دار',
    shopName: 'Gujjar Traders Mandi Gali',
    phone: '0333-5566778',
    address: 'Gali #3, Grain Market Mandi',
    creditLimit: 200000,
    totalDebit: 12400,
    totalCredit: 0,
    currentBalance: 12400,
    status: 'ACTIVE',
    createdAt: '02 Nov 2024',
    lastTransactionDate: '02 Nov 2024',
    notes: 'Wholesale lot buyer.'
  }
];

export const INITIAL_KHATA_TRANSACTIONS: KhataTransaction[] = [
  // Transactions for Haji Rasheed (Matches User Example!)
  {
    id: 'tx-001',
    customerId: 'khata-cust-01',
    dateStr: '20 Oct 2024',
    timeStr: '11:15 PKT',
    timestamp: 1729408500000,
    type: 'PURCHASE',
    description: 'Credit Purchase (چاول و دال خریداری): 2x Super Basmati 50kg, 10kg Daal Chana',
    items: [
      {
        productName: 'Super Basmati Old',
        urduName: 'سوپر باسمتی پرانا',
        quantity: 20,
        unit: 'kg',
        rate: 380,
        subtotal: 7600
      },
      {
        productName: 'Daal Chana Special',
        urduName: 'دال چنا سپیشل',
        quantity: 8,
        unit: 'kg',
        rate: 300,
        subtotal: 2400
      }
    ],
    debit: 10000,
    credit: 0,
    balanceAfter: 10000,
    referenceNo: 'INV-88102',
    notes: 'Brought by shop boy Asif'
  },
  {
    id: 'tx-002',
    customerId: 'khata-cust-01',
    dateStr: '24 Oct 2024',
    timeStr: '16:30 PKT',
    timestamp: 1729769400000,
    type: 'PAYMENT',
    description: 'Cash Payment Received (نقد وصولی): Rs. 9,000 paid against previous 10,000 bill',
    debit: 0,
    credit: 9000,
    balanceAfter: 1000,
    paymentMode: 'CASH',
    referenceNo: 'RCPT-501',
    notes: 'Haji Rasheed paid cash in person at counter. Remaining 1,000 promised next Monday.'
  },
  {
    id: 'tx-003',
    customerId: 'khata-cust-01',
    dateStr: '28 Oct 2024',
    timeStr: '14:20 PKT',
    timestamp: 1730107200000,
    type: 'PURCHASE',
    description: 'Credit Purchase (چاول ادھار خریداری): 10kg Basmati Super Sella + Spices',
    items: [
      {
        productName: 'Basmati Super Sella',
        urduName: 'باسمتی سوپر سیلا',
        quantity: 10,
        unit: 'kg',
        rate: 360,
        subtotal: 3600
      },
      {
        productName: 'Sabut Zeera Safaid',
        urduName: 'سفید زیرہ',
        quantity: 0.5,
        unit: 'kg',
        rate: 1800,
        subtotal: 900
      }
    ],
    debit: 4500,
    credit: 0,
    balanceAfter: 5500,
    referenceNo: 'INV-88195',
    notes: 'Added to existing balance (1,000 + 4,500 = 5,500)'
  },

  // Transactions for Madina Hotel
  {
    id: 'tx-004',
    customerId: 'khata-cust-02',
    dateStr: '15 Oct 2024',
    timeStr: '10:00 PKT',
    timestamp: 1728975600000,
    type: 'PURCHASE',
    description: 'Bulk Kitchen Rice Supply: 2x 50kg Bags Kainat 1121 Steam',
    debit: 35000,
    credit: 0,
    balanceAfter: 35000,
    referenceNo: 'INV-87950',
    notes: 'Delivered to hotel kitchen'
  },
  {
    id: 'tx-005',
    customerId: 'khata-cust-02',
    dateStr: '22 Oct 2024',
    timeStr: '18:15 PKT',
    timestamp: 1729605300000,
    type: 'PAYMENT',
    description: 'Full Balance Settlement (مکمل کھاتہ کلیئرنس بذریعہ راست آن لائن)',
    debit: 0,
    credit: 35000,
    balanceAfter: 0,
    paymentMode: 'RAAST',
    referenceNo: 'RAAST-TRX-994821',
    notes: 'Paid via Raast online. Khata account cleared and settled (0 Balance).'
  },

  // Transactions for Bismillah Biryani
  {
    id: 'tx-006',
    customerId: 'khata-cust-03',
    dateStr: '18 Oct 2024',
    timeStr: '12:00 PKT',
    timestamp: 1729234800000,
    type: 'PURCHASE',
    description: 'Biryani Rice Lot: 1x 50kg Super Bori Wholesale (PKR 18,500)',
    debit: 18500,
    credit: 0,
    balanceAfter: 18500,
    referenceNo: 'INV-88040',
    notes: 'Daily catering rice order'
  },
  {
    id: 'tx-007',
    customerId: 'khata-cust-03',
    dateStr: '25 Oct 2024',
    timeStr: '17:40 PKT',
    timestamp: 1729860000000,
    type: 'PAYMENT',
    description: 'Partial Cash Payment (جزوی ادائیگی وصولی)',
    debit: 0,
    credit: 10000,
    balanceAfter: 8500,
    paymentMode: 'CASH',
    referenceNo: 'RCPT-582',
    notes: 'Rs. 10,000 cash paid. Remaining balance: PKR 8,500.'
  },

  // Transactions for Chaudhry Tariq Gujjar
  {
    id: 'tx-008',
    customerId: 'khata-cust-04',
    dateStr: '02 Nov 2024',
    timeStr: '15:10 PKT',
    timestamp: 1730538600000,
    type: 'PURCHASE',
    description: 'Initial Lot Dispatch: Kainat Steam (30kg) + Dalda Oil 5L',
    debit: 12400,
    credit: 0,
    balanceAfter: 12400,
    referenceNo: 'INV-88310',
    notes: 'Fresh wholesale account opening purchase'
  }
];
