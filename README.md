# Heartfelt Surprises

Build a Free Personalized Birthday Surprise Web App



Build a polished, mobile-first web application for creating and sharing personalized interactive birthday surprises.



The app should be an original design inspired by the general concept of interactive birthday greeting websites. Do NOT copy any proprietary code, branding, graphics, text, assets, or exact visual implementation from existing websites.



Core Goal



The creator fills out a birthday form, uploads photos, writes personalized messages, previews the experience, and generates a unique birthday page.



The recipient receives a public URL such as:



"/birthday/{unique-id}"



and sees only the finished interactive birthday experience.



There must be NO payment system, subscription system, or login requirement for the first version.



---



TECH STACK



Use:



- React

- TypeScript

- Tailwind CSS

- Modern component architecture

- Supabase for database and storage

- Framer Motion or an appropriate animation library for animations

- Responsive/mobile-first design



Keep the code modular and maintainable.



Do not put all functionality into one giant component.



---



ROUTES



Create these routes:



"/"



Landing page



"/create"



Birthday creation form



"/preview/:id"



Preview of the generated birthday experience



"/birthday/:id"



Public recipient-facing birthday experience



---



LANDING PAGE



Create a beautiful minimal landing page.



Hero:



"Create a Birthday Surprise They'll Remember ❤️"



Supporting text:



"Turn your memories, words and wishes into an interactive birthday experience."



Primary CTA:



"Create a Surprise"



Secondary CTA:



"See How It Works"



Use subtle animations and a premium romantic aesthetic.



Do not make the page look like a generic SaaS dashboard.



---



CREATION FORM



Create a multi-step form instead of one extremely long form.



Show a progress indicator.



Step 1 — Basic Details



Fields:



- Birthday person's name

- Sender's name

- Birthday date

- Age

- Relationship

- Intro message



All required except relationship and age.



---



Step 2 — Reasons



Allow the creator to enter multiple reasons/messages.



Example:



"I love your smile."



"You make ordinary days special."



"You always know how to make me laugh."



Allow adding/removing reasons.



Minimum: 1



Maximum: 12



These will later appear as interactive balloons.



---



Step 3 — Memories



Allow uploading photos.



Maximum: 10 photos.



For each photo optionally allow:



- Caption

- Short memory



Show thumbnails after upload.



Allow removing/reordering photos.



Use Supabase Storage.



Do not store raw image data directly in the database.



---



Step 4 — Birthday Letter



Provide a large text area for a personal birthday letter.



Show a live character count.



The letter should support line breaks.



---



Step 5 — Experience Settings



Allow:



Theme



Options:



- Romantic

- Dreamy

- Midnight

- Celebration



Music



Allow selecting from available built-in royalty-safe tracks.



Also provide an option to disable music.



Do NOT use copyrighted songs without permission.



Music must require a user interaction before playback because of browser autoplay restrictions.



---



Step 6 — Preview



Show:



"Your surprise is ready."



Display the generated birthday experience inside a preview.



Buttons:



"Edit"



"Generate Birthday Page"



When Generate is pressed:



1. Validate all data.

2. Upload photos to Supabase Storage.

3. Create the birthday record in Supabase.

4. Generate a unique ID.

5. Save all configuration data.

6. Navigate to "/birthday/{id}".

7. Show a share screen containing the generated URL.



---



SUPABASE DATABASE



Create a table:



"birthday_pages"



Suggested fields:



- id

- recipient_name

- sender_name

- birthday_date

- age

- relationship

- intro_message

- letter

- theme

- music_enabled

- music_track

- created_at



Create another table:



"birthday_reasons"



Fields:



- id

- birthday_page_id

- text

- display_order

- created_at



Create another table:



"birthday_photos"



Fields:



- id

- birthday_page_id

- storage_path

- public_url

- caption

- memory

- display_order

- created_at



Use foreign keys appropriately.



---



SUPABASE STORAGE



Create/use a storage bucket for birthday photos.



Organize uploads using the birthday page ID.



Example:



"birthday-photos/{birthday-page-id}/{unique-file-name}"



Validate:



- image file type

- reasonable file size

- maximum number of uploads



Compress/resize images on the client where practical before uploading.



Do not expose private credentials in frontend code.



Use the Supabase anon/public key only where appropriate.



---



SECURITY



Implement sensible Supabase Row Level Security.



The public birthday page should be readable using its unique ID.



Creators should not be able to arbitrarily modify another birthday page.



Do not expose Supabase service-role keys in the browser.



Do not place secrets in frontend environment variables that are intended to remain private.



---



RECIPIENT EXPERIENCE



This is the most important part of the application.



The recipient-facing page should NOT look like a form or dashboard.



It should feel like a cinematic interactive birthday surprise.



Use:



- full-screen sections

- smooth transitions

- elegant typography

- subtle particles/glows

- tasteful motion

- responsive layouts

- touch-friendly interactions



Avoid excessive effects that make the page slow or childish.



---



EXPERIENCE FLOW



Scene 1 — Opening



Dark atmospheric background.



Show:



"Someone made something special for you..."



Then:



"Tap to begin ❤️"



On interaction, transition into the birthday experience.



---



Scene 2 — Birthday Reveal



Reveal the recipient's name.



Example:



"Happy Birthday, [NAME]"



Then display the creator's intro message.



Use a beautiful text reveal animation.



---



Scene 3 — Cake



Display an animated birthday cake.



Show candles.



Allow the recipient to interact with the candles.



After the interaction:



- candles go out

- glow effect

- confetti/fireworks

- birthday message appears



Do not require microphone access.



Use tap/click interaction as the reliable fallback.



---



Scene 4 — Reasons / Balloons



Create floating balloons.



Each balloon corresponds to one reason from the creator.



The recipient taps a balloon.



The balloon pops with animation.



The corresponding message appears elegantly.



Allow the recipient to continue until all reasons are revealed.



Do not reveal all messages immediately.



---



Scene 5 — Memories



Display uploaded photos as an interactive memory gallery.



Use elegant cards/polaroid-style layouts.



Each photo can display:



- image

- caption

- memory



Support:



- swipe on mobile

- arrow controls on desktop



Use smooth transitions.



Do not distort images.



Use object-fit appropriately.



---



Scene 6 — Letter



Create an envelope.



Text:



"There's one more thing..."



The recipient taps the envelope.



Animate the envelope opening.



Reveal the birthday letter.



Use a handwritten-style font if available, but keep readability high.



Reveal the letter progressively rather than showing everything instantly.



---



Scene 7 — Finale



After the letter:



Show:



"Happy Birthday, [NAME] ❤️"



Then display a final message from the sender.



Trigger tasteful confetti/particle effects.



Include:



"Replay the Surprise"



button.



---



MUSIC



If music is enabled:



Do not autoplay audio before user interaction.



After the recipient taps the opening screen, begin the selected track.



Provide a small unobtrusive music control.



Allow:



- play

- pause

- mute



Remember that mobile browsers restrict autoplay.



---



RESPONSIVENESS



The primary target is mobile.



Optimize for:



- Android phones

- iPhones

- modern mobile browsers



Also support desktop.



Never allow text, buttons, balloons, photos or animations to overflow horizontally.



Use viewport-safe layouts.



Respect mobile safe areas.



---



PERFORMANCE



Optimize aggressively because birthday pages may contain multiple photos.



Use:



- lazy loading

- compressed images

- appropriate image dimensions

- CSS transforms for animations

- minimal unnecessary re-renders



Avoid huge video backgrounds.



The page should load quickly even on a normal mobile connection.



---



UX REQUIREMENTS



The creator should always know:



- what step they are on

- what remains incomplete

- whether uploads succeeded

- whether the birthday page was generated



Show useful loading states.



Show useful error messages.



Never silently fail.



If an image upload fails, clearly identify which image failed.



---



SHARE SCREEN



After generation display:



"Your birthday surprise is ready ❤️"



Show the generated URL.



Buttons:



"Copy Link"



"Open Birthday Page"



"Create Another"



Use the browser Clipboard API for Copy Link.



---



DESIGN DIRECTION



The website should feel:



- emotional

- elegant

- premium

- cinematic

- personal

- modern



Avoid:



- generic Bootstrap appearance

- excessive gradients

- huge amounts of text

- childish clipart

- unnecessary UI elements

- excessive rounded cards everywhere



Use a strong visual hierarchy.



Animations should enhance emotion rather than exist merely because animation is possible.



---



IMPORTANT IMPLEMENTATION RULES



1. Build the application as reusable React components.

2. Separate creator UI from recipient UI.

3. Keep birthday data dynamic.

4. Never hard-code a specific person's birthday information.

5. Use Supabase for persistent birthday data and photo storage.

6. Make the generated page accessible using a unique ID.

7. Do not implement payments.

8. Do not require user accounts for V1.

9. Do not use copyrighted music/assets without appropriate rights.

10. Do not copy another website's source code, branding, or proprietary assets.

11. Include loading, empty and error states.

12. Make all interactive elements keyboard-accessible where applicable.

13. Make the experience work without microphone permissions.

14. Ensure the generated birthday page can be opened directly from its URL without going through the creator page.

15. Keep the code ready for future features such as custom domains, authentication, expiration, analytics and paid plans, but DO NOT implement those features now.



---



DEVELOPMENT APPROACH



First implement the complete functional flow:



Landing → Create → Upload → Save → Preview → Generate → Public Birthday Page.



Then polish the visual design and animations.



Do not sacrifice functionality for visual effects.



At the end, verify:



- Supabase connection works

- database records are created correctly

- photos upload correctly

- generated IDs work

- direct "/birthday/{id}" URLs work

- mobile layout works

- refresh on the birthday URL still loads the correct birthday

- no secret keys are exposed

- errors are handled properly



Build the application now.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/5e49a881-dec0-4658-aef9-6d814f62978c).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
