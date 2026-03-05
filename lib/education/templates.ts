export const EDU_TEMPLATES = [
    {
        id: "admission_inquiry",
        name: "Admission Inquiry Flow",
        description: "Captures student details and sends course brochure instantly.",
        type: "FLOW",
        steps: [
            { type: "message", content: "Hi! Welcome to [Institute Name]. Which course are you interested in?", options: ["Digital Marketing", "Software Development", "Data Science"] },
            { type: "condition", logic: "any_reply" },
            { type: "message", content: "Great choice! Here is the detailed brochure for that course: [URL]. Would you like to schedule a free demo?", options: ["Yes, Schedule Demo", "Just browsing"] }
        ]
    },
    {
        id: "demo_reminder",
        name: "Demo Reminder Sequence",
        description: "Drip sequence to ensure lead shows up for the demo class.",
        type: "DRIP",
        messages: [
            { delay: "0 min", content: "Your demo class for [Course] is confirmed! See you at [Time]." },
            { delay: "2 hours", content: "🚀 Only 2 hours left for your demo! Join here: [Link]" },
            { delay: "1 day", content: "How was the demo? Ready to secure your seat with a 10% discount?", options: ["Enroll Now", "Talk to Counselor"] }
        ]
    },
    {
        id: "payment_urgency",
        name: "Fee Payment Urgency",
        description: "Sent to 'Payment Pending' leads when batch is almost full.",
        type: "MESSAGE",
        content: "🔥 Final call! Only 3 seats left for the upcoming batch. Complete your admission fee payment now to secure your spot: [Payment Link]"
    }
];
