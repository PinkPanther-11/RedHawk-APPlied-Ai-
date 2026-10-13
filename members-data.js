/* ══════════════════════════════════════════════════════════
   RedHawk Applied AI — Current Members page content
   This is the only file you need to edit to update the roster
   or the weekly curriculum. Save, refresh, done.
   ══════════════════════════════════════════════════════════ */

/* ── ROSTER ────────────────────────────────────────────────
   One line per member. Every field is optional except name.
     name:     "First Last"
     detail:   major, class year, or both ("Finance · 2028")
     linkedin: full LinkedIn URL
     photo:    path to a headshot, e.g. "assets/members/first-last.jpg"
   Slots with no name show as "Coming soon". There are 24 seats;
   change ROSTER_SEATS if the cohort size changes. */
var ROSTER_SEATS = 24;

var ROSTER = [
  // { name: "First Last", detail: "Finance · 2028", linkedin: "https://www.linkedin.com/in/...", photo: "" },
];

/* ── CURRICULUM ────────────────────────────────────────────
   One entry per week, in order.
     title:    the week's name
     summary:  one line shown before the week is opened
     sections: what shows when someone clicks the week. Each section has a
               label and a list of items. An item is either plain text, or
               ["Term", "what it means"] for a two-part line.
   A week with tba: true shows as "To be announced" and can't be opened.
   An entry with event: true is a highlighted event, not a numbered week. */
var CURRICULUM = [
  {
    title: "Kickoff",
    summary: "Meet the exec and your cohort, and get set up for the semester.",
    sections: [
      { label: "What we cover", items: [
        "Exec introductions and how the organization runs",
        "The agenda for the semester",
        "Meeting the rest of your cohort"
      ]},
      { label: "Get set up", items: [
        "Join the organization on Miami Central",
        "Create your Claude account",
        "Add your LinkedIn and resume",
        "Cohort group photo"
      ]}
    ]
  },
  {
    title: "Claude Introduction",
    summary: "How Claude actually works, then six hands-on activities using your own accounts.",
    sections: [
      { label: "Part 1: How Claude works", items: [
        ["Prompting", "the six parts of a strong prompt: context, task, details, format, example, and tone"],
        ["How AI works", "what an LLM is, tokens, and the context window"],
        ["Usage", "what drains your allowance and how to stretch it"],
        ["Models and effort", "picking the right model and how hard it thinks"],
        ["Ways to use Claude", "Chat, Cowork, Code, Design, and Artifacts"],
        ["Memory and skills", "teaching Claude who you are and how you work"],
        ["Connectors and agents", "APIs, MCP, tool use, and scheduled tasks"],
        ["Computer use", "Claude in Chrome, and keeping a human in the loop"]
      ]},
      { label: "Part 2: Activities", items: [
        "Build your \"About Me\" memory",
        "Organize your Google Drive",
        "Clean up your Gmail",
        "Build a Humanizer skill",
        "Find jobs on Indeed",
        "Build your LinkedIn networking list"
      ]}
    ]
  },
  {
    title: "Claude Skills & Repeatable Workflows",
    summary: "Stop rewriting the same prompts. Teach Claude a process once and reuse it.",
    sections: [
      { label: "What we cover", items: [
        ["What Skills are", "saved instructions that teach Claude to do a job your way"],
        ["Why they matter", "standardize repetitive work and stop rewriting prompts"],
        ["Prompt vs. memory vs. project vs. skill", "what each one is for"],
        ["Anatomy of a Skill", "SKILL.md, instructions, reference files, templates, and scripts"],
        ["Scripts inside Skills", "Claude handles the judgment, code handles the calculations"],
        ["Testing", "how to test a Skill and improve it"]
      ]},
      { label: "Business Skills we look at", items: [
        "Equity research",
        "Earnings analysis",
        "Financial statement analysis",
        "Consulting case analysis",
        "Competitor research",
        "Resume review",
        "Marketing content review"
      ]}
    ]
  },
  {
    title: "AI Agents & Claude Cowork",
    summary: "Give AI an objective instead of step-by-step instructions, and know when not to.",
    sections: [
      { label: "What we cover", items: [
        ["Chatbot vs. agent", "what changes when AI carries out the work itself"],
        ["Claude Cowork", "delegating larger tasks, running several at once, and getting finished deliverables"],
        ["Connectors", "Google Drive, Gmail, Slack, and other business apps"],
        ["MCP", "what it is, and how it gives Claude access to outside tools and data"],
        ["Subagents", "specialized agents splitting a task: research, financial analysis, competitors, writing"],
        ["Plugins", "packaged Claude capabilities"]
      ]},
      { label: "The simple distinction", items: [
        ["Memory", "what Claude remembers"],
        ["Projects", "context for one area of work"],
        ["Skills", "how Claude does something"],
        ["Connectors and MCP", "what Claude can access"],
        ["Artifacts", "what Claude can build"],
        ["Claude Code", "what Claude can do"]
      ]},
      { label: "AI safety in business", items: [
        "Handling sensitive information",
        "Hallucinations and checking sources",
        "Human review",
        "When not to hand something over to AI completely"
      ]}
    ]
  },
  {
    title: "Claude Code",
    summary: "Git, GitHub, and Claude Code. You build a website and launch it.",
    sections: [
      { label: "What we cover", items: [
        ["Git and GitHub", "repositories, commits, and push and pull"],
        ["Claude Code + GitHub", "why the two are useful together"]
      ]},
      { label: "You build", items: [
        "Your own website, built with Claude Code and launched live"
      ]}
    ]
  },
  {
    title: "Other AI Tools",
    summary: "Beyond Claude: how other AI tools compare and where each one fits.",
    sections: [
      { label: "What we cover", items: [
        "Meta Muse",
        "Grok",
        "How they compare with Claude, and when to reach for each"
      ]}
    ]
  },
  {
    event: true,
    date: "Nov 6–8",
    title: "RedHawk Builds 2026",
    summary: "A weekend fintech hackathon at the McVey Data Science Building. $3,500 in prizes.",
    sections: [
      { label: "The weekend", items: [
        ["Fri · Learn", "dinner from 5 to 8 PM, then hands-on AI workshops"],
        ["Sat · Build", "check-in at 9 AM, build starts at 10 AM, mentors until 10 PM"],
        ["Sun · Pitch", "Devpost due at 10 AM, expo judging, finals at 1 PM, awards at 2 PM"]
      ]},
      { label: "Good to know", items: [
        "Teams of up to 4. Come solo and find a team at the Saturday mixer",
        "$2,000 first, $1,000 second, $500 third",
        "6 free meals and a shirt for every builder",
        "No experience needed"
      ]}
    ],
    link: { href: "https://redhawk-builds.vercel.app", text: "Register for RedHawk Builds" }
  },
  {
    title: "Guest Speaker Panel",
    summary: "People who use AI professionally, on what the work really looks like.",
    sections: [
      { label: "What to expect", items: [
        "A panel of practitioners who apply AI in their jobs",
        "What the work looks like day to day, and what they hire for",
        "Speakers announced soon"
      ]}
    ]
  }
];
