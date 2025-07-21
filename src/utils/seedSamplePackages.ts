// Sample package data seeder - Run this in the admin console to add sample packages
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const samplePackages = [
  {
    title: "Kashmir Paradise",
    images: [
      "https://media.istockphoto.com/id/1323846766/photo/a-beautiful-view-of-dal-lake-in-winter-srinagar-kashmir-india.jpg?s=612x612&w=0&k=20&c=Dp3peie2t-jdLEmqe4W-DD09GACu2Cr-JjHHeB6rpBc=",
      "https://images.pexels.com/photos/417074/pexels-photo-417074.jpeg",
      "https://images.pexels.com/photos/3408744/pexels-photo-3408744.jpeg"
    ],
    days: "5N/6D",
    price: 35999,
    location: "Srinagar, Gulmarg, Pahalgam",
    category: "domestic",
    overview: "Discover the breathtaking beauty of Kashmir, often referred to as 'Paradise on Earth'. This comprehensive tour package takes you through the most scenic locations in the Kashmir valley.",
    highlights: [
      "Shikara ride on the serene Dal Lake",
      "Visit to the famous Mughal Gardens",
      "Gondola ride in Gulmarg with panoramic views",
      "Explore the beautiful Betaab Valley",
      "Visit Chandanwari and Aru Valley in Pahalgam"
    ],
    inclusions: [
      "5 nights accommodation in 3-star hotels",
      "Daily breakfast and dinner",
      "All transfers and sightseeing by private vehicle",
      "English-speaking tour guide",
      "All applicable taxes and service charges",
      "Airport pickup and drop-off"
    ],
    exclusions: [
      "Airfare to and from Srinagar",
      "Lunch and personal expenses",
      "Optional activities mentioned in the itinerary",
      "Travel insurance",
      "Anything not mentioned in inclusions"
    ],
    itinerary: [
      {
        day: "Day 1",
        title: "Arrival in Srinagar",
        description: "Arrive at Srinagar Airport, where our representative will greet you and transfer you to the houseboat. After check-in, enjoy a relaxing Shikara ride on Dal Lake."
      },
      {
        day: "Day 2",
        title: "Srinagar Sightseeing",
        description: "After breakfast, visit the famous Mughal Gardens including Nishat Bagh, Shalimar Bagh, and Chashme Shahi."
      },
      {
        day: "Day 3",
        title: "Srinagar to Gulmarg",
        description: "After breakfast, check out from the houseboat and drive to Gulmarg. Known as the 'Meadow of Flowers', enjoy the Gondola ride."
      }
    ],
    maxPeople: 15,
    duration: "6 Days, 5 Nights",
    departureInfo: "Daily departures available",
    minAge: 5,
    featured: true,
    status: "active"
  },
  {
    title: "Kerala Backwaters",
    images: [
      "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/2c/f3/1b/4a/alleppey-backwater-cruise.jpg?w=1200&h=-1&s=1",
      "https://images.pexels.com/photos/962464/pexels-photo-962464.jpeg",
      "https://images.pexels.com/photos/3408744/pexels-photo-3408744.jpeg"
    ],
    days: "4N/5D",
    price: 25999,
    location: "Kochi, Munnar, Alleppey",
    category: "domestic",
    overview: "Experience the serene beauty of God's Own Country with our Kerala Backwaters tour package. This journey takes you through lush green landscapes and tranquil backwaters.",
    highlights: [
      "Overnight stay in a traditional houseboat",
      "Visit to the famous tea plantations in Munnar",
      "Traditional Kathakali dance performance",
      "Spice garden tour with expert guides",
      "Explore the historic Fort Kochi area"
    ],
    inclusions: [
      "4 nights accommodation (2 nights in hotels, 1 night in houseboat, 1 night in resort)",
      "Daily breakfast and dinner",
      "Houseboat stay with all meals included",
      "All transfers and sightseeing by private vehicle",
      "English-speaking tour guide"
    ],
    exclusions: [
      "Airfare to Kochi and from Cochin",
      "Personal expenses and tips",
      "Optional activities not mentioned in the itinerary",
      "Travel insurance",
      "Camera fees at monuments"
    ],
    itinerary: [
      {
        day: "Day 1",
        title: "Arrival in Kochi",
        description: "Arrive at Kochi International Airport, visit Fort Kochi area, including the Chinese Fishing Nets, St. Francis Church."
      },
      {
        day: "Day 2",
        title: "Kochi to Munnar",
        description: "After breakfast, drive to Munnar, famous for its tea plantations and scenic beauty."
      }
    ],
    maxPeople: 12,
    duration: "5 Days, 4 Nights",
    departureInfo: "Monday, Wednesday, Friday",
    minAge: 0,
    featured: true,
    status: "active"
  },
  {
    title: "Dubai Adventure",
    images: [
      "https://media.tacdn.com/media/attractions-splice-spp-674x446/10/71/94/a2.jpg",
      "https://images.pexels.com/photos/1442731/pexels-photo-1442731.jpeg",
      "https://images.pexels.com/photos/2844734/pexels-photo-2844734.jpeg"
    ],
    days: "5N/6D",
    price: 65999,
    location: "Dubai, Abu Dhabi",
    category: "international",
    overview: "Experience the modern marvel of Dubai with its towering skyscrapers, luxury shopping, and thrilling desert adventures.",
    highlights: [
      "Desert Safari with BBQ dinner",
      "Visit to Burj Khalifa and Dubai Mall",
      "Ferrari World theme park in Abu Dhabi",
      "Dubai Miracle Garden visit",
      "Traditional dhow cruise dinner"
    ],
    inclusions: [
      "5 nights accommodation in 4-star hotels",
      "Daily breakfast and dinner",
      "All transfers in private vehicle",
      "Desert safari with BBQ dinner",
      "Burj Khalifa tickets"
    ],
    exclusions: [
      "International airfare",
      "Dubai visa fees",
      "Personal expenses",
      "Optional activities",
      "Travel insurance"
    ],
    itinerary: [
      {
        day: "Day 1",
        title: "Arrival in Dubai",
        description: "Arrive at Dubai International Airport, transfer to hotel, evening at leisure."
      },
      {
        day: "Day 2",
        title: "Dubai City Tour",
        description: "Visit Burj Khalifa, Dubai Mall, Dubai Fountain, and traditional Gold and Spice Souks."
      }
    ],
    maxPeople: 20,
    duration: "6 Days, 5 Nights",
    departureInfo: "Daily departures available",
    minAge: 0,
    featured: true,
    status: "active"
  }
];

export const seedSamplePackages = async () => {
  try {
    console.log('Seeding sample packages...');
    
    for (const packageData of samplePackages) {
      const docData = {
        ...packageData,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
        created_by: 'admin@anandtravels.com',
        rating: 4.5 + Math.random() * 0.5, // Random rating between 4.5-5.0
        reviews: Math.floor(Math.random() * 200) + 50 // Random reviews between 50-250
      };
      
      await addDoc(collection(db, 'packages'), docData);
      console.log(`Added package: ${packageData.title}`);
    }
    
    console.log('Sample packages seeded successfully!');
  } catch (error) {
    console.error('Error seeding packages:', error);
  }
};
