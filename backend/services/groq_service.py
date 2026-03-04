from groq import Groq
from models import Person, Photo, Face
import os

client = Groq(api_key=os.getenv('GROQ_API_KEY'))


def get_ai_response(user_message, user_id):
    """
    Sends user message to Groq AI and returns a response.
    Also detects if user wants to search photos or send them.
    """
    try:
        # Get user's people list to give AI context
        people = Person.query.filter_by(user_id=user_id).all()
        people_names = [p.name for p in people]

        # Get total photos count
        total_photos = Photo.query.filter_by(user_id=user_id).count()

        # Build system prompt
        system_prompt = f"""
You are Drishyamitra, an intelligent photo management assistant.
You help users find, organize, and share their photos using natural language.

Current user has:
- {total_photos} photos in their library
- Known people: {', '.join(people_names) if people_names else 'None added yet'}

You can help users with:
1. Finding photos of specific people (e.g. "Show me photos of Mom")
2. Sending photos via email (e.g. "Email Dad's photos to example@gmail.com")
3. Sending photos via WhatsApp (e.g. "Send photos of Priya to +91XXXXXXXXXX")
4. Organizing and managing their photo library

When user asks to find photos, respond with:
ACTION: FIND_PHOTOS
PERSON: <person name>

When user asks to send via email, respond with:
ACTION: SEND_EMAIL
PERSON: <person name>
RECIPIENT: <email address>

When user asks to send via WhatsApp, respond with:
ACTION: SEND_WHATSAPP
PERSON: <person name>
PHONE: <phone number>

For general questions, just respond conversationally and helpfully.
Always be friendly, helpful and concise.
"""

        # Call Groq API
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_message}
            ],
            max_tokens=500,
            temperature=0.7
        )

        ai_reply = response.choices[0].message.content

        # Parse action from AI response
        parsed = parse_ai_action(ai_reply, user_id)
        if parsed:
            return parsed

        return ai_reply

    except Exception as e:
        print(f"Groq API error: {e}")
        return "Sorry, I'm having trouble understanding that. Please try again!"


def parse_ai_action(ai_reply, user_id):
    """
    Parses structured actions from AI response
    and executes them automatically.
    """
    lines = ai_reply.strip().split('\n')
    action = None
    person_name = None
    recipient = None
    phone = None

    for line in lines:
        if line.startswith('ACTION:'):
            action = line.replace('ACTION:', '').strip()
        elif line.startswith('PERSON:'):
            person_name = line.replace('PERSON:', '').strip()
        elif line.startswith('RECIPIENT:'):
            recipient = line.replace('RECIPIENT:', '').strip()
        elif line.startswith('PHONE:'):
            phone = line.replace('PHONE:', '').strip()

    if not action:
        return None

    # Find person in database
    person = None
    if person_name:
        person = Person.query.filter(
            Person.user_id == user_id,
            Person.name.ilike(f'%{person_name}%')
        ).first()

    if action == 'FIND_PHOTOS':
        if not person:
            return f"I couldn't find anyone named '{person_name}' in your library. Please add them first!"

        faces = Face.query.filter_by(person_id=person.id).all()
        photo_count = len(faces)

        if photo_count == 0:
            return f"No photos found for {person.name} yet."

        return f"Found {photo_count} photo(s) of {person.name}! Check the gallery to view them."

    elif action == 'SEND_EMAIL':
        if not person:
            return f"I couldn't find anyone named '{person_name}' in your library."
        if not recipient:
            return "Please provide an email address to send to."

        faces = Face.query.filter_by(person_id=person.id).all()
        photo_ids = [f.photo_id for f in faces]

        if not photo_ids:
            return f"No photos found for {person.name}."

        from services.gmail_service import send_photos_via_email
        result = send_photos_via_email(recipient, photo_ids, user_id)
        return result.get('message', 'Photos sent successfully!')

    elif action == 'SEND_WHATSAPP':
        if not person:
            return f"I couldn't find anyone named '{person_name}' in your library."
        if not phone:
            return "Please provide a phone number to send to."

        faces = Face.query.filter_by(person_id=person.id).all()
        photo_ids = [f.photo_id for f in faces]

        if not photo_ids:
            return f"No photos found for {person.name}."

        from services.whatsapp_service import send_photos_via_whatsapp
        result = send_photos_via_whatsapp(phone, photo_ids, user_id)
        return result.get('message', 'Photos sent successfully!')

    return None