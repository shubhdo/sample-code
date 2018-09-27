const Subscription = `
type Subscription {
    name: String,
    description: String,
    price: Float,
    duration: String,
    maxNumberOfMembers: Int,
    features: [String],
    isMostPopular: Boolean,
    stripePlanId: String,
    status: String
}`;

module.exports = Subscription;
