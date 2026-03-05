export const INDUSTRY_SCENARIOS = [
    {
        "id": "universal_lead_capture",
        "title": "1. Universal Lead Capture Engine",
        "description": "Capture every inquiry professionally, save to CRM, score budget, and follow up.",
        "modulesUsed": [
            "Message",
            "List",
            "Condition",
            "Action",
            "Drip"
        ],
        "flowData": {
            "nodes": [
                {
                    "id": "node_start",
                    "type": "start",
                    "position": {
                        "x": 250,
                        "y": 50
                    },
                    "data": {
                        "label": "HELLO"
                    }
                },
                {
                    "id": "node_msg1",
                    "type": "message",
                    "position": {
                        "x": 250,
                        "y": 150
                    },
                    "data": {
                        "label": "Welcome",
                        "text": "Welcome! Thank you for reaching out to us. What service are you interested in?",
                        "buttons": [
                            {
                                "id": "b1",
                                "title": "View Services",
                                "type": "reply"
                            }
                        ]
                    }
                },
                {
                    "id": "node_list1",
                    "type": "list",
                    "position": {
                        "x": 250,
                        "y": 300
                    },
                    "data": {
                        "label": "Service Interest",
                        "buttonText": "Services",
                        "sectionTitle": "Our Services",
                        "items": [
                            {
                                "id": "s1",
                                "title": "Consulting"
                            },
                            {
                                "id": "s2",
                                "title": "Implementation"
                            },
                            {
                                "id": "s3",
                                "title": "Support"
                            }
                        ]
                    }
                },
                {
                    "id": "node_action1",
                    "type": "action",
                    "position": {
                        "x": 250,
                        "y": 450
                    },
                    "data": {
                        "label": "Add to CRM",
                        "actionType": "add_to_crm"
                    }
                },
                {
                    "id": "node_list2",
                    "type": "list",
                    "position": {
                        "x": 250,
                        "y": 600
                    },
                    "data": {
                        "label": "Budget",
                        "buttonText": "Select Budget",
                        "sectionTitle": "Budget Range",
                        "items": [
                            {
                                "id": "b1",
                                "title": "< $10k"
                            },
                            {
                                "id": "b2",
                                "title": "$10k - $50k"
                            },
                            {
                                "id": "b3",
                                "title": "> $50k"
                            }
                        ]
                    }
                },
                {
                    "id": "node_drip",
                    "type": "drip",
                    "position": {
                        "x": 250,
                        "y": 750
                    },
                    "data": {
                        "label": "Followup Drip",
                        "dripId": ""
                    }
                },
                {
                    "id": "node_msg2",
                    "type": "message",
                    "position": {
                        "x": 250,
                        "y": 900
                    },
                    "data": {
                        "label": "Sales Push",
                        "text": "Thanks! Our sales team will evaluate your requirements and reach out to you within 2-4 hours.",
                        "buttons": [
                            {
                                "id": "c1",
                                "title": "Call Us Now",
                                "type": "call",
                                "value": "+1234567890"
                            }
                        ]
                    }
                }
            ],
            "edges": [
                {
                    "id": "e1",
                    "source": "node_start",
                    "target": "node_msg1"
                },
                {
                    "id": "e2",
                    "source": "node_msg1",
                    "target": "node_list1",
                    "sourceHandle": "button-b1"
                },
                {
                    "id": "e3",
                    "source": "node_list1",
                    "target": "node_action1",
                    "sourceHandle": "item-s1"
                },
                {
                    "id": "e4",
                    "source": "node_action1",
                    "target": "node_list2"
                },
                {
                    "id": "e5",
                    "source": "node_list2",
                    "target": "node_drip",
                    "sourceHandle": "item-b1"
                },
                {
                    "id": "e6",
                    "source": "node_drip",
                    "target": "node_msg2"
                }
            ]
        }
    },
    {
        "id": "instant_quote_generator",
        "title": "2. Instant Quote Generator Flow",
        "description": "Generate leads ready to buy by asking requirements and budget, then auto-quoting.",
        "modulesUsed": [
            "Message",
            "List",
            "Action",
            "Payment"
        ],
        "flowData": {
            "nodes": [
                {
                    "id": "node_start",
                    "type": "start",
                    "position": {
                        "x": 250,
                        "y": 50
                    },
                    "data": {
                        "label": "QUOTE"
                    }
                },
                {
                    "id": "node_msg1",
                    "type": "message",
                    "position": {
                        "x": 250,
                        "y": 150
                    },
                    "data": {
                        "label": "Welcome",
                        "text": "Hi! Let's get you a quick quote. What type of service do you need?",
                        "buttons": [
                            {
                                "id": "b1",
                                "title": "Start Query",
                                "type": "reply"
                            }
                        ]
                    }
                },
                {
                    "id": "node_list1",
                    "type": "list",
                    "position": {
                        "x": 250,
                        "y": 300
                    },
                    "data": {
                        "label": "Service Type",
                        "buttonText": "Select Type",
                        "sectionTitle": "Service",
                        "items": [
                            {
                                "id": "t1",
                                "title": "Standard"
                            },
                            {
                                "id": "t2",
                                "title": "Premium"
                            }
                        ]
                    }
                },
                {
                    "id": "node_list2",
                    "type": "list",
                    "position": {
                        "x": 250,
                        "y": 450
                    },
                    "data": {
                        "label": "Requirements",
                        "buttonText": "Select Need",
                        "sectionTitle": "Delivery Need",
                        "items": [
                            {
                                "id": "r1",
                                "title": "Normal (3 days)"
                            },
                            {
                                "id": "r2",
                                "title": "Urgent (24h)"
                            }
                        ]
                    }
                },
                {
                    "id": "node_action1",
                    "type": "action",
                    "position": {
                        "x": 250,
                        "y": 600
                    },
                    "data": {
                        "label": "Auto Webhook Quote",
                        "actionType": "webhook"
                    }
                },
                {
                    "id": "node_payment",
                    "type": "payment",
                    "position": {
                        "x": 250,
                        "y": 750
                    },
                    "data": {
                        "label": "Payment Option",
                        "paymentTitle": "Service Quote Deposit",
                        "amount": "100",
                        "currency": "USD"
                    }
                }
            ],
            "edges": [
                {
                    "id": "e1",
                    "source": "node_start",
                    "target": "node_msg1"
                },
                {
                    "id": "e2",
                    "source": "node_msg1",
                    "target": "node_list1",
                    "sourceHandle": "button-b1"
                },
                {
                    "id": "e3",
                    "source": "node_list1",
                    "target": "node_list2",
                    "sourceHandle": "item-t1"
                },
                {
                    "id": "e4",
                    "source": "node_list2",
                    "target": "node_action1",
                    "sourceHandle": "item-r1"
                },
                {
                    "id": "e5",
                    "source": "node_action1",
                    "target": "node_payment"
                }
            ]
        }
    },
    {
        "id": "high_ticket_sales_funnel",
        "title": "3. High Ticket Sales Funnel",
        "description": "Convert premium clients by filtering serious buyers through a consultation booking and advance payment.",
        "modulesUsed": [
            "Message",
            "List",
            "Appointment",
            "Payment"
        ],
        "flowData": {
            "nodes": [
                {
                    "id": "node_start",
                    "type": "start",
                    "position": {
                        "x": 250,
                        "y": 50
                    },
                    "data": {
                        "label": "CONSULT"
                    }
                },
                {
                    "id": "node_msg1",
                    "type": "message",
                    "position": {
                        "x": 250,
                        "y": 150
                    },
                    "data": {
                        "label": "Welcome",
                        "text": "Welcome to Premium Consulting. What is your primary challenge right now?",
                        "buttons": [
                            {
                                "id": "b1",
                                "title": "Growth Strategy",
                                "type": "reply"
                            },
                            {
                                "id": "b2",
                                "title": "Cost Optimization",
                                "type": "reply"
                            }
                        ]
                    }
                },
                {
                    "id": "node_msg2",
                    "type": "message",
                    "position": {
                        "x": 250,
                        "y": 300
                    },
                    "data": {
                        "label": "Solution & Case Study",
                        "contentType": "DOCUMENT",
                        "mediaUrl": "https://example.com/case-study.pdf",
                        "text": "We've helped 50+ businesses solve exactly this. Download our latest case study above.",
                        "buttons": [
                            {
                                "id": "b3",
                                "title": "Book Consultation",
                                "type": "reply"
                            }
                        ]
                    }
                },
                {
                    "id": "node_appt",
                    "type": "appointment",
                    "position": {
                        "x": 250,
                        "y": 450
                    },
                    "data": {
                        "label": "Book Consultation"
                    }
                },
                {
                    "id": "node_payment",
                    "type": "payment",
                    "position": {
                        "x": 250,
                        "y": 600
                    },
                    "data": {
                        "label": "Advance Payment",
                        "amount": "500",
                        "currency": "USD",
                        "paymentTitle": "Consultation Retainer"
                    }
                }
            ],
            "edges": [
                {
                    "id": "e1",
                    "source": "node_start",
                    "target": "node_msg1"
                },
                {
                    "id": "e2",
                    "source": "node_msg1",
                    "target": "node_msg2",
                    "sourceHandle": "button-b1"
                },
                {
                    "id": "e3",
                    "source": "node_msg2",
                    "target": "node_appt",
                    "sourceHandle": "button-b3"
                },
                {
                    "id": "e4",
                    "source": "node_appt",
                    "target": "node_payment",
                    "sourceHandle": "true"
                }
            ]
        }
    },
    {
        "id": "ecommerce_conversion_machine",
        "title": "4. Ecommerce Conversion Machine",
        "description": "Maximize purchase rate with product list, cart, payment, and tracking.",
        "modulesUsed": [
            "Catalog",
            "Message",
            "Payment",
            "Order Tracking"
        ],
        "flowData": {
            "nodes": [
                {
                    "id": "node_start",
                    "type": "start",
                    "position": {
                        "x": 250,
                        "y": 50
                    },
                    "data": {
                        "label": "SHOP"
                    }
                },
                {
                    "id": "node_msg1",
                    "type": "message",
                    "position": {
                        "x": 250,
                        "y": 150
                    },
                    "data": {
                        "label": "Welcome",
                        "text": "Hi! Check out our latest collections.",
                        "buttons": [
                            {
                                "id": "b1",
                                "title": "View Catalog",
                                "type": "reply"
                            }
                        ]
                    }
                },
                {
                    "id": "node_catalog",
                    "type": "catalog",
                    "position": {
                        "x": 250,
                        "y": 300
                    },
                    "data": {
                        "label": "Products Catalog"
                    }
                },
                {
                    "id": "node_msg2",
                    "type": "message",
                    "position": {
                        "x": 250,
                        "y": 450
                    },
                    "data": {
                        "label": "Variant Selection",
                        "text": "Please use the 'Add to Cart' button to select you variants and proceed."
                    }
                },
                {
                    "id": "node_payment",
                    "type": "payment",
                    "position": {
                        "x": 250,
                        "y": 600
                    },
                    "data": {
                        "label": "Checkout Payment",
                        "amount": "0",
                        "currency": "USD",
                        "paymentTitle": "Dynamic Cart Total"
                    }
                },
                {
                    "id": "node_tracking",
                    "type": "order_tracking",
                    "position": {
                        "x": 250,
                        "y": 750
                    },
                    "data": {
                        "label": "Order Tracking"
                    }
                }
            ],
            "edges": [
                {
                    "id": "e1",
                    "source": "node_start",
                    "target": "node_msg1"
                },
                {
                    "id": "e2",
                    "source": "node_msg1",
                    "target": "node_catalog",
                    "sourceHandle": "button-b1"
                },
                {
                    "id": "e3",
                    "source": "node_catalog",
                    "target": "node_msg2"
                },
                {
                    "id": "e4",
                    "source": "node_msg2",
                    "target": "node_payment"
                },
                {
                    "id": "e5",
                    "source": "node_payment",
                    "target": "node_tracking"
                }
            ]
        }
    },
    {
        "id": "abandoned_lead_recovery",
        "title": "5. Abandoned Lead Recovery Flow",
        "description": "Recover lost leads with reminders, urgency, and offers.",
        "modulesUsed": [
            "Start",
            "Wait",
            "Message",
            "List",
            "Action"
        ],
        "flowData": {
            "nodes": [
                {
                    "id": "node_start",
                    "type": "start",
                    "position": {
                        "x": 250,
                        "y": 50
                    },
                    "data": {
                        "label": "RECOVER"
                    }
                },
                {
                    "id": "node_msg1",
                    "type": "message",
                    "position": {
                        "x": 250,
                        "y": 150
                    },
                    "data": {
                        "label": "Reminder",
                        "text": "Hi there! We noticed you left something behind. Are you still interested?",
                        "buttons": [
                            {
                                "id": "b1",
                                "title": "Yes",
                                "type": "reply"
                            },
                            {
                                "id": "b2",
                                "title": "No thanks",
                                "type": "reply"
                            }
                        ]
                    }
                },
                {
                    "id": "node_cond1",
                    "type": "condition",
                    "position": {
                        "x": 250,
                        "y": 300
                    },
                    "data": {
                        "label": "Still Interested?",
                        "conditionType": "message_body",
                        "operator": "equals",
                        "value": "Yes"
                    }
                },
                {
                    "id": "node_msg2",
                    "type": "message",
                    "position": {
                        "x": 50,
                        "y": 450
                    },
                    "data": {
                        "label": "Offer",
                        "text": "Great! Here is a 10% discount code: SAVE10 to complete your purchase today.",
                        "buttons": [
                            {
                                "id": "b3",
                                "title": "Use Code Now",
                                "type": "url",
                                "value": "https://store.com/checkout"
                            }
                        ]
                    }
                },
                {
                    "id": "node_msg3",
                    "type": "message",
                    "position": {
                        "x": 50,
                        "y": 600
                    },
                    "data": {
                        "label": "Urgency",
                        "text": "This code expires in exactly 2 hours!"
                    }
                },
                {
                    "id": "node_end",
                    "type": "end",
                    "position": {
                        "x": 450,
                        "y": 450
                    },
                    "data": {
                        "label": "End Flow - Not interested"
                    }
                }
            ],
            "edges": [
                {
                    "id": "e1",
                    "source": "node_start",
                    "target": "node_msg1"
                },
                {
                    "id": "e2",
                    "source": "node_msg1",
                    "target": "node_cond1",
                    "sourceHandle": "button-b1"
                },
                {
                    "id": "e3",
                    "source": "node_cond1",
                    "target": "node_msg2",
                    "sourceHandle": "true"
                },
                {
                    "id": "e4",
                    "source": "node_msg2",
                    "target": "node_msg3"
                },
                {
                    "id": "e5",
                    "source": "node_cond1",
                    "target": "node_end",
                    "sourceHandle": "false"
                }
            ]
        }
    },
    {
        "id": "new_customer_onboarding",
        "title": "6. New Customer Onboarding Flow",
        "description": "Reduce support load by sending instructions, guides, and account setup.",
        "modulesUsed": [
            "Message",
            "Action",
            "List",
            "Condition"
        ],
        "flowData": {
            "nodes": [
                {
                    "id": "node_start",
                    "type": "start",
                    "position": {
                        "x": 250,
                        "y": 50
                    },
                    "data": {
                        "label": "ONBOARD"
                    }
                },
                {
                    "id": "node_msg1",
                    "type": "message",
                    "position": {
                        "x": 250,
                        "y": 150
                    },
                    "data": {
                        "label": "Welcome",
                        "text": "Welcome aboard! We are thrilled to have you.",
                        "buttons": [
                            {
                                "id": "b1",
                                "title": "Let's Start",
                                "type": "reply"
                            }
                        ]
                    }
                },
                {
                    "id": "node_msg2",
                    "type": "message",
                    "position": {
                        "x": 250,
                        "y": 300
                    },
                    "data": {
                        "label": "Instructions",
                        "contentType": "DOCUMENT",
                        "text": "Here is the getting started guide.",
                        "buttons": [
                            {
                                "id": "b2",
                                "title": "Done",
                                "type": "reply"
                            }
                        ]
                    }
                },
                {
                    "id": "node_action",
                    "type": "action",
                    "position": {
                        "x": 250,
                        "y": 450
                    },
                    "data": {
                        "label": "API Account Setup",
                        "actionType": "webhook"
                    }
                },
                {
                    "id": "node_list",
                    "type": "list",
                    "position": {
                        "x": 250,
                        "y": 600
                    },
                    "data": {
                        "label": "Support Option",
                        "buttonText": "Help Menu",
                        "sectionTitle": "Need Help?",
                        "items": [
                            {
                                "id": "i1",
                                "title": "FAQ"
                            },
                            {
                                "id": "i2",
                                "title": "Contact Support"
                            }
                        ]
                    }
                },
                {
                    "id": "node_end",
                    "type": "end",
                    "position": {
                        "x": 250,
                        "y": 750
                    },
                    "data": {
                        "label": "Complete"
                    }
                }
            ],
            "edges": [
                {
                    "id": "e1",
                    "source": "node_start",
                    "target": "node_msg1"
                },
                {
                    "id": "e2",
                    "source": "node_msg1",
                    "target": "node_msg2",
                    "sourceHandle": "button-b1"
                },
                {
                    "id": "e3",
                    "source": "node_msg2",
                    "target": "node_action",
                    "sourceHandle": "button-b2"
                },
                {
                    "id": "e4",
                    "source": "node_action",
                    "target": "node_list"
                },
                {
                    "id": "e5",
                    "source": "node_list",
                    "target": "node_end",
                    "sourceHandle": "item-i1"
                }
            ]
        }
    },
    {
        "id": "payment_collection",
        "title": "7. Payment Collection Flow",
        "description": "Collect pending payments automatically with invoice and payment link.",
        "modulesUsed": [
            "Message",
            "Payment",
            "Condition"
        ],
        "flowData": {
            "nodes": [
                {
                    "id": "node_start",
                    "type": "start",
                    "position": {
                        "x": 250,
                        "y": 50
                    },
                    "data": {
                        "label": "INVOICE"
                    }
                },
                {
                    "id": "node_msg1",
                    "type": "message",
                    "position": {
                        "x": 250,
                        "y": 150
                    },
                    "data": {
                        "label": "Reminder",
                        "text": "Hi! This is a gentle reminder regarding your pending invoice #INV-1029.",
                        "buttons": [
                            {
                                "id": "b1",
                                "title": "View Invoice",
                                "type": "reply"
                            }
                        ]
                    }
                },
                {
                    "id": "node_msg2",
                    "type": "message",
                    "position": {
                        "x": 250,
                        "y": 300
                    },
                    "data": {
                        "label": "Invoice PDF",
                        "contentType": "DOCUMENT",
                        "text": "Please find the attached invoice copy.",
                        "buttons": [
                            {
                                "id": "b2",
                                "title": "Pay Now",
                                "type": "reply"
                            }
                        ]
                    }
                },
                {
                    "id": "node_payment",
                    "type": "payment",
                    "position": {
                        "x": 250,
                        "y": 450
                    },
                    "data": {
                        "label": "Payment Checkout",
                        "paymentTitle": "Invoice Payment",
                        "amount": "1500",
                        "currency": "USD"
                    }
                },
                {
                    "id": "node_msg3",
                    "type": "message",
                    "position": {
                        "x": 250,
                        "y": 600
                    },
                    "data": {
                        "label": "Confirmation",
                        "text": "Payment received. Thank you!"
                    }
                }
            ],
            "edges": [
                {
                    "id": "e1",
                    "source": "node_start",
                    "target": "node_msg1"
                },
                {
                    "id": "e2",
                    "source": "node_msg1",
                    "target": "node_msg2",
                    "sourceHandle": "button-b1"
                },
                {
                    "id": "e3",
                    "source": "node_msg2",
                    "target": "node_payment",
                    "sourceHandle": "button-b2"
                },
                {
                    "id": "e4",
                    "source": "node_payment",
                    "target": "node_msg3"
                }
            ]
        }
    },
    {
        "id": "appointment_booking_standard",
        "title": "8. Appointment Booking Flow",
        "description": "Automate bookings with service selection, dates, slot, and payment.",
        "modulesUsed": [
            "List",
            "Appointment",
            "Payment",
            "Action"
        ],
        "flowData": {
            "nodes": [
                {
                    "id": "node_start",
                    "type": "start",
                    "position": {
                        "x": 250,
                        "y": 50
                    },
                    "data": {
                        "label": "BOOKING"
                    }
                },
                {
                    "id": "node_list1",
                    "type": "list",
                    "position": {
                        "x": 250,
                        "y": 150
                    },
                    "data": {
                        "label": "Select Service",
                        "buttonText": "Services",
                        "sectionTitle": "Services",
                        "items": [
                            {
                                "id": "s1",
                                "title": "Consultation"
                            },
                            {
                                "id": "s2",
                                "title": "On-site Visit"
                            }
                        ]
                    }
                },
                {
                    "id": "node_appt",
                    "type": "appointment",
                    "position": {
                        "x": 250,
                        "y": 300
                    },
                    "data": {
                        "label": "Calendar Slot Picker"
                    }
                },
                {
                    "id": "node_payment",
                    "type": "payment",
                    "position": {
                        "x": 250,
                        "y": 450
                    },
                    "data": {
                        "label": "Booking Fee",
                        "amount": "50",
                        "currency": "USD",
                        "paymentTitle": "Appointment Reservation"
                    }
                },
                {
                    "id": "node_action",
                    "type": "action",
                    "position": {
                        "x": 250,
                        "y": 600
                    },
                    "data": {
                        "label": "Schedule Reminder",
                        "actionType": "webhook"
                    }
                }
            ],
            "edges": [
                {
                    "id": "e1",
                    "source": "node_start",
                    "target": "node_list1"
                },
                {
                    "id": "e2",
                    "source": "node_list1",
                    "target": "node_appt",
                    "sourceHandle": "item-s1"
                },
                {
                    "id": "e3",
                    "source": "node_appt",
                    "target": "node_payment",
                    "sourceHandle": "true"
                },
                {
                    "id": "e4",
                    "source": "node_payment",
                    "target": "node_action"
                }
            ]
        }
    },
    {
        "id": "event_registration",
        "title": "9. Event Registration Flow",
        "description": "Fill events fast with details, registration, and payment.",
        "modulesUsed": [
            "Message",
            "Meta_Flow",
            "Payment",
            "Message"
        ],
        "flowData": {
            "nodes": [
                {
                    "id": "node_start",
                    "type": "start",
                    "position": {
                        "x": 250,
                        "y": 50
                    },
                    "data": {
                        "label": "EVENT"
                    }
                },
                {
                    "id": "node_msg1",
                    "type": "message",
                    "position": {
                        "x": 250,
                        "y": 150
                    },
                    "data": {
                        "label": "Event Details",
                        "contentType": "IMAGE",
                        "text": "Join our next Mega Summit on Digital Growth!",
                        "buttons": [
                            {
                                "id": "b1",
                                "title": "Register Now",
                                "type": "reply"
                            }
                        ]
                    }
                },
                {
                    "id": "node_form",
                    "type": "meta_flow",
                    "position": {
                        "x": 250,
                        "y": 300
                    },
                    "data": {
                        "label": "Registration Form",
                        "flowCTA": "Fill Attendee Details"
                    }
                },
                {
                    "id": "node_payment",
                    "type": "payment",
                    "position": {
                        "x": 250,
                        "y": 450
                    },
                    "data": {
                        "label": "Ticket Payment",
                        "amount": "199",
                        "currency": "USD",
                        "paymentTitle": "Summit Entry Ticket"
                    }
                },
                {
                    "id": "node_msg2",
                    "type": "message",
                    "position": {
                        "x": 250,
                        "y": 600
                    },
                    "data": {
                        "label": "Confirmation",
                        "text": "You are in! E-Ticket will be mailed shortly."
                    }
                }
            ],
            "edges": [
                {
                    "id": "e1",
                    "source": "node_start",
                    "target": "node_msg1"
                },
                {
                    "id": "e2",
                    "source": "node_msg1",
                    "target": "node_form",
                    "sourceHandle": "button-b1"
                },
                {
                    "id": "e3",
                    "source": "node_form",
                    "target": "node_payment"
                },
                {
                    "id": "e4",
                    "source": "node_payment",
                    "target": "node_msg2"
                }
            ]
        }
    },
    {
        "id": "course_admission",
        "title": "10. Course Admission Flow",
        "description": "Convert students: courses, eligibility, demo, payment.",
        "modulesUsed": [
            "List",
            "Condition",
            "Appointment",
            "Payment"
        ],
        "flowData": {
            "nodes": [
                {
                    "id": "node_start",
                    "type": "start",
                    "position": {
                        "x": 250,
                        "y": 50
                    },
                    "data": {
                        "label": "STUDY"
                    }
                },
                {
                    "id": "node_list",
                    "type": "list",
                    "position": {
                        "x": 250,
                        "y": 150
                    },
                    "data": {
                        "label": "Courses",
                        "buttonText": "Select Course",
                        "sectionTitle": "Programs",
                        "items": [
                            {
                                "id": "c1",
                                "title": "B.Tech"
                            },
                            {
                                "id": "c2",
                                "title": "MBA"
                            }
                        ]
                    }
                },
                {
                    "id": "node_form",
                    "type": "meta_flow",
                    "position": {
                        "x": 250,
                        "y": 300
                    },
                    "data": {
                        "label": "Eligibility Check",
                        "flowCTA": "Check Eligibility"
                    }
                },
                {
                    "id": "node_appt",
                    "type": "appointment",
                    "position": {
                        "x": 250,
                        "y": 450
                    },
                    "data": {
                        "label": "Book Demo/Counseling"
                    }
                },
                {
                    "id": "node_payment",
                    "type": "payment",
                    "position": {
                        "x": 250,
                        "y": 600
                    },
                    "data": {
                        "label": "Admission Fee",
                        "amount": "1000",
                        "currency": "USD",
                        "paymentTitle": "Semester 1 Registration"
                    }
                }
            ],
            "edges": [
                {
                    "id": "e1",
                    "source": "node_start",
                    "target": "node_list"
                },
                {
                    "id": "e2",
                    "source": "node_list",
                    "target": "node_form",
                    "sourceHandle": "item-c1"
                },
                {
                    "id": "e3",
                    "source": "node_form",
                    "target": "node_appt"
                },
                {
                    "id": "e4",
                    "source": "node_appt",
                    "target": "node_payment",
                    "sourceHandle": "true"
                }
            ]
        }
    },
    {
        "id": "real_estate_filter",
        "title": "11. Real Estate Lead Filter",
        "description": "Find serious buyers by asking property type, budget, location, and site visit.",
        "modulesUsed": [
            "List",
            "List",
            "List",
            "Appointment",
            "Action"
        ],
        "flowData": {
            "nodes": [
                {
                    "id": "node_start",
                    "type": "start",
                    "position": {
                        "x": 250,
                        "y": 50
                    },
                    "data": {
                        "label": "PROPERTY"
                    }
                },
                {
                    "id": "node_list1",
                    "type": "list",
                    "position": {
                        "x": 250,
                        "y": 150
                    },
                    "data": {
                        "label": "Property Type",
                        "buttonText": "Select",
                        "sectionTitle": "Type",
                        "items": [
                            {
                                "id": "p1",
                                "title": "Apartment"
                            },
                            {
                                "id": "p2",
                                "title": "Villa"
                            },
                            {
                                "id": "p3",
                                "title": "Commercial"
                            }
                        ]
                    }
                },
                {
                    "id": "node_list2",
                    "type": "list",
                    "position": {
                        "x": 250,
                        "y": 300
                    },
                    "data": {
                        "label": "Budget",
                        "buttonText": "Select",
                        "sectionTitle": "Budget",
                        "items": [
                            {
                                "id": "b1",
                                "title": "< $500k"
                            },
                            {
                                "id": "b2",
                                "title": "$500k - $1M"
                            },
                            {
                                "id": "b3",
                                "title": "> $1M"
                            }
                        ]
                    }
                },
                {
                    "id": "node_list3",
                    "type": "list",
                    "position": {
                        "x": 250,
                        "y": 450
                    },
                    "data": {
                        "label": "Location",
                        "buttonText": "Select",
                        "sectionTitle": "Area",
                        "items": [
                            {
                                "id": "l1",
                                "title": "Downtown"
                            },
                            {
                                "id": "l2",
                                "title": "Suburbs"
                            }
                        ]
                    }
                },
                {
                    "id": "node_appt",
                    "type": "appointment",
                    "position": {
                        "x": 250,
                        "y": 600
                    },
                    "data": {
                        "label": "Schedule Site Visit"
                    }
                },
                {
                    "id": "node_action",
                    "type": "action",
                    "position": {
                        "x": 250,
                        "y": 750
                    },
                    "data": {
                        "label": "Agent Connect",
                        "actionType": "webhook"
                    }
                }
            ],
            "edges": [
                {
                    "id": "e1",
                    "source": "node_start",
                    "target": "node_list1"
                },
                {
                    "id": "e2",
                    "source": "node_list1",
                    "target": "node_list2",
                    "sourceHandle": "item-p1"
                },
                {
                    "id": "e3",
                    "source": "node_list2",
                    "target": "node_list3",
                    "sourceHandle": "item-b1"
                },
                {
                    "id": "e4",
                    "source": "node_list3",
                    "target": "node_appt",
                    "sourceHandle": "item-l1"
                },
                {
                    "id": "e5",
                    "source": "node_appt",
                    "target": "node_action",
                    "sourceHandle": "true"
                }
            ]
        }
    },
    {
        "id": "offer_campaign",
        "title": "12. Offer Campaign Flow",
        "description": "Drive sales spikes with flash offer, product selection, and checkout.",
        "modulesUsed": [
            "Message",
            "Catalog",
            "Payment",
            "Action"
        ],
        "flowData": {
            "nodes": [
                {
                    "id": "node_start",
                    "type": "start",
                    "position": {
                        "x": 250,
                        "y": 50
                    },
                    "data": {
                        "label": "OFFER50"
                    }
                },
                {
                    "id": "node_msg1",
                    "type": "message",
                    "position": {
                        "x": 250,
                        "y": 150
                    },
                    "data": {
                        "label": "Flash Offer",
                        "contentType": "IMAGE",
                        "text": "🎉 EXCLUSIVE 50% OFF FLASH SALE! Valid only for the next 4 hours.",
                        "buttons": [
                            {
                                "id": "b1",
                                "title": "Show Products",
                                "type": "reply"
                            }
                        ]
                    }
                },
                {
                    "id": "node_catalog",
                    "type": "catalog",
                    "position": {
                        "x": 250,
                        "y": 300
                    },
                    "data": {
                        "label": "Select Product"
                    }
                },
                {
                    "id": "node_payment",
                    "type": "payment",
                    "position": {
                        "x": 250,
                        "y": 450
                    },
                    "data": {
                        "label": "Discounted Checkout",
                        "amount": "0",
                        "currency": "USD",
                        "paymentTitle": "Flash Sale Total"
                    }
                },
                {
                    "id": "node_action",
                    "type": "action",
                    "position": {
                        "x": 250,
                        "y": 600
                    },
                    "data": {
                        "label": "Tag Buyer",
                        "actionType": "add_to_crm"
                    }
                }
            ],
            "edges": [
                {
                    "id": "e1",
                    "source": "node_start",
                    "target": "node_msg1"
                },
                {
                    "id": "e2",
                    "source": "node_msg1",
                    "target": "node_catalog",
                    "sourceHandle": "button-b1"
                },
                {
                    "id": "e3",
                    "source": "node_catalog",
                    "target": "node_payment"
                },
                {
                    "id": "e4",
                    "source": "node_payment",
                    "target": "node_action"
                }
            ]
        }
    },
    {
        "id": "referral_engine",
        "title": "13. Referral Engine Flow",
        "description": "Generate referrals via an offer and personalized share links.",
        "modulesUsed": [
            "Message",
            "Action",
            "Condition",
            "Wait"
        ],
        "flowData": {
            "nodes": [
                {
                    "id": "node_start",
                    "type": "start",
                    "position": {
                        "x": 250,
                        "y": 50
                    },
                    "data": {
                        "label": "REFER"
                    }
                },
                {
                    "id": "node_msg1",
                    "type": "message",
                    "position": {
                        "x": 250,
                        "y": 150
                    },
                    "data": {
                        "label": "Referral Offer",
                        "text": "Want $50 account credit? Refer a friend!",
                        "buttons": [
                            {
                                "id": "b1",
                                "title": "Get My Link",
                                "type": "reply"
                            }
                        ]
                    }
                },
                {
                    "id": "node_action",
                    "type": "action",
                    "position": {
                        "x": 250,
                        "y": 300
                    },
                    "data": {
                        "label": "Generate Link API",
                        "actionType": "webhook"
                    }
                },
                {
                    "id": "node_msg2",
                    "type": "message",
                    "position": {
                        "x": 250,
                        "y": 450
                    },
                    "data": {
                        "label": "Share Link",
                        "text": "Here is your unique referral link: https://grafty.pro/ref/user123. Get sharing!"
                    }
                },
                {
                    "id": "node_wait",
                    "type": "wait",
                    "position": {
                        "x": 250,
                        "y": 600
                    },
                    "data": {
                        "label": "Wait 7 Days",
                        "delayValue": "7",
                        "delayUnit": "days"
                    }
                },
                {
                    "id": "node_msg3",
                    "type": "message",
                    "position": {
                        "x": 250,
                        "y": 750
                    },
                    "data": {
                        "label": "Reminder",
                        "text": "Just a reminder! Have you shared your link yet? You're almost at your reward."
                    }
                }
            ],
            "edges": [
                {
                    "id": "e1",
                    "source": "node_start",
                    "target": "node_msg1"
                },
                {
                    "id": "e2",
                    "source": "node_msg1",
                    "target": "node_action",
                    "sourceHandle": "button-b1"
                },
                {
                    "id": "e3",
                    "source": "node_action",
                    "target": "node_msg2"
                },
                {
                    "id": "e4",
                    "source": "node_msg2",
                    "target": "node_wait"
                },
                {
                    "id": "e5",
                    "source": "node_wait",
                    "target": "node_msg3"
                }
            ]
        }
    },
    {
        "id": "customer_support",
        "title": "14. Customer Support Automation",
        "description": "Reduce support load by classifying issues and offering self-service or agent.",
        "modulesUsed": [
            "List",
            "Condition",
            "Message",
            "Action"
        ],
        "flowData": {
            "nodes": [
                {
                    "id": "node_start",
                    "type": "start",
                    "position": {
                        "x": 250,
                        "y": 50
                    },
                    "data": {
                        "label": "HELP"
                    }
                },
                {
                    "id": "node_list",
                    "type": "list",
                    "position": {
                        "x": 250,
                        "y": 150
                    },
                    "data": {
                        "label": "Issue Category",
                        "buttonText": "Select Sector",
                        "sectionTitle": "What do you need help with?",
                        "items": [
                            {
                                "id": "i1",
                                "title": "Billing"
                            },
                            {
                                "id": "i2",
                                "title": "Technical Issue"
                            },
                            {
                                "id": "i3",
                                "title": "Other"
                            }
                        ]
                    }
                },
                {
                    "id": "node_cond1",
                    "type": "condition",
                    "position": {
                        "x": 250,
                        "y": 300
                    },
                    "data": {
                        "label": "If Billing",
                        "conditionType": "message_body",
                        "operator": "equals",
                        "value": "Billing"
                    }
                },
                {
                    "id": "node_msg1",
                    "type": "message",
                    "position": {
                        "x": 50,
                        "y": 450
                    },
                    "data": {
                        "label": "Billing Link",
                        "text": "Please visit your billing portal at https://grafty.pro/billing to download invoices or update cards."
                    }
                },
                {
                    "id": "node_cond2",
                    "type": "condition",
                    "position": {
                        "x": 450,
                        "y": 300
                    },
                    "data": {
                        "label": "If Tech Issue/Other",
                        "conditionType": "message_body",
                        "operator": "contains",
                        "value": ""
                    }
                },
                {
                    "id": "node_msg2",
                    "type": "message",
                    "position": {
                        "x": 450,
                        "y": 450
                    },
                    "data": {
                        "label": "Describe Issue",
                        "text": "Please type a short description of your issue. An agent will be with you shortly."
                    }
                },
                {
                    "id": "node_action",
                    "type": "action",
                    "position": {
                        "x": 450,
                        "y": 600
                    },
                    "data": {
                        "label": "Route to Human Agent",
                        "actionType": "webhook"
                    }
                }
            ],
            "edges": [
                {
                    "id": "e1",
                    "source": "node_start",
                    "target": "node_list"
                },
                {
                    "id": "e2",
                    "source": "node_list",
                    "target": "node_cond1",
                    "sourceHandle": "item-i1"
                },
                {
                    "id": "e3",
                    "source": "node_cond1",
                    "target": "node_msg1",
                    "sourceHandle": "true"
                },
                {
                    "id": "e4",
                    "source": "node_cond1",
                    "target": "node_cond2",
                    "sourceHandle": "false"
                },
                {
                    "id": "e5",
                    "source": "node_cond2",
                    "target": "node_msg2",
                    "sourceHandle": "true"
                },
                {
                    "id": "e6",
                    "source": "node_msg2",
                    "target": "node_action"
                }
            ]
        }
    },
    {
        "id": "webinar_funnel",
        "title": "15. Webinar Funnel Flow",
        "description": "Sell webinars. Register, remind, join link, and post-webinar offer.",
        "modulesUsed": [
            "Meta_Flow",
            "Wait",
            "Message",
            "Action",
            "Payment"
        ],
        "flowData": {
            "nodes": [
                {
                    "id": "node_start",
                    "type": "start",
                    "position": {
                        "x": 250,
                        "y": 50
                    },
                    "data": {
                        "label": "WEBINAR"
                    }
                },
                {
                    "id": "node_form",
                    "type": "meta_flow",
                    "position": {
                        "x": 250,
                        "y": 150
                    },
                    "data": {
                        "label": "Webinar Registration",
                        "flowCTA": "Register Now"
                    }
                },
                {
                    "id": "node_msg1",
                    "type": "message",
                    "position": {
                        "x": 250,
                        "y": 300
                    },
                    "data": {
                        "label": "Confirm",
                        "text": "You're registered! The webinar starts tomorrow at 2 PM EST."
                    }
                },
                {
                    "id": "node_wait1",
                    "type": "wait",
                    "position": {
                        "x": 250,
                        "y": 450
                    },
                    "data": {
                        "label": "Wait exactly 1 day",
                        "delayValue": "1",
                        "delayUnit": "days"
                    }
                },
                {
                    "id": "node_msg2",
                    "type": "message",
                    "position": {
                        "x": 250,
                        "y": 600
                    },
                    "data": {
                        "label": "Join Link",
                        "text": "We are live! Join the webinar here: https://zoom.us/j/12345"
                    }
                },
                {
                    "id": "node_wait2",
                    "type": "wait",
                    "position": {
                        "x": 250,
                        "y": 750
                    },
                    "data": {
                        "label": "Wait 2 hours",
                        "delayValue": "2",
                        "delayUnit": "hours"
                    }
                },
                {
                    "id": "node_msg3",
                    "type": "message",
                    "position": {
                        "x": 250,
                        "y": 900
                    },
                    "data": {
                        "label": "Post-Webinar Offer",
                        "text": "Hope you enjoyed the session! Here is the special course offer mentioned:",
                        "buttons": [
                            {
                                "id": "b1",
                                "title": "Claim Offer",
                                "type": "reply"
                            }
                        ]
                    }
                },
                {
                    "id": "node_payment",
                    "type": "payment",
                    "position": {
                        "x": 250,
                        "y": 1050
                    },
                    "data": {
                        "label": "Checkout",
                        "amount": "99",
                        "currency": "USD",
                        "paymentTitle": "Webinar Masterclass Bundle"
                    }
                }
            ],
            "edges": [
                {
                    "id": "e1",
                    "source": "node_start",
                    "target": "node_form"
                },
                {
                    "id": "e2",
                    "source": "node_form",
                    "target": "node_msg1"
                },
                {
                    "id": "e3",
                    "source": "node_msg1",
                    "target": "node_wait1"
                },
                {
                    "id": "e4",
                    "source": "node_wait1",
                    "target": "node_msg2"
                },
                {
                    "id": "e5",
                    "source": "node_msg2",
                    "target": "node_wait2"
                },
                {
                    "id": "e6",
                    "source": "node_wait2",
                    "target": "node_msg3"
                },
                {
                    "id": "e7",
                    "source": "node_msg3",
                    "target": "node_payment",
                    "sourceHandle": "button-b1"
                }
            ]
        }
    },
    {
        "id": "multi_step_drip",
        "title": "16. Multi-Step Drip Sales Flow",
        "description": "Automated sequential selling across multiple days.",
        "modulesUsed": [
            "Message",
            "Wait",
            "Message",
            "Wait",
            "Message",
            "Payment"
        ],
        "flowData": {
            "nodes": [
                {
                    "id": "node_start",
                    "type": "start",
                    "position": {
                        "x": 250,
                        "y": 50
                    },
                    "data": {
                        "label": "COURSE"
                    }
                },
                {
                    "id": "node_msg1",
                    "type": "message",
                    "position": {
                        "x": 250,
                        "y": 150
                    },
                    "data": {
                        "label": "Day 1: Intro",
                        "text": "Hi! Over the next few days I'll share 3 secrets to doubling your traffic."
                    }
                },
                {
                    "id": "node_wait1",
                    "type": "wait",
                    "position": {
                        "x": 250,
                        "y": 300
                    },
                    "data": {
                        "label": "Wait 2 Days",
                        "delayValue": "2",
                        "delayUnit": "days"
                    }
                },
                {
                    "id": "node_msg2",
                    "type": "message",
                    "position": {
                        "x": 250,
                        "y": 450
                    },
                    "data": {
                        "label": "Day 3: Value",
                        "text": "Secret #1 is consistency. If you want the exact system we use, check out our bootcamp."
                    }
                },
                {
                    "id": "node_wait2",
                    "type": "wait",
                    "position": {
                        "x": 250,
                        "y": 600
                    },
                    "data": {
                        "label": "Wait 2 Days",
                        "delayValue": "2",
                        "delayUnit": "days"
                    }
                },
                {
                    "id": "node_msg3",
                    "type": "message",
                    "position": {
                        "x": 250,
                        "y": 750
                    },
                    "data": {
                        "label": "Day 5: Offer",
                        "text": "Bootcamp enrollment closes soon. Join 500+ successful students!",
                        "buttons": [
                            {
                                "id": "b1",
                                "title": "Enroll Now",
                                "type": "reply"
                            }
                        ]
                    }
                },
                {
                    "id": "node_payment",
                    "type": "payment",
                    "position": {
                        "x": 250,
                        "y": 900
                    },
                    "data": {
                        "label": "Enrollment",
                        "amount": "199",
                        "currency": "USD",
                        "paymentTitle": "Bootcamp Ticket"
                    }
                }
            ],
            "edges": [
                {
                    "id": "e1",
                    "source": "node_start",
                    "target": "node_msg1"
                },
                {
                    "id": "e2",
                    "source": "node_msg1",
                    "target": "node_wait1"
                },
                {
                    "id": "e3",
                    "source": "node_wait1",
                    "target": "node_msg2"
                },
                {
                    "id": "e4",
                    "source": "node_msg2",
                    "target": "node_wait2"
                },
                {
                    "id": "e5",
                    "source": "node_wait2",
                    "target": "node_msg3"
                },
                {
                    "id": "e6",
                    "source": "node_msg3",
                    "target": "node_payment",
                    "sourceHandle": "button-b1"
                }
            ]
        }
    },
    {
        "id": "agency_lead",
        "title": "17. Agency Lead Conversion",
        "description": "Sell digital services with budgets and requirements.",
        "modulesUsed": [
            "List",
            "Condition",
            "Message"
        ],
        "flowData": {
            "nodes": [
                {
                    "id": "node_start",
                    "type": "start",
                    "position": {
                        "x": 250,
                        "y": 50
                    },
                    "data": {
                        "label": "AGENCY"
                    }
                },
                {
                    "id": "node_list",
                    "type": "list",
                    "position": {
                        "x": 250,
                        "y": 150
                    },
                    "data": {
                        "label": "Services",
                        "buttonText": "Select",
                        "items": [
                            {
                                "id": "i1",
                                "title": "SEO"
                            },
                            {
                                "id": "i2",
                                "title": "Ads"
                            }
                        ]
                    }
                },
                {
                    "id": "node_msg",
                    "type": "message",
                    "position": {
                        "x": 250,
                        "y": 300
                    },
                    "data": {
                        "label": "Contacting",
                        "text": "Great. An account manager is reviewing this."
                    }
                }
            ],
            "edges": [
                {
                    "id": "e1",
                    "source": "node_start",
                    "target": "node_list"
                },
                {
                    "id": "e2",
                    "source": "node_list",
                    "target": "node_msg",
                    "sourceHandle": "item-i1"
                }
            ]
        }
    },
    {
        "id": "feedback",
        "title": "18. Feedback & Review Flow",
        "description": "Collect reviews after delivery.",
        "modulesUsed": [
            "Wait",
            "Message",
            "Condition"
        ],
        "flowData": {
            "nodes": [
                {
                    "id": "node_start",
                    "type": "start",
                    "position": {
                        "x": 250,
                        "y": 50
                    },
                    "data": {
                        "label": "DELIVERED"
                    }
                },
                {
                    "id": "node_msg",
                    "type": "message",
                    "position": {
                        "x": 250,
                        "y": 150
                    },
                    "data": {
                        "label": "Review",
                        "text": "Your order was delivered! How was it?",
                        "buttons": [
                            {
                                "id": "b1",
                                "title": "5 Stars",
                                "type": "reply"
                            },
                            {
                                "id": "b2",
                                "title": "Issue",
                                "type": "reply"
                            }
                        ]
                    }
                }
            ],
            "edges": [
                {
                    "id": "e1",
                    "source": "node_start",
                    "target": "node_msg"
                }
            ]
        }
    },
    {
        "id": "upsell",
        "title": "19. Upsell Flow",
        "description": "Increase order value immediately after purchase.",
        "modulesUsed": [
            "Wait",
            "Message",
            "Payment"
        ],
        "flowData": {
            "nodes": [
                {
                    "id": "node_start",
                    "type": "start",
                    "position": {
                        "x": 250,
                        "y": 50
                    },
                    "data": {
                        "label": "PAID"
                    }
                },
                {
                    "id": "node_msg",
                    "type": "message",
                    "position": {
                        "x": 250,
                        "y": 150
                    },
                    "data": {
                        "label": "Upsell",
                        "text": "Thanks! Want to add expedited shipping for just $10?",
                        "buttons": [
                            {
                                "id": "b1",
                                "title": "Add Now",
                                "type": "reply"
                            }
                        ]
                    }
                },
                {
                    "id": "node_payment",
                    "type": "payment",
                    "position": {
                        "x": 250,
                        "y": 300
                    },
                    "data": {
                        "label": "Payment",
                        "amount": "10",
                        "currency": "USD",
                        "paymentTitle": "Add-on"
                    }
                }
            ],
            "edges": [
                {
                    "id": "e1",
                    "source": "node_start",
                    "target": "node_msg"
                },
                {
                    "id": "e2",
                    "source": "node_msg",
                    "target": "node_payment",
                    "sourceHandle": "button-b1"
                }
            ]
        }
    },
    {
        "id": "subscription_renewal",
        "title": "20. Subscription Renewal",
        "description": "Reduce churn with automated renewal reminders.",
        "modulesUsed": [
            "Message",
            "Payment",
            "Action"
        ],
        "flowData": {
            "nodes": [
                {
                    "id": "node_start",
                    "type": "start",
                    "position": {
                        "x": 250,
                        "y": 50
                    },
                    "data": {
                        "label": "RENEW"
                    }
                },
                {
                    "id": "node_msg",
                    "type": "message",
                    "position": {
                        "x": 250,
                        "y": 150
                    },
                    "data": {
                        "label": "Reminder",
                        "text": "Your plan expires tomorrow. Renew now to avoid interruption!",
                        "buttons": [
                            {
                                "id": "b1",
                                "title": "Renew Plan",
                                "type": "reply"
                            }
                        ]
                    }
                },
                {
                    "id": "node_payment",
                    "type": "payment",
                    "position": {
                        "x": 250,
                        "y": 300
                    },
                    "data": {
                        "label": "Renewal",
                        "amount": "29",
                        "currency": "USD",
                        "paymentTitle": "Monthly Plan"
                    }
                }
            ],
            "edges": [
                {
                    "id": "e1",
                    "source": "node_start",
                    "target": "node_msg"
                },
                {
                    "id": "e2",
                    "source": "node_msg",
                    "target": "node_payment",
                    "sourceHandle": "button-b1"
                }
            ]
        }
    },
    {
        "id": "ecommerce_cod_verify",
        "title": "21. COD Order Verification Flow",
        "description": "Reduce fake orders. Confirm intent and accept delivery charge.",
        "modulesUsed": [
            "Message",
            "Payment",
            "Action",
            "Condition"
        ],
        "flowData": {
            "nodes": [
                {
                    "id": "node_start",
                    "type": "start",
                    "position": {
                        "x": 250,
                        "y": 50
                    },
                    "data": {
                        "label": "NEW_COD"
                    }
                },
                {
                    "id": "node_msg",
                    "type": "message",
                    "position": {
                        "x": 250,
                        "y": 150
                    },
                    "data": {
                        "label": "Confirm Order",
                        "text": "Hi! We received a Cash on Delivery order. To confirm dispatch, please reply 'Confirm'.",
                        "buttons": [
                            {
                                "id": "b1",
                                "title": "Confirm Order",
                                "type": "reply"
                            },
                            {
                                "id": "b2",
                                "title": "Cancel",
                                "type": "reply"
                            }
                        ]
                    }
                },
                {
                    "id": "node_cond",
                    "type": "condition",
                    "position": {
                        "x": 250,
                        "y": 300
                    },
                    "data": {
                        "label": "If Confirm",
                        "conditionType": "message_body",
                        "operator": "equals",
                        "value": "Confirm Order"
                    }
                },
                {
                    "id": "node_payment",
                    "type": "payment",
                    "position": {
                        "x": 50,
                        "y": 450
                    },
                    "data": {
                        "label": "Delivery Charge",
                        "amount": "5",
                        "currency": "USD",
                        "paymentTitle": "COD Advance Shipping"
                    }
                },
                {
                    "id": "node_msg2",
                    "type": "message",
                    "position": {
                        "x": 50,
                        "y": 600
                    },
                    "data": {
                        "label": "Dispatched",
                        "text": "Thanks! Your order is verified and is being packed."
                    }
                },
                {
                    "id": "node_msg3",
                    "type": "message",
                    "position": {
                        "x": 450,
                        "y": 450
                    },
                    "data": {
                        "label": "Cancelled",
                        "text": "Order cancelled successfully."
                    }
                }
            ],
            "edges": [
                {
                    "id": "e1",
                    "source": "node_start",
                    "target": "node_msg"
                },
                {
                    "id": "e2",
                    "source": "node_msg",
                    "target": "node_cond",
                    "sourceHandle": "button-b1"
                },
                {
                    "id": "e3",
                    "source": "node_cond",
                    "target": "node_payment",
                    "sourceHandle": "true"
                },
                {
                    "id": "e4",
                    "source": "node_payment",
                    "target": "node_msg2"
                },
                {
                    "id": "e5",
                    "source": "node_cond",
                    "target": "node_msg3",
                    "sourceHandle": "false"
                }
            ]
        }
    },
    {
        "id": "lead_qualification",
        "title": "22. Lead Qualification Flow",
        "description": "Identify serious leads instantly. Need, Budget, Timeline.",
        "modulesUsed": [
            "List",
            "List",
            "List",
            "Condition",
            "Action"
        ],
        "flowData": {
            "nodes": [
                {
                    "id": "node_start",
                    "type": "start",
                    "position": {
                        "x": 250,
                        "y": 50
                    },
                    "data": {
                        "label": "APPLY"
                    }
                },
                {
                    "id": "node_list1",
                    "type": "list",
                    "position": {
                        "x": 250,
                        "y": 150
                    },
                    "data": {
                        "label": "Primary Need",
                        "buttonText": "Select",
                        "items": [
                            {
                                "id": "i1",
                                "title": "Software"
                            },
                            {
                                "id": "i2",
                                "title": "Hardware"
                            }
                        ]
                    }
                },
                {
                    "id": "node_list2",
                    "type": "list",
                    "position": {
                        "x": 250,
                        "y": 300
                    },
                    "data": {
                        "label": "Timeline",
                        "buttonText": "When",
                        "items": [
                            {
                                "id": "t1",
                                "title": "Immediately"
                            },
                            {
                                "id": "t2",
                                "title": "1-3 Months"
                            }
                        ]
                    }
                },
                {
                    "id": "node_list3",
                    "type": "list",
                    "position": {
                        "x": 250,
                        "y": 450
                    },
                    "data": {
                        "label": "Budget",
                        "buttonText": "Budget",
                        "items": [
                            {
                                "id": "b1",
                                "title": "> $10k"
                            },
                            {
                                "id": "b2",
                                "title": "< $10k"
                            }
                        ]
                    }
                },
                {
                    "id": "node_cond",
                    "type": "condition",
                    "position": {
                        "x": 250,
                        "y": 600
                    },
                    "data": {
                        "label": "High Ticket?",
                        "conditionType": "message_body",
                        "operator": "equals",
                        "value": "> $10k"
                    }
                },
                {
                    "id": "node_action1",
                    "type": "action",
                    "position": {
                        "x": 50,
                        "y": 750
                    },
                    "data": {
                        "label": "Hot Lead Alert",
                        "actionType": "webhook"
                    }
                },
                {
                    "id": "node_action2",
                    "type": "action",
                    "position": {
                        "x": 450,
                        "y": 750
                    },
                    "data": {
                        "label": "Standard CRM",
                        "actionType": "add_to_crm"
                    }
                }
            ],
            "edges": [
                {
                    "id": "e1",
                    "source": "node_start",
                    "target": "node_list1"
                },
                {
                    "id": "e2",
                    "source": "node_list1",
                    "target": "node_list2",
                    "sourceHandle": "item-i1"
                },
                {
                    "id": "e3",
                    "source": "node_list2",
                    "target": "node_list3",
                    "sourceHandle": "item-t1"
                },
                {
                    "id": "e4",
                    "source": "node_list3",
                    "target": "node_cond",
                    "sourceHandle": "item-b1"
                },
                {
                    "id": "e5",
                    "source": "node_cond",
                    "target": "node_action1",
                    "sourceHandle": "true"
                },
                {
                    "id": "e6",
                    "source": "node_cond",
                    "target": "node_action2",
                    "sourceHandle": "false"
                }
            ]
        }
    },
    {
        "id": "restaurant_ordering",
        "title": "23. Restaurant Takeaway Ordering",
        "description": "Fast food orders over WhatsApp.",
        "modulesUsed": [
            "Catalog",
            "Payment",
            "Order Tracking"
        ],
        "flowData": {
            "nodes": [
                {
                    "id": "node_start",
                    "type": "start",
                    "position": {
                        "x": 250,
                        "y": 50
                    },
                    "data": {
                        "label": "MENU"
                    }
                },
                {
                    "id": "node_catalog",
                    "type": "catalog",
                    "position": {
                        "x": 250,
                        "y": 150
                    },
                    "data": {
                        "label": "Menu Carousel"
                    }
                },
                {
                    "id": "node_payment",
                    "type": "payment",
                    "position": {
                        "x": 250,
                        "y": 300
                    },
                    "data": {
                        "label": "Checkout",
                        "amount": "0",
                        "currency": "USD",
                        "paymentTitle": "Food Order Checkout"
                    }
                },
                {
                    "id": "node_msg",
                    "type": "message",
                    "position": {
                        "x": 250,
                        "y": 450
                    },
                    "data": {
                        "label": "Pickup Time",
                        "text": "Order received. Your pickup time is in 20 minutes."
                    }
                }
            ],
            "edges": [
                {
                    "id": "e1",
                    "source": "node_start",
                    "target": "node_catalog"
                },
                {
                    "id": "e2",
                    "source": "node_catalog",
                    "target": "node_payment"
                },
                {
                    "id": "e3",
                    "source": "node_payment",
                    "target": "node_msg"
                }
            ]
        }
    },
    {
        "id": "service_booking",
        "title": "24. Quick Service Booking",
        "description": "Book home services fast. Date, time, confirmation.",
        "modulesUsed": [
            "Appointment",
            "Payment",
            "Condition"
        ],
        "flowData": {
            "nodes": [
                {
                    "id": "node_start",
                    "type": "start",
                    "position": {
                        "x": 250,
                        "y": 50
                    },
                    "data": {
                        "label": "FIX"
                    }
                },
                {
                    "id": "node_appt",
                    "type": "appointment",
                    "position": {
                        "x": 250,
                        "y": 150
                    },
                    "data": {
                        "label": "Select Technician Slot"
                    }
                },
                {
                    "id": "node_msg",
                    "type": "message",
                    "position": {
                        "x": 250,
                        "y": 300
                    },
                    "data": {
                        "label": "Confirm",
                        "text": "Technician booked successfully. We will call you 30m before arrival."
                    }
                }
            ],
            "edges": [
                {
                    "id": "e1",
                    "source": "node_start",
                    "target": "node_appt"
                },
                {
                    "id": "e2",
                    "source": "node_appt",
                    "target": "node_msg",
                    "sourceHandle": "true"
                }
            ]
        }
    },
    {
        "id": "vip_support_escalation",
        "title": "25. VIP Support Escalation",
        "description": "Route high-priority customers straight to agents based on conditions.",
        "modulesUsed": [
            "Condition",
            "Action",
            "Message"
        ],
        "flowData": {
            "nodes": [
                {
                    "id": "node_start",
                    "type": "start",
                    "position": {
                        "x": 250,
                        "y": 50
                    },
                    "data": {
                        "label": "VIP_HELP"
                    }
                },
                {
                    "id": "node_msg",
                    "type": "message",
                    "position": {
                        "x": 250,
                        "y": 150
                    },
                    "data": {
                        "label": "Welcome VIP",
                        "text": "Welcome to VIP Support. Please describe your issue briefly."
                    }
                },
                {
                    "id": "node_action",
                    "type": "action",
                    "position": {
                        "x": 250,
                        "y": 300
                    },
                    "data": {
                        "label": "Instant Escalation API",
                        "actionType": "webhook"
                    }
                }
            ],
            "edges": [
                {
                    "id": "e1",
                    "source": "node_start",
                    "target": "node_msg"
                },
                {
                    "id": "e2",
                    "source": "node_msg",
                    "target": "node_action"
                }
            ]
        }
    }
];
