// Using native fetch


async function testHasData() {
    const apiKey = '5bc5d003-4cc3-4e2e-8497-4b3302a3f1bc';
    const username = 'Florianbornschier.o1';

    console.log(`Testing HasData API for @${username}...`);

    try {
        const response = await fetch(
            `https://api.hasdata.com/scrape/instagram/profile?handle=${encodeURIComponent(username)}`,
            {
                method: 'GET',
                headers: {
                    'x-api-key': apiKey,
                    'Content-Type': 'application/json',
                },
            }
        );

        console.log(`Response status: ${response.status} ${response.statusText}`);

        if (response.ok) {
            const data = await response.json();
            console.log('Data returned:', JSON.stringify(data, null, 2));

            const bio = data.biography || '';
            const fullName = data.fullName || '';
            const text = `${bio} ${fullName}`.toLowerCase();

            const germanIndicators = [
                'deutschland', 'germany', 'deutsch', 'berlin', 'münchen', 'hamburg',
                'köln', 'frankfurt', 'stuttgart', 'düsseldorf', 'de', '🇩🇪', 'german',
                'deutsche', 'deutscher', 'deutschsprachig', 'wien', 'zürich', 'schweiz', 'österreich'
            ];

            const isGerman = germanIndicators.some(indicator => text.includes(indicator.toLowerCase()));
            console.log(`Is German (according to current logic)? ${isGerman}`);
        } else {
            const text = await response.text();
            console.log('Error status:', response.status);
            console.log('Error response body:', text);
        }
    } catch (error) {
        console.error('Fetch error:', error);
    }
}

testHasData();
