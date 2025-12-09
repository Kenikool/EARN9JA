const mongoose = require("mongoose");
require("dotenv").config();

const User = require("../models/User");
const Property = require("../models/Property");

const MONGODB_URI = process.env.MONGODB_URI;

const sampleProperties = [
  {
    title: "Modern Downtown Loft",
    description:
      "Stunning loft in the heart of downtown with exposed brick walls, high ceilings, and floor-to-ceiling windows. Walking distance to restaurants, shops, and entertainment.",
    propertyType: "apartment",
    listingType: "sale",
    price: 450000,
    address: {
      street: "123 Main Street",
      city: "San Francisco",
      state: "CA",
      zipCode: "94102",
      country: "USA",
    },
    location: {
      type: "Point",
      coordinates: [-122.4194, 37.7749],
    },
    features: {
      bedrooms: 2,
      bathrooms: 2,
      area: 1200,
      yearBuilt: 2018,
      parking: 1,
    },
    amenities: ["Gym", "Rooftop Deck", "Concierge", "Pet Friendly"],
    images: [
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800",
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800",
    ],
    status: "active",
    featured: true,
  },
  {
    title: "Luxury Beachfront Villa",
    description:
      "Breathtaking ocean views from this stunning 4-bedroom villa. Private beach access, infinity pool, and modern amenities throughout.",
    propertyType: "house",
    listingType: "sale",
    price: 2500000,
    address: {
      street: "456 Ocean Drive",
      city: "Miami",
      state: "FL",
      zipCode: "33139",
      country: "USA",
    },
    location: {
      type: "Point",
      coordinates: [-80.13, 25.7907],
    },
    features: {
      bedrooms: 4,
      bathrooms: 3,
      area: 3500,
      lotSize: 8000,
      yearBuilt: 2020,
      parking: 3,
      floors: 2,
    },
    amenities: [
      "Pool",
      "Beach Access",
      "Smart Home",
      "Wine Cellar",
      "Home Theater",
    ],
    images: [
      "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800",
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800",
    ],
    status: "active",
    featured: true,
  },
  {
    title: "Cozy Suburban Family Home",
    description:
      "Perfect family home in quiet neighborhood. Large backyard, updated kitchen, and close to top-rated schools.",
    propertyType: "house",
    listingType: "sale",
    price: 385000,
    address: {
      street: "789 Maple Avenue",
      city: "Austin",
      state: "TX",
      zipCode: "78701",
      country: "USA",
    },
    location: {
      type: "Point",
      coordinates: [-97.7431, 30.2672],
    },
    features: {
      bedrooms: 3,
      bathrooms: 2,
      area: 1800,
      lotSize: 6000,
      yearBuilt: 2015,
      parking: 2,
    },
    amenities: ["Backyard", "Fireplace", "Updated Kitchen", "Hardwood Floors"],
    images: [
      "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800",
      "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800",
    ],
    status: "active",
    featured: false,
  },
  {
    title: "Downtown Studio Apartment",
    description:
      "Efficient studio in prime location. Perfect for young professionals. Building amenities include gym and rooftop lounge.",
    propertyType: "apartment",
    listingType: "rent",
    price: 1800,
    address: {
      street: "321 Broadway",
      city: "New York",
      state: "NY",
      zipCode: "10007",
      country: "USA",
    },
    location: {
      type: "Point",
      coordinates: [-74.006, 40.7128],
    },
    features: {
      bedrooms: 1,
      bathrooms: 1,
      area: 550,
      yearBuilt: 2019,
      parking: 0,
    },
    amenities: ["Gym", "Doorman", "Laundry", "Rooftop"],
    images: [
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800",
    ],
    status: "active",
    featured: false,
  },
  {
    title: "Mountain View Cabin",
    description:
      "Rustic cabin with modern updates. Stunning mountain views, wood-burning fireplace, and large deck for entertaining.",
    propertyType: "house",
    listingType: "sale",
    price: 525000,
    address: {
      street: "555 Pine Ridge Road",
      city: "Denver",
      state: "CO",
      zipCode: "80202",
      country: "USA",
    },
    location: {
      type: "Point",
      coordinates: [-104.9903, 39.7392],
    },
    features: {
      bedrooms: 3,
      bathrooms: 2,
      area: 2000,
      lotSize: 10000,
      yearBuilt: 2010,
      parking: 2,
    },
    amenities: ["Fireplace", "Mountain View", "Deck", "Hiking Trails"],
    images: [
      "https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=800",
    ],
    status: "active",
    featured: true,
  },
  {
    title: "Urban Penthouse Suite",
    description:
      "Luxurious penthouse with panoramic city views. Private elevator, chef's kitchen, and expansive terrace.",
    propertyType: "condo",
    listingType: "sale",
    price: 1850000,
    address: {
      street: "888 Skyline Boulevard",
      city: "Seattle",
      state: "WA",
      zipCode: "98101",
      country: "USA",
    },
    location: {
      type: "Point",
      coordinates: [-122.3321, 47.6062],
    },
    features: {
      bedrooms: 3,
      bathrooms: 3,
      area: 2800,
      yearBuilt: 2021,
      parking: 2,
      floors: 1,
    },
    amenities: ["Concierge", "Valet", "Pool", "Spa", "Private Terrace"],
    images: ["https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800"],
    status: "active",
    featured: true,
  },
  {
    title: "Charming Bungalow",
    description:
      "Renovated bungalow with original character. Hardwood floors, updated bathrooms, and lovely garden.",
    propertyType: "house",
    listingType: "sale",
    price: 295000,
    address: {
      street: "234 Oak Street",
      city: "Portland",
      state: "OR",
      zipCode: "97201",
      country: "USA",
    },
    location: {
      type: "Point",
      coordinates: [-122.675, 45.5152],
    },
    features: {
      bedrooms: 2,
      bathrooms: 1,
      area: 1100,
      lotSize: 4000,
      yearBuilt: 1925,
      parking: 1,
    },
    amenities: ["Garden", "Hardwood Floors", "Updated Kitchen"],
    images: [
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800",
    ],
    status: "active",
    featured: false,
  },
  {
    title: "Spacious Family Rental",
    description:
      "Large 4-bedroom home available for rent. Fenced yard, garage, and close to schools and parks.",
    propertyType: "house",
    listingType: "rent",
    price: 2500,
    address: {
      street: "567 Elm Drive",
      city: "Chicago",
      state: "IL",
      zipCode: "60601",
      country: "USA",
    },
    location: {
      type: "Point",
      coordinates: [-87.6298, 41.8781],
    },
    features: {
      bedrooms: 4,
      bathrooms: 2,
      area: 2200,
      lotSize: 5500,
      yearBuilt: 2012,
      parking: 2,
    },
    amenities: ["Fenced Yard", "Garage", "Basement", "Central AC"],
    images: [
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800",
    ],
    status: "active",
    featured: false,
  },
  {
    title: "Commercial Office Space",
    description:
      "Prime commercial space in business district. Open floor plan, conference rooms, and ample parking.",
    propertyType: "commercial",
    listingType: "rent",
    price: 5000,
    address: {
      street: "999 Business Park Drive",
      city: "Boston",
      state: "MA",
      zipCode: "02101",
      country: "USA",
    },
    location: {
      type: "Point",
      coordinates: [-71.0589, 42.3601],
    },
    features: {
      area: 3000,
      yearBuilt: 2018,
      parking: 10,
      floors: 1,
    },
    amenities: [
      "Conference Rooms",
      "Kitchen",
      "High-Speed Internet",
      "Security",
    ],
    images: [
      "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800",
    ],
    status: "active",
    featured: false,
  },
  {
    title: "Waterfront Condo",
    description:
      "Beautiful waterfront condo with marina views. Modern finishes, balcony, and resort-style amenities.",
    propertyType: "condo",
    listingType: "sale",
    price: 675000,
    address: {
      street: "777 Harbor Way",
      city: "San Diego",
      state: "CA",
      zipCode: "92101",
      country: "USA",
    },
    location: {
      type: "Point",
      coordinates: [-117.1611, 32.7157],
    },
    features: {
      bedrooms: 2,
      bathrooms: 2,
      area: 1400,
      yearBuilt: 2019,
      parking: 1,
    },
    amenities: ["Pool", "Gym", "Marina Access", "Balcony", "Concierge"],
    images: [
      "https://images.unsplash.com/photo-1515263487990-61b07816b324?w=800",
    ],
    status: "active",
    featured: true,
  },
];

async function seedDatabase() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");

    // Create a default agent user
    let agent = await User.findOne({ email: "agent@example.com" });

    if (!agent) {
      agent = await User.create({
        name: "John Smith",
        email: "agent@example.com",
        password: "password123",
        phone: "+1-555-0123",
        role: "agent",
        agentProfile: {
          licenseNumber: "RE-12345",
          agency: "Prime Real Estate",
          experience: 10,
          specializations: ["Residential", "Luxury Homes", "Waterfront"],
          bio: "Experienced real estate agent specializing in luxury properties.",
          verified: true,
        },
      });
      console.log("Created agent user");
    }

    // Clear existing properties
    await Property.deleteMany({});
    console.log("Cleared existing properties");

    // Add agent ID to all properties
    const propertiesWithAgent = sampleProperties.map((prop) => ({
      ...prop,
      agent: agent._id,
    }));

    // Insert sample properties
    const properties = await Property.insertMany(propertiesWithAgent);
    console.log(`✅ Successfully seeded ${properties.length} properties`);

    console.log("\n📊 Seed Summary:");
    console.log(`- Agent: ${agent.name} (${agent.email})`);
    console.log(`- Properties: ${properties.length}`);
    console.log(`- Featured: ${properties.filter((p) => p.featured).length}`);
    console.log(
      `- For Sale: ${properties.filter((p) => p.listingType === "sale").length}`
    );
    console.log(
      `- For Rent: ${properties.filter((p) => p.listingType === "rent").length}`
    );

    console.log("\n🔐 Login Credentials:");
    console.log("Email: agent@example.com");
    console.log("Password: password123");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
}

seedDatabase();
