import React from 'react';
import { Link } from 'react-router-dom';
import './Legal.css';

function TermsOfService() {
  return (
    <div className="legal-container">
      <div className="legal-content">
        <h1>Terms of Service</h1>
        <p className="last-updated">Last Updated: January 20, 2026</p>

        <div className="beta-notice critical">
          <strong>⚠️ CRITICAL DISCLAIMERS - READ CAREFULLY</strong>
          <ol>
            <li><strong>NOT FINANCIAL ADVICE:</strong> BudgetBuddy is a personal finance tracking tool only. It does NOT provide financial, investment, tax, or legal advice.</li>
            <li><strong>BETA SOFTWARE:</strong> This application is in active development and may contain bugs, errors, or unexpected behavior.</li>
            <li><strong>NO WARRANTY:</strong> BudgetBuddy is provided "AS IS" without any guarantees of accuracy, reliability, or fitness for a particular purpose.</li>
          </ol>
        </div>

        <section>
          <h2>1. Acceptance of Terms</h2>
          <p>By accessing or using BudgetBuddy ("the Service"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, do not use the Service.</p>
          <p>These Terms constitute a legally binding agreement between you ("User" or "you") and BudgetBuddy ("we," "us," or "our").</p>
        </section>

        <section>
          <h2>2. Beta Software Disclaimer</h2>
          
          <h3>2.1 Experimental Nature</h3>
          <p>BudgetBuddy is currently in <strong>BETA TESTING</strong>. This means:</p>
          <ul>
            <li>Features may be incomplete, unstable, or subject to change without notice</li>
            <li>Data loss, corruption, or unexpected behavior may occur</li>
            <li>The Service may experience downtime, errors, or interruptions</li>
            <li>We may add, modify, or remove features at any time</li>
            <li>Beta access may be terminated at our discretion</li>
          </ul>

          <h3>2.2 User Responsibilities During Beta</h3>
          <p>As a beta user, you agree to:</p>
          <ul>
            <li>Report bugs and issues through appropriate channels</li>
            <li>Maintain your own backups of critical financial data</li>
            <li>NOT rely on BudgetBuddy as your sole financial record</li>
            <li>Accept that calculations and projections may contain errors</li>
          </ul>
        </section>

        <section>
          <h2>3. Not Financial Advice</h2>
          
          <h3>3.1 Educational Tool Only</h3>
          <p><strong>IMPORTANT:</strong> BudgetBuddy provides:</p>
          <ul>
            <li>✅ Transaction tracking and categorization</li>
            <li>✅ Budget visualization and goal setting</li>
            <li>✅ Basic financial analytics and projections</li>
            <li>❌ NOT personalized financial advice</li>
            <li>❌ NOT investment recommendations</li>
            <li>❌ NOT tax guidance or legal counsel</li>
            <li>❌ NOT certified financial planning services</li>
          </ul>

          <h3>3.2 Consult Professionals</h3>
          <p>For financial decisions, always consult:</p>
          <ul>
            <li>Certified Financial Planners (CFP)</li>
            <li>Certified Public Accountants (CPA)</li>
            <li>Licensed investment advisors</li>
            <li>Tax professionals</li>
            <li>Legal counsel (for legal matters)</li>
          </ul>
          <p>BudgetBuddy creators, operators, and contributors are not licensed financial professionals and cannot be held liable for financial decisions made based on information from this Service.</p>
        </section>

        <section>
          <h2>4. User Account Responsibilities</h2>
          
          <h3>4.1 Account Security</h3>
          <p>You are responsible for:</p>
          <ul>
            <li>Maintaining the confidentiality of your password</li>
            <li>All activities that occur under your account</li>
            <li>Notifying us immediately of unauthorized access</li>
            <li>Using a strong, unique password</li>
          </ul>

          <h3>4.2 Accurate Information</h3>
          <p>You agree to:</p>
          <ul>
            <li>Provide accurate and current information</li>
            <li>Update your information as needed</li>
            <li>Not impersonate others or create fake accounts</li>
          </ul>

          <h3>4.3 Prohibited Uses</h3>
          <p>You may NOT:</p>
          <ul>
            <li>Use the Service for illegal activities</li>
            <li>Attempt to hack, reverse engineer, or exploit the Service</li>
            <li>Upload malicious code or viruses</li>
            <li>Abuse rate limits or automated scraping</li>
            <li>Resell or redistribute access to the Service</li>
            <li>Use the Service to harass, abuse, or harm others</li>
          </ul>
        </section>

        <section>
          <h2>5. Data Accuracy & Limitations</h2>
          
          <h3>5.1 User-Entered Data</h3>
          <p>BudgetBuddy relies entirely on data YOU enter manually. We:</p>
          <ul>
            <li>Cannot verify the accuracy of your transactions</li>
            <li>Do not validate amounts, dates, or categories</li>
            <li>Are not responsible for errors in your data entry</li>
          </ul>

          <h3>5.2 Calculations & Analytics</h3>
          <p>All calculations (spending summaries, goal progress, projections) are estimates based on your input. We do NOT guarantee:</p>
          <ul>
            <li>Mathematical accuracy (bugs may exist)</li>
            <li>Prediction reliability (future projections are speculative)</li>
            <li>Completeness of financial insights</li>
          </ul>

          <h3>5.3 No Bank Integration</h3>
          <p>BudgetBuddy does NOT:</p>
          <ul>
            <li>Connect to real bank accounts</li>
            <li>Import transactions automatically</li>
            <li>Access your credit card or financial institution data</li>
          </ul>
          <p>Any financial data in BudgetBuddy is manually entered by you.</p>
        </section>

        <section>
          <h2>6. Intellectual Property</h2>
          
          <h3>6.1 Our Property</h3>
          <p>BudgetBuddy, including its:</p>
          <ul>
            <li>Source code, design, and UI/UX</li>
            <li>Logos, trademarks, and branding</li>
            <li>Content, text, and graphics</li>
          </ul>
          <p>...is owned by BudgetBuddy and protected by copyright, trademark, and intellectual property laws.</p>

          <h3>6.2 Your Data</h3>
          <p>You retain full ownership of all data you input into BudgetBuddy. We claim no ownership over your:</p>
          <ul>
            <li>Transaction records</li>
            <li>Financial goals</li>
            <li>Budget categories</li>
            <li>Personal information</li>
          </ul>
        </section>

        <section>
          <h2>7. Limitation of Liability</h2>
          
          <h3>7.1 No Damages</h3>
          <p><strong>TO THE MAXIMUM EXTENT PERMITTED BY LAW:</strong></p>
          <p>BudgetBuddy and its creators SHALL NOT BE LIABLE for:</p>
          <ul>
            <li>Financial losses resulting from use of the Service</li>
            <li>Incorrect calculations, projections, or analytics</li>
            <li>Data loss, corruption, or unauthorized access</li>
            <li>Service downtime, errors, or interruptions</li>
            <li>Decisions made based on information from the Service</li>
            <li>Third-party services (Supabase, Cloudflare)</li>
          </ul>

          <h3>7.2 Maximum Liability Cap</h3>
          <p>In no event shall our total liability exceed the amount you paid for the Service in the 12 months prior to the claim. Since BudgetBuddy is currently free, <strong>our maximum liability is $0.00</strong>.</p>

          <h3>7.3 Indemnification</h3>
          <p>You agree to indemnify and hold harmless BudgetBuddy from any claims, damages, or expenses arising from:</p>
          <ul>
            <li>Your violation of these Terms</li>
            <li>Your use or misuse of the Service</li>
            <li>Your violation of any law or third-party rights</li>
          </ul>
        </section>

        <section>
          <h2>8. Privacy & Data Collection</h2>
          <p>Your use of BudgetBuddy is also governed by our <Link to="/privacy">Privacy Policy</Link>. By using the Service, you consent to:</p>
          <ul>
            <li>Data collection as described in the Privacy Policy</li>
            <li>Storage of data on Supabase servers</li>
            <li>Use of cookies and browser storage</li>
          </ul>
        </section>

        <section>
          <h2>9. Service Modifications & Termination</h2>
          
          <h3>9.1 Changes to Service</h3>
          <p>We reserve the right to:</p>
          <ul>
            <li>Modify, suspend, or discontinue any feature at any time</li>
            <li>Change pricing (currently free, but may charge in future)</li>
            <li>Impose usage limits or restrictions</li>
          </ul>

          <h3>9.2 Account Termination</h3>
          <p>We may terminate your account if you:</p>
          <ul>
            <li>Violate these Terms</li>
            <li>Engage in abusive or fraudulent behavior</li>
            <li>Remain inactive for an extended period</li>
          </ul>
          <p>You may delete your account at any time through account settings. Upon deletion, all your data will be permanently removed within 30 days.</p>
        </section>

        <section>
          <h2>10. Dispute Resolution</h2>
          
          <h3>10.1 Governing Law</h3>
          <p>These Terms are governed by the laws of <strong>Ontario, Canada</strong>, without regard to conflict of law principles.</p>

          <h3>10.2 Arbitration</h3>
          <p>Any disputes shall be resolved through binding arbitration in Ontario, Canada, rather than in court, except you may assert claims in small claims court if they qualify.</p>
        </section>

        <section>
          <h2>11. Miscellaneous</h2>
          
          <h3>11.1 Severability</h3>
          <p>If any provision of these Terms is found unenforceable, the remaining provisions remain in full effect.</p>

          <h3>11.2 No Waiver</h3>
          <p>Our failure to enforce any right or provision does not constitute a waiver of future enforcement.</p>

          <h3>11.3 Entire Agreement</h3>
          <p>These Terms and our Privacy Policy constitute the entire agreement between you and BudgetBuddy.</p>
        </section>

        <section>
          <h2>12. Contact Information</h2>
          <p>For questions about these Terms:</p>
          <p>
            <strong>Email:</strong> support@yourbudgetbuddy.com<br />
            <strong>Response Time:</strong> Within 72 hours
          </p>
        </section>

        <div className="legal-footer">
          <p><strong>By clicking "Sign Up" or using BudgetBuddy, you acknowledge that you have read, understood, and agree to these Terms of Service.</strong></p>
          <Link to="/" className="btn-back">← Back to App</Link>
        </div>
      </div>
    </div>
  );
}

export default TermsOfService;
 