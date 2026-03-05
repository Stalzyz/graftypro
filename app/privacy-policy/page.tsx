import { FacebookLoginButton } from "../../components/facebook-sdk"; // Keep import even if unused for now, or remove if not needed on this page specifically. 
// Assuming the user wants standard legal pages.

export default function PrivacyPolicy() {
    return (
        <div className="max-w-4xl mx-auto px-6 py-12 prose prose-slate dark:prose-invert">
            <h1>Privacy Policy</h1>
            <p suppressHydrationWarning>Last updated: {new Date().toLocaleDateString()}</p>

            <h2>1. Introduction</h2>
            <p>
                Welcome to Grafty ("we," "our," or "us"). We are committed to protecting your personal information and your right to privacy.
                If you have any questions or concerns about our policy, or our practices with regards to your personal information, please contact us at <a href="mailto:support@grafty.pro">support@grafty.pro</a>.
            </p>

            <h2>2. Information We Collect</h2>
            <p>
                We collect personal information that you voluntarily provide to us when you register on the website, express an interest in obtaining information about us or our products and services, when you participate in activities on the website or otherwise when you contact us.
            </p>
            <ul>
                <li><strong>Personal Information Provided by You:</strong> We collect names; email addresses; phone numbers; and other similar information.</li>
                <li><strong>Payment Data:</strong> We may collect data necessary to process your payment if you make purchases, such as your payment instrument number (such as a credit card number), and the security code associated with your payment instrument.</li>
            </ul>

            <h2>3. How We Use Your Information</h2>
            <p>
                We use personal information collected via our website for a variety of business purposes described below. We process your personal information for these purposes in reliance on our legitimate business interests, in order to enter into or perform a contract with you, with your consent, and/or for compliance with our legal obligations.
            </p>
            <ul>
                <li>To facilitate account creation and logon process.</li>
                <li>To send you marketing and promotional communications.</li>
                <li>To fulfill and manage your orders.</li>
            </ul>

            <h2>4. Sharing Your Information</h2>
            <p>
                We only share information with your consent, to comply with laws, to provide you with services, to protect your rights, or to fulfill business obligations.
            </p>

            <h2>5. Contact Us</h2>
            <p>
                If you have questions or comments about this policy, you may email us at <a href="mailto:support@grafty.pro">support@grafty.pro</a>.
            </p>
        </div>
    );
}
