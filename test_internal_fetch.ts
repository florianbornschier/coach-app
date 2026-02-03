import { fetchInstagramProfile } from './lib/instagram-api';

async function testFetch() {
    const apiKey = '5bc5d003-4cc3-4e2e-8497-4b3302a3f1bc';
    const username = 'tomvorwald';

    console.log(`Testing fetchInstagramProfile for @${username}...`);

    try {
        const profile = await fetchInstagramProfile(username, apiKey);
        if (profile) {
            console.log('Successfully fetched and mapped profile:');
            console.log(JSON.stringify(profile, null, 2));
        } else {
            console.log('Profile was skipped (likely not German).');
        }
    } catch (error) {
        console.error('Error fetching profile:', error);
    }
}

testFetch();
