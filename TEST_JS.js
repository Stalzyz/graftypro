const data = {
  "screen_0_COMPANY_NAME_0": "Grekam",
  "screen_0_NEW_TO_DIGITAL_MARKETING_1": ["Yes"],
  "screen_0_WHEN_DO_YOU_WANT_TO_START_2": ["1_Within_7_Days"],
  "screen_0_BEST_TIME_TO_CONNECT_3": ["1_Afternoon"],
  "screen_0_WHATS_YOUR_NAME_4": "Stalinkumar",
  "screen_0_YOUR_PHONE_NUMBER_5": "9042583701",
  "flow_token": "tk_123"
};

const entries = Object.entries(data)
    .filter(([k]) => k !== 'flow_token')
    .sort(([a], [b]) => {
        const numA = parseInt(a.match(/_(\d+)$/)?.[1] || "0");
        const numB = parseInt(b.match(/_(\d+)$/)?.[1] || "0");
        return numA - numB;
    });

console.log(entries);
