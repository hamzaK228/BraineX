/**
 * Database Seed Script
 * Reads all JSON data files and inserts them into MongoDB.
 * Creates an initial super_admin account.
 *
 * Usage: node scripts/seed-database.js
 */
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { readFile } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env') });

// Import models
import User from '../backend/models/User.js';
import Scholarship from '../backend/models/Scholarship.js';
import Mentor from '../backend/models/Mentor.js';
import Field from '../backend/models/Field.js';
import Event from '../backend/models/Event.js';
import University from '../backend/models/University.js';
import Program from '../backend/models/Program.js';
import Project from '../backend/models/Project.js';
import Roadmap from '../backend/models/Roadmap.js';

const DATA_DIR = path.join(__dirname, '..', 'backend', 'data');

/**
 * Read a JSON data file
 */
async function loadJsonFile(filename) {
    try {
        const filePath = path.join(DATA_DIR, filename);
        const raw = await readFile(filePath, 'utf8');
        const data = JSON.parse(raw);
        return Array.isArray(data) ? data : [];
    } catch (error) {
        console.warn(`  ⚠️  Could not read ${filename}: ${error.message}`);
        return [];
    }
}

/**
 * Seed a collection if it's empty
 */
async function seedCollection(Model, modelName, filename) {
    const count = await Model.countDocuments();
    if (count > 0) {
        console.log(`  ⏭️  ${modelName}: ${count} documents already exist, skipping`);
        return count;
    }

    const data = await loadJsonFile(filename);
    if (data.length === 0) {
        console.log(`  📭 ${modelName}: No data found in ${filename}`);
        return 0;
    }

    // Remove numeric 'id' field from each document (let MongoDB generate _id)
    const cleanData = data.map(({ id, _id, ...rest }) => rest);

    try {
        const result = await Model.insertMany(cleanData, { ordered: false });
        console.log(`  ✅ ${modelName}: Seeded ${result.length} documents`);
        return result.length;
    } catch (error) {
        // Handle duplicate key errors gracefully
        if (error.code === 11000) {
            console.log(`  ⚠️  ${modelName}: Some duplicates skipped, inserted others`);
            return error.insertedDocs?.length || 0;
        }
        console.error(`  ❌ ${modelName}: Error seeding - ${error.message}`);
        return 0;
    }
}

async function createAdminAccount() {
    const adminEmail = 'admin@brainex.com';

    try {
        // Use findOneAndUpdate with upsert to be fully idempotent
        const admin = await User.findOneAndUpdate(
            { email: adminEmail },
            {
                $setOnInsert: {
                    firstName: 'Super',
                    lastName: 'Admin',
                    email: adminEmail,
                    password: 'Admin123!',
                    role: 'super_admin',
                    isVerified: true,
                    isActive: true,
                },
            },
            {
                upsert: true,
                new: true,
                setDefaultsOnInsert: true,
            }
        );

        console.log(`  ✅ Super_admin account is ready: ${admin.email}`);
    } catch (error) {
        if (error.code === 11000) {
            console.log(`  ⏭️  Admin account already exists (${adminEmail})`);
            return;
        }
        console.error(`  ❌ Failed to create admin account: ${error.message}`);
    }
}

/**
 * Main seed function
 */
async function seed() {
    console.log('\n🌱 BraineX Database Seeder\n');
    console.log('━'.repeat(50));

    // Connect to MongoDB
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/brainex_db';
    console.log(`📡 Connecting to MongoDB...`);

    try {
        await mongoose.connect(uri, {
            serverSelectionTimeoutMS: 10000,
        });
        console.log(`✅ Connected to MongoDB: ${mongoose.connection.host}\n`);
    } catch (error) {
        console.error(`❌ Failed to connect to MongoDB: ${error.message}`);
        console.error(`   Make sure MONGODB_URI is set correctly in .env`);
        process.exit(1);
    }

    console.log('📦 Seeding collections...\n');

    // Seed all collections
    const results = {};
    results.scholarships = await seedCollection(Scholarship, 'Scholarships', 'scholarships.json');
    results.mentors = await seedCollection(Mentor, 'Mentors', 'mentors.json');
    results.fields = await seedCollection(Field, 'Fields', 'fields.json');
    results.events = await seedCollection(Event, 'Events', 'events.json');
    results.universities = await seedCollection(University, 'Universities', 'universities.json');
    results.programs = await seedCollection(Program, 'Programs', 'programs.json');
    results.projects = await seedCollection(Project, 'Projects', 'projects.json');
    results.roadmaps = await seedCollection(Roadmap, 'Roadmaps', 'roadmaps.json');

    // Create admin account
    console.log('\n👤 Admin Account...\n');
    await createAdminAccount();

    // Summary
    console.log('\n' + '━'.repeat(50));
    console.log('📊 Seed Summary:');
    for (const [name, count] of Object.entries(results)) {
        console.log(`   ${name.padEnd(15)}: ${count} documents`);
    }
    console.log('━'.repeat(50));

    // Disconnect
    await mongoose.connection.close();
    console.log('\n✅ Seeding complete! Database connection closed.\n');
}

// Run
seed().catch((error) => {
    console.error('Fatal seed error:', error);
    process.exit(1);
});
