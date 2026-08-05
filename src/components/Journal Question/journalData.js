// journalData.js
// Source data for the "Rectification of Errors" journal exercise.
// Each transaction is a one-sided error. The learner must decide which
// side (Debit / Credit) each of the two affected accounts belongs on.
// `correct` is the key the UI checks answers against.

export const transactions = [
  {
    id: "t1",
    text: "Goods Sold To Ashok Rs.75 Were Omitted To Be Entered In His Account.",
    amount: 75,
    accounts: [
      {
        name: "Ashok A/C",
        correct: "debit",
        hint: "Ashok bought goods on credit, so he now owes the business more. The side that increases what he owes is the one to pick.",
      },
      {
        name: "Suspense A/C",
        correct: "credit",
        hint: "Suspense A/C always squares up the difference — it takes the opposite side of the personal account above.",
      },
    ],
  },
  {
    id: "t2",
    text: "Goods Returned From Ramesh Rs.650 Were Not Posted To His Account.",
    amount: 650,
    accounts: [
      {
        name: "Ramesh A/C",
        correct: "credit",
        hint: "Ramesh sent goods back, so he owes less now. The side that reduces his balance is the one to pick.",
      },
      {
        name: "Suspense A/C",
        correct: "debit",
        hint: "Suspense A/C takes the opposite side of Ramesh's account to balance the books.",
      },
    ],
  },
  {
    id: "t3",
    text: "Cash Discount Allowed To Amar Rs.225 Entered In Cash Book But Not Posted To His Personal Account.",
    amount: 225,
    accounts: [
      {
        name: "Amar A/C",
        correct: "credit",
        hint: "Discount allowed lowers the amount Amar owes. The side that decreases his balance is the one to pick.",
      },
      {
        name: "Suspense A/C",
        correct: "debit",
        hint: "Suspense A/C takes the opposite side of Amar's account.",
      },
    ],
  },
  {
    id: "t4",
    text: "Discount Received Rs.150 Entered In Cash Book But Not Entered In Discount Book.",
    amount: 150,
    accounts: [
      {
        name: "Discount Received A/C",
        correct: "credit",
        hint: "Discount received is income for the business. The side that increases an income account is the one to pick.",
      },
      {
        name: "Suspense A/C",
        correct: "debit",
        hint: "Suspense A/C takes the opposite side of the Discount Received A/C.",
      },
    ],
  },
];

// Builds the printable journal-entry lines for a fully-solved transaction.
export function buildJournalLines(transaction) {
  const debitAcc = transaction.accounts.find((a) => a.correct === "debit");
  const creditAcc = transaction.accounts.find((a) => a.correct === "credit");
  return {
    id: transaction.id,
    debitLine: `${debitAcc.name} ......................... Dr`,
    creditLine: `To ${creditAcc.name}`,
    narration: `(Being ${transaction.text})`,
    amount: transaction.amount,
  };
}
