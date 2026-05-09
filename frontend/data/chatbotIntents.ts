export interface ChatIntent {
  id: string;
  category: string;
  keywords: string[];
  variations: string[];
  answer: string;
}

export const chatbotIntents: ChatIntent[] = [
  {
    id: "what_is_foodloop",
    category: "General",
    keywords: ["what", "foodloop", "platform", "purpose", "about"],
    variations: [
      "What is FoodLoop?",
      "Can you tell me about FoodLoop?",
      "What does this platform do?",
      "Explain FoodLoop to me."
    ],
    answer: "FoodLoop is a platform that connects surplus food donors with NGOs and shelters."
  },
  {
    id: "how_it_works",
    category: "General",
    keywords: ["how", "work", "process", "steps", "does"],
    variations: [
      "How does FoodLoop work?",
      "How do I use this?",
      "What is the process?",
      "Explain how it works."
    ],
    answer: "Donors upload food listings and NGOs or volunteers claim them."
  },
  {
    id: "is_it_free",
    category: "General",
    keywords: ["free", "cost", "price", "pay", "charge"],
    variations: [
      "Is FoodLoop free?",
      "Do I have to pay to use this?",
      "What is the cost?",
      "Is there a subscription fee?"
    ],
    answer: "Yes, FoodLoop is free for donors and NGOs."
  },
  {
    id: "who_can_donate",
    category: "Donation",
    keywords: ["who", "donate", "donor", "give", "allowed"],
    variations: [
      "Who can donate food?",
      "Can I donate?",
      "What type of businesses can donate?",
      "Who are the donors?"
    ],
    answer: "Restaurants, hotels, bakeries, canteens, and event organizers."
  },
  {
    id: "who_can_receive",
    category: "NGOs",
    keywords: ["who", "receive", "get", "claim", "ngo", "shelter"],
    variations: [
      "Who can receive food?",
      "Who gets the food?",
      "Can anyone claim food?",
      "Who are the receivers?"
    ],
    answer: "NGOs, shelters, orphanages, and community fridges."
  },
  {
    id: "create_account",
    category: "Account",
    keywords: ["create", "account", "signup", "sign", "register", "join"],
    variations: [
      "How do I create an account?",
      "How do I sign up?",
      "Where can I register?",
      "I want to join FoodLoop."
    ],
    answer: "Click Sign Up and complete the registration form."
  },
  {
    id: "how_to_login",
    category: "Account",
    keywords: ["login", "log", "in", "signin", "access"],
    variations: [
      "How do I log in?",
      "Where do I sign in?",
      "How do I access my account?",
      "I want to login."
    ],
    answer: "Enter your email and password on the login page."
  },
  {
    id: "forgot_password",
    category: "Account",
    keywords: ["forgot", "password", "reset", "recover"],
    variations: [
      "I forgot my password.",
      "How do I reset my password?",
      "I can't log in.",
      "Password recovery."
    ],
    answer: "Use the Forgot Password option."
  },
  {
    id: "donate_cooked_food",
    category: "Donation",
    keywords: ["cooked", "food", "fresh", "prepared", "meals"],
    variations: [
      "Can I donate cooked food?",
      "Do you accept cooked meals?",
      "I have fresh cooked food.",
      "Is prepared food allowed?"
    ],
    answer: "Yes, fresh cooked food is accepted."
  },
  {
    id: "donate_packaged_food",
    category: "Donation",
    keywords: ["packaged", "sealed", "groceries", "items", "dry"],
    variations: [
      "Can I donate packaged food?",
      "Do you take sealed food?",
      "Are packaged groceries allowed?",
      "Can I give packed items?"
    ],
    answer: "Yes, sealed packaged food is accepted."
  },
  {
    id: "how_to_upload",
    category: "Donation",
    keywords: ["how", "upload", "list", "add", "listing"],
    variations: [
      "How do I upload food?",
      "How to create a listing?",
      "Where do I add food?",
      "How do I list surplus food?"
    ],
    answer: "Click Add Listing and enter food details."
  },
  {
    id: "upload_photos",
    category: "Donation",
    keywords: ["upload", "photos", "images", "pictures", "camera"],
    variations: [
      "Can I upload food photos?",
      "How to add pictures?",
      "Can I attach images?",
      "Do I need to take a photo?"
    ],
    answer: "Yes, image uploads are supported."
  },
  {
    id: "how_ai_matching_works",
    category: "AI Features",
    keywords: ["how", "ai", "matching", "work", "match"],
    variations: [
      "How does AI matching work?",
      "Explain the AI matchmaking.",
      "How do NGOs get matched?",
      "What algorithm is used?"
    ],
    answer: "AI matches food with nearby NGOs based on urgency and distance."
  },
  {
    id: "what_is_ai_score",
    category: "AI Features",
    keywords: ["what", "ai", "score", "rating", "priority"],
    variations: [
      "What is the AI score?",
      "Explain the AI rating.",
      "What does the priority score mean?",
      "Why is there an AI score?"
    ],
    answer: "It is the priority rating for food rescue."
  },
  {
    id: "how_to_claim",
    category: "NGOs",
    keywords: ["how", "claim", "food", "get", "request"],
    variations: [
      "How do I claim food?",
      "How to request a listing?",
      "I want to claim this food.",
      "Where is the claim button?"
    ],
    answer: "Open a listing and click Claim Food."
  },
  {
    id: "volunteers_join",
    category: "Volunteers",
    keywords: ["volunteers", "join", "help", "deliver", "driver"],
    variations: [
      "Can volunteers join FoodLoop?",
      "How do I become a volunteer?",
      "I want to help deliver food.",
      "Are delivery drivers needed?"
    ],
    answer: "Yes, volunteers can sign up and help deliver food."
  },
  {
    id: "route_optimization",
    category: "AI Features",
    keywords: ["routes", "optimized", "fastest", "path", "directions"],
    variations: [
      "How are routes optimized?",
      "How do I find the fastest route?",
      "Does the AI calculate directions?",
      "Explain route optimization."
    ],
    answer: "AI generates the fastest pickup path."
  },
  {
    id: "live_tracking",
    category: "Logistics",
    keywords: ["track", "deliveries", "live", "map", "status"],
    variations: [
      "Can I track deliveries live?",
      "Is there a live map?",
      "How do I see where the food is?",
      "Can I track the volunteer?"
    ],
    answer: "Yes, live tracking is available."
  },
  {
    id: "mobile_version",
    category: "General",
    keywords: ["mobile", "version", "app", "phone", "responsive"],
    variations: [
      "Is there a mobile version?",
      "Does FoodLoop have an app?",
      "Can I use this on my phone?",
      "Is it mobile responsive?"
    ],
    answer: "Yes, FoodLoop is mobile responsive."
  },
  {
    id: "use_at_night",
    category: "General",
    keywords: ["use", "night", "24/7", "time", "hours"],
    variations: [
      "Can I use FoodLoop at night?",
      "What are the operating hours?",
      "Is it available 24/7?",
      "Can I donate late at night?"
    ],
    answer: "Yes, the platform works 24/7."
  },
  {
    id: "ngo_registration",
    category: "NGOs",
    keywords: ["ngo", "register", "signup", "join", "organization"],
    variations: [
      "How do NGOs register?",
      "How can my shelter join?",
      "Where do NGOs sign up?",
      "NGO onboarding process."
    ],
    answer: "NGOs can sign up using the NGO registration form."
  },
  {
    id: "ngo_verification",
    category: "NGOs",
    keywords: ["ngo", "verification", "required", "verify", "safe"],
    variations: [
      "Is NGO verification required?",
      "Do I need to verify my NGO?",
      "Why is verification needed?",
      "Is it safe to donate?"
    ],
    answer: "Yes, verified NGOs ensure safe distribution."
  },
  {
    id: "edit_listing",
    category: "Donation",
    keywords: ["edit", "listing", "update", "change", "modify"],
    variations: [
      "Can I edit a listing?",
      "How to update my food post?",
      "I made a mistake in my listing.",
      "Can I modify the quantity?"
    ],
    answer: "Yes, donors can update listings anytime."
  },
  {
    id: "delete_listing",
    category: "Donation",
    keywords: ["delete", "listing", "remove", "cancel"],
    variations: [
      "Can I delete a listing?",
      "How to remove my post?",
      "Can I cancel my donation?",
      "I want to delete food."
    ],
    answer: "Yes, listings can be removed before pickup."
  },
  {
    id: "not_accepted_foods",
    category: "Donation",
    keywords: ["foods", "not", "accepted", "expired", "unsafe"],
    variations: [
      "What foods are not accepted?",
      "Can I donate expired food?",
      "Are there restricted items?",
      "What is not allowed?"
    ],
    answer: "Expired or unsafe foods are not accepted."
  },
  {
    id: "qr_verification",
    category: "Logistics",
    keywords: ["qr", "verification", "scan", "code", "pickup"],
    variations: [
      "How does QR verification work?",
      "How do I scan the QR code?",
      "How is pickup confirmed?",
      "What is the QR for?"
    ],
    answer: "Pickup is confirmed using QR scanning."
  },
  {
    id: "after_pickup",
    category: "Logistics",
    keywords: ["after", "pickup", "happens", "completed", "finish"],
    variations: [
      "What happens after pickup?",
      "Is the process complete after delivery?",
      "What to do when food is picked up?",
      "How does a listing finish?"
    ],
    answer: "The listing is marked completed."
  },
  {
    id: "donation_history",
    category: "Account",
    keywords: ["view", "donation", "history", "past", "dashboard"],
    variations: [
      "Can I view donation history?",
      "Where are my past donations?",
      "Can I see what I donated?",
      "Does the dashboard show history?"
    ],
    answer: "Yes, dashboards show past donations."
  },
  {
    id: "notifications",
    category: "General",
    keywords: ["receive", "notifications", "alerts", "sms", "email"],
    variations: [
      "Can I receive notifications?",
      "Do I get alerts?",
      "Are there SMS updates?",
      "Will I get emailed?"
    ],
    answer: "Yes, via app, SMS, or email."
  },
  {
    id: "emergency_alerts",
    category: "Features",
    keywords: ["emergency", "alerts", "urgent", "instant", "rescue"],
    variations: [
      "How do emergency alerts work?",
      "What happens when food is urgent?",
      "Who gets emergency notifications?",
      "Explain the emergency rescue."
    ],
    answer: "Urgent food sends instant notifications."
  },
  {
    id: "filter_listings",
    category: "Features",
    keywords: ["filter", "listings", "category", "urgency", "sort"],
    variations: [
      "Can I filter food listings?",
      "How to sort food posts?",
      "Can I filter by category?",
      "Is there a way to filter by urgency?"
    ],
    answer: "Yes, by category, urgency, and location."
  },
  {
    id: "search_city",
    category: "Features",
    keywords: ["search", "city", "location", "find", "area"],
    variations: [
      "Can I search by city?",
      "How do I find food in my area?",
      "Is location search available?",
      "Can I search for my town?"
    ],
    answer: "Yes, search functionality is available."
  },
  {
    id: "support_maps",
    category: "Features",
    keywords: ["support", "maps", "live", "integrated", "location"],
    variations: [
      "Does FoodLoop support maps?",
      "Is there a map view?",
      "Can I see locations on a map?",
      "Do you have map integration?"
    ],
    answer: "Yes, live maps are integrated."
  },
  {
    id: "which_maps",
    category: "Features",
    keywords: ["which", "maps", "google", "openstreetmap", "used"],
    variations: [
      "Which maps are used?",
      "Is it Google Maps?",
      "What map provider do you use?",
      "Are you using OpenStreetMap?"
    ],
    answer: "Google Maps or OpenStreetMap."
  },
  {
    id: "match_speed",
    category: "AI Features",
    keywords: ["fast", "matches", "generated", "seconds", "speed"],
    variations: [
      "How fast are matches generated?",
      "How long does matching take?",
      "Is AI matching quick?",
      "When will I find an NGO?"
    ],
    answer: "Usually within seconds."
  },
  {
    id: "bakeries_use",
    category: "Donation",
    keywords: ["bakeries", "bakery", "bread", "pastries", "surplus"],
    variations: [
      "Can bakeries use FoodLoop?",
      "I own a bakery, can I donate?",
      "Do you accept bakery items?",
      "Can bread be donated?"
    ],
    answer: "Yes, bakeries can donate surplus items."
  },
  {
    id: "wedding_halls",
    category: "Donation",
    keywords: ["wedding", "halls", "event", "leftovers", "party"],
    variations: [
      "Can wedding halls donate food?",
      "I have event leftovers.",
      "Can I donate party food?",
      "Are catering leftovers accepted?"
    ],
    answer: "Yes, event leftovers are supported."
  },
  {
    id: "what_is_ai",
    category: "AI Features",
    keywords: ["what", "foodloop", "ai", "assistant", "smart"],
    variations: [
      "What is FoodLoop AI?",
      "Who are you?",
      "Are you a bot?",
      "Explain the AI assistant."
    ],
    answer: "It is the smart assistant for matching and support."
  },
  {
    id: "chat_support",
    category: "General",
    keywords: ["chat", "support", "help", "assistance", "talk"],
    variations: [
      "Can I chat with support?",
      "Is there customer service?",
      "How do I get help?",
      "I need support."
    ],
    answer: "Yes, the AI chatbot provides assistance."
  },
  {
    id: "voice_input",
    category: "Features",
    keywords: ["voice", "input", "speech-to-text", "speak", "dictate"],
    variations: [
      "Does FoodLoop support voice input?",
      "Can I speak to type?",
      "Is there a microphone feature?",
      "Explain speech-to-text."
    ],
    answer: "Yes, speech-to-text is available."
  },
  {
    id: "translate_languages",
    category: "Features",
    keywords: ["translate", "languages", "multilingual", "spanish", "hindi"],
    variations: [
      "Can FoodLoop translate languages?",
      "Is multilingual support available?",
      "Can I use this in another language?",
      "How does translation work?"
    ],
    answer: "Yes, multilingual translation is supported."
  }
];
