import asyncio
import random
from datetime import date, datetime, timezone, timedelta
from sqlalchemy import select
from backend.app.core.database import AsyncSessionLocal, init_db
from backend.app.core.security import get_password_hash
from backend.app.models.user import User, UserRole, UserStatus, Verification, VerificationType, VerificationStatus
from backend.app.models.profile import Profile, ProfilePhoto, PromptAnswer
from backend.app.models.card import ConnectionCard, CardAnswer
from backend.app.models.match import Match, ConnectionRequest
from backend.app.models.chat import Conversation, Message
from backend.app.models.date import DatePlan
from backend.app.main import DEFAULT_CONNECTION_CARDS, seed_initial_platform_data

# Realistic Sri Lankan Fictional First Names & Last Names
FEMALE_NAMES = [
    ("Amaya", "Perera"), ("Senuri", "Fernando"), ("Dilini", "de Silva"), ("Nethmi", "Jayawardena"),
    ("Kavindi", "Wickramasinghe"), ("Dinithi", "Gunasekara"), ("Ananya", "Rajasingham"), ("Priyanka", "Sivalingam"),
    ("Tharushi", "Dissanayake"), ("Minoli", "Alwis"), ("Sanduni", "Karunaratne"), ("Meenakshi", "Sundaram"),
    ("Ishani", "Mendis"), ("Chathurika", "Bandara"), ("Zahra", "Mansoor"), ("Fatima", "Rizwan"),
    ("Ruwanthi", "Senanayake"), ("Natasha", "Peiris"), ("Vindya", "Samarasinghe"), ("Shalini", "Mahendran"),
    ("Hansani", "Fonseka"), ("Thilini", "Hettiarachchi"), ("Apeksha", "Ranasinghe"), ("Bavani", "Thiruchelvam"),
    ("Oshadi", "Weerasinghe"), ("Sachini", "Abeysekara"), ("Keshia", "Daniel"), ("Malithi", "Rajapakse")
]

MALE_NAMES = [
    ("Kaveen", "Perera"), ("Dinuk", "Fernando"), ("Chathura", "de Silva"), ("Ruvin", "Jayawardena"),
    ("Thisara", "Wickramasinghe"), ("Akila", "Gunasekara"), ("Sanjay", "Rajasingham"), ("Karthik", "Sivalingam"),
    ("Gayan", "Dissanayake"), ("Malinda", "Alwis"), ("Isuru", "Karunaratne"), ("Praveen", "Sundaram"),
    ("Nuwan", "Mendis"), ("Sachith", "Bandara"), ("Tariq", "Mansoor"), ("Zayan", "Rizwan"),
    ("Dilan", "Senanayake"), ("Shenal", "Peiris"), ("Janith", "Samarasinghe"), ("Arun", "Mahendran"),
    ("Tharindu", "Fonseka"), ("Roshan", "Hettiarachchi"), ("Avishka", "Ranasinghe"), ("Dharshan", "Thiruchelvam"),
    ("Chamath", "Weerasinghe"), ("Shehan", "Abeysekara"), ("Joshua", "Daniel"), ("Vishwa", "Rajapakse")
]

CITIES_NEIGHBORHOODS = [
    ("Colombo", "Colombo 03 (Kollupitiya)"),
    ("Colombo", "Colombo 04 (Bambalapitiya)"),
    ("Colombo", "Colombo 05 (Havelock Town)"),
    ("Colombo", "Colombo 07 (Cinnamon Gardens)"),
    ("Colombo", "Mount Lavinia"),
    ("Colombo", "Rajagiriya"),
    ("Colombo", "Nugegoda"),
    ("Kandy", "Kandy City"),
    ("Kandy", "Peradeniya"),
    ("Kandy", "Anniewatte"),
    ("Galle", "Galle Fort"),
    ("Galle", "Unawatuna"),
    ("Galle", "Karapitiya"),
    ("Negombo", "Negombo Beach Road"),
    ("Negombo", "Kochchikade"),
]

OCCUPATIONS = [
    "Software Engineer at Sysco LABS", "UX Designer & Illustrator", "Architectural Assistant",
    "Specialty Coffee Barista & Roaster", "Digital Marketer", "Doctor at NHSL Colombo",
    "Management Consultant", "Marine Biology Researcher", "Fintech Product Manager",
    "Civil Engineer", "Chartered Accountant (ACCA)", "Graphic Designer & Typography Nerd",
    "Lawyer (Supreme Court of Sri Lanka)", "Environmental Science Lecturer",
    "Data Scientist", "Apparel Merchandiser", "Hotel Operations Manager",
    "Copywriter & Content Creator", "Interior Stylist", "Physiotherapist"
]

RELATIONSHIP_INTENTS = [
    "Serious relationship",
    "Dating intentionally",
    "Open to seeing where it goes",
    "New connections",
]

COMMUNICATION_STYLES = [
    "Frequent texter & voice notes",
    "Focused during work, deep evening calls",
    "In-person preferred over endless texting",
    "Spontaneous banter & meme sender",
]

LIFESTYLE_PACES = [
    "Cafe explorer & beach sunsets",
    "Early riser, yoga & weekend surf trips",
    "Night owl, live indie gigs & late-night kottu",
    "Creative homebody with books & specialty tea",
    "Active outdoors, hiking & photography",
]

ALL_INTERESTS = [
    "Specialty Coffee", "Southern Coast Surfing", "Sri Lankan Literature",
    "Wildlife Photography", "Late Night Kottu Crawls", "Board Games & Catan",
    "Indie Live Music", "Modern Architecture", "Ceylon Tea Culture",
    "Trail Running & Hiking", "Art Galleries & Exhibitions", "Cinema & Documentaries",
    "Scuba Diving", "Cooking Local Curries", "Philosophy & Podcasts",
    "Cricket & Rugby Matches", "Vintage Thrift Fashion", "Guitar & Jamming"
]

PROMPT_TEMPLATES = [
    ("ideal_sunday", "My ideal Sunday in Sri Lanka looks like...", [
        "A slow brew pour-over, morning walk around Independence Square, and dinner at a seaside shack in Mount Lavinia.",
        "Catching the morning train to Galle Fort, iced latte at Pedlar's Inn, and watching the rampart sunset.",
        "Homemade pol roti and lunu miris with ginger tea, followed by reading on the balcony listening to the rain.",
        "Catching the dawn swell at Weligama or Mirissa, followed by coconut water and fresh tropical fruit.",
        "Heading up into the misty Hanthana ranges near Kandy for a trail walk, then hot kottu in town."
    ]),
    ("obsessed_with", "Currently obsessed with...", [
        "Finding the most authentic roast paan and crab curry spot in Colombo.",
        "Film photography around Pettah markets and Old Colombo colonial architecture.",
        "Collecting vinyl records of 70s Sri Lankan baila and jazz legends.",
        "Learning how to roast specialty single-estate Nuwara Eliya coffee beans at home.",
        "Re-reading Martin Wickramasinghe and Michael Ondaatje with an espresso."
    ]),
    ("green_flag", "A huge green flag in someone is...", [
        "They remember the small things you said in passing and show kindness to service staff.",
        "Being able to enjoy peaceful silence together without feeling pressured to fill it.",
        "Someone who loves their family and roots, but thinks independently and openly.",
        "They are genuinely excited about their passions and support yours without competition.",
        "Being prompt, respecting each other's time, and keeping their word."
    ]),
    ("talk_for_hours", "I could talk for hours about...", [
        "How Sri Lankan coastal marine ecosystems can be conserved sustainably.",
        "The evolution of contemporary South Asian art, typography, and storytelling.",
        "Why Galle Face sunsets hit differently on a windy monsoon evening.",
        "The greatest test cricket matches and underdog sporting moments in history.",
        "Science fiction literature, speculative futures, and philosophy of mind."
    ])
]

# Curated Unsplash portrait avatars representing warm, natural portraits
FEMALE_AVATARS = [
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&w=800&q=80",
]

MALE_AVATARS = [
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1513956589380-bad6acb9b9d4?auto=format&fit=crop&w=800&q=80",
]


async def seed_profiles(target_count: int = 100):
    print(f"Starting seed script for {target_count} realistic Sri Lankan profiles...")
    await init_db()
    await seed_initial_platform_data()

    async with AsyncSessionLocal() as db:
        # Load active cards
        cards_res = await db.execute(select(ConnectionCard).where(ConnectionCard.is_active == 1))
        connection_cards = cards_res.scalars().all()

        # Check existing count
        user_count_res = await db.execute(select(User).where(User.role == UserRole.USER.value))
        existing_users = user_count_res.scalars().all()
        if len(existing_users) >= target_count:
            print(f"Database already contains {len(existing_users)} seeded users. Skipping duplicate seeding.")
            return

        # Create Demo User: Senuri Fernando (Colombo 05, 24 years old, UX Designer)
        # Phone: +94771234567, OTP: 123456
        demo_phone = "+94771234567"
        existing_demo = await db.execute(select(User).where(User.phone == demo_phone))
        demo_user = existing_demo.scalar_one_or_none()

        if not demo_user:
            demo_user = User(
                phone=demo_phone,
                email="demo@mingle.lk",
                role=UserRole.USER.value,
                status=UserStatus.ACTIVE.value,
                is_phone_verified=True,
                is_email_verified=True,
                is_selfie_verified=True,
                is_profile_completed=True,
            )
            db.add(demo_user)
            await db.flush()

            demo_profile = Profile(
                user_id=demo_user.id,
                first_name="Senuri",
                birth_date=date(2001, 5, 14),
                gender="woman",
                looking_for_gender="everyone",
                city="Colombo",
                neighborhood="Colombo 05 (Havelock Town)",
                bio="Product & UX designer in Colombo. Coffee before conversations, weekend surf trips down south, and passionate about thoughtful architecture.",
                occupation="UX Designer & Illustrator",
                education="University of Moratuwa",
                relationship_intent="Dating intentionally",
                communication_style="Frequent texter & voice notes",
                lifestyle_pace="Cafe explorer & beach sunsets",
                interests=["Specialty Coffee", "Southern Coast Surfing", "Sri Lankan Literature", "Modern Architecture", "Ceylon Tea Culture"],
                languages=["English", "Sinhala"],
            )
            db.add(demo_profile)
            await db.flush()

            # Photo
            db.add(ProfilePhoto(
                profile_id=demo_profile.id,
                url=FEMALE_AVATARS[0],
                caption="Coffee & afternoon sketches in Havelock Town",
                is_primary=True,
                order_index=0
            ))
            db.add(ProfilePhoto(
                profile_id=demo_profile.id,
                url="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80",
                caption="Weekend in Galle Fort",
                is_primary=False,
                order_index=1
            ))

            # Prompts
            db.add(PromptAnswer(
                profile_id=demo_profile.id,
                prompt_key="ideal_sunday",
                prompt_question="My ideal Sunday in Sri Lanka looks like...",
                answer_text="A slow brew pour-over, morning walk around Independence Square, and dinner at a seaside shack in Mount Lavinia."
            ))
            db.add(PromptAnswer(
                profile_id=demo_profile.id,
                prompt_key="green_flag",
                prompt_question="A huge green flag in someone is...",
                answer_text="They remember the small things you said in passing and show genuine kindness to service staff."
            ))

            # Card answers for demo user
            for card in connection_cards[:3]:
                db.add(CardAnswer(
                    profile_id=demo_profile.id,
                    card_id=card.id,
                    selected_option_key="A",
                    comment="Definitely my top pick!"
                ))
            print("Demo user Senuri Fernando (+94771234567 / OTP 123456) seeded successfully.")

        # Seed Fictional Profiles
        genders = ["woman", "man"]
        created_profiles = []

        for i in range(target_count):
            gender = "woman" if i % 2 == 0 else "man"
            name_pool = FEMALE_NAMES if gender == "woman" else MALE_NAMES
            first_name, last_name = name_pool[i % len(name_pool)]
            # Add variation to make each unique
            unique_suffix = f"{i + 1:03d}"
            email = f"{first_name.lower()}.{last_name.lower()}.{unique_suffix}@katha-seed.lk"
            phone = f"+9477{random.randint(1000000, 9999999)}"

            # Age between 21 and 35
            age_years = random.randint(21, 35)
            birth_year = 2026 - age_years
            birth_month = random.randint(1, 12)
            birth_day = random.randint(1, 28)
            birth_date = date(birth_year, birth_month, birth_day)

            city, neighborhood = random.choice(CITIES_NEIGHBORHOODS)
            occupation = random.choice(OCCUPATIONS)
            intent = random.choice(RELATIONSHIP_INTENTS)
            comm_style = random.choice(COMMUNICATION_STYLES)
            lifestyle = random.choice(LIFESTYLE_PACES)
            interests = random.sample(ALL_INTERESTS, k=random.randint(3, 5))
            
            # Languages
            langs = ["English"]
            if random.random() > 0.3:
                langs.append("Sinhala")
            if random.random() > 0.6:
                langs.append("Tamil")

            # Verification indicators
            is_selfie = (random.random() > 0.4)
            is_phone = True
            is_email = (random.random() > 0.2)

            user = User(
                email=email,
                phone=phone,
                role=UserRole.USER.value,
                status=UserStatus.ACTIVE.value,
                is_phone_verified=is_phone,
                is_email_verified=is_email,
                is_selfie_verified=is_selfie,
                is_profile_completed=True,
                discovery_enabled=True,
                approximate_distance_only=True,
                show_neighborhood_only=True,
            )
            db.add(user)
            await db.flush()

            bio = f"{occupation} based in {neighborhood}. Passionate about {interests[0].lower()} and {interests[1].lower()}. Looking for meaningful connections and good conversation."

            profile = Profile(
                user_id=user.id,
                first_name=first_name,
                birth_date=birth_date,
                gender=gender,
                looking_for_gender="everyone",
                city=city,
                neighborhood=neighborhood,
                bio=bio,
                occupation=occupation,
                education="Graduate Degree",
                relationship_intent=intent,
                communication_style=comm_style,
                lifestyle_pace=lifestyle,
                interests=interests,
                languages=langs,
            )
            db.add(profile)
            await db.flush()
            created_profiles.append((user, profile))

            # Avatar photo
            avatar_pool = FEMALE_AVATARS if gender == "woman" else MALE_AVATARS
            primary_avatar = avatar_pool[i % len(avatar_pool)]
            db.add(ProfilePhoto(
                profile_id=profile.id,
                url=primary_avatar,
                caption=f"Living life in {neighborhood}",
                is_primary=True,
                order_index=0
            ))

            # 2 Random Prompts
            sample_prompts = random.sample(PROMPT_TEMPLATES, 2)
            for p_key, p_question, p_answers in sample_prompts:
                db.add(PromptAnswer(
                    profile_id=profile.id,
                    prompt_key=p_key,
                    prompt_question=p_question,
                    answer_text=random.choice(p_answers)
                ))

            # 3 Random Connection Card answers
            sample_cards = random.sample(connection_cards, min(3, len(connection_cards)))
            for card in sample_cards:
                chosen_opt = random.choice(card.options)["key"]
                db.add(CardAnswer(
                    profile_id=profile.id,
                    card_id=card.id,
                    selected_option_key=chosen_opt,
                    comment="Resonates with me completely."
                ))

        await db.commit()
        print(f"Successfully seeded {len(created_profiles)} rich Sri Lankan profiles across Colombo, Kandy, Galle, and Negombo!")

        # Create 2 initial matches and a sample conversation for Demo User so investor demo has immediate lively state!
        if demo_user and len(created_profiles) >= 3:
            user_b, profile_b = created_profiles[0]
            user_c, profile_c = created_profiles[1]

            # Match 1 with user_b
            m1 = Match(
                user1_id=demo_user.id,
                user2_id=user_b.id,
                compatibility_score=88.5,
                match_reasons=[
                    f"Aligned intention: Both looking for {demo_profile.relationship_intent.lower()}",
                    f"Shared passions: {profile_b.interests[0]} & {demo_profile.interests[0]}",
                    "Both value calm weekend coffee over crowded clubs"
                ],
                is_active=True
            )
            db.add(m1)
            await db.flush()

            c1 = Conversation(match_id=m1.id)
            db.add(c1)
            await db.flush()

            # Add sample messages
            msg1 = Message(
                conversation_id=c1.id,
                sender_id=user_b.id,
                content=f"Hey Senuri! Loved that you also picked surf & beach sunset for your ideal Saturday. Which spot on the southern coast is your go-to?",
                created_at=datetime.now(timezone.utc) - timedelta(hours=3),
                read_at=datetime.now(timezone.utc) - timedelta(hours=2)
            )
            msg2 = Message(
                conversation_id=c1.id,
                sender_id=demo_user.id,
                content="Hey! Midigama and Hiriketiya for sure. Nothing beats a sunset session after a long design sprint!",
                created_at=datetime.now(timezone.utc) - timedelta(hours=2),
                read_at=datetime.now(timezone.utc) - timedelta(hours=1)
            )
            msg3 = Message(
                conversation_id=c1.id,
                sender_id=user_b.id,
                content="Hiriketiya is magic! There's a great little cafe near the horseshoe bay. Would you be open to grabbing a coffee sometime?",
                created_at=datetime.now(timezone.utc) - timedelta(minutes=45)
            )
            db.add_all([msg1, msg2, msg3])

            # Propose a Date Plan
            dplan = DatePlan(
                match_id=m1.id,
                proposed_by_id=user_b.id,
                category="Coffee & Walk",
                venue_name="Barefoot Garden Cafe",
                neighborhood="Colombo 03",
                budget_bracket="Under LKR 2,000",
                scheduled_time=datetime.now(timezone.utc) + timedelta(days=2, hours=4),
                status="proposed",
                invitation_note="Thought we could grab iced coffee and check out the gallery bookshop!"
            )
            db.add(dplan)

            # Match 2 with user_c
            m2 = Match(
                user1_id=demo_user.id,
                user2_id=user_c.id,
                compatibility_score=82.0,
                match_reasons=[
                    "Shared appreciation for Sri Lankan literature & art",
                    f"Nearby in {profile_c.neighborhood}",
                    "Both prefer thoughtful communication"
                ],
                is_active=True
            )
            db.add(m2)
            await db.flush()

            c2 = Conversation(match_id=m2.id)
            db.add(c2)
            await db.flush()

            # Add incoming connection request from profile 3
            if len(created_profiles) >= 3:
                user_d, profile_d = created_profiles[2]
                req = ConnectionRequest(
                    sender_id=user_d.id,
                    receiver_id=demo_user.id,
                    intro_note="Hey Senuri, your note on Independence Square Sunday walks really resonated. Would love to connect!",
                    status="pending"
                )
                db.add(req)

            await db.commit()
            print("Created rich demo conversation, active matches, and date proposal for the Demo User!")


if __name__ == "__main__":
    asyncio.run(seed_profiles(100))
