const express = require('express');
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth')
const dotenv = require('dotenv');
const randomUseragent = require('random-useragent');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const cors = require('cors');

dotenv.config();
puppeteer.use(StealthPlugin())

const app = express();
const genAI = new GoogleGenerativeAI(process.env.API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
app.use(express.json());
app.use(cors({
    origin: `${process.env.FRONTEND}`
}))

// Redirect Handler for Flipkart URL (Separate for clarity)
const handleRedirects = async (url) => {
    let browser;
    try {
        browser = await puppeteer.launch({
            executablePath: '/usr/bin/chromium-browser',
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        const page = await browser.newPage();
        const userAgent = randomUseragent.getRandom();
        await page.setUserAgent(userAgent);
        await page.goto(url, { waitUntil: 'networkidle0', timeout: 120000 });
        return page.url(); // Final URL after redirects
    } catch (error) {
        console.error("Error handling redirects:", error);
        throw error;
    } finally {
        if (browser) await browser.close();
    }
};

app.post('/api/test', (req,res) => {
    res.send("Test Successfull")
})

app.post('/api/phistory', async (req, res) => {
    let { inputValue } = req.body;

    if (inputValue.startsWith('https://dl.flipkart.com/')) {
        try {
            inputValue = await handleRedirects(inputValue);
            console.log(`Redirected`);
        } catch (error) {
            return res.status(500).json({ error: "Redirect error for Flipkart URL" });
        }
    }

    let browser;
    try {
        browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        const page = await browser.newPage();

        await page.goto(`https://pricebefore.com/search/?category=all&q=${inputValue}`, { 
            waitUntil: 'networkidle0',
            timeout: 60000
        });

        const data = await page.evaluate(() => {
            try {
                // Extract title
                const titleElement = document.evaluate(
                    "/html/body/div[2]/div/div[1]/div/div[5]/div/h1",
                    document,
                    null,
                    XPathResult.FIRST_ORDERED_NODE_TYPE,
                    null
                ).singleNodeValue;
                const titleText = titleElement ? titleElement.textContent : null;
        
                // Extract image source
                const img = document.querySelector(
                    "body > div.cgd-page.mm-page.mm-slideout > div > div:nth-child(2) > div.cgd-col.cgd-24u.cmo-primary > div.cmo-mod.cmo-product > div.bd > div > div > div:nth-child(1) > div > div.bd > div > img"
                );
                const src = img ? img.getAttribute("src") : null;
        
                // Extract price
                const priceElement = document.querySelector(".price-final");
                const curprice = priceElement ? priceElement.textContent : null;
        
                // Find and parse JSON data
                let jsonData = { dates: null, prices: null };
                const scripts = document.querySelectorAll("script");
                for (let script of scripts) {
                    if (script.textContent.includes("var data =")) {
                        try {
                            const jsonString = script.textContent.match(/var\s+data\s*=\s*(.*);/)[1];
                            jsonData = JSON.parse(jsonString);
                            break;
                        } catch (error) {
                            console.warn("Error parsing JSON data:", error);
                        }
                    }
                }
        
                // Return structured data, including null for missing elements
                return {
                    dates: jsonData.dates || null,
                    prices: jsonData.prices || null,
                    title: titleText,
                    image: src,
                    currentprice: curprice,
                };
            } catch (error) {
                console.error("Error extracting data in page.evaluate:", error);
                return null;
            }
        });

        if (!data) {
            return res.status(500).json({ error: "Failed to extract data from the page" });
        }

        res.json(data);

    } catch (error) {
        console.error("Error during Puppeteer processing:", error);
        res.status(500).json({ error: "An error occurred while processing the request" });
    } finally {
        if (browser) await browser.close();
    }
});

app.post('/api/compare', async (req, res) => {
    const { link1, link2 } = req.body;
    let browser;
    try {
        // Launch Puppeteer with minimal permissions for security
        browser = await puppeteer.launch({ 
            headless: true, 
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });

        // Open pages concurrently and set user agents
        const [page1, page2] = await Promise.all([browser.newPage(), browser.newPage()]);
        const userAgent = randomUseragent.getRandom();
        await Promise.all([page1.setUserAgent(userAgent), page2.setUserAgent(userAgent)]);

        // Navigate to product URLs and wait for page load
        await Promise.all([
            page1.goto(link1, { waitUntil: 'networkidle2', timeout: 120000 }),
            page2.goto(link2, { waitUntil: 'networkidle2', timeout: 120000 })
        ]);

        // Remove unnecessary tags and retrieve cleaned HTML content
        await Promise.all([
            page1.evaluate(() => document.querySelectorAll('script, style, meta, link').forEach(tag => tag.remove())),
            page2.evaluate(() => document.querySelectorAll('script, style, meta, link').forEach(tag => tag.remove()))
        ]);
        const [cleanedHtml1, cleanedHtml2] = await Promise.all([page1.content(), page2.content()]);

        // Prompt for generalized product comparison
        const description = `
            Compare two products based on their specifications to verify similarity. 
            Return the information as an array format, where each item is an array containing three elements: 
            the feature name, Product 1 specification, and Product 2 specification. 
            Do not create new lines or include 'json'. 
            Do not add any extra commas. follow proper json syntax.
            Only return the main array and the array items inside it. 
            Include the product name as the first row and 'Color' as a feature.
            Include the image link as the second row.
            Always try to get same features for both products. Match the features for both the products.
            Do not include extra content or recommendations. 
            Include a minimum of 10 features.
        `;
        const comparisonPrompt = `
            Extract the relevant information from the following content: 
            Product 1: ${cleanedHtml1} 
            Product 2: ${cleanedHtml2}. 
            Only include data that directly matches the provided description: ${description}.
            If the products are not similar (eg: if product 1 is laptop and product 2 is mobile phone), dont print anything else just return [notsimilar]
        `;

        // Assuming model.generateContent is an API for AI processing of the HTML content
        const comparisonResult = await model.generateContent([comparisonPrompt]);

        // Check for result validity
        const resultText = comparisonResult.response.text().trim();
        console.log(resultText);
        if (resultText === "notsimilar") return res.status(400).json({ error: "notsimilar" });
        if (!resultText || resultText === '[null]') return res.status(400).json({ error: "data not found" });

        // Return parsed comparison result
        const data = JSON.parse(resultText);
        res.json({ comparisonResult: data });

    } catch (error) {
        console.error("Error during processing:", error);
        res.status(500).json({ error: "An error occurred while processing the request" });
    } finally {
        if (browser) await browser.close();
    }
});


app.post('/api/psuggest', async (req, res) => {
    var phoneFormData = req.body;
    const { brand, minPrice, maxPrice, selectedRams, selectedStorage, selectedBattery, selectedScreen, selectedClock } = phoneFormData
    // Building Flipkart URL
    var flipkartUrl = `https://www.flipkart.com/search?q=mobiles&sort=popularity&p%5B%5D=facets.price_range.from%3D${minPrice}&p%5B%5D=facets.price_range.to%3D${maxPrice}`;
    if(brand && brand.length > 0){
        brand.forEach(brand => {
            flipkartUrl = flipkartUrl+`&p%5B%5D=facets.brand%255B%255D%3D${brand}`
        });
    }
    if(selectedRams && selectedRams.length > 0){
        selectedRams.forEach(ram => {
            ram = ram.replace(/\s+/g, '%2B');
            ram = ram.replace(/&/g, '%2526');
            flipkartUrl = flipkartUrl+`&p%5B%5D=facets.ram%255B%255D%3D${ram}`
        });
    }
    if(selectedStorage && selectedStorage.length > 0){
        selectedStorage.forEach(storage => {
            storage = storage.replace(/\s+/g, '%2B');
            storage = storage.replace(/&/g, '%2526');
            flipkartUrl = flipkartUrl+`&p%5B%5D=facets.internal_storage%255B%255D%3D${storage}`
        })
    }
    if(selectedBattery && selectedBattery.length > 0){
        selectedBattery.forEach(battery => {
            battery = battery.replace(/\s+/g, '%2B');
            battery = battery.replace(/&/g, '%2526');
            flipkartUrl = flipkartUrl+`&p%5B%5D=facets.battery_capacity%255B%255D%3D${battery}`
        })
    }
    if(selectedScreen && selectedScreen.length > 0){
        selectedScreen.forEach(screen => {
            screen = screen.replace(/\s+/g, '%2B');
            screen = screen.replace(/&/g, '%2526');
            flipkartUrl = flipkartUrl+`&p%5B%5D=facets.screen_size%255B%255D%3D${screen}`
        })
    }
    if(selectedClock && selectedClock.length > 0){
        selectedClock.forEach(clock => {
            clock = clock.replace(/\s+/g, '%2B');
            clock = clock.replace(/&/g, '%2526');
            flipkartUrl = flipkartUrl+`&p%5B%5D=facets.clock_speed%255B%255D%3D${clock}`
        })
    }
    // Building Amazon URL
    
    
    // Launch puppeteer
    let browser;
    try {
        browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
         });
        const flipkartpage = await browser.newPage();
        const userAgent = randomUseragent.getRandom();
        await flipkartpage.setUserAgent(userAgent);

        // Navigate to the URL
        await flipkartpage.goto(flipkartUrl, { 
            waitUntil: 'networkidle0'
        });

        // Extract data
        // Flipkart
        await flipkartpage.evaluate(() => {
            const tagsToRemove = document.querySelectorAll('script, style, meta, link');
            tagsToRemove.forEach(tag => tag.remove());
        });
        const flipkartCleanedHtml = await flipkartpage.content();
        const description = 'Find the top 3 all different best price-to-specs ratio mobile phone. phones shouldnt be same and must be diferent. if there are less than 3 phones then only output those phones. if there are devices in the result then add them as well but max will be 3. The output should be in this format: [product_name, product_ram, product_internal_storage, product_battery_capacity, product_price, product_flipkart_link, product_image_src]. do not include any other information in this. ignore any mobile color or any other info. for product link add https://flipkart.com as prefix. some devices especially apple devices wont have some info like ram, battery etc, dont set it to null, set ram , battery, etc to "NA"'
        const flipkartprompt = `
            You are tasked with extracting specific information from the following text content: ${flipkartCleanedHtml}. 
            Only extract the information that directly matches the provided description: ${description}.
            No extra content or explanations should be included. 
            If no information matches the description, return [null]. 
            Your output should contain only the data that is explicitly requested, with no other text.
            Do not include any recommendations`
        const flipkartresult = (await model.generateContent([flipkartprompt])).response.text();
        if (flipkartresult.trim() === '[null]') {
            // Handle the empty response here
            res.send("noproducts")
        }
        else {
            const flipkartproductsArray = flipkartresult.match(/\[.*?\]/g);
            const flipkartparsedProducts = flipkartproductsArray.map(productString => {
                const regex = /\[(.*?), (\d+ GB|NA), (\d+ GB|NA), (\d+ mAh|NA), (₹[\d,]+), (https?:\/\/[^\s\]]+), (https?:\/\/[^\s\]]+)\]/;
                const match = productString.match(regex);
                if (match) {
                    return {
                        productName: match[1],
                        ram: match[2],
                        internalStorage: match[3],
                        batteryCapacity: match[4],
                        price: match[5],
                        flipkartDirectUrl: match[6],
                        imageUrl: match[7]
                    }; 
                } else {
                    return null; // In case of no match, return null or handle error as needed
                }
            }).filter(Boolean);

            // Send the extracted data as a response
            res.json(flipkartparsedProducts);
        }
    } catch (error) {
        console.error("Error during Puppeteer processing:", error);
        res.status(500).json({ error: "An error occurred while processing the request" });
    } finally {
        if (browser) await browser.close();
    }
});

app.post('/api/lsuggest', async (req, res) => {
    var laptopFormData = req.body;
    const { brand, minPrice, maxPrice, selectedRams, selectedSSD, selectedGraphics, selectedScreen, selectedGraphicsMemory, selectedHDD, selectedProcessor } = laptopFormData
    // Building Flipkart URL
    var flipkartUrl = `https://www.flipkart.com/search?q=laptops&sort=popularity&p%5B%5D=facets.price_range.from%3D${minPrice}&p%5B%5D=facets.price_range.to%3D${maxPrice}`;
    if(brand && brand.length > 0){
        brand.forEach(brand => {
            flipkartUrl = flipkartUrl+`&p%5B%5D=facets.brand%255B%255D%3D${brand}`
        });
    }
    if(selectedRams && selectedRams.length > 0){
        selectedRams.forEach(ram => {
            ram = ram.replace(/\s+/g, '%2B');
            ram = ram.replace(/&/g, '%2526');
            flipkartUrl = flipkartUrl+`&p%5B%5D=facets.system_memory%255B%255D%3D${ram}`
        });
    }
    if(selectedSSD && selectedSSD.length > 0){
        selectedSSD.forEach(ssd => {
            ssd = ssd.replace(/\s+/g, '%2B');
            ssd = ssd.replace(/&/g, '%2526');
            flipkartUrl = flipkartUrl+`&p%5B%5D=facets.ssd_capacity%255B%255D%3D${ssd}`
        })
    }
    if(selectedGraphics && selectedGraphics.length > 0){
        selectedGraphics.forEach(graphics => {
            graphics = graphics.replace(/\s+/g, '%2B');
            graphics = graphics.replace(/&/g, '%2526');
            flipkartUrl = flipkartUrl+`&p%5B%5D=facets.graphic_processor_name%255B%255D%3D${graphics}`
        })
    }
    if(selectedScreen && selectedScreen.length > 0){
        selectedScreen.forEach(screen => {
            screen = screen.replace(/\s+/g, '%2B');
            screen = screen.replace(/&/g, '%2526');
            flipkartUrl = flipkartUrl+`&p%5B%5D=facets.screen_size%255B%255D%3D${screen}`
        })
    }
    if(selectedGraphicsMemory && selectedGraphicsMemory.length > 0){
        selectedGraphicsMemory.forEach(gram => {
            gram = gram.replace(/\s+/g, '%2B');
            gram = gram.replace(/&/g, '%2526');
            flipkartUrl = flipkartUrl+`&p%5B%5D=facets.dedicated_graphics_memory%255B%255D%3D${gram}`
        })
    }
    if(selectedHDD && selectedHDD.length > 0){
        selectedHDD.forEach(hdd => {
            hdd = hdd.replace(/\s+/g, '%2B');
            hdd = hdd.replace(/&/g, '%2526');
            flipkartUrl = flipkartUrl+`&p%5B%5D=facets.hard_disk_capacity%255B%255D%3D${hdd}`
        })
    }
    if(selectedProcessor && selectedProcessor.length > 0){
        selectedProcessor.forEach(processor => {
            processor = processor.replace(/\s+/g, '%2B');
            processor = processor.replace(/&/g, '%2526');
            flipkartUrl = flipkartUrl+`&p%5B%5D=facets.processor_brand%255B%255D%3D${processor}`
        })
    }
    // Building Amazon URL
    
    
    // Launch puppeteer
    let browser;
    try {
        browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
         });
        const flipkartpage = await browser.newPage();
        const userAgent = randomUseragent.getRandom();
        await flipkartpage.setUserAgent(userAgent);

        // Navigate to the URL
        await flipkartpage.goto(flipkartUrl, { 
            waitUntil: 'networkidle0'
        });

        // Extract data
        // Flipkart
        await flipkartpage.evaluate(() => {
            const tagsToRemove = document.querySelectorAll('script, style, meta, link');
            tagsToRemove.forEach(tag => tag.remove());
        });
        const flipkartCleanedHtml = await flipkartpage.content();
        const description = 'Find the top 3 all different best price-to-specs ratio laptops. laptops shouldnt be same and must be diferent. if there are less than 3 laptops then only output those phones. if there are devices in the result then add them as well but max will be 3. The output should be in this format: [product_name, product_ram, product_graphics_card, product_processor, product_screen_size, product_price, product_flipkart_link, product_image_src]. do not include any other information in this. ignore any laptop color or any other info. for product link add https://flipkart.com as prefix. some devices wont have some info like ram, graphics etc, dont set it to null, set ram , graphics, other etc to "NA"'
        const flipkartprompt = `
            You are tasked with extracting specific information from the following text content: ${flipkartCleanedHtml}. 
            Only extract the information that directly matches the provided description: ${description}.
            No extra content or explanations should be included. 
            If no information matches the description, return [null]. 
            Your output should contain only the data that is explicitly requested, with no other text.
            Do not include any recommendations`
        const flipkartresult = (await model.generateContent([flipkartprompt])).response.text();
        if (flipkartresult.trim() === '[null]') {
            // Handle the empty response here
            res.send("noproducts")
        }
        else {
            const flipkartproductsArray = flipkartresult.match(/\[.*?\]/g);
            const flipkartparsedProducts = flipkartproductsArray.map(productString => {
                const regex = /\[([^,]+), (\d+ GB|NA), ([^,]+|NA), ([^,]+|NA), ([^,]+|NA), (₹[\d,]+), (https?:\/\/[^\s\]]+), (https?:\/\/[^\s\]]+)\]/;
                const match = productString.match(regex);
                if (match) {
                    return {
                        productName: match[1],
                        ram: match[2],
                        graphicsCard: match[3],
                        processor: match[4],
                        screenSize: match[5],
                        price: match[6],
                        flipkartDirectUrl: match[7],
                        imageUrl: match[8]
                    }; 
                } else {
                    return null; // In case of no match, return null or handle error as needed
                }
            }).filter(Boolean);

            // Send the extracted data as a response
            res.json(flipkartparsedProducts);
        }
    } catch (error) {
        console.error("Error during Puppeteer processing:", error);
        res.status(500).json({ error: "An error occurred while processing the request" });
    } finally {
        if (browser) await browser.close();
    }
});
// Start the server
app.listen(5000, () => {
    console.log("Welcome to ShopScout. You are listening on port 5000");
});
