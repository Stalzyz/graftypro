const plan = "FREE";
const current_plan_id = "ceeb1916-01a0-4deb-a54b-ff020dc04823";
const isFreePlanId = current_plan_id && plan === 'FREE';
const hasPaidPlan = (!!current_plan_id && !isFreePlanId) || (plan && plan !== 'FREE');
console.log({isFreePlanId, hasPaidPlan});
