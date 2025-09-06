import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.56.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface MonthlyReportRequest {
  userId: string;
  email: string;
  month: string; // YYYY-MM format
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { userId, email, month }: MonthlyReportRequest = await req.json();

    // Calculate date range for the month
    const startDate = `${month}-01`;
    const endDate = new Date(new Date(startDate).getFullYear(), new Date(startDate).getMonth() + 1, 0)
      .toISOString().split('T')[0];

    console.log(`Generating monthly report for user ${userId}, month ${month}`);

    // Fetch user's financial data for the month
    const [transactionsRes, budgetGoalsRes, portfolioRes] = await Promise.all([
      supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .gte('date', startDate)
        .lte('date', endDate),
      supabase
        .from('budget_goals')
        .select('*')
        .eq('user_id', userId)
        .gte('period_start', startDate)
        .lte('period_end', endDate),
      supabase
        .from('portfolio_holdings')
        .select('*')
        .eq('user_id', userId)
    ]);

    const transactions = transactionsRes.data || [];
    const budgetGoals = budgetGoalsRes.data || [];
    const portfolio = portfolioRes.data || [];

    // Calculate summary statistics
    const totalIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const netSavings = totalIncome - totalExpenses;

    // Group expenses by category
    const expensesByCategory = transactions
      .filter(t => t.type === 'expense')
      .reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount;
        return acc;
      }, {} as Record<string, number>);

    // Calculate portfolio value
    const portfolioValue = portfolio.reduce((sum, holding) => {
      return sum + (holding.current_price || holding.purchase_price) * holding.quantity;
    }, 0);

    // Generate HTML email content
    const monthName = new Date(startDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    
    const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Monthly Financial Report</title>
      <style>
        body { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #22c55e, #16a34a); color: white; padding: 30px; text-align: center; border-radius: 10px; }
        .card { background: #f8f9fa; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #22c55e; }
        .metric { display: flex; justify-content: space-between; margin: 10px 0; }
        .metric-value { font-weight: bold; color: #16a34a; }
        .expense-negative { color: #dc2626; }
        .category-item { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e5e7eb; }
        .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>💰 Monthly Financial Report</h1>
        <h2>${monthName}</h2>
        <p>Your Smart Saver Bot Summary</p>
      </div>

      <div class="card">
        <h3>📊 Financial Overview</h3>
        <div class="metric">
          <span>Total Income:</span>
          <span class="metric-value">₹${totalIncome.toLocaleString()}</span>
        </div>
        <div class="metric">
          <span>Total Expenses:</span>
          <span class="metric-value expense-negative">₹${totalExpenses.toLocaleString()}</span>
        </div>
        <div class="metric">
          <span>Net Savings:</span>
          <span class="metric-value ${netSavings >= 0 ? '' : 'expense-negative'}">₹${netSavings.toLocaleString()}</span>
        </div>
        <div class="metric">
          <span>Total Transactions:</span>
          <span class="metric-value">${transactions.length}</span>
        </div>
      </div>

      ${Object.keys(expensesByCategory).length > 0 ? `
      <div class="card">
        <h3>🏷️ Expense Breakdown</h3>
        ${Object.entries(expensesByCategory)
          .sort(([,a], [,b]) => b - a)
          .map(([category, amount]) => `
            <div class="category-item">
              <span>${category}</span>
              <span>₹${amount.toLocaleString()}</span>
            </div>
          `).join('')}
      </div>
      ` : ''}

      ${portfolio.length > 0 ? `
      <div class="card">
        <h3>📈 Investment Portfolio</h3>
        <div class="metric">
          <span>Total Portfolio Value:</span>
          <span class="metric-value">₹${portfolioValue.toLocaleString()}</span>
        </div>
        <div class="metric">
          <span>Holdings Count:</span>
          <span class="metric-value">${portfolio.length}</span>
        </div>
      </div>
      ` : ''}

      ${budgetGoals.length > 0 ? `
      <div class="card">
        <h3>🎯 Budget Goals</h3>
        <p>You have ${budgetGoals.length} active budget goal(s) for this period.</p>
        ${budgetGoals.map(goal => {
          const spent = expensesByCategory[goal.category] || 0;
          const remaining = (goal.monthly_limit || 0) - spent;
          return `
            <div class="category-item">
              <span>${goal.category} Budget</span>
              <span>₹${spent.toLocaleString()} / ₹${(goal.monthly_limit || 0).toLocaleString()}</span>
            </div>
            ${remaining < 0 ? `<p style="color: #dc2626; font-size: 12px;">⚠️ Over budget by ₹${Math.abs(remaining).toLocaleString()}</p>` : ''}
          `;
        }).join('')}
      </div>
      ` : ''}

      <div class="card">
        <h3>💡 Financial Insights</h3>
        <ul>
          ${netSavings > 0 ? 
            `<li>Great job! You saved ₹${netSavings.toLocaleString()} this month.</li>` : 
            `<li>You spent ₹${Math.abs(netSavings).toLocaleString()} more than you earned this month. Consider reviewing your expenses.</li>`
          }
          ${Object.keys(expensesByCategory).length > 0 ? 
            `<li>Your highest expense category was ${Object.entries(expensesByCategory).sort(([,a], [,b]) => b - a)[0][0]} (₹${Object.entries(expensesByCategory).sort(([,a], [,b]) => b - a)[0][1].toLocaleString()}).</li>` : 
            ''
          }
          ${transactions.length > 0 ? 
            `<li>You tracked ${transactions.length} transactions this month - keep up the good habit!</li>` : 
            `<li>No transactions recorded this month. Start tracking to get better insights!</li>`
          }
        </ul>
      </div>

      <div class="footer">
        <p>Generated by Smart Saver Bot • ${new Date().toLocaleDateString()}</p>
        <p>Keep tracking, keep saving! 💪</p>
      </div>
    </body>
    </html>
    `;

    // For now, return the HTML content (in production, you'd send this via email)
    // You could integrate with Resend, SendGrid, or another email service here
    console.log(`Monthly report generated for user ${userId}`);

    return new Response(JSON.stringify({
      success: true,
      reportData: {
        month: monthName,
        totalIncome,
        totalExpenses,
        netSavings,
        transactionCount: transactions.length,
        portfolioValue,
        expensesByCategory
      },
      emailHtml // In production, remove this and just send the email
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });

  } catch (error: any) {
    console.error("Error generating monthly report:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);