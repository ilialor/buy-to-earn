/**
 * Revenue Distribution Test for Co-Intent Platform
 * Node.js script to run precise simulations and save results to files
 */

const fs = require('fs');
const path = require('path');

// Helper function to format numbers without currency
function formatNumber(amount) {
    if (typeof amount !== 'number' || isNaN(amount)) {
        amount = 0;
    }
    return new Intl.NumberFormat('ru-RU', { 
        style: 'decimal', 
        minimumFractionDigits: 2, 
        maximumFractionDigits: 2
    }).format(amount);
}

/**
 * Class representing the revenue distribution simulation
 */
class RevenueTestSimulator {
    constructor(params = {}) {
        // --- Initial Investment --- 
        this.initialInvestment = params.initialInvestment || 100000;
        
        // --- Configurable Distribution Shares (Post-Investment Phase) --- 
        this.creatorShare = params.creatorShare || 10;
        this.platformShare = params.platformShare || 10;
        this.promotionShare = params.promotionShare || 10;
        this.buyersShare = 100 - this.creatorShare - this.platformShare - this.promotionShare;
        
        // --- Payback Model Parameters --- 
        this.nonPaybackPoolSharePercent = params.nonPaybackPoolSharePercent || 60;
        this.paybackRatios = params.paybackRatios || [1, 2, 3]; // Test multiple ratios
        
        // --- Test Parameters ---
        this.tokenPrice = params.tokenPrice || 100;
        this.tokensToTrack = params.tokensToTrack || [1, 100, 1000];
        this.maxBatchSize = params.maxBatchSize || 1000; // How many sales to simulate in each batch
        this.resultsDir = params.resultsDir || 'test-results';
        this.maxSimulations = params.maxSimulations || 100000; // Safety limit
        
        // --- Initialize Test Data ---
        this.numPrepayers = this.calculateNumPrepayers();
        console.log(`Initial investment: ${this.initialInvestment}, Token price: ${this.tokenPrice}`);
        console.log(`Calculated prepayers: ${this.numPrepayers}`);
        console.log(`Distribution: Creator=${this.creatorShare}%, Platform=${this.platformShare}%, Promotion=${this.promotionShare}%, Buyers=${this.buyersShare}%`);
        console.log(`Payback: NonPaybackPool=${this.nonPaybackPoolSharePercent}%, Shared=${100-this.nonPaybackPoolSharePercent}%`);
        
        // Create results directory if it doesn't exist
        if (!fs.existsSync(this.resultsDir)) {
            fs.mkdirSync(this.resultsDir, { recursive: true });
        }
    }
    
    /**
     * Calculate the number of prepayers required to cover the initial investment
     */
    calculateNumPrepayers() {
        if (isNaN(this.tokenPrice) || this.tokenPrice <= 0 || this.initialInvestment <= 0) {
            return 0;
        }
        return Math.ceil(this.initialInvestment / this.tokenPrice);
    }
    
    /**
     * Run the simulation for all payback ratios
     */
    async runAllTests() {
        const startTime = Date.now();
        const results = {};
        
        // Initialize result structure
        for (const ratio of this.paybackRatios) {
            results[`ratio_${ratio}x`] = {
                paybackSales: {},
                paybackFinancials: {}
            };
            this.tokensToTrack.forEach(token => {
                results[`ratio_${ratio}x`].paybackSales[`token_${token}`] = null;
                results[`ratio_${ratio}x`].paybackFinancials[`token_${token}`] = null;
            });
        }
        
        // Run simulations for each payback ratio
        for (const ratio of this.paybackRatios) {
            console.log(`\n=== Starting simulation for payback ratio ${ratio}x ===`);
            const startRatioTime = Date.now();
            
            const paybackResults = await this.runTestForRatio(ratio);
            
            // Store results
            const ratioKey = `ratio_${ratio}x`;
            results[ratioKey].paybackSales = paybackResults.paybackSales;
            results[ratioKey].paybackFinancials = paybackResults.paybackFinancials;
            
            const ratioEndTime = Date.now();
            console.log(`Completed simulation for ratio ${ratio}x in ${((ratioEndTime - startRatioTime) / 1000).toFixed(2)} seconds`);
        }
        
        // Print summary report
        this.printSummaryReport(results);
        
        const endTime = Date.now();
        console.log(`Total execution time: ${((endTime - startTime) / 1000).toFixed(2)} seconds`);
        
        return results;
    }
    
    /**
     * Run the test for a specific payback ratio
     */
    async runTestForRatio(paybackRatio) {
        const paybackGoal = this.tokenPrice * paybackRatio;
        console.log(`\nSimulating with payback goal of ${paybackGoal} (${paybackRatio}x)`);
        
        // Initialize state
        let currentBatch = 1;
        let batchStartSale = this.numPrepayers + 1;
        let batchEndSale = Math.min(batchStartSale + this.maxBatchSize - 1, this.maxSimulations);
        let allTokensReachedPayback = false;
        
        // Initialize arrays
        let tokenEarnings = new Array(this.maxSimulations + 1).fill(0);
        let paybackSales = {}; // Store sale number when each tracked token reaches payback
        
        // Финансовые показатели в точках окупаемости
        let paybackFinancials = {};
        
        this.tokensToTrack.forEach(token => {
            paybackSales[`token_${token}`] = null;
            paybackFinancials[`token_${token}`] = null;
        });
        
        // Общие финансовые показатели
        let totalRevenue = this.initialInvestment; // Начинаем с суммы начальных инвестиций
        let creatorRevenue = this.initialInvestment; // Автор уже получил все начальные инвестиции
        let platformRevenue = 0;
        let promotionRevenue = 0;
        
        // Constants for calculations
        const nonPaybackPoolPercent = this.nonPaybackPoolSharePercent / 100.0;
        const sharedPoolPercent = 1.0 - nonPaybackPoolPercent;
        
        // Initialize time tracking
        const startTime = Date.now();
        let lastProgressTime = startTime;
        
        // Start batch processing
        while (batchStartSale <= this.maxSimulations && !allTokensReachedPayback) {
            console.log(`Processing batch ${currentBatch}: Sales ${batchStartSale}-${batchEndSale}`);
            
            // Process this batch of sales
            for (let currentSale = batchStartSale; currentSale <= batchEndSale; currentSale++) {
                const saleAmount = this.tokenPrice;
                totalRevenue += saleAmount;
                
                const saleCreatorRevenue = saleAmount * (this.creatorShare / 100);
                const salePlatformRevenue = saleAmount * (this.platformShare / 100);
                const salePromotionRevenue = saleAmount * (this.promotionShare / 100);
                const saleTotalBuyersRevenue = saleAmount * (this.buyersShare / 100);
                
                creatorRevenue += saleCreatorRevenue;
                platformRevenue += salePlatformRevenue;
                promotionRevenue += salePromotionRevenue;
                
                const numTokensInDistribution = currentSale - 1;
                
                if (numTokensInDistribution > 0) {
                    // 1. Identify tokens that haven't reached payback yet
                    let notPaidBackIndices = [];
                    for (let i = 1; i <= numTokensInDistribution; i++) {
                        if (tokenEarnings[i] < paybackGoal) {
                            notPaidBackIndices.push(i);
                        }
                    }
                    
                    const notPaidBackCount = notPaidBackIndices.length;
                    
                    // 2. Calculate revenue pools
                    const exclusiveNPRevenue = saleTotalBuyersRevenue * nonPaybackPoolPercent;
                    const sharedRevenue = saleTotalBuyersRevenue * sharedPoolPercent;
                    
                    // 3. Calculate per-token shares
                    const sharePerNPToken = notPaidBackCount > 0 ? exclusiveNPRevenue / notPaidBackCount : 0;
                    const sharePerSharedToken = numTokensInDistribution > 0 ? sharedRevenue / numTokensInDistribution : 0;
                    
                    // 4. Distribute earnings to all previous tokens
                    for (let i = 1; i <= numTokensInDistribution; i++) {
                        const wasPaidBackBefore = tokenEarnings[i] >= paybackGoal;
                        
                        if (wasPaidBackBefore) {
                            tokenEarnings[i] += sharePerSharedToken; // Only shared pool
                        } else {
                            tokenEarnings[i] += sharePerNPToken + sharePerSharedToken; // Both pools
                            
                            // Check if token just reached payback
                            if (tokenEarnings[i] >= paybackGoal) {
                                // If this is a tracked token that hasn't been marked as paid back yet
                                if (this.tokensToTrack.includes(i) && paybackSales[`token_${i}`] === null) {
                                    paybackSales[`token_${i}`] = currentSale;
                                    // Сохраняем финансовые показатели на момент окупаемости
                                    paybackFinancials[`token_${i}`] = {
                                        totalRevenue: totalRevenue,
                                        creatorRevenue: creatorRevenue,
                                        platformRevenue: platformRevenue,
                                        promotionRevenue: promotionRevenue,
                                        tokenEarnings: tokenEarnings[i]
                                    };
                                    console.log(`  - Token #${i} reached payback goal ${paybackGoal} at sale #${currentSale} (Total Revenue: ${formatNumber(totalRevenue)}, Creator: ${formatNumber(creatorRevenue)}, Platform: ${formatNumber(platformRevenue)})`);
                                }
                            }
                        }
                    }
                    
                    // Check if all tracked tokens have reached payback
                    allTokensReachedPayback = this.tokensToTrack.every(token => 
                        paybackSales[`token_${token}`] !== null);
                    
                    if (allTokensReachedPayback) {
                        console.log(`All tracked tokens reached payback by sale #${currentSale}. Stopping simulation.`);
                        break;
                    }
                }
                
                // Show progress every 10 seconds
                const now = Date.now();
                if (now - lastProgressTime > 10000) {
                    console.log(`  Progress: Sale #${currentSale}, Elapsed: ${((now - startTime) / 1000).toFixed(0)} seconds`);
                    lastProgressTime = now;
                }
            }
            
            // Save batch results to file
            await this.saveBatchResults(paybackRatio, currentBatch, batchStartSale, batchEndSale, tokenEarnings.slice(0, batchEndSale + 1));
            
            // Prepare for next batch
            currentBatch++;
            batchStartSale = batchEndSale + 1;
            batchEndSale = Math.min(batchStartSale + this.maxBatchSize - 1, this.maxSimulations);
            
            // If we've reached max simulations without all tokens reaching payback
            if (batchStartSale > this.maxSimulations && !allTokensReachedPayback) {
                console.log(`\nWarning: Reached maximum ${this.maxSimulations} sales without all tokens reaching payback.`);
                this.tokensToTrack.forEach(token => {
                    if (paybackSales[`token_${token}`] === null) {
                        console.log(`  - Token #${token} did not reach payback goal ${paybackGoal} within ${this.maxSimulations} sales.`);
                    }
                });
            }
        }
        
        return { paybackSales, paybackFinancials };
    }
    
    /**
     * Save batch results to a file
     */
    async saveBatchResults(paybackRatio, batchNum, startSale, endSale, tokenEarnings) {
        const filename = path.join(this.resultsDir, `ratio_${paybackRatio}x_batch_${batchNum}_sales_${startSale}-${endSale}.json`);
        
        // Create a smaller object with just the tracked tokens
        const trackedEarnings = {};
        this.tokensToTrack.forEach(token => {
            if (token <= tokenEarnings.length - 1) {
                trackedEarnings[`token_${token}`] = tokenEarnings[token];
            }
        });
        
        // First 100 tokens
        const first100 = {};
        for (let i = 1; i <= 100 && i < tokenEarnings.length; i++) {
            first100[`token_${i}`] = tokenEarnings[i];
        }
        
        // Save data
        const dataToSave = {
            simulationParams: {
                paybackRatio,
                paybackGoal: this.tokenPrice * paybackRatio,
                batchNum,
                startSale,
                endSale
            },
            trackedTokenEarnings: trackedEarnings,
            first100TokenEarnings: first100
        };
        
        return new Promise((resolve, reject) => {
            fs.writeFile(filename, JSON.stringify(dataToSave, null, 2), (err) => {
                if (err) {
                    console.error(`Error saving batch results: ${err.message}`);
                    reject(err);
                } else {
                    console.log(`Saved batch results to ${filename}`);
                    resolve();
                }
            });
        });
    }
    
    /**
     * Print a summary report of when tokens reached payback
     */
    printSummaryReport(results) {
        console.log("\n=================================");
        console.log("SUMMARY REPORT - REVENUE DISTRIBUTION TEST");
        console.log("=================================");
        console.log("Parameters:");
        console.log(`- Initial Investment: ${this.initialInvestment}`);
        console.log(`- Token Price: ${this.tokenPrice}`);
        console.log(`- Number of Prepayers: ${this.numPrepayers}`);
        console.log(`- Creator Share: ${this.creatorShare}%`);
        console.log(`- Platform Share: ${this.platformShare}%`);
        console.log(`- Promotion Share: ${this.promotionShare}%`);
        console.log(`- Buyers Share: ${this.buyersShare}%`);
        console.log(`- Non-Payback Pool: ${this.nonPaybackPoolSharePercent}%`);
        
        console.log("\n---------------------------------");
        console.log("TOKEN PAYBACK RESULTS");
        console.log("---------------------------------");
        
        // Create a table-like structure for the report
        const tableData = {};
        this.tokensToTrack.forEach(token => {
            tableData[`Token #${token}`] = {};
            
            this.paybackRatios.forEach(ratio => {
                const ratioKey = `ratio_${ratio}x`;
                const saleNum = results[ratioKey]?.paybackSales[`token_${token}`];
                tableData[`Token #${token}`][`${ratio}x Payback`] = saleNum !== null ? saleNum : "Not Reached";
            });
        });
        
        // Print table rows
        console.log("\nToken\t| " + this.paybackRatios.map(r => `${r}x Payback`).join("\t| "));
        console.log("-".repeat(60));
        
        Object.keys(tableData).forEach(tokenLabel => {
            const tokenData = tableData[tokenLabel];
            const values = this.paybackRatios.map(r => tokenData[`${r}x Payback`]);
            console.log(`${tokenLabel}\t| ${values.join("\t| ")}`);
        });
        
        // Финансовые показатели
        console.log("\n---------------------------------");
        console.log("FINANCIAL METRICS AT PAYBACK POINTS");
        console.log("---------------------------------");
        console.log("Note: Creator revenue includes initial investment of " + formatNumber(this.initialInvestment));
        console.log("Note: Platform receives " + this.platformShare + "% only from sales AFTER prepayment phase");
        console.log("");
        
        this.tokensToTrack.forEach(token => {
            console.log(`\nToken #${token}:`);
            this.paybackRatios.forEach(ratio => {
                const ratioKey = `ratio_${ratio}x`;
                const financials = results[ratioKey]?.paybackFinancials[`token_${token}`];
                
                if (financials) {
                    const saleNum = results[ratioKey].paybackSales[`token_${token}`];
                    const salesAfterPrepayment = saleNum - this.numPrepayers;
                    const revenueAfterPrepayment = salesAfterPrepayment * this.tokenPrice;
                    
                    // Calculate percentages for clarity
                    const platformPercentOfTotal = ((financials.platformRevenue / financials.totalRevenue) * 100).toFixed(2);
                    
                    console.log(`  ${ratio}x Payback (Sale #${saleNum}):`);
                    console.log(`    Total Revenue: ${formatNumber(financials.totalRevenue)}`);
                    console.log(`    Creator Revenue: ${formatNumber(financials.creatorRevenue)} (includes ${formatNumber(this.initialInvestment)} initial investment)`);
                    console.log(`    Platform Revenue: ${formatNumber(financials.platformRevenue)} (${platformPercentOfTotal}% of total revenue)`);
                    console.log(`    Revenue from sales after prepayment: ${formatNumber(revenueAfterPrepayment)}`);
                } else {
                    console.log(`  ${ratio}x Payback: Not Reached`);
                }
            });
        });
        
        // Save final report to file
        const finalReportPath = path.join(this.resultsDir, 'final_report.json');
        fs.writeFileSync(finalReportPath, JSON.stringify(results, null, 2));
        console.log(`\nFull report saved to ${finalReportPath}`);
    }
}

/**
 * Parse command line arguments
 */
function parseCommandLineArgs() {
    const args = process.argv.slice(2);
    const params = {};

    for (let i = 0; i < args.length; i++) {
        const arg = args[i];
        if (arg.startsWith('--')) {
            const [key, value] = arg.substring(2).split('=');
            if (value === undefined) {
                if (i + 1 < args.length && !args[i + 1].startsWith('--')) {
                    params[key] = args[i + 1];
                    i++;
                } else {
                    params[key] = true;
                }
            } else {
                params[key] = value;
            }
        }
    }

    // Convert numeric values
    const numericParams = ['initialInvestment', 'tokenPrice', 'creatorShare', 'platformShare', 
                          'promotionShare', 'nonPaybackPoolSharePercent', 'maxBatchSize'];
    
    for (const param of numericParams) {
        if (params[param] !== undefined) {
            params[param] = Number(params[param]);
        }
    }

    // Convert array values
    if (params.paybackRatios) {
        params.paybackRatios = params.paybackRatios.split(',').map(Number);
    }
    
    if (params.tokensToTrack) {
        params.tokensToTrack = params.tokensToTrack.split(',').map(Number);
    }

    return params;
}

/**
 * Run the test with parameters from command line or defaults
 */
async function runTest() {
    const cmdLineParams = parseCommandLineArgs();
    
    const defaultParams = {
        initialInvestment: 100000,
        tokenPrice: 100,
        creatorShare: 10,
        platformShare: 10,
        promotionShare: 10, // Resulting in 70% buyers share
        nonPaybackPoolSharePercent: 60,
        paybackRatios: [1, 2, 3],
        tokensToTrack: [1, 100, 1000],
        maxBatchSize: 1000,
        resultsDir: 'revenue-test-results'
    };
    
    // Merge default and command line parameters
    const params = {...defaultParams, ...cmdLineParams};
    
    const simulator = new RevenueTestSimulator(params);
    await simulator.runAllTests();
}

// Run the test if this script is executed directly
if (require.main === module) {
    console.log("Starting Revenue Distribution Test...");
    runTest().catch(err => {
        console.error("Test failed:", err);
        process.exit(1);
    });
}

module.exports = { RevenueTestSimulator }; 