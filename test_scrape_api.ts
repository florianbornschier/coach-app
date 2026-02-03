async function testInternalScrape() {
    const username = 'tomvorwald';
    console.log(`Testing internal scrape for @${username}...`);

    try {
        const response = await fetch('http://localhost:3000/api/instagram/scrape', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username })
        });

        console.log(`Status: ${response.status}`);
        const data = await response.json();
        console.log('Response:', JSON.stringify(data, null, 2));
    } catch (err) {
        console.error('Error:', err);
    }
}

testInternalScrape();
