const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Organizer = require('./src/models/Organizer');
const connectDB = require('./src/config/db');

dotenv.config();

connectDB();

const freefireData = [
  {
    slug: "nexus",
    game: "freefire",
    name: "Team Nexus",
    description: "The strategic masterminds behind the tournament brackets and scheduling.",
    color: "#ec4899",
    members: [
      { name: "Rahul Das", role: "Lead Coordinator", mobile: "+91 98765 43210", branch: "CSE", college: "VSSUT Burla", year: "Final Year" },
      { name: "Sneha Patel", role: "Event Manager", mobile: "+91 98765 43211", branch: "IT", college: "VSSUT Burla", year: "3rd Year" },
      { name: "Rohit Verma", role: "Scheduler", mobile: "+91 98765 43214", branch: "ETC", college: "VSSUT Burla", year: "2nd Year" },
    ]
  },
  {
    slug: "original-god",
    game: "freefire",
    name: "Team Original God",
    description: "The technical wizards ensuring lag-free streams and seamless production.",
    color: "#8b5cf6",
    members: [
      { name: "Amit Kumar", role: "Tech Head", mobile: "+91 98765 43212", branch: "CSE", college: "VSSUT Burla", year: "3rd Year" },
      { name: "Priya Singh", role: "Lead Caster", mobile: "+91 98765 43213", branch: "EE", college: "VSSUT Burla", year: "Final Year" },
      { name: "Vikram Roy", role: "Moderator", mobile: "+91 98765 43215", branch: "ME", college: "VSSUT Burla", year: "2nd Year" },
    ]
  }
];

const bgmiData = [
  {
    slug: "dominators",
    game: "bgmi",
    name: "Team Dominators",
    description: "The strategic masterminds managing the Erangel battlegrounds.",
    color: "#f97316",
    members: [
      { name: "Arjun Singh", role: "Tournament Lead", mobile: "+91 91234 56780", branch: "CSE", college: "VSSUT Burla", year: "Final Year" },
      { name: "Rohan Das", role: "Room Manager", mobile: "+91 91234 56781", branch: "EEE", college: "VSSUT Burla", year: "3rd Year" },
      { name: "Kiran Rao", role: "Scorer", mobile: "+91 91234 56782", branch: "Civil", college: "VSSUT Burla", year: "2nd Year" },
    ]
  },
  {
    slug: "frag-ops",
    game: "bgmi",
    name: "Team Frag Ops",
    description: "Ensuring fair play and zero tolerance for hackers.",
    color: "#ea580c",
    members: [
      { name: "Suresh P.", role: "Anti-Cheat Lead", mobile: "+91 91234 56783", branch: "IT", college: "VSSUT Burla", year: "3rd Year" },
      { name: "Meera K.", role: "Community Mod", mobile: "+91 91234 56784", branch: "ETC", college: "VSSUT Burla", year: "2nd Year" },
    ]
  }
];

const valorantData = [
  {
    slug: "vanguard",
    game: "valorant",
    name: "Team Vanguard",
    description: "The tactical minds designing custom lobbies and scrim schedules.",
    color: "#ff4655",
    members: [
      { name: "Vikram Singh", role: "Head Marshall", mobile: "+91 95555 12345", branch: "CSE", college: "VSSUT Burla", year: "Final Year" },
      { name: "Anita Roy", role: "Production Lead", mobile: "+91 95555 12346", branch: "IT", college: "VSSUT Burla", year: "3rd Year" },
    ]
  },
  {
    slug: "sentinels-ops",
    game: "valorant",
    name: "Team Sentinels Ops",
    description: "Maintaining competitive integrity and observer feeds.",
    color: "#bd3944",
    members: [
      { name: "Kunal Jain", role: "Observer", mobile: "+91 95555 12347", branch: "ETC", college: "VSSUT Burla", year: "2nd Year" },
      { name: "Priya P.", role: "Discord Mod", mobile: "+91 95555 12348", branch: "EEE", college: "VSSUT Burla", year: "Final Year" },
    ]
  }
];

const importData = async () => {
  try {
    console.log('Clearing old Organizers...');
    await Organizer.deleteMany();

    console.log('Importing FreeFire Data...');
    await Organizer.insertMany(freefireData);

    console.log('Importing BGMI Data...');
    await Organizer.insertMany(bgmiData);

    console.log('Importing Valorant Data...');
    await Organizer.insertMany(valorantData);

    console.log('Data Imported!');
    process.exit();
  } catch (error) {
    console.error(`Error: ${error}`);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await Organizer.deleteMany();
    console.log('Data Destroyed!');
    process.exit();
  } catch (error) {
    console.error(`Error: ${error}`);
    process.exit(1);
  }
};

if (process.argv[2] === '-d') {
  destroyData();
} else {
  importData();
}
