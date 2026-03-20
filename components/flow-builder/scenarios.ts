export const INDUSTRY_SCENARIOS = [
    {
        "id": "lead_magnet",
        "title": "1. Lead Magnet (PDF/Coupon)",
        "description": "Give a PDF or Coupon in exchange for name & email. Perfect for building a marketing list.",
        "modulesUsed": ["Message", "Action", "Condition"],
        "flowData": {
            "nodes": [
                { "id": "node_start", "type": "start", "position": { "x": 250, "y": 50 }, "data": { "label": "GUIDE" } },
                { "id": "node_msg1", "type": "message", "position": { "x": 250, "y": 150 }, "data": { "label": "Welcome", "text": "Hi! Ready to download our 'Ultimate Growth Guide'? Just tell us your name first!", "buttons": [{ "id": "b1", "title": "Start", "type": "reply" }] } },
                { "id": "node_action1", "type": "action", "position": { "x": 250, "y": 300 }, "data": { "label": "Save Lead", "actionType": "save_to_crm" } },
                { "id": "node_msg2", "type": "message", "position": { "x": 250, "y": 450 }, "data": { "label": "Send Guide", "contentType": "DOCUMENT", "mediaUrl": "https://example.com/guide.pdf", "text": "Here is your guide! We've also sent a 10% discount code: WELCOME10." } }
            ],
            "edges": [
                { "id": "e1", "source": "node_start", "target": "node_msg1" },
                { "id": "e2", "source": "node_msg1", "target": "node_action1", "sourceHandle": "button-b1" },
                { "id": "e3", "source": "node_action1", "target": "node_msg2" }
            ]
        }
    },
    {
        "id": "simple_catalog",
        "title": "2. Simple Product Catalog",
        "description": "A clean list menu of your top sellers with interactive selection.",
        "modulesUsed": ["List", "Message", "Payment"],
        "flowData": {
            "nodes": [
                { "id": "node_start", "type": "start", "position": { "x": 250, "y": 50 }, "data": { "label": "CATALOG" } },
                { "id": "node_list1", "type": "list", "position": { "x": 250, "y": 150 }, "data": { "label": "Best Sellers", "buttonText": "View Menu", "sectionTitle": "Top Products", "items": [{ "id": "p1", "title": "Product A" }, { "id": "p2", "title": "Product B" }] } },
                { "id": "node_msg1", "type": "message", "position": { "x": 250, "y": 300 }, "data": { "label": "Pricing", "text": "Great choice! This product is ₹999. Would you like to proceed to payment?", "buttons": [{ "id": "pay", "title": "Pay Now", "type": "reply" }] } },
                { "id": "node_payment", "type": "payment", "position": { "x": 250, "y": 450 }, "data": { "label": "Payment", "amount": "999", "currency": "INR", "paymentTitle": "Order Payment" } }
            ],
            "edges": [
                { "id": "e1", "source": "node_start", "target": "node_list1" },
                { "id": "e2", "source": "node_list1", "target": "node_msg1", "sourceHandle": "item-p1" },
                { "id": "e3", "source": "node_msg1", "target": "node_payment", "sourceHandle": "button-pay" }
            ]
        }
    },
    {
        "id": "flash_sale",
        "title": "3. Flash Sale Countdown",
        "description": "High-urgency marketing flow with limited-time discount codes.",
        "modulesUsed": ["Message", "Wait", "Condition"],
        "flowData": {
            "nodes": [
                { "id": "node_start", "type": "start", "position": { "x": 250, "y": 50 }, "data": { "label": "SALE" } },
                { "id": "node_msg1", "type": "message", "position": { "x": 250, "y": 150 }, "data": { "label": "Announcement", "text": "FLASH SALE! 50% OFF for the next 4 hours only. Use code: FLASH50", "buttons": [{ "id": "claim", "title": "Claim Now", "type": "url", "value": "https://store.com/sale" }] } },
                { "id": "node_wait", "type": "wait", "position": { "x": 250, "y": 300 }, "data": { "label": "Wait 2 Hours", "delay": "120" } },
                { "id": "node_msg2", "type": "message", "position": { "x": 250, "y": 450 }, "data": { "label": "Reminder", "text": "Hurry! Only 2 hours left before the sale ends." } }
            ],
            "edges": [
                { "id": "e1", "source": "node_start", "target": "node_msg1" },
                { "id": "e2", "source": "node_msg1", "target": "node_wait" },
                { "id": "e3", "source": "node_wait", "target": "node_msg2" }
            ]
        }
    },
    {
        "id": "wholesale_inquiry",
        "title": "4. Bulk/Wholesale Inquiry",
        "description": "Structured form for capturing B2B leads and large volume requests.",
        "modulesUsed": ["Message", "Action", "Webhook"],
        "flowData": {
            "nodes": [
                { "id": "node_start", "type": "start", "position": { "x": 250, "y": 50 }, "data": { "label": "WHOLESALE" } },
                { "id": "node_msg1", "type": "message", "position": { "x": 250, "y": 150 }, "data": { "label": "Contact Info", "text": "Thanks for your interest in wholesale. What is your company name?" } },
                { "id": "node_msg2", "type": "message", "position": { "x": 250, "y": 300 }, "data": { "label": "Volume Req", "text": "What is the approximate monthly volume you're looking for?" } },
                { "id": "node_action", "type": "action", "position": { "x": 250, "y": 450 }, "data": { "label": "Tag Wholesale", "actionType": "webhook" } },
                { "id": "node_msg3", "type": "message", "position": { "x": 250, "y": 600 }, "data": { "label": "Success", "text": "Our B2B team will reach out to you within 24 hours with a custom quote." } }
            ],
            "edges": [
                { "id": "e1", "source": "node_start", "target": "node_msg1" },
                { "id": "e2", "source": "node_msg1", "target": "node_msg2" },
                { "id": "e3", "source": "node_msg2", "target": "node_action" },
                { "id": "e4", "source": "node_action", "target": "node_msg3" }
            ]
        }
    },
    {
        "id": "affiliate_app",
        "title": "5. Affiliate Application",
        "description": "Capture intent and social media details from potential brand partners.",
        "modulesUsed": ["Message", "Condition", "Action"],
        "flowData": {
            "nodes": [
                { "id": "node_start", "type": "start", "position": { "x": 250, "y": 50 }, "data": { "label": "PARTNER" } },
                { "id": "node_msg1", "type": "message", "position": { "x": 250, "y": 150 }, "data": { "label": "Init", "text": "Want to earn 20% commission? Join our affiliate program!", "buttons": [{ "id": "join", "title": "Apply Now", "type": "reply" }] } },
                { "id": "node_msg2", "type": "message", "position": { "x": 250, "y": 300 }, "data": { "label": "Social Handle", "text": "Please share your Instagram/YouTube handle." } },
                { "id": "node_action", "type": "action", "position": { "x": 250, "y": 450 }, "data": { "label": "Tag Affiliate", "actionType": "save_to_crm" } },
                { "id": "node_msg3", "type": "message", "position": { "x": 250, "y": 600 }, "data": { "label": "End", "text": "Thanks! We'll review your profile and get back to you soon." } }
            ],
            "edges": [
                { "id": "e1", "source": "node_start", "target": "node_msg1" },
                { "id": "e2", "source": "node_msg1", "target": "node_msg2", "sourceHandle": "button-join" },
                { "id": "e3", "source": "node_msg2", "target": "node_action" },
                { "id": "e4", "source": "node_action", "target": "node_msg3" }
            ]
        }
    },
    {
        "id": "instant_faq",
        "title": "6. Instant FAQ",
        "description": "Provide immediate answers to the top 10 most common customer questions.",
        "modulesUsed": ["List", "Message"],
        "flowData": {
            "nodes": [
                { "id": "node_start", "type": "start", "position": { "x": 250, "y": 50 }, "data": { "label": "FAQ" } },
                { "id": "node_list", "type": "list", "position": { "x": 250, "y": 150 }, "data": { "label": "FAQ Menu", "buttonText": "Select Question", "sectionTitle": "Common Queries", "items": [{ "id": "f1", "title": "Shipping Time?" }, { "id": "f2", "title": "Refund Policy?" }, { "id": "f3", "title": "Contact Details" }] } },
                { "id": "node_msg1", "type": "message", "position": { "x": 250, "y": 300 }, "data": { "label": "Answer", "text": "We ship within 24-48 hours. Delivery takes 3-5 business days depending on your location." } }
            ],
            "edges": [
                { "id": "e1", "source": "node_start", "target": "node_list" },
                { "id": "e2", "source": "node_list", "target": "node_msg1", "sourceHandle": "item-f1" }
            ]
        }
    },
    {
        "id": "order_tracker",
        "title": "7. Order Tracker",
        "description": "Real-time status check using Order ID, integrated with your backend.",
        "modulesUsed": ["Message", "Action", "Webhook"],
        "flowData": {
            "nodes": [
                { "id": "node_start", "type": "start", "position": { "x": 250, "y": 50 }, "data": { "label": "TRACK" } },
                { "id": "node_msg1", "type": "message", "position": { "x": 250, "y": 150 }, "data": { "label": "Ask ID", "text": "Please enter your 8-digit Order ID (e.g., #12345678)." } },
                { "id": "node_action", "type": "action", "position": { "x": 250, "y": 300 }, "data": { "label": "Fetch Status", "actionType": "webhook" } },
                { "id": "node_msg2", "type": "message", "position": { "x": 250, "y": 450 }, "data": { "label": "Display Status", "text": "Your order status is: [STATUS]. It should arrive by [DATE]." } }
            ],
            "edges": [
                { "id": "e1", "source": "node_start", "target": "node_msg1" },
                { "id": "e2", "source": "node_msg1", "target": "node_action" },
                { "id": "e3", "source": "node_action", "target": "node_msg2" }
            ]
        }
    },
    {
        "id": "refund_request",
        "title": "8. Refund Request",
        "description": "Collect photos and reasons for refund automatically to streamline support.",
        "modulesUsed": ["Message", "Condition", "Action"],
        "flowData": {
            "nodes": [
                { "id": "node_start", "type": "start", "position": { "x": 250, "y": 50 }, "data": { "label": "REFUND" } },
                { "id": "node_msg1", "type": "message", "position": { "x": 250, "y": 150 }, "data": { "label": "Reason", "text": "Sorry to hear that. Why would you like a refund?", "buttons": [{ "id": "damage", "title": "Damaged Item", "type": "reply" }, { "id": "size", "title": "Wrong Size", "type": "reply" }] } },
                { "id": "node_msg2", "type": "message", "position": { "x": 250, "y": 300 }, "data": { "label": "Upload Photo", "text": "Please upload a photo of the product for our team to review." } },
                { "id": "node_action", "type": "action", "position": { "x": 250, "y": 450 }, "data": { "label": "Notify Admin", "actionType": "send_email" } },
                { "id": "node_msg3", "type": "message", "position": { "x": 250, "y": 600 }, "data": { "label": "End", "text": "Thank you. Your request is being reviewed. Case ID: REF-990." } }
            ],
            "edges": [
                { "id": "e1", "source": "node_start", "target": "node_msg1" },
                { "id": "e2", "source": "node_msg1", "target": "node_msg2", "sourceHandle": "button-damage" },
                { "id": "e3", "source": "node_msg2", "target": "node_action" },
                { "id": "e4", "source": "node_action", "target": "node_msg3" }
            ]
        }
    },
    {
        "id": "support_escalation",
        "title": "9. Support Escalation",
        "description": "Seamlessly transfer to a live agent when automated answers aren't enough.",
        "modulesUsed": ["Message", "Action", "Condition"],
        "flowData": {
            "nodes": [
                { "id": "node_start", "type": "start", "position": { "x": 250, "y": 50 }, "data": { "label": "AGENT" } },
                { "id": "node_msg1", "type": "message", "position": { "x": 250, "y": 150 }, "data": { "label": "Init", "text": "Would you like to speak with a human agent?", "buttons": [{ "id": "yes", "title": "Yes, Please", "type": "reply" }] } },
                { "id": "node_action", "type": "action", "position": { "x": 250, "y": 300 }, "data": { "label": "Assign to Agent", "actionType": "assign_to_agent" } },
                { "id": "node_msg2", "type": "message", "position": { "x": 250, "y": 450 }, "data": { "label": "Wait", "text": "Please hold! An agent will be with you shortly. Estimated wait: 2 mins." } }
            ],
            "edges": [
                { "id": "e1", "source": "node_start", "target": "node_msg1" },
                { "id": "e2", "source": "node_msg1", "target": "node_action", "sourceHandle": "button-yes" },
                { "id": "e3", "source": "node_action", "target": "node_msg2" }
            ]
        }
    },
    {
        "id": "business_profile",
        "title": "10. Business Profile",
        "description": "One-tap access to your business hours, website, catalog, and location.",
        "modulesUsed": ["List", "Message", "Location"],
        "flowData": {
            "nodes": [
                { "id": "node_start", "type": "start", "position": { "x": 250, "y": 50 }, "data": { "label": "INFO" } },
                { "id": "node_list", "type": "list", "position": { "x": 250, "y": 150 }, "data": { "label": "Profile Menu", "buttonText": "View Info", "sectionTitle": "Business Info", "items": [{ "id": "hours", "title": "Working Hours" }, { "id": "loc", "title": "Store Location" }, { "id": "web", "title": "Visit Website" }] } },
                { "id": "node_msg_hours", "type": "message", "position": { "x": 50, "y": 300 }, "data": { "label": "Hours", "text": "We are open Mon-Sat, 9 AM to 8 PM." } },
                { "id": "node_loc", "type": "location", "position": { "x": 250, "y": 300 }, "data": { "label": "Send Map", "locationType": "static", "latitude": "12.9716", "longitude": "77.5946", "name": "Main Office", "address": "123 Business Park, Bangalore" } }
            ],
            "edges": [
                { "id": "e1", "source": "node_start", "target": "node_list" },
                { "id": "e2", "source": "node_list", "target": "node_msg_hours", "sourceHandle": "item-hours" },
                { "id": "e3", "source": "node_list", "target": "node_loc", "sourceHandle": "item-loc" }
            ]
        }
    },
    {
        "id": "delivery_status",
        "title": "11. Delivery Status",
        "description": "Send live tracking links and delivery partner details automatically.",
        "modulesUsed": ["Message", "Action", "Webhook"],
        "flowData": {
            "nodes": [
                { "id": "node_start", "type": "start", "position": { "x": 250, "y": 50 }, "data": { "label": "TRACK" } },
                { "id": "node_msg1", "type": "message", "position": { "x": 250, "y": 150 }, "data": { "label": "Ask Order ID", "text": "Please enter your Order ID to track your delivery." } },
                { "id": "node_action", "type": "action", "position": { "x": 250, "y": 300 }, "data": { "label": "Fetch Tracking", "actionType": "webhook" } },
                { "id": "node_msg2", "type": "message", "position": { "x": 250, "y": 450 }, "data": { "label": "Show Tracking", "text": "📦 Your order is out for delivery! Track it here: [LINK]" } }
            ],
            "edges": [
                { "id": "e1", "source": "node_start", "target": "node_msg1" },
                { "id": "e2", "source": "node_msg1", "target": "node_action" },
                { "id": "e3", "source": "node_action", "target": "node_msg2" }
            ]
        }
    },
    {
        "id": "stock_notification",
        "title": "12. Stock Notification",
        "description": "Let customers subscribe to 'Back in Stock' alerts for their favorite items.",
        "modulesUsed": ["Message", "Action", "Condition"],
        "flowData": {
            "nodes": [
                { "id": "node_start", "type": "start", "position": { "x": 250, "y": 50 }, "data": { "label": "RESTOCK" } },
                { "id": "node_msg1", "type": "message", "position": { "x": 250, "y": 150 }, "data": { "label": "Confirm Product", "text": "Product 'SuperSneakers' is currently out of stock. Want an alert when it's back?", "buttons": [{ "id": "yes", "title": "Notify Me", "type": "reply" }] } },
                { "id": "node_action", "type": "action", "position": { "x": 250, "y": 300 }, "data": { "label": "Add to Waitlist", "actionType": "save_to_crm" } },
                { "id": "node_msg2", "type": "message", "position": { "x": 250, "y": 450 }, "data": { "label": "Success", "text": "Perfect! We'll message you the moment it arrives at our warehouse." } }
            ],
            "edges": [
                { "id": "e1", "source": "node_start", "target": "node_msg1" },
                { "id": "e2", "source": "node_msg1", "target": "node_action", "sourceHandle": "button-yes" },
                { "id": "e3", "source": "node_action", "target": "node_msg2" }
            ]
        }
    },
    {
        "id": "service_feedback",
        "title": "13. Service Feedback",
        "description": "Collect NPS or star ratings after every successful delivery or support chat.",
        "modulesUsed": ["List", "Message", "Action"],
        "flowData": {
            "nodes": [
                { "id": "node_start", "type": "start", "position": { "x": 250, "y": 50 }, "data": { "label": "FEEDBACK" } },
                { "id": "node_list", "type": "list", "position": { "x": 250, "y": 150 }, "data": { "label": "Rate Us", "buttonText": "Pick Rating", "sectionTitle": "Service Quality", "items": [{ "id": "5", "title": "⭐⭐⭐⭐⭐ Excellent" }, { "id": "4", "title": "⭐⭐⭐⭐ Good" }, { "id": "1", "title": "⭐ Poor" }] } },
                { "id": "node_msg1", "type": "message", "position": { "x": 250, "y": 300 }, "data": { "label": "Thank You", "text": "Thanks for your feedback! We use this to improve our service." } },
                { "id": "node_action", "type": "action", "position": { "x": 250, "y": 450 }, "data": { "label": "Store Score", "actionType": "webhook" } }
            ],
            "edges": [
                { "id": "e1", "source": "node_start", "target": "node_list" },
                { "id": "e2", "source": "node_list", "target": "node_msg1" },
                { "id": "e3", "source": "node_msg1", "target": "node_action" }
            ]
        }
    },
    {
        "id": "table_booking",
        "title": "14. Table/Room Booking",
        "description": "Real-time availability check and booking for hospitality businesses.",
        "modulesUsed": ["Appointment", "Message", "Payment"],
        "flowData": {
            "nodes": [
                { "id": "node_start", "type": "start", "position": { "x": 150, "y": 50 }, "data": { "label": "BOOK" } },
                { "id": "node_appt", "type": "appointment", "position": { "x": 150, "y": 150 }, "data": { "label": "Select Slot" } },
                { "id": "node_msg1", "type": "message", "position": { "x": 150, "y": 300 }, "data": { "label": "Confirm", "text": "Slot available! Pay a small deposit to confirm your booking.", "buttons": [{ "id": "pay", "title": "Pay Deposit", "type": "reply" }] } },
                { "id": "node_payment", "type": "payment", "position": { "x": 150, "y": 450 }, "data": { "label": "Deposit", "amount": "500", "currency": "INR", "paymentTitle": "Booking Deposit" } }
            ],
            "edges": [
                { "id": "e1", "source": "node_start", "target": "node_appt" },
                { "id": "e2", "source": "node_appt", "target": "node_msg1", "sourceHandle": "true" },
                { "id": "e3", "source": "node_msg1", "target": "node_payment", "sourceHandle": "button-pay" }
            ]
        }
    },
    {
        "id": "payment_receipt",
        "title": "15. Payment Receipt",
        "description": "Automatically send PDF receipts and order confirmation after checkout.",
        "modulesUsed": ["Message", "Action", "Webhook"],
        "flowData": {
            "nodes": [
                { "id": "node_start", "type": "start", "position": { "x": 250, "y": 50 }, "data": { "label": "RECEIPT" } },
                { "id": "node_action", "type": "action", "position": { "x": 250, "y": 150 }, "data": { "label": "Gen PDF", "actionType": "webhook" } },
                { "id": "node_msg1", "type": "message", "position": { "x": 250, "y": 300 }, "data": { "label": "Send Doc", "contentType": "DOCUMENT", "text": "Thank you for your purchase! Attached is your official receipt." } }
            ],
            "edges": [
                { "id": "e1", "source": "node_start", "target": "node_action" },
                { "id": "e2", "source": "node_action", "target": "node_msg1" }
            ]
        }
    },
    {
        "id": "vip_access",
        "title": "16. VIP Early Access",
        "description": "Unlock secret catalogs or early-bird pricing for your top-tier customers.",
        "modulesUsed": ["Condition", "Catalog", "Message"],
        "flowData": {
            "nodes": [
                { "id": "node_start", "type": "start", "position": { "x": 250, "y": 50 }, "data": { "label": "VIP" } },
                { "id": "node_cond", "type": "condition", "position": { "x": 250, "y": 150 }, "data": { "label": "Is VIP?", "conditionType": "user_tag", "operator": "contains", "value": "VIP" } },
                { "id": "node_catalog", "type": "catalog", "position": { "x": 50, "y": 300 }, "data": { "label": "Secret Catalog" } },
                { "id": "node_msg", "type": "message", "position": { "x": 450, "y": 300 }, "data": { "label": "Join VIP", "text": "This collection is for VIPs only. Spend ₹5000+ to unlock access!" } }
            ],
            "edges": [
                { "id": "e1", "source": "node_start", "target": "node_cond" },
                { "id": "e2", "source": "node_cond", "target": "node_catalog", "sourceHandle": "true" },
                { "id": "e3", "source": "node_cond", "target": "node_msg", "sourceHandle": "false" }
            ]
        }
    },
    {
        "id": "birthday_voucher",
        "title": "17. Birthday Automated Gift",
        "description": "Send personalized vouchers and warm wishes on special occasions.",
        "modulesUsed": ["Message", "Wait", "Action"],
        "flowData": {
            "nodes": [
                { "id": "node_start", "type": "start", "position": { "x": 250, "y": 50 }, "data": { "label": "BIRTHDAY" } },
                { "id": "node_msg1", "type": "message", "position": { "x": 250, "y": 150 }, "data": { "label": "Gift", "text": "Happy Birthday! 🎂 Here's a 20% discount code for you: BDAY20", "buttons": [{ "id": "shop", "title": "Shop Now", "type": "reply" }] } },
                { "id": "node_catalog", "type": "catalog", "position": { "x": 250, "y": 300 }, "data": { "label": "Shop Items" } }
            ],
            "edges": [
                { "id": "e1", "source": "node_start", "target": "node_msg1" },
                { "id": "e2", "source": "node_msg1", "target": "node_catalog", "sourceHandle": "button-shop" }
            ]
        }
    },
    {
        "id": "referral_points",
        "title": "18. Invite & Earn",
        "description": "Gamify growth by giving points for every friend who joins using their link.",
        "modulesUsed": ["Action", "Message", "Webhook"],
        "flowData": {
            "nodes": [
                { "id": "node_start", "type": "start", "position": { "x": 250, "y": 50 }, "data": { "label": "INVITE" } },
                { "id": "node_action", "type": "action", "position": { "x": 250, "y": 150 }, "data": { "label": "Gen Ref Link", "actionType": "webhook" } },
                { "id": "node_msg1", "type": "message", "position": { "x": 250, "y": 300 }, "data": { "label": "Share Info", "text": "Share this link with friends! When they join, you get 100 points: [LINK]" } }
            ],
            "edges": [
                { "id": "e1", "source": "node_start", "target": "node_action" },
                { "id": "e2", "source": "node_action", "target": "node_msg1" }
            ]
        }
    },
    {
        "id": "quiz_recommendation",
        "title": "19. Product Recommendation Quiz",
        "description": "Help users choose the right product by asking 3 quick questions.",
        "modulesUsed": ["List", "Message", "Catalog"],
        "flowData": {
            "nodes": [
                { "id": "node_start", "type": "start", "position": { "x": 250, "y": 50 }, "data": { "label": "QUIZ" } },
                { "id": "node_list", "type": "list", "position": { "x": 250, "y": 150 }, "data": { "label": "Skin Type", "buttonText": "Select", "items": [{ "id": "oily", "title": "Oily" }, { "id": "dry", "title": "Dry" }] } },
                { "id": "node_msg", "type": "message", "position": { "x": 250, "y": 300 }, "data": { "label": "Rec", "text": "Based on your skin type, we recommend these products:" } },
                { "id": "node_catalog", "type": "catalog", "position": { "x": 250, "y": 450 }, "data": { "label": "View Recs" } }
            ],
            "edges": [
                { "id": "e1", "source": "node_start", "target": "node_list" },
                { "id": "e2", "source": "node_list", "target": "node_msg" },
                { "id": "e3", "source": "node_msg", "target": "node_catalog" }
            ]
        }
    },
    {
        "id": "loyalty_balance",
        "title": "20. Loyalty Check",
        "description": "One-click access to loyalty points, tier status, and reward history.",
        "modulesUsed": ["Action", "Webhook", "Message"],
        "flowData": {
            "nodes": [
                { "id": "node_start", "type": "start", "position": { "x": 250, "y": 50 }, "data": { "label": "POINTS" } },
                { "id": "node_action", "type": "action", "position": { "x": 250, "y": 150 }, "data": { "label": "Fetch Pts", "actionType": "webhook" } },
                { "id": "node_msg1", "type": "message", "position": { "x": 250, "y": 300 }, "data": { "label": "Show Bal", "text": "You have 450 points! You're only 50 points away from a 'Gold' upgrade." } }
            ],
            "edges": [
                { "id": "e1", "source": "node_start", "target": "node_action" },
                { "id": "e2", "source": "node_action", "target": "node_msg1" }
            ]
        }
    },
    {
        "id": "restaurant_booking",
        "title": "21. Restaurant Reservation",
        "description": "Book tables, select pax, and get instant venue location via GPS.",
        "modulesUsed": ["Appointment", "Location", "Message"],
        "flowData": {
            "nodes": [
                { "id": "node_start", "type": "start", "position": { "x": 150, "y": 50 }, "data": { "label": "RESERVE" } },
                { "id": "node_appt", "type": "appointment", "position": { "x": 150, "y": 150 }, "data": { "label": "Pick Date" } },
                { "id": "node_msg", "type": "message", "position": { "x": 150, "y": 300 }, "data": { "label": "Confirm", "text": "Reserved! Your table is ready. Find us here if you get lost:" } },
                { "id": "node_loc", "type": "location", "position": { "x": 150, "y": 450 }, "data": { "label": "Venue Pin", "locationType": "SEND", "latitude": "12.9716", "longitude": "77.5946", "name": "Gourmet Garden" } }
            ],
            "edges": [
                { "id": "id1", "source": "node_start", "target": "node_appt" },
                { "id": "id2", "source": "node_appt", "target": "node_msg", "sourceHandle": "true" },
                { "id": "id3", "source": "node_msg", "target": "node_loc" }
            ]
        }
    },
    {
        "id": "hotel_concierge",
        "title": "22. Hotel Digital Concierge",
        "description": "Let guests order room service, request towels, or book spa sessions.",
        "modulesUsed": ["List", "Message", "Action"],
        "flowData": {
            "nodes": [
                { "id": "node_start", "type": "start", "position": { "x": 250, "y": 50 }, "data": { "label": "SERVICE" } },
                { "id": "node_list", "type": "list", "position": { "x": 250, "y": 150 }, "data": { "label": "Needs", "buttonText": "Select", "items": [{ "id": "towels", "title": "Fresh Towels" }, { "id": "food", "title": "Room Service" }] } },
                { "id": "node_msg", "type": "message", "position": { "x": 250, "y": 300 }, "data": { "label": "Ack", "text": "Request received! A staff member is on it." } }
            ],
            "edges": [
                { "id": "e1", "source": "node_start", "target": "node_list" },
                { "id": "e2", "source": "node_list", "target": "node_msg" }
            ]
        }
    },
    {
        "id": "travel_itinerary",
        "title": "23. Smart Travel Itinerary",
        "description": "Send day-wise schedules, ticket PDFs, and airport pickup pins.",
        "modulesUsed": ["Message", "Location", "Action"],
        "flowData": {
            "nodes": [
                { "id": "node_start", "type": "start", "position": { "x": 250, "y": 50 }, "data": { "label": "TRIP" } },
                { "id": "node_msg_doc", "type": "message", "position": { "x": 250, "y": 150 }, "data": { "label": "Tickets", "contentType": "DOCUMENT", "text": "Here are your e-tickets for Bali!" } },
                { "id": "node_loc", "type": "location", "position": { "x": 250, "y": 300 }, "data": { "label": "Pickup Point", "locationType": "SEND", "latitude": "-8.7481", "longitude": "115.1673", "name": "Airport Pickup Zone" } }
            ],
            "edges": [
                { "id": "e1", "source": "node_start", "target": "node_msg_doc" },
                { "id": "e2", "source": "node_msg_doc", "target": "node_loc" }
            ]
        }
    },
    {
        "id": "gym_trainer_bot",
        "title": "24. Gym & Fitness Coach",
        "description": "Deliver daily workout plans, track calories, and book PT slots.",
        "modulesUsed": ["Message", "Appointment", "List"],
        "flowData": {
            "nodes": [
                { "id": "node_start", "type": "start", "position": { "x": 250, "y": 50 }, "data": { "label": "GYM" } },
                { "id": "node_list", "type": "list", "position": { "x": 250, "y": 150 }, "data": { "label": "Workouts", "buttonText": "View Plans", "items": [{ "id": "legs", "title": "Leg Day 🦵" }, { "id": "cardio", "title": "Cardio 🏃‍♂️" }] } },
                { "id": "node_appt", "type": "appointment", "position": { "x": 250, "y": 300 }, "data": { "label": "Book Coach" } }
            ],
            "edges": [
                { "id": "e1", "source": "node_start", "target": "node_list" },
                { "id": "e2", "source": "node_list", "target": "node_appt" }
            ]
        }
    },
    {
        "id": "dental_automation",
        "title": "25. Dental/Medical Booking",
        "description": "Medical history capture, appointment scheduling, and prep instructions.",
        "modulesUsed": ["Message", "Appointment", "Meta_Flow"],
        "flowData": {
            "nodes": [
                { "id": "node_start", "type": "start", "position": { "x": 250, "y": 50 }, "data": { "label": "DENTIST" } },
                { "id": "node_flow", "type": "meta_flow", "position": { "x": 250, "y": 150 }, "data": { "label": "Health Form", "flowCTA": "Start Medical History" } },
                { "id": "node_appt", "type": "appointment", "position": { "x": 250, "y": 300 }, "data": { "label": "Schedule Clinic Visit" } }
            ],
            "edges": [
                { "id": "e1", "source": "node_start", "target": "node_flow" },
                { "id": "e2", "node_flow": "node_flow", "target": "node_appt" }
            ]
        }
    },
    {
        "id": "gmb_location_booster",
        "title": "26. Google My Business & Location Booster",
        "description": "Boost local SEO by collecting 5-star reviews and helping customers find your branch via GPS.",
        "modulesUsed": [
            "Message",
            "Condition",
            "Location",
            "Action"
        ],
        "flowData": {
            "nodes": [
                {
                    "id": "node_start",
                    "type": "start",
                    "position": { "x": 400, "y": 50 },
                    "data": { "label": "FIND_US" }
                },
                {
                    "id": "node_msg_init",
                    "type": "message",
                    "position": { "x": 400, "y": 150 },
                    "data": {
                        "label": "Welcome",
                        "text": "How was your experience today? We'd love to hear from you!",
                        "buttons": [
                            { "id": "star5", "title": "⭐⭐⭐⭐⭐", "type": "reply" },
                            { "id": "star3", "title": "⭐⭐⭐", "type": "reply" },
                            { "id": "star1", "title": "📉 1-2 Stars", "type": "reply" }
                        ]
                    }
                },
                {
                    "id": "node_cond_rating",
                    "type": "condition",
                    "position": { "x": 400, "y": 300 },
                    "data": {
                        "label": "Check Rating",
                        "conditionType": "button_id",
                        "operator": "equals",
                        "value": "star5"
                    }
                },
                {
                    "id": "node_msg_gmb",
                    "type": "message",
                    "position": { "x": 200, "y": 450 },
                    "data": {
                        "label": "GMB Review",
                        "text": "We're so glad you liked it! It would mean the world to us if you shared your experience on Google.",
                        "buttons": [
                            { "id": "gmb_link", "title": "Review on Google", "type": "url", "value": "https://g.page/r/your-id/review" },
                            { "id": "find_store", "title": "📍 Find Near Me", "type": "reply" }
                        ]
                    }
                },
                {
                    "id": "node_msg_complaint",
                    "type": "message",
                    "position": { "x": 600, "y": 450 },
                    "data": {
                        "label": "Feedback Capture",
                        "text": "We're sorry we missed the mark. What can we do better? Type your feedback below."
                    }
                },
                {
                    "id": "node_loc_req",
                    "type": "location",
                    "position": { "x": 200, "y": 600 },
                    "data": {
                        "label": "Request Location",
                        "locationType": "REQUEST",
                        "bodyText": "Please share your current location to find the nearest branch."
                    }
                },
                {
                    "id": "node_loc_send",
                    "type": "location",
                    "position": { "x": 200, "y": 750 },
                    "data": {
                        "label": "Send Store Pin",
                        "locationType": "SEND",
                        "name": "Main Branch",
                        "address": "123 Business Park, Tech City",
                        "latitude": "12.9716",
                        "longitude": "77.5946"
                    }
                }
            ],
            "edges": [
                { "id": "e1", "source": "node_start", "target": "node_msg_init" },
                { "id": "e2", "source": "node_msg_init", "target": "node_cond_rating", "sourceHandle": "button-star5" },
                { "id": "e3", "source": "node_cond_rating", "target": "node_msg_gmb", "sourceHandle": "true" },
                { "id": "e4", "source": "node_cond_rating", "target": "node_msg_complaint", "sourceHandle": "false" },
                { "id": "e5", "source": "node_msg_gmb", "target": "node_loc_req", "sourceHandle": "button-find_store" },
                { "id": "e6", "source": "node_loc_req", "target": "node_loc_send" }
            ]
        }
    }
];
