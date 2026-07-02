import type { Category, Mood } from "./taxonomy";

/**
 * Editorial copy for archive pages (mood, category, and select tags).
 *
 * These archives are the site's search surface: the pages that can rank for
 * queries like "stories to read when you can't sleep". Each needs enough
 * unique, human-quality text to be an answer rather than a card grid — see
 * docs/seo-quality-roadmap.md, Phase 1.
 *
 * Rules for this copy (mirrors the story voice spec where it applies):
 * - Plain words, no em dashes, no AI-tell vocabulary, no rule-of-three padding.
 * - Every piece must be unique; no shared phrasing between archives.
 * - First paragraph is always visible on the page; the rest sits behind a
 *   disclosure, but all of it ships in the HTML.
 * - `seoDescription` is the SERP snippet: 140–160 chars, written for a click.
 */
export interface ArchiveCopy {
  /** Meta description used verbatim in metadata + JSON-LD. */
  seoDescription: string;
  /** Intro paragraphs. First is the visible lede; the rest are collapsible. */
  intro: string[];
}

export const MOOD_ARCHIVE_COPY: Record<Mood, ArchiveCopy> = {
  CANT_SLEEP: {
    seoDescription:
      "Short stories to read when you can't sleep. Honest, quiet, two minutes each, written for the hours between 2am and whenever your mind lets go.",
    intro: [
      "It's late, you've tried, and sleep isn't coming. These are short stories for exactly that: two or three minutes each, written in the voice of someone lying awake the same way you are.",
      "Being unable to sleep is rarely about sleep. It's the unsent message, tomorrow's meeting replaying tonight, the ceiling you've memorized. The stories in this feed start from those places. Someone counts the hours until an alarm that keeps getting closer. Someone rereads a conversation they should have archived. Someone listens to the building settle and tries to decide whether the sound means anything. Ordinary rooms, ordinary worry, told plainly.",
      "None of them end with a twist, and none of them tie anything up. Each one closes on a small line that lands somewhere true, which is about as much resolution as this hour offers anyone. They're not designed to knock you out. They're company. Reading one is closer to hearing a stranger admit they're awake too.",
      "A note on why this works better than the feed you were just in. Scrolling is designed to keep you awake; it pays its bills that way. A two-minute story has a shape instead: a beginning, a middle, and a line that ends. Your mind gets to complete something, which is exactly what it's been failing to do with tomorrow's worries for the past hour. Nobody here will promise you sleep. But finishing a small thing at 3am is its own kind of unwinding, and it beats reading the news again.",
      "Start at the top, which is the newest, or hit the random button and let the night deal you one. If a story leaves you wanting a particular ache, the tags underneath it lead sideways to more of the same. The feed updates most nights, so tomorrow it will hold a story that didn't exist tonight, which is a small thing to look forward to at a bad hour.",
    ],
  },
  DARK: {
    seoDescription:
      "Dark short stories to read at night. Grounded, quietly wrong, no gore. For the nights you want something with teeth instead of something soothing.",
    intro: [
      "Sometimes you don't want comfort. You want something with teeth, a story that leans into the dark instead of switching a light on. This is that shelf.",
      "Dark here doesn't mean gore, and it rarely means monsters. It means the ordinary thing that is quietly wrong: the apartment sound you can't place, the text from a number that shouldn't exist, the neighbor's routine that stopped making sense last month. The dread stays grounded, the rooms stay real, and nothing gets explained away at the end. Whatever was wrong when the story started is still wrong when it ends, just better lit.",
      "Each story runs a few minutes, first person, told by someone who was there and still isn't sure what they saw. There's no twist waiting to let you off. The last line just turns slightly, and the story stays in the room after you've closed it. If you've ever read something short at night and then checked the hallway, that's the effect these are after.",
      "People come to this mood for different reasons. Some nights the dark stories work like a controlled burn, a safe place to put a feeling that has nowhere else to go. Other nights it's plainer than that: you're awake, the house is quiet, and you want fiction that matches the lighting. Both are good reasons. The stories don't ask which one brought you. They run one to five on the intensity scale, most in the upper middle, and the tags under each one will tell you before you commit.",
      "If you want fear specifically, the horror category cuts closer. This mood is wider than fear: it holds the bleak, the bitter, and the merely shadowed too. Read one and see where the night takes it. They're short enough that one more is always a reasonable decision.",
    ],
  },
  MISS_SOMEONE: {
    seoDescription:
      "Stories about missing someone, for the nights they won't leave your head. Exes, old friends, people gone. Short, honest, written after 2am.",
    intro: [
      "Someone is on your mind, and it's late enough that you've stopped pretending otherwise. These stories are about missing people: exes, old friends, family, the ones who left and the ones who are still around but different now.",
      "Missing someone at night has its own vocabulary. The contact you can't delete. The profile you check even though checking never once helped. The draft rewritten four times and never sent. The stories in this feed live inside those small acts, told by people doing them at the same hour you are. Some of them miss a person. Some miss the version of themselves that existed around that person, which is harder to admit.",
      "They're short, a couple of minutes each, and they don't end in reunions. No airport scenes. What they offer instead is precision: the exact shape of an absence, named well enough that yours feels less strange. That's the trade this hour makes. You don't get the person back. You get to feel accurately, and at this hour, accuracy is the available mercy.",
      "There's a specific relief in this feed that's hard to explain until it happens. You read a story where someone does the exact thing you did an hour ago, checks the same nothing, invents the same excuse, and the loneliness of the habit breaks a little. Not the missing itself. The missing stays. But missing someone in company is measurably lighter than missing them alone, and a feed of strangers doing it honestly is the closest thing the internet has to that company at this hour.",
      "Read the newest first or wander by tag. The romance and ties categories overlap with this feeling from different angles, love that's still alive on one side, family and friendship on the other. All of it is written for the same hours you're keeping now.",
    ],
  },
  EMPTY: {
    seoDescription:
      "Stories for when you feel empty or numb at night. Quiet, hollow, honest short reads that name the flatness instead of trying to fix it.",
    intro: [
      "Not sad, exactly. Not anything, exactly. There's a specific flatness that shows up late at night, and these stories are written from inside it.",
      "Feeling empty is hard to describe without sounding dramatic, which is why most descriptions of it fail. The stories here work small instead. A kitchen at 3am with nothing wrong in it and nothing right either. A person scrolling without registering a single post. The group chat that used to be loud, still muted, nobody noticing. A shower taken at the wrong hour just to have done something. Flatness lives in details like these, and naming the details is the closest language gets to it.",
      "Nothing in this feed will try to cheer you up. No arcs of healing, no lesson in the last paragraph. Each story just sits where you're sitting and describes the room honestly, and then one line near the end catches on something real. Oddly, that helps more than encouragement does. Being described accurately is a kind of company.",
      "If you're wondering whether reading about flatness makes flatness worse, fair question. It doesn't seem to work that way. Encouragement bounces off this feeling because encouragement argues with it, and it doesn't argue back, it just sits there. Description gets underneath it. A story that renders the exact texture of a numb evening proves that someone else has been in this room and left again, which is quiet evidence the room has a door. That's all these stories claim. It's more than it sounds like at 3am.",
      "They take about two minutes each. Read one, or several, or just let the page sit open in the dark. If the hollow feeling has a direction tonight, the reflective mood is quieter and turned inward, and the existential category asks the bigger versions of the same questions.",
    ],
  },
  REFLECTIVE: {
    seoDescription:
      "Quiet, thoughtful stories for late-night reflection. Slow first-person reads about time, choices, and the versions of yourself that surface after 2am.",
    intro: [
      "Some nights aren't heavy, they're just deep. The house is quiet, tomorrow hasn't started, and your mind is walking back through things at its own pace. These stories keep that pace.",
      "They're slow on purpose. Someone drives home the long way and lets a memory ride along. Someone finds an old note in their own handwriting and doesn't fully recognize the person who wrote it. Someone measures the distance between the life they planned at nineteen and the one they're actually in. No crisis anywhere, just attention, which turns out to be what this hour is best at. Daytime attention is spent before it ever reaches you. The 3am kind has nowhere else to be.",
      "Each piece runs a few minutes and closes on a quiet realization rather than an ending. Not a moral. More like the moment a thought finishes forming after circling all evening. You've had those. These are what they look like written down.",
      "The stories reward a certain kind of reading. Don't skim them the way you skim everything else this late; they're built at talking speed, and the turns are small enough to miss. One is about the way a father loads a dishwasher. One is about the last time a narrator ran anywhere, years ago, and what stopped. If those sound like nothing, that's the register working. The point of this mood is that nothing, looked at long enough after 2am, is usually something.",
      "This mood pairs naturally with the existential category, where the questions get bigger, and with ties, where the reflection turns toward other people. But it stands fine on its own. Pick the newest, or scroll until a title sounds like the night you're having. The feed is short-form, but nothing about it is in a hurry. For once, neither are you.",
    ],
  },
  UNSETTLING: {
    seoDescription:
      "Unsettling short stories that sit just under the skin. Eerie without gore, wrong in quiet ways. For the nights you feel uneasy and want company in it.",
    intro: [
      "Something feels off tonight and you'd rather lean into it than shake it. This feed is for that exact instinct: stories that are eerie without ever raising their voice.",
      "Unsettling is its own register, different from horror. Horror wants your fear. Unsettling wants your doubt. A detail in a familiar room stops adding up. A stranger knows one thing they shouldn't. An elevator stops on a floor nobody pressed, once, and never does it again. The stories here stay almost entirely ordinary, which is what makes the one wrong thread in each of them hard to put down. Nothing announces itself. The wrongness has to be noticed, which makes you complicit in finding it.",
      "They're first person and short, told by people who mostly talk themselves out of what they noticed. The endings don't explain. The last line recolors what you already read and leaves it at that, so the unease is yours to keep. On the intensity scale these sit in the middle: nothing graphic, nothing safe.",
      "A practical note: these stories calibrate differently depending on your night. Read at noon, they're clever. Read at 2:47am with the kitchen light off, the same paragraph has a pulse. The feed doesn't manufacture that difference, the hour does. Which is why the stories are short: unease compounds when you supply the silence between them yourself. Two or three in a row is the recommended dose. Past that you start hearing your own apartment differently, and that's on you.",
      "Cross a certain line and you're in horror territory, and that category is one link away. If tonight's uneasy feeling is more emotional than eerie, the dark mood holds the bleaker, heavier stories. This one is for the itch you can't locate. The stories won't scratch it. They'll trace its outline, which is better.",
    ],
  },
};

export const CATEGORY_ARCHIVE_COPY: Record<Category, ArchiveCopy> = {
  HORROR: {
    seoDescription:
      "Short horror stories to read at night. Grounded dread, no gore, no cheap twists. The ordinary thing that's quietly wrong, in two-minute reads.",
    intro: [
      "Short horror, written for the hours when the house makes sounds you don't investigate. Grounded, patient, and almost never supernatural, which somehow makes it worse.",
      "The horror here starts in real rooms. A night shift where the badge reader logs someone who doesn't work there anymore. A childhood game a sibling denies ever playing. A voicemail that's just breathing, from your own number. No masked figures, no gore, nothing jumping out. The fear comes from a detail that refuses to sit still, and from a narrator slowly running out of harmless explanations. By the time the last one runs out, so has the story, and you're alone with what's left.",
      "Every story is first person and takes about two minutes, the length of a held breath. Endings don't resolve. They turn once, quietly, and hand the story to you to carry to bed. If you've ever wanted to be scared in a way that doesn't insult your intelligence, that's the aim here.",
      "What earns a story this label instead of unsettling or dark is commitment. An unsettling story lets you keep one foot in a harmless explanation. A horror story takes the explanation away, calmly, and watches what you do next. The best ones in this feed do it with a single detail, the badge log, the second set of footsteps that match yours a half-beat late. You'll know the moment it happens because you'll stop reading in your head and start reading in the room. That moment is the product. Everything else is delivery.",
      "Intensity varies by story, one to five, never graphic. The unsettling mood is this category's quieter sibling if you want dread without commitment, and the dark mood collects the bleak-but-not-scary. Horror is the concentrate. Read one with the lights however you like. Nobody judges either choice.",
    ],
  },
  CONFESSION: {
    seoDescription:
      "Anonymous confession stories: the things people only admit after 2am. Secrets, guilt, and small shames told plainly, in short first-person reads.",
    intro: [
      "Everyone carries at least one thing they'd only say with the lights off. This category is where those things get said.",
      "The confessions here are small and real, which is what makes them land. Not crimes, mostly. The more human inventory: reading a partner's messages and finding nothing, which somehow didn't help. Letting a friendship die by simply never replying. Being relieved, actually relieved, at news that should have hurt. The kind of admission that costs something to type even without a name attached.",
      "Each one is first person, a couple of minutes, told plainly with no bid for sympathy. That's the house style: no justifying, no lesson at the end, just the thing itself, said at last. The final line usually lands on the part of the truth the narrator was circling the whole time. You'll recognize the maneuver. Most of us do it too.",
      "The anonymity here isn't a gimmick, it's the load the genre rests on. A confession with a name attached is a performance with an audience to manage. A confession without one has nothing to gain from lying, which is why the small ones hit hardest: nobody invents being jealous of a friend's grief. Reading a few in a row recalibrates something. Your own worst thought stops being evidence that you're uniquely broken and starts being evidence that you're a person. That's the service this category quietly provides.",
      "People read this category two ways. Some come to feel less alone in what they've done or thought. Some come for the voltage of honesty with nothing attached to it. Both work. If the secrets you're drawn to are about wanting someone, desire runs adjacent to this feed, and spite holds the grudges. Confession is the load-bearing wall of this whole site. Start anywhere. The dark doesn't rank them.",
    ],
  },
  ROMANCE: {
    seoDescription:
      "Short romance stories about longing, tenderness, and the people we can't put down. Aching, honest, written for late-night hearts and read-at-2am nerves.",
    intro: [
      "Love after 2am is quieter and more honest than it is in daylight. These are short stories about that version of it: tenderness, longing, and the people we keep caring about past all practical reason.",
      "Very little here looks like a love story's highlight reel. It looks like the real texture instead. Learning someone's coffee order by heart and having nowhere to use the knowledge anymore. A typing bubble that appears, disappears, and takes a whole evening's hope with it. Two people who got the timing wrong by six months and keep almost saying so. The ache is the point, handled carefully.",
      "Stories run two or three minutes, first person, present tense and close. Some are about love that's current, some about love that's technically over and clearly isn't. They end on a turn, not a kiss: one line that tells the truth of the thing. If you want the missing more than the wanting, the miss-someone mood overlaps from the loss side.",
      "The love stories that survive this hour are the unfinished ones, which is why the feed skews toward them. Requited, settled, daylight love is wonderful and has nowhere to go in three hundred words. But the almost, the too-late, the still: those fit exactly. Expect stories where the whole plot is a hand not reached for. Expect at least one that describes your current situation with upsetting accuracy. That isn't an accident of volume. It's because the situations repeat, in everyone, which at 2am is either depressing or deeply comforting. The stories vote comforting.",
      "Desire is the neighboring category when the feeling runs hotter than tender. This one keeps its hands mostly still. It's for the slow ache, the checked phone, the person whose name you still say carefully. Read one and try not to text anybody. No promises made on your behalf.",
    ],
  },
  EXISTENTIAL: {
    seoDescription:
      "Existential short stories for 3am questions. Time, meaning, smallness, the strange fact of being anyone at all. Slow, honest, grounded late reads.",
    intro: [
      "At some point in the night the questions stop being about your day and start being about the whole arrangement. Time, meaning, the strange fact of being anyone at all. These stories live there.",
      "Nothing in this category is abstract, though. Each story pins its big question to something small enough to hold. A man realizes the family photos stop including him around a certain year and does the math on why. A woman feeds a parking meter at 3am for a car she's about to sell and can't explain the loyalty. The cosmic arrives through the concrete or it doesn't arrive at all.",
      "Expect a slower pulse than the rest of the site. These run a little longer in feeling than in word count, first person, no hurry. The endings don't answer anything. They locate the question more precisely, which at this hour is the honest version of an answer.",
      "A warning and a recommendation in one: these stories don't dispel the 3am feeling, they dignify it. The daytime consensus says nighttime perspective is distorted, that whatever occurs to you after midnight should be discounted in the morning. The stories here take the opposite bet, that the hour strips more than it adds, and that the person doing math about their life in a dark kitchen is doing real math. Whether that's true is above this page's pay grade. But it reads true at the hour you'd actually be here, and you'd be surprised how far that goes.",
      "The reflective mood is this category's gentler cousin, more memory than metaphysics. Surreal is its stranger one, where the night actually bends. Existential keeps both feet on the floor and just looks down at it for a long time. If you've ever stood in a kitchen at 3am feeling like a guest in your own life, you have the prerequisite. Come in.",
    ],
  },
  SURREAL: {
    seoDescription:
      "Surreal short stories where the night bends slightly out of true. Dreamlike, off-kilter fiction that stays one careful degree away from ordinary.",
    intro: [
      "Around 3am the world's hinges loosen a little. Rooms hum at a different pitch, logic gets negotiable, and the stories in this category are written from inside that slippage.",
      "The surrealism here is restrained, one degree off true rather than full dream logic. A hallway that's a step longer than it was yesterday. A radio station that plays tomorrow's weather. A stranger at the bus stop who politely returns a memory you'd lost. Everything else stays ordinary: the rent is still due, the phone still needs charging. One bent thread runs through an otherwise straight fabric, which is why it holds.",
      "Stories are short and first person, narrated by people who notice the wrongness and keep functioning anyway, the way you do in dreams. Endings don't wake you up or explain the trick. They fold the strangeness back into the night and leave a seam. You'll finish some of them unsure which side of the seam you're on. That's the intended condition.",
      "The genre has house rules. One bend per story, never two; a second bend makes it fantasy and breaks the spell. The bend is never explained, never resolved, and never noticed by anyone except the narrator, which is the loneliest part and the most accurate one. Dreams work the same way: the wrongness is always yours alone. If you keep a note on your phone of things that felt briefly impossible at night, half-asleep sentences, rooms that hummed, this category will feel like finding out other people keep the note too.",
      "If the bend runs frightening, horror and the unsettling mood are nearby. But surreal isn't trying to scare you. It's after the other feeling, the one where the night seems briefly to have an inner life of its own. Read one right before sleep at your own discretion. They tend to follow you in.",
    ],
  },
  WORKPLACE: {
    seoDescription:
      "Workplace confession stories: night shifts, empty offices, the email you shouldn't have sent. What work actually does to people, admitted after hours.",
    intro: [
      "Work follows people home, and at 2am it stops pretending to be fine. This category is the after-hours version of the office: what actually got felt all day, admitted once the building is empty.",
      "The material is the stuff performance reviews never touch. Rehearsing a resignation on the drive in, every day, for a year. The reply-all that took two seconds to send and a season to live down. Watching a worse idea win because of who said it. Covering for a coworker and starting a quiet ledger of it. And the night shifts, always: hospitals, warehouses, front desks, the 4am floor where the fluorescent hum does most of the talking.",
      "Stories are first person and short, told in a couple of minutes by people you have absolutely worked with. Some are bitter, some are funny in the way that's next door to bitter, some are just tired. The last line tends to land on what the job actually costs, which is rarely the hours.",
      "There's a reason work stories land differently after 2am. In daylight, a job is a container: hours, tasks, a chair. At night the container leaks, and what spills out is what these stories are made of, the identity questions, the small humiliations filed under professionalism, the arithmetic of what exactly is being traded for the salary. None of it fits in a one-on-one. All of it fits here. The night-shift stories are the purest of the set, written from inside the hours the rest of the economy pretends don't exist.",
      "Spite is the adjacent category when the feeling sharpens into a grudge, and confession when it's guilt instead. Workplace holds the middle: the unsaid, accumulating quietly next to the badge and the lanyard. If you're reading this on a break at 3am, these are your people.",
    ],
  },
  DESIRE: {
    seoDescription:
      "Stories about wanting someone: charged, restrained, kept-awake-by-it desire. Tension drawn out and never spelled out, in short late-night reads.",
    intro: [
      "Wanting someone has a night schedule, and this is its category. Charged stories about desire, written with restraint and read with the door closed, probably after everyone else is asleep.",
      "Restraint is the whole craft here. Nothing graphic, nothing spelled out. The heat lives in specifics instead: a hand hovering near a sleeve without landing, a message reread for the fourth time for temperature rather than content, two coworkers who keep a careful eleven inches between them in every elevator. Suggestion carries further than description at this hour, and these stories know it.",
      "They're short, first person, and honest about the undignified parts. Wanting someone you shouldn't. Wanting someone who's asleep in the next room and somehow still far away. Wanting to be wanted, which is its own separate hunger. Wanting the version of someone you invented, which the stories admit more readily than people do. The endings don't consummate or resolve. They tighten by one notch and stop, and the tension goes home with you.",
      "For the record, this category has the strictest rules on the site. Nothing explicit, nothing graphic, no exceptions; intensity five here means the tension is at five, never the content. That constraint isn't squeamishness, it's engineering. Wanting is at its most powerful in the gap before anything happens, and prose that closes the gap kills the current it was carrying. The stories stay in the gap on purpose. If they're doing their job, so will you, at least until morning.",
      "Romance is next door when the feeling is tender rather than charged, and confession when the wanting needs admitting more than describing. Desire is for the current itself. Read a couple of them. It's a safe way to hold a live wire, which is roughly the point of fiction. It wears off by morning. Mostly.",
    ],
  },
  SPITE: {
    seoDescription:
      "Petty revenge and grudge stories: the unhinged little fantasies that surface after midnight, told with unnerving precision. Never acted on, deeply felt.",
    intro: [
      "Some feelings are only safe to say out loud after midnight, and most of them live here. Grudges, pettiness, and the small unhinged revenge fantasies nobody acts on but everybody drafts.",
      "The spite in these stories is specific, which is what makes it art instead of noise. Remembering, in exact words, what someone said at a dinner in 2019. Keeping a mental spreadsheet of every round of drinks a certain friend has dodged. Composing the wedding toast you'd give if honesty were legal. The narrators know precisely how petty they're being. They do the math anyway, with feeling.",
      "Each story is a couple of minutes of first-person ledger-keeping, usually funny in a way the narrator doesn't acknowledge, with a last line that tips the whole thing over into something realer: hurt, mostly, wearing armor. That's the trick of spite as a genre. Scratch it and it's grief about not being valued.",
      "It's the funniest category on the site, which no one expects going in. Spite is inherently comic because it's precision aimed at something tiny: the correct loading of a dishwasher, the exact wording of a four-year-old slight, a parking spot. The narrators are ridiculous and know it and continue anyway. But read enough and the pattern under the jokes shows through. Nobody keeps a ledger about someone they don't care about. Every entry in every list here is, structurally, a record of wanting to matter to a person who stopped noticing. The comedy is real. So is the other thing.",
      "Nothing here is a plan and none of it is advice. It's a pressure valve. If your grudge involves an office, the workplace category holds the professional-grade material. If it curdles toward guilt, confession is one door down. Read a few and feel your own ledger get lighter. Temporarily. These things refill.",
    ],
  },
  TIES: {
    seoDescription:
      "Stories about family and old friends: group chats gone quiet, siblings grown distant, the people who aren't romance but still keep us up at night.",
    intro: [
      "The people who keep you up at night aren't always lovers. Sometimes it's a sister you haven't called, a friend you outgrew without deciding to, a parent whose texts you answer slower every year. This category is about those bonds.",
      "Ties collects the family stories and the friendship stories, which turn out to be the heaviest ones on the site. A group chat that used to be loud, now just birthdays. Two brothers who only speak fluently when a car needs fixing. The best friend from a former life whose new life you watch through a screen, cheering quietly, from too far away. Nothing here is estrangement drama. It's the slower drift that nobody names until it's finished.",
      "The stories run a few minutes, first person, and they resist the easy endings hardest of all. No reconciliation scenes, no phone calls finally made. Just a narrator seeing one of their people clearly for a moment, and the last line saying what the seeing costs. If that sounds mild, wait for the one that's about your own sibling. There's one in here that will be.",
      "These stories obey a rule the romantic ones don't have to: nobody gets to leave cleanly. An ex can become a stranger. A brother can't; he just becomes a stranger you share a childhood with, which is a different and stranger arrangement. That's why this category aches at a lower frequency than the rest of the site. The relationships in it predate your ability to choose your relationships, and they'll outlast most of what you're currently worried about. The stories don't resolve that. They just finally say it plainly, usually in the last line, usually about someone specific. Bring your own specific someone. You will anyway.",
      "If the person on your mind tonight is romantic, the miss-someone mood and romance both run closer to that wound. Ties is for the rest of the web we hang in. Read one, and if you end up texting a cousin at 2:40am, that's between you and the group chat.",
    ],
  },
};

/**
 * Curated copy for high-value tag archives, keyed by tag slug (see
 * `tagToSlug`). Tags are free-form and data-driven, so entries are added here
 * deliberately once a tag proves index-worthy (high story count in the
 * sitemap, or impressions in Search Console). Unmapped tags keep the
 * templated one-liner and the TAG_INDEX_MIN noindex gate.
 */
export const TAG_ARCHIVE_COPY: Record<string, ArchiveCopy> = {};
