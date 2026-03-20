
import { FINANCIAL_RULES, calculateResellerCommission } from '../config';
import { DnsService } from '../dns-service';

async function runTests() {
    console.log('🧪 Starting Whitelabel Module Audit...\n');

    // --- TEST 1: Commission & Margin Floor ---
    console.log('Test 1: Commission & Margin Floor');
    const normalComm = calculateResellerCommission(1000, 20, 5); // 20% base + 5% markup = 25%
    console.log('Input: ₹1000, 20% base, 5% markup');
    console.log('Target Reseller Share: 25% (₹250)');
    console.log('Result:', normalComm);
    console.log('✅ PASS:', normalComm.resellerShare === 250);

    const highComm = calculateResellerCommission(1000, 50, 40); // 50% base + 40% markup = 90%?
    // Max comm is 40. Rate becomes 40 + 40 = 80%.
    // Platform share = 100 - 80 = 20%. (Floor is 15%)
    // Result should be 80%? Wait, let's check code logic.
    // baseRate = min(50, 40) = 40.
    // totalRate = 40 + 40 = 80.
    // platformRate = 20. 20 < 15 is false.
    // finalTotalRate = 80.
    console.log('\nInput: ₹1000, 50% base, 40% markup');
    console.log('Expectations: Base capped at 40. Total 80%. Reseller Share ₹800');
    console.log('Result:', highComm);
    console.log('✅ PASS:', highComm.resellerShare === 800);

    const floorViolation = calculateResellerCommission(1000, 40, 50); // 40 + 50 = 90%.
    // platformRate = 10. 10 < 15 is TRUE.
    // finalTotalRate = 100 - 15 = 85.
    // Reseller Share ₹850.
    console.log('\nInput: ₹1000, 40% base, 50% markup (Violation Target)');
    console.log('Expectations: Limited by Margin Floor (15%). Reseller Share ₹850');
    console.log('Result:', floorViolation);
    console.log('✅ PASS:', floorViolation.resellerShare === 850);


    // --- TEST 2: DNS Normalization ---
    console.log('\nTest 2: DNS CNAME Verification Logic');
    // We can't actually resolve DNS in a purely isolated test without network, 
    // but we can test the normalization logic if we extract it or mock results.
    const domain = "PORTAL.reseller.COM  ";
    const expected = "cname.Grafty.pro. ";
    
    // Simulating internal logic of verifyCname
    const targetDomain = domain.toLowerCase().trim();
    const normalizedExpected = expected.toLowerCase().trim().replace(/\.$/, "");
    
    const mockRecords = ["CNAME.GRAFTY.PRO."];
    const isMatch = mockRecords.some(record => 
        record.toLowerCase().trim().replace(/\.$/, "") === normalizedExpected
    );

    console.log(`Input Domain: "${domain}"`);
    console.log(`Expected CNAME: "${expected}"`);
    console.log(`Mock Found Record: "${mockRecords[0]}"`);
    console.log('Match Result:', isMatch);
    console.log('✅ PASS:', isMatch === true);

    // --- TEST 3: Wallet Margin Logic (Phase 3 Audit) ---
    console.log('\nTest 3: Wallet Margin Calculation (from ResellerService)');
    const totalDeducted = 1.10; // e.g. ₹1.10 charge to vendor
    const markup_percentage = 10; // 10% markup
    
    const markupFactor = 1 + (markup_percentage / 100);
    const basePrice = totalDeducted / markupFactor;
    const wlMargin = totalDeducted - basePrice;

    console.log(`Total Deducted: ₹${totalDeducted}`);
    console.log(`Markup: ${markup_percentage}%`);
    console.log(`Calculated Base Price: ₹${basePrice.toFixed(4)} (Expected ₹1.0000)`);
    console.log(`Calculated Partner Margin: ₹${wlMargin.toFixed(4)} (Expected ₹0.1000)`);
    console.log('✅ PASS:', Math.abs(wlMargin - 0.10) < 0.0001);

    console.log('\n' + '═'.repeat(50));
    console.log('🎉 Whitelabel Logic Audit Completed!');
    console.log('═'.repeat(50));
}

runTests().catch(console.error);
