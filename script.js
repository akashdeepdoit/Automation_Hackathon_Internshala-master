const puppeteer = require("puppeteer");
let { id, pass } = require("./secret");
let dataFile = require("./data");

async function main() {
    let browser;
    try {
        console.log("Launching browser...");
        browser = await puppeteer.launch({
            headless: false,
            defaultViewport: null,
            args: ["--start-maximized"],
        });

        let pages = await browser.pages();
        let tab = pages[0];

        console.log("Navigating to Internshala...");
        await tab.goto("https://internshala.com/");

        console.log("Clicking login button...");
        await retryClick(tab, ".login-cta", 3); // Retry clicking login button if necessary

        console.log("Typing credentials...");
        await tab.waitForSelector("#modal_email", { visible: true });
        await tab.type("#modal_email", id);
        await tab.waitForSelector("#modal_password", { visible: true });
        await tab.type("#modal_password", pass);

        console.log("Submitting login...");
        await tab.click("#modal_login_submit");

        console.log("Waiting for navigation after login...");
        await tab.waitForNavigation({ waitUntil: "networkidle2" });

        // Handle CAPTCHA if detected
        await handleCaptcha(tab);

        // Search and apply for internships
        await searchAndApplyInternships(tab, "Web Development", "Bangalore");

    } catch (err) {
        console.error("Error during automation:", err);
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

async function handleCaptcha(tab) {
    console.log("Checking for CAPTCHA...");
    try {
        await tab.waitForSelector('.g-recaptcha', { timeout: 5000 });
        console.log("CAPTCHA detected. Please solve the CAPTCHA manually.");
        await tab.waitForFunction(() => !document.querySelector('.g-recaptcha'));
        console.log("CAPTCHA solved.");
    } catch (e) {
        console.log("No CAPTCHA detected.");
    }
}

async function searchAndApplyInternships(tab, category, location) {
    try {
        // Navigate to the internships page (assuming you're already logged in)
        await tab.goto('https://www.internshala.com/internships');

        // Click on the location filter
        await retryClick(tab, '#location_filter', 3);
        
        // Type location (e.g., Bangalore) into the location input
        await tab.waitForSelector('#location_names', { visible: true });
        await tab.type('#location_names', location);
        await tab.type('#location_names', "Bangalore");


        // Click the search button
        await tab.click('#search');
        // await tab.type("bangalore");

        // Wait for search results
        await tab.waitForSelector('.internship_meta', { timeout: 60000 });

        // Continue with applying for internships
        // Example: Click on the first internship and apply
        await tab.click('.internship_meta');
        await fillApplicationForm(tab, dataFile); // Assuming fillApplicationForm function is defined
    } catch (error) {
        console.error('Error searching and applying for internships:', error);
    }
}

async function retryClick(tab, selector, retries) {
    for (let i = 0; i < retries; i++) {
        try {
            await tab.click(selector);
            return;
        } catch (err) {
            console.log(`Retry ${i + 1}/${retries} for selector: ${selector}`);
            await new Promise(resolve => setTimeout(resolve, 2000)); // Wait for 2000 milliseconds (2 seconds)
        }
    }
    throw new Error(`Failed to click selector: ${selector} after ${retries} retries`);
}


async function fillApplicationForm(tab, data) {
    try {
        console.log("Filling application form...");

        // Example: Fill out application form fields
        await tab.waitForSelector("#training_details", { visible: true });
        await tab.type("#training_details", data["Training"]);

        await tab.waitForSelector("#organization_details", { visible: true });
        await tab.type("#organization_details", data["Organization"]);

        await tab.waitForSelector("#description_details", { visible: true });
        await tab.type("#description_details", data["description"]);

        await tab.waitForSelector("#project_link", { visible: true });
        await tab.type("#project_link", data["link"]);

        await tab.waitForSelector("#hiring_reason", { visible: true });
        await tab.type("#hiring_reason", data["hiringReason"]);

        await tab.waitForSelector("#availability", { visible: true });
        await tab.type("#availability", data["availability"]);

        await tab.waitForSelector("#rating", { visible: true });
        await tab.type("#rating", data["rating"].toString());

        console.log("Application form filled.");
    } catch (err) {
        console.error("Error filling application form:", err);
    }
}

main();
