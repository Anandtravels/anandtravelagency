import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { MapPin, Calendar, Clock, Users, Check, Star, Image } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useToast } from "@/hooks/use-toast";
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

// This would normally come from the database
const packagesData = {
  domestic: [
    {
      id: 1,
      title: "Jammu & Kashmir",
      images: [
        "https://media.istockphoto.com/id/1323846766/photo/a-beautiful-view-of-dal-lake-in-winter-srinagar-kashmir-india.jpg?s=612x612&w=0&k=20&c=Dp3peie2t-jdLEmqe4W-DD09GACu2Cr-JjHHeB6rpBc=",
        "https://media.istockphoto.com/id/1323846766/photo/a-beautiful-view-of-dal-lake-in-winter-srinagar-kashmir-india.jpg?s=612x612&w=0&k=20&c=Dp3peie2t-jdLEmqe4W-DD09GACu2Cr-JjHHeB6rpBc=",
        "https://media.istockphoto.com/id/1323846766/photo/a-beautiful-view-of-dal-lake-in-winter-srinagar-kashmir-india.jpg?s=612x612&w=0&k=20&c=Dp3peie2t-jdLEmqe4W-DD09GACu2Cr-JjHHeB6rpBc="
      ],
      days: "5N/6D",
      price: "₹35,999",
      location: "Srinagar, Gulmarg, Pahalgam",
      rating: 4.8,
      reviews: 124,
      overview: "Discover the breathtaking beauty of Kashmir, often referred to as 'Paradise on Earth'. This comprehensive tour package takes you through the most scenic locations in the Kashmir valley, offering a perfect blend of natural beauty, adventure, and cultural experiences.",
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
          description: "Arrive at Srinagar Airport, where our representative will greet you and transfer you to the houseboat. After check-in, enjoy a relaxing Shikara ride on Dal Lake. In the evening, explore the local market. Overnight stay at the houseboat."
        },
        {
          day: "Day 2",
          title: "Srinagar Sightseeing",
          description: "After breakfast, visit the famous Mughal Gardens including Nishat Bagh, Shalimar Bagh, and Chashme Shahi. Later, visit the Shankaracharya Temple located on a hill offering panoramic views of the city. Return to the houseboat for dinner and overnight stay."
        },
        {
          day: "Day 3",
          title: "Srinagar to Gulmarg",
          description: "After breakfast, check out from the houseboat and drive to Gulmarg (approx. 2 hours). Known as the 'Meadow of Flowers', Gulmarg is famous for its scenic beauty and the world's second-highest Gondola ride. Enjoy activities like Gondola ride, skiing (in winter), or horseback riding. Overnight stay at a hotel in Gulmarg."
        },
        {
          day: "Day 4",
          title: "Gulmarg to Pahalgam",
          description: "After breakfast, drive to Pahalgam (approx. 3 hours), known as the 'Valley of Shepherds'. En route, visit the Avantipura Ruins and the Saffron fields. Check in at the hotel and spend the evening at leisure by the river Lidder. Overnight stay in Pahalgam."
        },
        {
          day: "Day 5",
          title: "Pahalgam Sightseeing",
          description: "After breakfast, explore the beautiful valleys of Pahalgam including Betaab Valley, Chandanwari, and Aru Valley. You can also enjoy activities like river rafting or horseback riding (optional). Return to the hotel for overnight stay."
        },
        {
          day: "Day 6",
          title: "Pahalgam to Srinagar - Departure",
          description: "After breakfast, check out from the hotel and drive back to Srinagar Airport (approx. 3 hours) for your onward journey, carrying beautiful memories of your Kashmir trip."
        }
      ],
      category: "domestic",
      maxPeople: 15,
      duration: "6 Days, 5 Nights",
      departureInfo: "Daily departures available",
      minAge: 5
    },
    {
      id: 2,
      title: "Kerala Backwaters",
      images: [
        "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/2c/f3/1b/4a/alleppey-backwater-cruise.jpg?w=1200&h=-1&s=1",
        "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/2c/f3/1b/4a/alleppey-backwater-cruise.jpg?w=1200&h=-1&s=1",
        "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/2c/f3/1b/4a/alleppey-backwater-cruise.jpg?w=1200&h=-1&s=1"
      ],
      days: "4N/5D",
      price: "₹25,999",
      location: "Kochi, Munnar, Alleppey",
      rating: 4.9,
      reviews: 186,
      overview: "Experience the serene beauty of God's Own Country with our Kerala Backwaters tour package. This journey takes you through the lush green landscapes, tranquil backwaters, and pristine beaches of Kerala, offering a perfect retreat from the hustle and bustle of city life.",
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
        "English-speaking tour guide",
        "All applicable taxes and service charges"
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
          description: "Arrive at Kochi International Airport, where our representative will greet you and transfer you to your hotel. After check-in, visit Fort Kochi area, including the Chinese Fishing Nets, St. Francis Church, and the Dutch Palace. In the evening, enjoy a traditional Kathakali dance performance. Overnight stay in Kochi."
        },
        {
          day: "Day 2",
          title: "Kochi to Munnar",
          description: "After breakfast, drive to Munnar (approx. 4 hours), famous for its tea plantations and scenic beauty. En route, visit the Valara and Cheeyappara waterfalls. Check in at the hotel and spend the evening at leisure. Overnight stay in Munnar."
        },
        {
          day: "Day 3",
          title: "Munnar Sightseeing",
          description: "After breakfast, explore Munnar visiting the Tea Plantations, Tea Museum, Mattupetty Dam, Echo Point, and the beautiful Eravikulam National Park (home to the endangered Nilgiri Tahr). Return to the hotel for overnight stay."
        },
        {
          day: "Day 4",
          title: "Munnar to Alleppey",
          description: "After breakfast, check out from the hotel and drive to Alleppey (approx. 4 hours). Board your private houseboat, a converted rice barge now serving as a floating hotel. Cruise through the serene backwaters, observing rural Kerala life. Enjoy lunch, dinner, and overnight stay on the houseboat."
        },
        {
          day: "Day 5",
          title: "Alleppey to Kochi - Departure",
          description: "After breakfast on the houseboat, disembark and drive to Kochi International Airport (approx. 2 hours) for your onward journey, carrying beautiful memories of Kerala."
        }
      ],
      category: "domestic",
      maxPeople: 12,
      duration: "5 Days, 4 Nights",
      departureInfo: "Monday, Wednesday, Friday",
      minAge: 0
    },
    {
      id: 3,
      title: "Taj Mahal",
      images: [
        "https://images.pexels.com/photos/1603650/pexels-photo-1603650.jpeg",
        "https://images.pexels.com/photos/1603650/pexels-photo-1603650.jpeg",
        "https://images.pexels.com/photos/1603650/pexels-photo-1603650.jpeg"
      ],
      days: "6N/7D",
      price: "₹28,999",
      location: "Agra",
      rating: 4.7,
      reviews: 152,
      overview: "Experience the magnificence of the Taj Mahal and explore the rich Mughal heritage of Agra.",
      highlights: [
        "Visit the iconic Taj Mahal at sunrise",
        "Explore Agra Fort UNESCO site",
        "Visit Fatehpur Sikri",
        "Shopping at local markets",
        "Traditional Mughlai cuisine experience"
      ],
      inclusions: [
        "6 nights accommodation in 4-star hotels",
        "Daily breakfast and dinner",
        "All transfers in AC vehicle",
        "Professional tour guide",
        "Monument entrance fees",
        "Welcome drink on arrival"
      ],
      exclusions: [
        "Airfare",
        "Personal expenses",
        "Camera fees at monuments",
        "Tips and gratuities",
        "Travel insurance"
      ],
      itinerary: [
        {
          day: "Day 1",
          title: "Arrival in Agra",
          description: "Arrive in Agra and check-in to your hotel. Evening at leisure."
        },
        {
          day: "Day 2",
          title: "Taj Mahal Visit",
          description: "Early morning visit to Taj Mahal, afternoon Agra Fort tour."
        }
        // ...add more days
      ],
      category: "domestic",
      maxPeople: 15,
      duration: "7 Days, 6 Nights",
      departureInfo: "Daily departures available",
      minAge: 0
    },
    {
      id: 4,
      title: "Goa",
      images: [
        "https://lp-cms-production.imgix.net/2022-03/India%20Varkala%20andrijosef%20shutterstock_1902816124%20RFC.jpg?auto=format&w=1440&h=810&fit=crop&q=75",
        "https://lp-cms-production.imgix.net/2022-03/India%20Varkala%20andrijosef%20shutterstock_1902816124%20RFC.jpg?auto=format&w=1440&h=810&fit=crop&q=75",
        "https://lp-cms-production.imgix.net/2022-03/India%20Varkala%20andrijosef%20shutterstock_1902816124%20RFC.jpg?auto=format&w=1440&h=810&fit=crop&q=75"
      ],
      days: "3N/4D",
      price: "₹18,999",
      location: "North & South Goa",
      rating: 4.6,
      reviews: 210,
      overview: "Discover the vibrant beaches, rich culture, and exciting nightlife of Goa.",
      highlights: [
        "Beach hopping tour",
        "Water sports activities",
        "Old Goa church visits",
        "Spice plantation tour",
        "Sunset river cruise"
      ],
      inclusions: [
        "3 nights accommodation",
        "Daily breakfast",
        "Airport/station transfers",
        "Sightseeing as per itinerary",
        "All taxes included"
      ],
      exclusions: [
        "Flights/train tickets",
        "Personal expenses",
        "Water sports charges",
        "Entry fees",
        "Travel insurance"
      ],
      itinerary: [
        {
          day: "Day 1",
          title: "Arrival in Goa",
          description: "Arrive and transfer to hotel. Evening free for beach visit."
        }
        // ...add more days
      ],
      category: "domestic",
      maxPeople: 10,
      duration: "4 Days, 3 Nights",
      departureInfo: "Daily departures",
      minAge: 0
    },
    {
      id: 5,
      title: "Andaman Islands",
      images: [
        "https://static.theprint.in/wp-content/uploads/2020/08/Untitled-design-2020-08-09T193331.340.jpg",
        "https://static.theprint.in/wp-content/uploads/2020/08/Untitled-design-2020-08-09T193331.340.jpg",
        "https://static.theprint.in/wp-content/uploads/2020/08/Untitled-design-2020-08-09T193331.340.jpg"
      ],
      days: "5N/6D",
      price: "₹32,999",
      location: "Port Blair, Havelock, Neil Island",
      rating: 4.9,
      reviews: 96,
      overview: "Explore the pristine beaches and crystal-clear waters of the Andaman Islands.",
      highlights: [
        "Snorkeling at Elephant Beach",
        "Visit to Radhanagar Beach",
        "Explore Cellular Jail",
        "Scuba diving experience",
        "Boat ride to Ross Island"
      ],
      inclusions: [
        "5 nights accommodation",
        "Daily breakfast",
        "Airport transfers",
        "Sightseeing as per itinerary",
        "All taxes included"
      ],
      exclusions: [
        "Flights",
        "Personal expenses",
        "Water sports charges",
        "Entry fees",
        "Travel insurance"
      ],
      itinerary: [
        {
          day: "Day 1",
          title: "Arrival in Port Blair",
          description: "Arrive and transfer to hotel. Evening visit to Cellular Jail."
        }
        // ...add more days
      ],
      category: "domestic",
      maxPeople: 12,
      duration: "6 Days, 5 Nights",
      departureInfo: "Daily departures",
      minAge: 0
    },
    {
      id: 6,
      title: "MANALI",
      images: [
        "https://s7ap1.scene7.com/is/image/incredibleindia/The-Best-Adventure-Experiences-in-Manali1-hero?qlt=82&ts=1726731002736",
        "https://s7ap1.scene7.com/is/image/incredibleindia/The-Best-Adventure-Experiences-in-Manali1-hero?qlt=82&ts=1726731002736",
        "https://s7ap1.scene7.com/is/image/incredibleindia/The-Best-Adventure-Experiences-in-Manali1-hero?qlt=82&ts=1726731002736"
      ],
      days: "7N/8D",
      price: "₹42,999",
      location: "Manali, Shimla, Dharamshala",
      rating: 4.7,
      reviews: 78,
      overview: "Experience the beauty of the Himalayas and adventure sports in Manali.",
      highlights: [
        "Visit to Rohtang Pass",
        "Explore Solang Valley",
        "Trekking in Manali",
        "Visit to Hadimba Temple",
        "Shopping at Mall Road"
      ],
      inclusions: [
        "7 nights accommodation",
        "Daily breakfast and dinner",
        "All transfers in AC vehicle",
        "Sightseeing as per itinerary",
        "All taxes included"
      ],
      exclusions: [
        "Flights/train tickets",
        "Personal expenses",
        "Entry fees",
        "Tips and gratuities",
        "Travel insurance"
      ],
      itinerary: [
        {
          day: "Day 1",
          title: "Arrival in Manali",
          description: "Arrive and transfer to hotel. Evening at leisure."
        }
        // ...add more days
      ],
      category: "domestic",
      maxPeople: 15,
      duration: "8 Days, 7 Nights",
      departureInfo: "Daily departures",
      minAge: 0
    }
  ],
  international: [
    {
      id: 7,
      title: "Bangkok, Thailand",
      images: [
        "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/0e/43/44/db/photo0jpg.jpg?w=900&h=500&s=1",
        "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/0e/43/44/db/photo0jpg.jpg?w=900&h=500&s=1",
        "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/0e/43/44/db/photo0jpg.jpg?w=900&h=500&s=1"
      ],
      days: "6N/7D",
      price: "₹65,999",
      location: "Bangkok, Pattaya, Phuket",
      rating: 4.8,
      reviews: 156,
      overview: "Discover the wonders of Thailand with our comprehensive tour package covering the vibrant cities of Bangkok and Pattaya, and the paradise island of Phuket. Experience the perfect blend of cultural heritage, bustling city life, and serene beach relaxation.",
      highlights: [
        "Phi Phi Islands tour by speedboat",
        "Visit to the majestic Grand Palace and Emerald Buddha Temple",
        "Experience the vibrant Floating Market",
        "Day trip to Coral Island with water sports",
        "Safari World and Marine Park visit"
      ],
      inclusions: [
        "6 nights accommodation in 4-star hotels",
        "Daily breakfast",
        "All transfers by air-conditioned vehicle",
        "Bangkok to Phuket domestic flight",
        "English-speaking tour guide",
        "All entrance fees as per itinerary",
        "Thailand visa assistance"
      ],
      exclusions: [
        "International airfare",
        "Lunch and dinner unless specified",
        "Personal expenses and tips",
        "Optional tours and activities",
        "Travel insurance",
        "Thailand Visa fees"
      ],
      itinerary: [
        {
          day: "Day 1",
          title: "Arrival in Bangkok",
          description: "Arrive at Bangkok International Airport, where our representative will greet you and transfer you to your hotel. Rest of the day at leisure to explore the city on your own. Overnight stay in Bangkok."
        },
        {
          day: "Day 2",
          title: "Bangkok City Tour",
          description: "After breakfast, embark on a city tour visiting the Grand Palace, Wat Phra Kaew (Emerald Buddha Temple), Wat Arun (Temple of Dawn), and a boat ride through the canals. Evening is free for shopping at local markets. Overnight stay in Bangkok."
        },
        {
          day: "Day 3",
          title: "Bangkok to Pattaya",
          description: "After breakfast, check out from the hotel and drive to Pattaya (approx. 2 hours). En route, visit the Floating Market. Check in at the hotel in Pattaya and spend the evening at leisure. You can opt for the famous Alcazar Show (optional). Overnight stay in Pattaya."
        },
        {
          day: "Day 4",
          title: "Coral Island Tour",
          description: "After breakfast, transfer to the pier for a speedboat ride to Coral Island. Enjoy water sports and activities (at own expense) or relax on the beautiful beach. Return to Pattaya in the afternoon. Evening free for leisure. Overnight stay in Pattaya."
        },
        {
          day: "Day 5",
          title: "Pattaya to Bangkok - Flight to Phuket",
          description: "After breakfast, check out from the hotel and drive back to Bangkok to catch your flight to Phuket. Arrive in Phuket and transfer to your hotel. Rest of the day at leisure to explore the beaches. Overnight stay in Phuket."
        },
        {
          day: "Day 6",
          title: "Phi Phi Islands Tour",
          description: "After breakfast, embark on a full-day tour to the famous Phi Phi Islands by speedboat. Visit Maya Bay (where 'The Beach' was filmed), Monkey Beach, and enjoy swimming, snorkeling, and lunch on the island. Return to Phuket in the evening. Overnight stay in Phuket."
        },
        {
          day: "Day 7",
          title: "Phuket - Departure",
          description: "After breakfast, check out from the hotel. Depending on your flight time, you can explore Phuket town or relax at the hotel before being transferred to Phuket International Airport for your onward journey."
        }
      ],
      category: "international",
      maxPeople: 20,
      duration: "7 Days, 6 Nights",
      departureInfo: "Tuesday, Saturday",
      minAge: 2
    },
    {
      id: 8,
      title: "Dubai",
      images: [
        "https://media.tacdn.com/media/attractions-splice-spp-674x446/10/71/94/a2.jpg",
        "https://media.tacdn.com/media/attractions-splice-spp-674x446/10/71/94/a2.jpg",
        "https://media.tacdn.com/media/attractions-splice-spp-674x446/10/71/94/a2.jpg"
      ],
      days: "5N/6D",
      price: "₹55,999",
      location: "Dubai",
      rating: 4.7,
      reviews: 98,
      overview: "Explore the dazzling city of Dubai with our exclusive tour package. From the iconic Burj Khalifa to the traditional souks, experience the perfect blend of modernity and tradition in this vibrant city.",
      highlights: [
        "Visit to Burj Khalifa",
        "Desert Safari with BBQ Dinner",
        "Dhow Cruise on Dubai Creek",
        "Explore the Dubai Mall and Aquarium",
        "Visit to Palm Jumeirah and Atlantis"
      ],
      inclusions: [
        "5 nights accommodation in 4-star hotels",
        "Daily breakfast",
        "All transfers by air-conditioned vehicle",
        "English-speaking tour guide",
        "All entrance fees as per itinerary",
        "Dubai visa assistance"
      ],
      exclusions: [
        "International airfare",
        "Lunch and dinner unless specified",
        "Personal expenses and tips",
        "Optional tours and activities",
        "Travel insurance",
        "Dubai Visa fees"
      ],
      itinerary: [
        {
          day: "Day 1",
          title: "Arrival in Dubai",
          description: "Arrive at Dubai International Airport, where our representative will greet you and transfer you to your hotel. Rest of the day at leisure to explore the city on your own. Overnight stay in Dubai."
        },
        {
          day: "Day 2",
          title: "Dubai City Tour",
          description: "After breakfast, embark on a city tour visiting the Burj Khalifa, Dubai Mall, Dubai Aquarium, and the Dubai Fountain. Evening is free for shopping at local markets. Overnight stay in Dubai."
        },
        {
          day: "Day 3",
          title: "Desert Safari",
          description: "After breakfast, enjoy a morning at leisure. In the afternoon, proceed for a Desert Safari with dune bashing, camel riding, and a BBQ dinner. Return to the hotel for overnight stay."
        },
        {
          day: "Day 4",
          title: "Dhow Cruise",
          description: "After breakfast, enjoy a day at leisure. In the evening, proceed for a Dhow Cruise on Dubai Creek with dinner. Return to the hotel for overnight stay."
        },
        {
          day: "Day 5",
          title: "Palm Jumeirah and Atlantis",
          description: "After breakfast, visit the Palm Jumeirah and Atlantis. Enjoy the Aquaventure Waterpark and Lost Chambers Aquarium. Return to the hotel for overnight stay."
        },
        {
          day: "Day 6",
          title: "Dubai - Departure",
          description: "After breakfast, check out from the hotel. Depending on your flight time, you can explore more of Dubai or relax at the hotel before being transferred to Dubai International Airport for your onward journey."
        }
      ],
      category: "international",
      maxPeople: 15,
      duration: "6 Days, 5 Nights",
      departureInfo: "Wednesday, Saturday",
      minAge: 2
    },
    {
      id: 9,
      title: "Malaysia & Langkawi",
      images: [
        "https://cdn.pixabay.com/photo/2016/11/13/12/52/kuala-lumpur-1820944_960_720.jpg",
        "https://cdn.pixabay.com/photo/2016/11/13/12/52/kuala-lumpur-1820944_960_720.jpg",
        "https://cdn.pixabay.com/photo/2016/11/13/12/52/kuala-lumpur-1820944_960_720.jpg"
      ],
      days: "6N/7D",
      price: "₹60,999",
      location: "Kuala Lumpur, Langkawi",
      rating: 4.6,
      reviews: 112,
      overview: "Experience the best of Malaysia with our tour package covering the bustling city of Kuala Lumpur and the serene island of Langkawi. Enjoy a perfect blend of urban excitement and island relaxation.",
      highlights: [
        "Visit to Petronas Twin Towers",
        "Langkawi Island Hopping Tour",
        "Explore the Batu Caves",
        "Visit to Langkawi Sky Bridge",
        "Shopping at Bukit Bintang"
      ],
      inclusions: [
        "6 nights accommodation in 4-star hotels",
        "Daily breakfast",
        "All transfers by air-conditioned vehicle",
        "Kuala Lumpur to Langkawi domestic flight",
        "English-speaking tour guide",
        "All entrance fees as per itinerary",
        "Malaysia visa assistance"
      ],
      exclusions: [
        "International airfare",
        "Lunch and dinner unless specified",
        "Personal expenses and tips",
        "Optional tours and activities",
        "Travel insurance",
        "Malaysia Visa fees"
      ],
      itinerary: [
        {
          day: "Day 1",
          title: "Arrival in Kuala Lumpur",
          description: "Arrive at Kuala Lumpur International Airport, where our representative will greet you and transfer you to your hotel. Rest of the day at leisure to explore the city on your own. Overnight stay in Kuala Lumpur."
        },
        {
          day: "Day 2",
          title: "Kuala Lumpur City Tour",
          description: "After breakfast, embark on a city tour visiting the Petronas Twin Towers, Batu Caves, and Merdeka Square. Evening is free for shopping at Bukit Bintang. Overnight stay in Kuala Lumpur."
        },
        {
          day: "Day 3",
          title: "Kuala Lumpur to Langkawi",
          description: "After breakfast, check out from the hotel and transfer to the airport for your flight to Langkawi. Arrive in Langkawi and transfer to your hotel. Rest of the day at leisure to explore the beaches. Overnight stay in Langkawi."
        },
        {
          day: "Day 4",
          title: "Langkawi Island Hopping Tour",
          description: "After breakfast, embark on a full-day island hopping tour visiting the famous Langkawi Sky Bridge, Eagle Square, and the Langkawi Cable Car. Return to the hotel for overnight stay."
        },
        {
          day: "Day 5",
          title: "Langkawi Beach Day",
          description: "After breakfast, enjoy a day at leisure on the beautiful beaches of Langkawi. You can opt for water sports or simply relax by the sea. Overnight stay in Langkawi."
        },
        {
          day: "Day 6",
          title: "Langkawi to Kuala Lumpur",
          description: "After breakfast, check out from the hotel and transfer to the airport for your flight back to Kuala Lumpur. Arrive in Kuala Lumpur and transfer to your hotel. Rest of the day at leisure. Overnight stay in Kuala Lumpur."
        },
        {
          day: "Day 7",
          title: "Kuala Lumpur - Departure",
          description: "After breakfast, check out from the hotel. Depending on your flight time, you can explore more of Kuala Lumpur or relax at the hotel before being transferred to Kuala Lumpur International Airport for your onward journey."
        }
      ],
      category: "international",
      maxPeople: 20,
      duration: "7 Days, 6 Nights",
      departureInfo: "Monday, Thursday",
      minAge: 2
    },
    {
      id: 10,
      title: "Bali, Indonesia",
      images: [
        "https://www.outlooktravelmag.com/media/bali-tg.png",
        "https://www.outlooktravelmag.com/media/bali-tg.png",
        "https://www.outlooktravelmag.com/media/bali-tg.png"
      ],
      days: "5N/6D",
      price: "₹50,999",
      location: "Bali",
      rating: 4.8,
      reviews: 134,
      overview: "Discover the enchanting island of Bali with our exclusive tour package. From stunning beaches to vibrant culture, experience the best of Bali with our carefully curated itinerary.",
      highlights: [
        "Visit to Uluwatu Temple",
        "Kintamani Volcano Tour",
        "Explore the Ubud Monkey Forest",
        "Tegallalang Rice Terraces",
        "Relax at Seminyak Beach"
      ],
      inclusions: [
        "5 nights accommodation in 4-star hotels",
        "Daily breakfast",
        "All transfers by air-conditioned vehicle",
        "English-speaking tour guide",
        "All entrance fees as per itinerary",
        "Bali visa assistance"
      ],
      exclusions: [
        "International airfare",
        "Lunch and dinner unless specified",
        "Personal expenses and tips",
        "Optional tours and activities",
        "Travel insurance",
        "Bali Visa fees"
      ],
      itinerary: [
        {
          day: "Day 1",
          title: "Arrival in Bali",
          description: "Arrive at Ngurah Rai International Airport, where our representative will greet you and transfer you to your hotel. Rest of the day at leisure to explore the island on your own. Overnight stay in Bali."
        },
        {
          day: "Day 2",
          title: "Uluwatu Temple Tour",
          description: "After breakfast, embark on a tour to the famous Uluwatu Temple, perched on a cliff overlooking the Indian Ocean. Enjoy a traditional Kecak dance performance in the evening. Return to the hotel for overnight stay."
        },
        {
          day: "Day 3",
          title: "Kintamani Volcano Tour",
          description: "After breakfast, proceed for a full-day tour to Kintamani Volcano. Visit the Tegallalang Rice Terraces, Ubud Monkey Forest, and the Tirta Empul Temple. Return to the hotel for overnight stay."
        },
        {
          day: "Day 4",
          title: "Beach Day at Seminyak",
          description: "After breakfast, enjoy a day at leisure on the beautiful beaches of Seminyak. You can opt for water sports or simply relax by the sea. Overnight stay in Bali."
        },
        {
          day: "Day 5",
          title: "Explore Ubud",
          description: "After breakfast, explore the cultural heart of Bali - Ubud. Visit the Ubud Palace, Ubud Art Market, and the Sacred Monkey Forest Sanctuary. Return to the hotel for overnight stay."
        },
        {
          day: "Day 6",
          title: "Bali - Departure",
          description: "After breakfast, check out from the hotel. Depending on your flight time, you can explore more of Bali or relax at the hotel before being transferred to Ngurah Rai International Airport for your onward journey."
        }
      ],
      category: "international",
      maxPeople: 15,
      duration: "6 Days, 5 Nights",
      departureInfo: "Tuesday, Friday",
      minAge: 2
    },
    {
      id: 11,
      title: "European Dreams",
      images: [
        "https://images.pexels.com/photos/532826/pexels-photo-532826.jpeg",
        "https://images.pexels.com/photos/532826/pexels-photo-532826.jpeg",
        "https://images.pexels.com/photos/532826/pexels-photo-532826.jpeg"
      ],
      days: "10N/11D",
      price: "₹1,50,999",
      location: "Paris, Rome, Amsterdam",
      rating: 4.9,
      reviews: 89,
      overview: "Embark on a journey through the heart of Europe with our European Dreams tour package. Explore the iconic cities of Paris, Rome, and Amsterdam, and experience the rich history, culture, and beauty of Europe.",
      highlights: [
        "Eiffel Tower visit in Paris",
        "Colosseum tour in Rome",
        "Canal cruise in Amsterdam",
        "Visit to the Louvre Museum",
        "Explore the Vatican City"
      ],
      inclusions: [
        "10 nights accommodation in 4-star hotels",
        "Daily breakfast",
        "All transfers by air-conditioned vehicle",
        "Intercity train tickets",
        "English-speaking tour guide",
        "All entrance fees as per itinerary",
        "Schengen visa assistance"
      ],
      exclusions: [
        "International airfare",
        "Lunch and dinner unless specified",
        "Personal expenses and tips",
        "Optional tours and activities",
        "Travel insurance",
        "Schengen Visa fees"
      ],
      itinerary: [
        {
          day: "Day 1",
          title: "Arrival in Paris",
          description: "Arrive at Charles de Gaulle Airport, where our representative will greet you and transfer you to your hotel. Rest of the day at leisure to explore the city on your own. Overnight stay in Paris."
        },
        {
          day: "Day 2",
          title: "Paris City Tour",
          description: "After breakfast, embark on a city tour visiting the Eiffel Tower, Louvre Museum, Notre-Dame Cathedral, and a Seine River cruise. Evening is free for shopping at Champs-Élysées. Overnight stay in Paris."
        },
        {
          day: "Day 3",
          title: "Paris to Rome",
          description: "After breakfast, check out from the hotel and transfer to the train station for your journey to Rome. Arrive in Rome and transfer to your hotel. Rest of the day at leisure. Overnight stay in Rome."
        },
        {
          day: "Day 4",
          title: "Rome City Tour",
          description: "After breakfast, embark on a city tour visiting the Colosseum, Roman Forum, Trevi Fountain, and the Pantheon. Evening is free for leisure. Overnight stay in Rome."
        },
        {
          day: "Day 5",
          title: "Vatican City Tour",
          description: "After breakfast, proceed for a tour of the Vatican City, including St. Peter's Basilica, the Vatican Museums, and the Sistine Chapel. Return to the hotel for overnight stay."
        },
        {
          day: "Day 6",
          title: "Rome to Amsterdam",
          description: "After breakfast, check out from the hotel and transfer to the train station for your journey to Amsterdam. Arrive in Amsterdam and transfer to your hotel. Rest of the day at leisure. Overnight stay in Amsterdam."
        },
        {
          day: "Day 7",
          title: "Amsterdam City Tour",
          description: "After breakfast, embark on a city tour visiting the Anne Frank House, Van Gogh Museum, and a canal cruise. Evening is free for leisure. Overnight stay in Amsterdam."
        },
        {
          day: "Day 8",
          title: "Day Trip to Zaanse Schans",
          description: "After breakfast, proceed for a day trip to Zaanse Schans, a picturesque village known for its historic windmills and traditional Dutch houses. Return to the hotel for overnight stay."
        },
        {
          day: "Day 9",
          title: "Amsterdam to Paris",
          description: "After breakfast, check out from the hotel and transfer to the train station for your journey back to Paris. Arrive in Paris and transfer to your hotel. Rest of the day at leisure. Overnight stay in Paris."
        },
        {
          day: "Day 10",
          title: "Versailles Palace Tour",
          description: "After breakfast, proceed for a tour of the Palace of Versailles, a UNESCO World Heritage site. Explore the opulent palace and its beautiful gardens. Return to the hotel for overnight stay."
        },
        {
          day: "Day 11",
          title: "Paris - Departure",
          description: "After breakfast, check out from the hotel. Depending on your flight time, you can explore more of Paris or relax at the hotel before being transferred to Charles de Gaulle Airport for your onward journey."
        }
      ],
      category: "international",
      maxPeople: 25,
      duration: "11 Days, 10 Nights",
      departureInfo: "Friday, Sunday",
      minAge: 2
    },
    {
      id: 12,
      title: "Vietnam",
      images: [
        "https://images.squarespace-cdn.com/content/v1/5c3824e246d6976392372cd9/1560106931611-VVF5OJ34KV28ZNBPRQRS/Vietnam+visitor+visa.jpg?format=2500w",
        "https://images.squarespace-cdn.com/content/v1/5c3824e246d6976392372cd9/1560106931611-VVF5OJ34KV28ZNBPRQRS/Vietnam+visitor+visa.jpg?format=2500w",
        "https://images.squarespace-cdn.com/content/v1/5c3824e246d6976392372cd9/1560106931611-VVF5OJ34KV28ZNBPRQRS/Vietnam+visitor+visa.jpg?format=2500w"
      ],
      days: "7N/8D",
      price: "₹70,999",
      location: "Hanoi, Ho Chi Minh City, Halong Bay",
      rating: 4.7,
      reviews: 102,
      overview: "Explore the rich history and natural beauty of Vietnam with our comprehensive tour package. From the bustling cities of Hanoi and Ho Chi Minh City to the serene waters of Halong Bay, experience the best of Vietnam.",
      highlights: [
        "Halong Bay Cruise",
        "Cu Chi Tunnels tour",
        "Visit to the War Remnants Museum",
        "Explore the Old Quarter of Hanoi",
        "Mekong Delta tour"
      ],
      inclusions: [
        "7 nights accommodation in 4-star hotels",
        "Daily breakfast",
        "All transfers by air-conditioned vehicle",
        "Domestic flights within Vietnam",
        "English-speaking tour guide",
        "All entrance fees as per itinerary",
        "Vietnam visa assistance"
      ],
      exclusions: [
        "International airfare",
        "Lunch and dinner unless specified",
        "Personal expenses and tips",
        "Optional tours and activities",
        "Travel insurance",
        "Vietnam Visa fees"
      ],
      itinerary: [
        {
          day: "Day 1",
          title: "Arrival in Hanoi",
          description: "Arrive at Noi Bai International Airport, where our representative will greet you and transfer you to your hotel. Rest of the day at leisure to explore the city on your own. Overnight stay in Hanoi."
        },
        {
          day: "Day 2",
          title: "Hanoi City Tour",
          description: "After breakfast, embark on a city tour visiting the Ho Chi Minh Mausoleum, One Pillar Pagoda, Temple of Literature, and the Old Quarter. Evening is free for leisure. Overnight stay in Hanoi."
        },
        {
          day: "Day 3",
          title: "Halong Bay Cruise",
          description: "After breakfast, proceed for a full-day cruise on Halong Bay, a UNESCO World Heritage site. Enjoy the stunning limestone karsts, caves, and islands. Return to Hanoi for overnight stay."
        },
        {
          day: "Day 4",
          title: "Hanoi to Ho Chi Minh City",
          description: "After breakfast, check out from the hotel and transfer to the airport for your flight to Ho Chi Minh City. Arrive in Ho Chi Minh City and transfer to your hotel. Rest of the day at leisure. Overnight stay in Ho Chi Minh City."
        },
        {
          day: "Day 5",
          title: "Ho Chi Minh City Tour",
          description: "After breakfast, embark on a city tour visiting the War Remnants Museum, Reunification Palace, Notre-Dame Cathedral, and Ben Thanh Market. Evening is free for leisure. Overnight stay in Ho Chi Minh City."
        },
        {
          day: "Day 6",
          title: "Cu Chi Tunnels Tour",
          description: "After breakfast, proceed for a tour of the Cu Chi Tunnels, an extensive network of underground tunnels used during the Vietnam War. Return to the hotel for overnight stay."
        },
        {
          day: "Day 7",
          title: "Mekong Delta Tour",
          description: "After breakfast, embark on a full-day tour to the Mekong Delta. Enjoy a boat ride through the canals, visit local villages, and experience the rural life of Vietnam. Return to the hotel for overnight stay."
        },
        {
          day: "Day 8",
          title: "Ho Chi Minh City - Departure",
          description: "After breakfast, check out from the hotel. Depending on your flight time, you can explore more of Ho Chi Minh City or relax at the hotel before being transferred to Tan Son Nhat International Airport for your onward journey."
        }
      ],
      category: "international",
      maxPeople: 20,
      duration: "8 Days, 7 Nights",
      departureInfo: "Monday, Thursday",
      minAge: 2
    }
  ]
};

// Helper function to find a package by ID
const findPackageById = (id: number) => {
  const allPackages = [...packagesData.domestic, ...packagesData.international];
  return allPackages.find(pkg => pkg.id === id);
};

const PackageDetail = () => {
  const { id } = useParams();
  const [packageData, setPackageData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [travelers, setTravelers] = useState(2);
  const { toast } = useToast();
  const [bookingForm, setBookingForm] = useState({
    name: '',
    email: '',
    phone: '',
    date: '',
    adults: 1,
    children: 0,
    special_requests: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  
  // Add new state for the initial contact form
  const [contactInfo, setContactInfo] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const [showContactForm, setShowContactForm] = useState(true);
  const [contactFormComplete, setContactFormComplete] = useState(false);
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});
  
  useEffect(() => {
    // Simulate loading data from API
    const fetchData = async () => {
      setLoading(true);
      try {
        // In a real app, this would be an API call
        const foundPackage = findPackageById(Number(id));
        if (foundPackage) {
          setPackageData(foundPackage);
        }
      } catch (error) {
        console.error("Error fetching package details:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id]);
  
  const handleBookNow = () => {
    setBookingModalOpen(true);
  };

  // Validate contact form
  const validateContactForm = () => {
    const errors: {[key: string]: string} = {};
    
    if (!contactInfo.name.trim()) {
      errors.name = "Name is required";
    }
    
    if (!contactInfo.email.trim()) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(contactInfo.email)) {
      errors.email = "Please enter a valid email";
    }
    
    if (!contactInfo.phone.trim()) {
      errors.phone = "Phone number is required";
    } else if (!/^\d{10}$/.test(contactInfo.phone.replace(/\D/g, ''))) {
      errors.phone = "Please enter a valid 10-digit phone number";
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  // Handle initial form submission
  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateContactForm()) {
      // Transfer contact info to booking form
      setBookingForm(prev => ({
        ...prev,
        name: contactInfo.name,
        email: contactInfo.email,
        phone: contactInfo.phone
      }));
      
      setContactFormComplete(true);
      setShowContactForm(false);
      setBookingModalOpen(true);
    }
  };
  
  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Save booking to Firestore
      await addDoc(collection(db, 'package_bookings'), {
        package_id: id,
        package_name: packageData?.title || 'Unknown Package',
        name: bookingForm.name,
        email: bookingForm.email,
        phone: bookingForm.phone,
        travel_date: bookingForm.date,
        adults_count: bookingForm.adults,
        children_count: bookingForm.children,
        special_requests: bookingForm.special_requests,
        status: 'pending',
        created_at: serverTimestamp()
      });
      
      // Show success message
      toast({
        title: "Booking Successful",
        description: "Your package booking has been submitted. We'll contact you shortly.",
      });
      
      // Reset form
      setBookingForm({
        name: '',
        email: '',
        phone: '',
        date: '',
        adults: 1,
        children: 0,
        special_requests: ''
      });
      
      // Close booking modal
      setBookingModalOpen(false);
      setContactFormComplete(false);
      setShowContactForm(true);
    } catch (error) {
      console.error("Error submitting booking:", error);
      toast({
        title: "Booking Failed",
        description: "There was an error submitting your booking. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-travel-blue-dark mx-auto"></div>
            <p className="mt-4 text-travel-blue-dark">Loading package details...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }
  
  if (!packageData) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow flex items-center justify-center py-20">
          <div className="container-custom text-center">
            <h1 className="text-4xl font-bold text-travel-blue-dark mb-6">Package Not Found</h1>
            <p className="text-lg mb-8 text-gray-600">
              The package you are looking for does not exist or has been removed.
            </p>
            <Link to="/packages" className="btn-primary text-lg">
              Browse All Packages
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        {/* Package Header */}
        <div className="bg-travel-blue-dark text-white py-8">
          <div className="container-custom">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold mb-2">{packageData.title}</h1>
                <div className="flex items-center gap-4 flex-wrap">
                  <div className="flex items-center gap-1">
                    <MapPin size={18} />
                    <span>{packageData.location}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar size={18} />
                    <span>{packageData.days}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star size={18} className="text-yellow-400 fill-yellow-400" />
                    <span>{packageData.rating} ({packageData.reviews} reviews)</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm">Starting from</div>
                <div className="text-3xl font-bold text-travel-orange">{packageData.price}</div>
                <div className="text-sm">per person on twin sharing</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Image Gallery */}
        <section className="py-8">
          <div className="container-custom">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2 h-[400px] md:h-[500px] rounded-lg overflow-hidden">
                <img 
                  src={packageData.images[activeImageIndex]} 
                  alt={packageData.title} 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="grid grid-cols-3 lg:grid-cols-1 gap-4">
                {packageData.images.map((image, index) => (
                  <div 
                    key={index} 
                    className={`h-32 rounded-lg overflow-hidden cursor-pointer border-2 ${
                      index === activeImageIndex ? 'border-travel-orange' : 'border-transparent'
                    }`}
                    onClick={() => setActiveImageIndex(index)}
                  >
                    <img 
                      src={image} 
                      alt={`${packageData.title} - Image ${index + 1}`} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
        
        {/* Package Details */}
        <section className="py-8">
          <div className="container-custom">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column - Package Info */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                  <h2 className="text-2xl font-bold text-travel-blue-dark mb-4">Overview</h2>
                  <p className="text-gray-700 mb-6">{packageData.overview}</p>
                  
                  <h3 className="text-xl font-semibold text-travel-blue-medium mb-3">Package Highlights</h3>
                  <ul className="space-y-2 mb-6">
                    {packageData.highlights.map((highlight, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <Check size={18} className="text-travel-orange mt-1 flex-shrink-0" />
                        <span className="text-gray-700">{highlight}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-gray-50 p-4 rounded-lg text-center">
                      <Clock className="w-6 h-6 text-travel-blue-dark mx-auto mb-2" />
                      <h4 className="font-medium text-travel-blue-dark">Duration</h4>
                      <p className="text-gray-600">{packageData.duration}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg text-center">
                      <Users className="w-6 h-6 text-travel-blue-dark mx-auto mb-2" />
                      <h4 className="font-medium text-travel-blue-dark">Group Size</h4>
                      <p className="text-gray-600">Max {packageData.maxPeople} people</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg text-center">
                      <Calendar className="w-6 h-6 text-travel-blue-dark mx-auto mb-2" />
                      <h4 className="font-medium text-travel-blue-dark">Departures</h4>
                      <p className="text-gray-600">{packageData.departureInfo}</p>
                    </div>
                  </div>
                </div>
                
                {/* Itinerary */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                  <h2 className="text-2xl font-bold text-travel-blue-dark mb-6">Detailed Itinerary</h2>
                  
                  <div className="space-y-6">
                    {packageData.itinerary.map((day, index) => (
                      <div key={index} className="relative border-l-2 border-travel-blue-dark pl-6 pb-6">
                        <div className="absolute -left-2.5 top-0 w-5 h-5 rounded-full bg-travel-blue-dark"></div>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <h3 className="text-lg font-semibold text-travel-blue-dark">{day.day}: {day.title}</h3>
                          <p className="text-gray-700 mt-2">{day.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Inclusions/Exclusions */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h2 className="text-xl font-bold text-travel-blue-dark mb-4">Inclusions</h2>
                      <ul className="space-y-2">
                        {packageData.inclusions.map((item, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <Check size={18} className="text-green-500 mt-1 flex-shrink-0" />
                            <span className="text-gray-700">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-travel-blue-dark mb-4">Exclusions</h2>
                      <ul className="space-y-2">
                        {packageData.exclusions.map((item, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="text-red-500 mt-1 flex-shrink-0">✕</span>
                            <span className="text-gray-700">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Right Column - Booking Form */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
                  <h2 className="text-2xl font-bold text-travel-blue-dark mb-4">Book This Package</h2>
                  
                  {/* Contact form before booking */}
                  {showContactForm && (
                    <form onSubmit={handleContactSubmit} className="space-y-4">
                      <div>
                        <Label htmlFor="name">Your Name</Label>
                        <Input 
                          id="name"
                          value={contactInfo.name}
                          onChange={(e) => setContactInfo({...contactInfo, name: e.target.value})}
                          placeholder="Enter your full name"
                        />
                        {formErrors.name && <p className="text-red-500 text-sm mt-1">{formErrors.name}</p>}
                      </div>
                      
                      <div>
                        <Label htmlFor="email">Email Address</Label>
                        <Input 
                          id="email"
                          type="email"
                          value={contactInfo.email}
                          onChange={(e) => setContactInfo({...contactInfo, email: e.target.value})}
                          placeholder="Enter your email"
                        />
                        {formErrors.email && <p className="text-red-500 text-sm mt-1">{formErrors.email}</p>}
                      </div>
                      
                      <div>
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input 
                          id="phone"
                          value={contactInfo.phone}
                          onChange={(e) => setContactInfo({...contactInfo, phone: e.target.value})}
                          placeholder="Enter your phone number"
                        />
                        {formErrors.phone && <p className="text-red-500 text-sm mt-1">{formErrors.phone}</p>}
                      </div>
                      
                      <Button type="submit" className="w-full">
                        Book Now
                      </Button>
                    </form>
                  )}
                  
                  {/* Call to action buttons for non-contact form state (should not normally be visible) */}
                  {!showContactForm && !bookingModalOpen && (
                    <div className="space-y-4">
                      <Button 
                        className="w-full" 
                        onClick={() => setBookingModalOpen(true)}
                      >
                        Book Now
                      </Button>
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => setShowContactForm(true)}
                      >
                        Edit Contact Info
                      </Button>
                    </div>
                  )}
                  
                  <div className="mt-6 border-t pt-4">
                    <h3 className="font-medium mb-2">Why Book With Us</h3>
                    <ul className="text-sm space-y-2">
                      <li>✓ Best price guarantee</li>
                      <li>✓ 24/7 customer support</li>
                      <li>✓ Flexible payment options</li>
                      <li>✓ Customizable itineraries</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Related Packages */}
        <section className="py-16 bg-gray-50">
          <div className="container-custom">
            <h2 className="section-title text-center mb-12">You May Also Like</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {packagesData[packageData.category === "domestic" ? "domestic" : "international"]
                .filter(pkg => pkg.id !== packageData.id)
                .slice(0, 3)
                .map((pkg) => (
                  <div key={pkg.id} className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow">
                    <div className="h-48 overflow-hidden">
                      <img 
                        src={typeof pkg.images === 'string' ? pkg.images : pkg.images[0]} 
                        alt={pkg.title} 
                        className="w-full h-full object-cover transition-transform hover:scale-110 duration-700"
                      />
                    </div>
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-xl font-semibold text-travel-blue-dark">{pkg.title}</h3>
                        <span className="bg-travel-orange text-white text-sm font-medium px-2 py-1 rounded">
                          {pkg.days}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                        <MapPin size={16} className="text-travel-blue-medium" />
                        <span>{pkg.location}</span>
                      </div>
                      
                      <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                        <div className="text-travel-blue-dark">
                          <span className="text-sm">Starting from</span>
                          <p className="text-xl font-bold">{pkg.price}</p>
                        </div>
                        <Link 
                          to={`/packages/${pkg.id}`} 
                          className="bg-travel-blue-dark hover:bg-travel-blue-medium text-white px-4 py-2 rounded-md transition-colors text-sm font-medium"
                        >
                          View Details
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
      
      {/* Booking Modal */}
      <Dialog open={bookingModalOpen} onOpenChange={setBookingModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Book {packageData?.title}</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleBooking} className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label htmlFor="date">Travel Date</Label>
                <Input
                  id="date"
                  type="date"
                  required
                  value={bookingForm.date}
                  onChange={(e) => setBookingForm({...bookingForm, date: e.target.value})}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              
              <div>
                <Label htmlFor="adults">Adults</Label>
                <Input
                  id="adults"
                  type="number"
                  min={1}
                  required
                  value={bookingForm.adults}
                  onChange={(e) => setBookingForm({...bookingForm, adults: parseInt(e.target.value) || 1})}
                />
              </div>
              
              <div>
                <Label htmlFor="children">Children</Label>
                <Input
                  id="children"
                  type="number"
                  min={0}
                  value={bookingForm.children}
                  onChange={(e) => setBookingForm({...bookingForm, children: parseInt(e.target.value) || 0})}
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="special_requests">Special Requests (Optional)</Label>
              <Textarea
                id="special_requests"
                placeholder="Any special requests or requirements..."
                value={bookingForm.special_requests}
                onChange={(e) => setBookingForm({...bookingForm, special_requests: e.target.value})}
                className="min-h-[100px]"
              />
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span>Price per person:</span>
                <span>₹{packageData?.price.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span>Adults:</span>
                <span>{bookingForm.adults} × ₹{packageData?.price.toLocaleString('en-IN')}</span>
              </div>
              {bookingForm.children > 0 && (
                <div className="flex justify-between items-center mb-2">
                  <span>Children:</span>
                  <span>{bookingForm.children} × ₹{Math.round(packageData?.price * 0.7).toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="flex justify-between items-center font-bold pt-2 border-t">
                <span>Total:</span>
                <span>₹{(
                  (packageData?.price * bookingForm.adults) +
                  (packageData?.price * 0.7 * bookingForm.children)
                ).toLocaleString('en-IN')}</span>
              </div>
            </div>
            
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setBookingModalOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-r-transparent"></span>
                    Processing...
                  </span>
                ) : (
                  "Complete Booking"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PackageDetail;
