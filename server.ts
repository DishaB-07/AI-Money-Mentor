import express from "express";
import cors from "cors";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// --- MATH ENGINE ---

function calculateTax(income: number, sec80c: number, sec80d: number, hraExemption: number) {
  const stdDeduction = 50000;
  
  // --- OLD REGIME ---
  const oldTaxable = Math.max(0, income - stdDeduction - sec80c - sec80d - hraExemption);
  let oldTax = 0;
  if (oldTaxable > 250000) oldTax += (Math.min(oldTaxable, 500000) - 250000) * 0.05;
  if (oldTaxable > 500000) oldTax += (Math.min(oldTaxable, 1000000) - 500000) * 0.20;
  if (oldTaxable > 1000000) oldTax += (oldTaxable - 1000000) * 0.30;
  if (oldTaxable <= 500000) oldTax = 0; // 87A
  oldTax = oldTax * 1.04; // 4% Cess

  // --- NEW REGIME ---
  const newTaxable = Math.max(0, income - stdDeduction);
  let newTax = 0;
  if (newTaxable > 300000) newTax += (Math.min(newTaxable, 600000) - 300000) * 0.05;
  if (newTaxable > 600000) newTax += (Math.min(newTaxable, 900000) - 600000) * 0.10;
  if (newTaxable > 900000) newTax += (Math.min(newTaxable, 1200000) - 900000) * 0.15;
  if (newTaxable > 1200000) newTax += (Math.min(newTaxable, 1500000) - 1200000) * 0.20;
  if (newTaxable > 1500000) newTax += (newTaxable - 1500000) * 0.30;
  if (newTaxable <= 700000) newTax = 0; // 87A
  newTax = newTax * 1.04;

  return {
    old_regime_tax: Math.round(oldTax),
    new_regime_tax: Math.round(newTax),
    recommended: newTax <= oldTax ? "New Regime" : "Old Regime",
    savings: Math.round(Math.abs(oldTax - newTax))
  };
}

function calculateFire(monthlyExpenses: number, inflationRate: number, yearsToRetire: number, currentSavings: number) {
  const futureMonthlyExpenses = monthlyExpenses * Math.pow((1 + inflationRate/100), yearsToRetire);
  const annualFutureExpenses = futureMonthlyExpenses * 12;
  const fireCorpus = annualFutureExpenses * 25; // 4% withdrawal rate
  
  const r = 0.12 / 12;
  const n = yearsToRetire * 12;
  const futureValueExisting = currentSavings * Math.pow((1 + 0.12), yearsToRetire);
  const shortfall = Math.max(0, fireCorpus - futureValueExisting);
  
  const requiredSip = shortfall > 0 ? (shortfall * r) / (Math.pow((1 + r), n) - 1) : 0;
  
  return {
    fire_corpus: Math.round(fireCorpus),
    future_monthly_expenses: Math.round(futureMonthlyExpenses),
    required_sip: Math.round(requiredSip),
    shortfall: Math.round(shortfall)
  };
}

function computeHealthScore(savings: number, debt: number, emi: number, income: number, insurance: number) {
  let score = 100;
  const deductions: string[] = [];
  
  const emergencyRatio = savings / Math.max(1, (income - emi));
  if (emergencyRatio < 3) {
    score -= 20;
    deductions.push("Emergency fund < 3 months");
  }
    
  const debtIncomeRatio = emi / Math.max(1, income);
  if (debtIncomeRatio > 0.4) {
    score -= 25;
    deductions.push("EMI is over 40% of income");
  }
    
  if (insurance < (income * 10)) {
    score -= 15;
    deductions.push("Life cover < 10x annual income");
  }

  const grade = score >= 90 ? "A+" : score >= 70 ? "B" : score >= 50 ? "C" : "D";
  return { score: Math.max(0, score), grade, issues: deductions };
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // API routes
  app.post("/api/tax-wizard", async (req, res) => {
    const { income, sec80c, sec80d, hraExemption } = req.body;
    const calcResult = calculateTax(income, sec80c, sec80d, hraExemption);
    res.json({ calculations: calcResult });
  });

  app.post("/api/fire-plan", async (req, res) => {
    const { monthlyExpenses, inflationRate, yearsToRetire, currentSavings } = req.body;
    const calcResult = calculateFire(monthlyExpenses, inflationRate, yearsToRetire, currentSavings);
    res.json({ calculations: calcResult });
  });

  app.post("/api/health-score", async (req, res) => {
    const { savings, debt, emi, income, insurance } = req.body;
    const calcResult = computeHealthScore(savings, debt, emi, income, insurance);
    res.json({ calculations: calcResult });
  });

  app.post("/api/couple-planner", async (req, res) => {
    const { partner1, partner2 } = req.body;
    
    const p1Tax = calculateTax(partner1.income, partner1.sec80c, partner1.sec80d, partner1.hraExemption);
    const p2Tax = calculateTax(partner2.income, partner2.sec80c, partner2.sec80d, partner2.hraExemption);
    
    const combinedIncome = partner1.income + partner2.income;
    const combinedSavings = partner1.savings + partner2.savings;
    const combinedDebt = partner1.debt + partner2.debt;
    
    res.json({ 
      calculations: {
        partner1: p1Tax,
        partner2: p2Tax,
        combined: {
          income: combinedIncome,
          savings: combinedSavings,
          debt: combinedDebt,
          netWorth: combinedSavings - combinedDebt
        }
      }
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
