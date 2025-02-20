// Set your secret key. Remember to switch to your live secret key in production.
// See your keys here: https://dashboard.stripe.com/apikeys
import Stripe from 'stripe';
const stripe = new Stripe('sk_test_51QmTHIQcjSY1Xq6AHh0w1iPbSJwx2IEQI9s2iBKl71dwh7GUhLHlyMQRTnR7V8ZzjoCOCW7DSepPbtoj6WFVOdsb00JsPbaDM0');

const account = await stripe.accounts.create();

console.log(account);

const accountLink = await stripe.accountLinks.create({
    account: account.id,
    refresh_url: 'https://example.com/reauth',
    return_url: 'https://example.com/return',
    type: 'account_onboarding',
});

console.log(accountLink);