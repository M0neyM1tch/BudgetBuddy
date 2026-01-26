import React from 'react';
import { Link } from 'react-router-dom';
import './Legal.css';

function PrivacyPolicy() {
  return (
    <div className="legal-container">
      <div className="legal-content">
        <h1>Privacy Policy</h1>
        <p className="last-updated">Last Updated: January 20, 2026</p>

        <div className="beta-notice">
          <strong>⚠️ BETA SOFTWARE NOTICE</strong>
          <p>BudgetBuddy is currently in beta testing. While we take data security seriously, please be aware that features and security measures are continuously being improved.</p>
        </div>

        <section>
          <h2>1. Information We Collect</h2>
          
          <h3>1.1 Account Information</h3>
          <p>When you create an account, we collect:</p>
          <ul>
            <li>Email address</li>
            <li>Name (optional)</li>
            <li>Encrypted password (managed by Supabase)</li>
          </ul>

          <h3>1.2 Financial Data</h3>
          <p>When you use BudgetBuddy, you voluntarily provide:</p>
          <ul>
            <li>Transaction details (date, amount, description, category)</li>
            <li>Financial goals (name, target amount, current amount)</li>
            <li>Budget categories and amounts</li>
            <li>Recurring transaction rules</li>
          </ul>
          <p><strong>Important:</strong> We do NOT collect or store actual bank account credentials, credit card numbers, or connect to your real financial institutions.</p>

          <h3>1.3 Technical Data</h3>
          <p>We automatically collect:</p>
          <ul>
            <li>IP address</li>
            <li>Browser type and version</li>
            <li>Device information</li>
            <li>Session IDs (stored in sessionStorage)</li>
            <li>Usage analytics (feature interactions, timestamps)</li>
          </ul>
        </section>

        <section>
          <h2>2. How We Use Your Information</h2>
          <p>We use your data to:</p>
          <ul>
            <li>Provide core budgeting and financial tracking features</li>
            <li>Calculate financial summaries, analytics, and projections</li>
            <li>Store your goals, transactions, and user preferences</li>
            <li>Improve our service through usage analytics</li>
            <li>Send important service notifications (account security, beta updates)</li>
            <li>Prevent abuse and enforce rate limits</li>
          </ul>
        </section>

        <section>
          <h2>3. Data Storage & Third-Party Services</h2>
          
          <h3>3.1 Supabase (Database & Authentication)</h3>
          <p>All user data is stored and processed by <strong>Supabase</strong>, our backend infrastructure provider:</p>
          <ul>
            <li><strong>Location:</strong> Data is stored on Supabase's servers (US-based by default)</li>
            <li><strong>Security:</strong> Data is encrypted in transit (HTTPS/TLS) and at rest (AES-256)</li>
            <li><strong>Purpose:</strong> Database storage, user authentication, and API services</li>
            <li><strong>Privacy Policy:</strong> <a href="https://supabase.com/privacy" target="_blank">https://supabase.com/privacy</a></li>
          </ul>

          <h3>3.2 Cloudflare (Hosting & CDN)</h3>
          <p>Our website is hosted and served through Cloudflare Pages:</p>
          <ul>
            <li><strong>Purpose:</strong> Website hosting, content delivery, DDoS protection</li>
            <li><strong>Data Collected:</strong> IP address, request logs (retained for 72 hours)</li>
            <li><strong>Privacy Policy:</strong> <a href="https://www.cloudflare.com/privacypolicy/" target="_blank">https://www.cloudflare.com/privacypolicy/</a></li>
          </ul>

          <h3>3.3 No Third-Party Analytics</h3>
          <p>We do NOT use Google Analytics, Facebook Pixel, or any third-party tracking services. All analytics are collected directly in our own database.</p>
        </section>

        <section>
          <h2>4. Cookies & Local Storage</h2>
          <p>BudgetBuddy uses the following browser storage mechanisms:</p>
          
          <table className="cookie-table">
            <thead>
              <tr>
                <th>Type</th>
                <th>Purpose</th>
                <th>Duration</th>
                <th>Required</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Authentication Cookies</td>
                <td>Keep you logged in</td>
                <td>7 days</td>
                <td>✅ Essential</td>
              </tr>
              <tr>
                <td>sessionStorage (Session ID)</td>
                <td>Track demo usage</td>
                <td>Session only</td>
                <td>⚠️ Functional</td>
              </tr>
              <tr>
                <td>localStorage (Rate Limit)</td>
                <td>Prevent abuse</td>
                <td>1 hour</td>
                <td>✅ Essential</td>
              </tr>
            </tbody>
          </table>

          <p><strong>Managing Cookies:</strong> You can clear cookies and storage through your browser settings, but this will log you out and reset your session.</p>
        </section>

        <section>
          <h2>5. Data Retention</h2>
          <p>We retain your data according to the following policies:</p>
          <ul>
            <li><strong>Active Accounts:</strong> Data is retained for the lifetime of your account</li>
            <li><strong>Deleted Accounts:</strong> All personal data is permanently deleted within 30 days of account deletion</li>
            <li><strong>Anonymized Analytics:</strong> Session analytics are retained indefinitely but are not linked to identifiable users</li>
            <li><strong>Backup Data:</strong> Encrypted backups may be retained for up to 90 days for disaster recovery</li>
          </ul>
        </section>

        <section>
          <h2>6. Your Data Rights (GDPR & CCPA)</h2>
          <p>You have the following rights regarding your personal data:</p>
          <ul>
            <li><strong>Access:</strong> Request a copy of all data we have about you</li>
            <li><strong>Rectification:</strong> Correct inaccurate or incomplete data</li>
            <li><strong>Deletion:</strong> Request permanent deletion of your account and all associated data</li>
            <li><strong>Portability:</strong> Export your data in JSON format</li>
            <li><strong>Restriction:</strong> Limit how we process your data</li>
            <li><strong>Objection:</strong> Object to certain data processing activities</li>
          </ul>
          <p>To exercise these rights, contact us at: <strong>privacy@yourbudgetbuddy.com</strong> (replace with your email)</p>
        </section>

        <section>
          <h2>7. Data Security</h2>
          <p>We implement industry-standard security measures:</p>
          <ul>
            <li>HTTPS/TLS encryption for all data in transit</li>
            <li>AES-256 encryption for data at rest</li>
            <li>Bcrypt password hashing (never stored in plain text)</li>
            <li>Row-level security policies in our database</li>
            <li>Regular security audits and updates</li>
          </ul>
          <p><strong>Beta Disclaimer:</strong> While we employ robust security measures, BudgetBuddy is in beta. We cannot guarantee absolute security and recommend not entering highly sensitive financial information.</p>
        </section>

        <section>
          <h2>8. Children's Privacy</h2>
          <p>BudgetBuddy is not intended for users under 18 years of age. We do not knowingly collect data from minors. If you believe a minor has created an account, please contact us immediately.</p>
        </section>

        <section>
          <h2>9. International Users</h2>
          <p>BudgetBuddy is operated from Canada. If you are accessing our service from the EU, UK, or other regions with data protection laws:</p>
          <ul>
            <li>Your data may be transferred to and processed in the United States (Supabase servers)</li>
            <li>By using our service, you consent to this transfer</li>
            <li>We comply with GDPR requirements for international data transfers</li>
          </ul>
        </section>

        <section>
          <h2>10. Changes to This Policy</h2>
          <p>We may update this Privacy Policy as BudgetBuddy evolves. Material changes will be communicated via:</p>
          <ul>
            <li>Email notification to registered users</li>
            <li>Prominent notice on our website</li>
            <li>Updated "Last Modified" date at the top of this page</li>
          </ul>
          <p>Continued use of BudgetBuddy after changes constitutes acceptance of the updated policy.</p>
        </section>

        <section>
          <h2>11. Contact Us</h2>
          <p>For privacy-related questions or concerns:</p>
          <p>
            <strong>Email:</strong> privacy@yourbudgetbuddy.com<br />
            <strong>Response Time:</strong> Within 72 hours
          </p>
        </section>

        <div className="legal-footer">
          <p>By using BudgetBuddy, you acknowledge that you have read and understood this Privacy Policy.</p>
          <Link to="/" className="btn-back">← Back to App</Link>
        </div>
      </div>
    </div>
  );
}

export default PrivacyPolicy;
