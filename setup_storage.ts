import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupStorage() {
    console.log('Checking/Creating Supabase Storage bucket: "profile-pictures"');

    const { data: buckets, error: listError } = await supabase.storage.listBuckets();

    if (listError) {
        console.error('Error listing buckets:', listError.message);
        return;
    }

    const bucketExists = buckets.find(b => b.name === 'profile-pictures');

    if (bucketExists) {
        console.log('✅ Bucket "profile-pictures" already exists.');
    } else {
        console.log('Creating "profile-pictures" bucket...');
        const { data, error } = await supabase.storage.createBucket('profile-pictures', {
            public: true,
            fileSizeLimit: 1024 * 1024 * 2, // 2MB
            allowedMimeTypes: ['image/png', 'image/jpeg', 'image/jpg', 'image/webp']
        });

        if (error) {
            console.error('❌ Error creating bucket:', error.message);
        } else {
            console.log('✅ Bucket "profile-pictures" created successfully!');
        }
    }
}

setupStorage();
